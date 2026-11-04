import express from "express";
import type { Express } from "express";

import { createGate } from "#/server/auth.ts";
import type { IsPublicPath } from "#/server/auth.ts";
import { apiRouter, authRouter } from "#/server/routes/routes.ts";

type AppOptions = {
  isPublicPath: IsPublicPath;
  mountClient: (app: Express) => Promise<void> | void;
};

export const createApp = async ({ isPublicPath, mountClient }: AppOptions) => {
  // Entire app is gated behind auth.
  const gate = createGate(isPublicPath);

  const app = express();

  app.use(authRouter);
  app.use(gate);
  app.use(apiRouter);

  await mountClient(app);

  return app;
};
