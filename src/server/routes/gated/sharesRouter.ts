import * as Sentry from "@sentry/node";
import express from "express";
import type { Router } from "express";

import { createSharedOde } from "#/server/shares/store.ts";
import {
  MAX_ODE_LENGTH,
  MAX_TOPIC_LENGTH,
  parseMosaic,
  toComparison,
} from "#/shared/ode.ts";

const MAX_BODY_SIZE = "300kb";

const trimmedString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const isValidComparison = (value: unknown) =>
  value === undefined ||
  (typeof value === "object" &&
    value !== null &&
    Object.keys(value).length === Object.keys(toComparison(value)).length);

const isValidMosaic = (value: unknown) =>
  value === undefined || parseMosaic(value) !== undefined;

export const sharesRouter: Router = express.Router();

const parseBody = express.json({ limit: MAX_BODY_SIZE });

sharesRouter.post("/api/shares", parseBody, async (req, res) => {
  const comparison: unknown = req.body?.comparison;
  const mosaic: unknown = req.body?.mosaic;
  const ode = trimmedString(req.body?.ode);
  const topic = trimmedString(req.body?.topic);

  if (
    !ode ||
    !topic ||
    ode.length > MAX_ODE_LENGTH ||
    topic.length > MAX_TOPIC_LENGTH ||
    !isValidComparison(comparison) ||
    !isValidMosaic(mosaic)
  ) {
    res.status(400).json({ error: "That ode can't be shared." });
    return;
  }

  try {
    const id = await createSharedOde(req.context.db, {
      comparison: toComparison(comparison),
      mosaic: parseMosaic(mosaic),
      ode,
      topic,
    });
    res.status(201).json({ id });
  } catch (error) {
    Sentry.captureException(error);
    res
      .status(500)
      .json({ error: "Something went wrong sharing your ode. Try again." });
  }
});
