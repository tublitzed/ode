import {
  APIConnectionError,
  InternalServerError,
  RateLimitError,
} from "@anthropic-ai/sdk";
import * as Sentry from "@sentry/node";
import express from "express";
import type { Router } from "express";

import { drawMosaic } from "#/server/odes/drawMosaic.ts";
import { generateOde } from "#/server/odes/generate.ts";
import type { Revision } from "#/server/odes/generate.ts";
import {
  DEFAULT_ODE_TYPE,
  isOdeType,
  MAX_CHANGE_REQUEST_LENGTH,
  MAX_CHANGE_REQUESTS,
  MAX_ODE_LENGTH,
  MAX_TOPIC_LENGTH,
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

const drawMosaicSafely = async (topic: string) => {
  try {
    return await drawMosaic(topic);
  } catch (error) {
    Sentry.captureException(error);
    return undefined;
  }
};

const isUsableOde = (value: unknown): value is string =>
  typeof value === "string" &&
  value.trim().length > 0 &&
  value.length <= MAX_ODE_LENGTH;

const isUsableChangeRequest = (value: unknown): value is string =>
  typeof value === "string" &&
  value.trim().length > 0 &&
  value.trim().length <= MAX_CHANGE_REQUEST_LENGTH;

const isUsableChangeRequests = (value: unknown): value is string[] =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.length <= MAX_CHANGE_REQUESTS &&
  value.every(isUsableChangeRequest);

type RevisionResult = { error: string } | { revision: Revision | undefined };

const readRevision = (body: unknown): RevisionResult => {
  const { changeRequests, previousOde, sourceOde } = (body ?? {}) as Record<
    string,
    unknown
  >;

  if (changeRequests === undefined && previousOde === undefined) {
    return { revision: undefined };
  }

  if (sourceOde !== undefined) {
    return {
      error:
        "Even the muse works one draft at a time. Compare or revise, not both.",
    };
  }

  if (!isUsableOde(previousOde)) {
    return {
      error:
        "That draft slipped out of reach. Write a fresh ode and try again.",
    };
  }

  if (!isUsableChangeRequests(changeRequests)) {
    return {
      error: `Every revision needs a note: a change of up to ${MAX_CHANGE_REQUEST_LENGTH} characters.`,
    };
  }

  return {
    revision: {
      changeRequests: changeRequests.map((changeRequest) =>
        changeRequest.trim(),
      ),
      previousOde,
    },
  };
};

export const odesRouter: Router = express.Router();

odesRouter.post("/api/odes", express.json(), async (req, res) => {
  const provided: unknown = req.body?.topic;
  const topic = typeof provided === "string" ? provided.trim() : "";

  if (!topic || topic.length > MAX_TOPIC_LENGTH) {
    res.status(400).json({
      error: `Every ode needs a subject: a word or phrase of up to ${MAX_TOPIC_LENGTH} characters.`,
    });
    return;
  }

  const type: unknown = req.body?.type ?? DEFAULT_ODE_TYPE;

  if (!isOdeType(type)) {
    res.status(400).json({
      error:
        "We don’t know that kind of ode. Try a Pindaric, Horatian or irregular one.",
    });
    return;
  }

  const sourceOde: unknown = req.body?.sourceOde;

  if (sourceOde !== undefined && !isUsableOde(sourceOde)) {
    res.status(400).json({
      error: "We can’t build on that ode. Write a fresh one and try again.",
    });
    return;
  }

  const revisionResult = readRevision(req.body);

  if ("error" in revisionResult) {
    res.status(400).json({ error: revisionResult.error });
    return;
  }

  const { revision } = revisionResult;
  const isFreshOde = sourceOde === undefined && revision === undefined;
  const pendingMosaic = isFreshOde ? drawMosaicSafely(topic) : undefined;

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
  }
});
