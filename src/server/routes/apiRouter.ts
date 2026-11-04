import express from "express";
import type { Router } from "express";

import { odesRouter } from "#/server/routes/odesRouter.ts";
import { sharesRouter } from "#/server/routes/sharesRouter.ts";

export const apiRouter: Router = express.Router();

apiRouter.use(odesRouter);
apiRouter.use(sharesRouter);
