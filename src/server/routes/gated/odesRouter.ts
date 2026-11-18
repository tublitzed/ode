import {
  APIConnectionError,
  APIUserAbortError,
  InternalServerError,
  RateLimitError,
} from "@anthropic-ai/sdk";
import * as Sentry from "@sentry/node";
import express from "express";
import type { Router } from "express";
import { z } from "zod";

import { drawMosaic } from "#/server/odes/drawMosaic.ts";
import { generateOde } from "#/server/odes/generate.ts";
import { odeText, trimmedText } from "#/server/routes/requestSchemas.ts";
import {
  DEFAULT_ODE_TYPE,
  MAX_CHANGE_REQUEST_LENGTH,
  MAX_CHANGE_REQUESTS,
  MAX_TOPIC_LENGTH,
  ODE_TYPES,
} from "#/shared/ode.ts";

const BUSY = {
  message: "Every poet is mid-verse right now. Try again in a moment.",
  status: 503,
};
const UNEXPECTED = {
  message: "Our poet dropped the quill. Try again.",
  status: 500,
};
const UNREACHABLE = {
  message:
    "Our poet wandered off in search of inspiration. Try again in a moment.",
  status: 502,
};

const OdeRequest = z.object({
  changeRequests: z
    .array(trimmedText(MAX_CHANGE_REQUEST_LENGTH))
    .min(1)
    .max(MAX_CHANGE_REQUESTS)
    .optional(),
  previousOde: odeText.optional(),
  sourceOde: odeText.optional(),
  topic: trimmedText(MAX_TOPIC_LENGTH),
  type: z.enum(ODE_TYPES).default(DEFAULT_ODE_TYPE),
});

type OdeRequest = z.infer<typeof OdeRequest>;

const FIELD_ERRORS: Record<keyof OdeRequest, string> = {
  changeRequests: `Every revision needs a note: a change of up to ${MAX_CHANGE_REQUEST_LENGTH} characters.`,
  previousOde:
    "That draft slipped out of reach. Write a fresh ode and try again.",
  sourceOde: "We can’t build on that ode. Write a fresh one and try again.",
  topic: `Every ode needs a subject: a word or phrase of up to ${MAX_TOPIC_LENGTH} characters.`,
  type: "We don’t know that kind of ode. Try a Pindaric, Horatian or irregular one.",
};

const REVISE_AND_COMPARE_ERROR =
  "Even the muse works one draft at a time. Compare or revise, not both.";

const isRequestField = (field: unknown): field is keyof OdeRequest =>
  typeof field === "string" && Object.hasOwn(FIELD_ERRORS, field);

const toFieldError = ({ issues }: z.ZodError) => {
  const field = issues[0]?.path[0];
  return isRequestField(field) ? FIELD_ERRORS[field] : FIELD_ERRORS.topic;
};

const getRevisionError = ({
  changeRequests,
  previousOde,
  sourceOde,
}: OdeRequest) => {
  if (changeRequests === undefined && previousOde === undefined) {
    return undefined;
  }

  if (sourceOde !== undefined) {
    return REVISE_AND_COMPARE_ERROR;
  }

  if (previousOde === undefined) {
    return FIELD_ERRORS.previousOde;
  }

  if (changeRequests === undefined) {
    return FIELD_ERRORS.changeRequests;
  }

  return undefined;
};

const toFailure = (error: unknown) => {
  if (error instanceof APIConnectionError) {
    return UNREACHABLE;
  }

  if (error instanceof RateLimitError) {
    return BUSY;
  }

  if (error instanceof InternalServerError) {
    return error.status === 529 ? BUSY : UNREACHABLE;
  }

  return UNEXPECTED;
};

const drawMosaicSafely = async (topic: string, signal: AbortSignal) => {
  try {
    return await drawMosaic(topic, signal);
  } catch (error) {
    if (error instanceof APIUserAbortError) {
      return undefined;
    }

    Sentry.captureException(error);
    return undefined;
  }
};

export const odesRouter: Router = express.Router();

odesRouter.post("/api/odes", express.json(), async (req, res) => {
  const parsed = OdeRequest.safeParse(req.body ?? {});

  if (!parsed.success) {
    res.status(400).json({ error: toFieldError(parsed.error) });
    return;
  }

  const revisionError = getRevisionError(parsed.data);

  if (revisionError) {
    res.status(400).json({ error: revisionError });
    return;
  }

  const { changeRequests, previousOde, sourceOde, topic, type } = parsed.data;
  const revision =
    changeRequests && previousOde ? { changeRequests, previousOde } : undefined;

  // We have comparisons and revisions in addition to fresh odes.
  const isFreshOde = sourceOde === undefined && revision === undefined;

  // No need to make a new mosaic for anything but a fresh ode.
  const mosaicController = new AbortController();
  const pendingMosaic = isFreshOde
    ? drawMosaicSafely(topic, mosaicController.signal)
    : undefined;

  try {
    const ode = await generateOde(topic, type, { revision, sourceOde });

    if (ode.status !== "ode" || !pendingMosaic) {
      res.json(ode);
      return;
    }

    const mosaic = await pendingMosaic;
    res.json(mosaic ? { ...ode, mosaic } : ode);
  } catch (error) {
    const failure = toFailure(error);

    if (failure === UNEXPECTED) {
      Sentry.captureException(error);
    }

    res.status(failure.status).json({ error: failure.message });
  } finally {
    mosaicController.abort();
  }
});
