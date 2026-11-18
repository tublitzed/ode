import * as Sentry from "@sentry/node";
import express from "express";
import type { Router } from "express";
import { z } from "zod";

import { odeText, trimmedText } from "#/server/routes/requestSchemas.ts";
import { createSharedOde } from "#/server/shares/store.ts";
import {
  COMPARISON_TYPES,
  MAX_ODE_LENGTH,
  MAX_TOPIC_LENGTH,
  parseMosaic,
} from "#/shared/ode.ts";
import type { MosaicShape } from "#/shared/ode.ts";

const MAX_BODY_SIZE = "300kb";

const ShareRequest = z.object({
  comparison: z.partialRecord(z.enum(COMPARISON_TYPES), odeText).optional(),
  mosaic: z
    .custom<MosaicShape[]>((value) => parseMosaic(value) !== undefined)
    .optional(),
  ode: trimmedText(MAX_ODE_LENGTH),
  topic: trimmedText(MAX_TOPIC_LENGTH),
});

export const sharesRouter: Router = express.Router();

const parseBody = express.json({ limit: MAX_BODY_SIZE });

sharesRouter.post("/api/shares", parseBody, async (req, res) => {
  const parsed = ShareRequest.safeParse(req.body ?? {});

  if (!parsed.success) {
    res.status(400).json({
      error: "That ode can’t be framed for sharing. Try writing it again.",
    });
    return;
  }

  try {
    const id = await createSharedOde(req.context.db, parsed.data);
    res.status(201).json({ id });
  } catch (error) {
    Sentry.captureException(error);
    res
      .status(500)
      .json({ error: "The ode slipped as we framed it. Try sharing again." });
  }
});
