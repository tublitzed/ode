import {
  APIConnectionError,
  InternalServerError,
  RateLimitError,
} from "@anthropic-ai/sdk";
import * as Sentry from "@sentry/node";
import express from "express";
import type { Router } from "express";

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
    return { error: "We can't compare and revise an ode at the same time." };
  }

  if (!isUsableOde(previousOde)) {
    return { error: "We can't revise that ode." };
  }

  if (!isUsableChangeRequests(changeRequests)) {
    return {
      error: `Describe your change in up to ${MAX_CHANGE_REQUEST_LENGTH} characters.`,
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
      error: `Enter a word or phrase of up to ${MAX_TOPIC_LENGTH} characters.`,
    });
    return;
  }

  const type: unknown = req.body?.type ?? DEFAULT_ODE_TYPE;

  if (!isOdeType(type)) {
    res.status(400).json({ error: "That's not a type of ode we can write." });
    return;
  }

  const sourceOde: unknown = req.body?.sourceOde;

  if (sourceOde !== undefined && !isUsableOde(sourceOde)) {
    res
      .status(400)
      .json({ error: "We can't use that ode as a starting point." });
    return;
  }

  const revisionResult = readRevision(req.body);

  if ("error" in revisionResult) {
    res.status(400).json({ error: revisionResult.error });
    return;
  }

  try {
    res.json(
      await generateOde(topic, type, {
        revision: revisionResult.revision,
        sourceOde,
      }),
    );
  } catch (error) {
    const failure = toFailure(error);

    if (failure === UNEXPECTED) {
      Sentry.captureException(error);
    }

    res.status(failure.status).json({ error: failure.message });
  }
});
