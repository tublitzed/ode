import express from "express";
import type { Express } from "express";

import { createGate } from "#/server/auth.ts";
import type { IsPublicPath } from "#/server/auth.ts";
import { createContextMiddleware } from "#/server/context.ts";
import type { ServerContext } from "#/server/context.ts";
import {
  apiRouter,
  authRouter,
  publicApiRouter,
} from "#/server/routes/routes.ts";

type AppOptions = {
  context: ServerContext;
  isPublicPath: IsPublicPath;
  mountClient: (app: Express) => Promise<void> | void;
};

export const createApp = async ({
  context,
  isPublicPath,
  mountClient,
}: AppOptions) => {
  // Entire app is gated behind auth.
  const gate = createGate(isPublicPath);

  const app = express();

  app.use(createContextMiddleware(context));
  app.use(authRouter);
  app.use("/api/public", publicApiRouter);
  app.use(gate);
  app.use(apiRouter);

  await mountClient(app);

  return app;
};
