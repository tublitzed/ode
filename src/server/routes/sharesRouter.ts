import * as Sentry from "@sentry/node";
import express from "express";
import type { Router } from "express";

import { createSharedOde, getSharedOde } from "#/server/shares/store.ts";
import {
  MAX_ODE_LENGTH,
  MAX_TOPIC_LENGTH,
  toComparison,
} from "#/shared/ode.ts";

const trimmedString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const isValidComparison = (value: unknown) =>
  value === undefined ||
  (typeof value === "object" &&
    value !== null &&
    Object.keys(value).length === Object.keys(toComparison(value)).length);

export const sharesRouter: Router = express.Router();

sharesRouter.get("/api/shares/:id", async (req, res) => {
  try {
    const sharedOde = await getSharedOde(req.params.id);
    if (!sharedOde) {
      res.status(404).json({ error: "We couldn't find that ode." });
      return;
    }

    res.json(sharedOde);
  } catch (error) {
    Sentry.captureException(error);
    res
      .status(500)
      .json({ error: "Something went wrong loading this ode. Try again." });
  }
});

sharesRouter.post("/api/shares", express.json(), async (req, res) => {
  const comparison: unknown = req.body?.comparison;
  const ode = trimmedString(req.body?.ode);
  const topic = trimmedString(req.body?.topic);

  if (
    !ode ||
    !topic ||
    ode.length > MAX_ODE_LENGTH ||
    topic.length > MAX_TOPIC_LENGTH ||
    !isValidComparison(comparison)
  ) {
    res.status(400).json({ error: "That ode can't be shared." });
    return;
  }

  try {
    const id = await createSharedOde({
      comparison: toComparison(comparison),
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
