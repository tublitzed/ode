import * as Sentry from "@sentry/node";
import express from "express";
import type { Router } from "express";

import { getSharedOde } from "#/server/shares/store.ts";

export const publicSharesRouter: Router = express.Router();

publicSharesRouter.get("/shares/:id", async (req, res) => {
  try {
    const sharedOde = await getSharedOde(req.context.db, req.params.id);
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
