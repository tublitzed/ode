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
import {
  DEFAULT_ODE_TYPE,
  isOdeType,
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

const isUsableSourceOde = (value: unknown): value is string =>
  typeof value === "string" &&
  value.trim().length > 0 &&
  value.length <= MAX_ODE_LENGTH;

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

  if (sourceOde !== undefined && !isUsableSourceOde(sourceOde)) {
    res.status(400).json({
      error: "We can’t build on that ode. Write a fresh one and try again.",
    });
    return;
  }

  const pendingMosaic =
    sourceOde === undefined ? drawMosaicSafely(topic) : undefined;

  try {
    const ode = await generateOde(topic, type, sourceOde);

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
