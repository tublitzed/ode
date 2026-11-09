import express from "express";
import type { Router } from "express";

import { publicSharesRouter } from "#/server/routes/public/publicSharesRouter.ts";

export const publicApiRouter: Router = express.Router();

publicApiRouter.use((_req, res, next) => {
  res.set("X-Robots-Tag", "noindex");
  next();
});

publicApiRouter.use(publicSharesRouter);
