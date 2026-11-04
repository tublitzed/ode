import {
  APIConnectionError,
  InternalServerError,
  RateLimitError,
} from "@anthropic-ai/sdk";
import * as Sentry from "@sentry/node";
import express from "express";
import type { Router } from "express";

import { generateOde } from "#/server/odes/generate.ts";
import { MAX_TOPIC_LENGTH } from "#/shared/ode.ts";

const BUSY = {
  message: "Ode is very busy right now. Try again in a moment.",
  status: 503,
};
const UNEXPECTED = {
  message: "Something went wrong writing your ode. Try again.",
  status: 500,
};
const UNREACHABLE = {
  message: "We couldn't reach our poet. Try again in a moment.",
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

export const odesRouter: Router = express.Router();

odesRouter.post("/api/odes", express.json(), async (req, res) => {
  const provided: unknown = req.body?.topic;
  const topic = typeof provided === "string" ? provided.trim() : "";

  if (!topic || topic.length > MAX_TOPIC_LENGTH) {
    res.status(400).json({
      error: `Enter a word or phrase of up to ${MAX_TOPIC_LENGTH} characters.`,
    });
    return;
  }

  try {
    res.json(await generateOde(topic));
  } catch (error) {
    const failure = toFailure(error);

    if (failure === UNEXPECTED) {
      Sentry.captureException(error);
    }

    res.status(failure.status).json({ error: failure.message });
  }
});
