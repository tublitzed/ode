import express from "express";
import type { Express } from "express";
import { createGate } from "#/server/auth.ts";
import type { IsPublicPath } from "#/server/auth.ts";
import { createContextMiddleware } from "#/server/context.ts";
import type { ServerContext } from "#/server/context.ts";
import {
  apiRouter,
  createAuthRouter,
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
  // Entire app is gated behind auth except for shares.
  const gate = createGate(isPublicPath);

  const app = express();

  // Railway rewrites x-forwarded-for to "<client IP>, <edge proxy IP>", dropping any
  // client-sent value. Trusting 2 hops sets req.ip to the client IP, used for login rate limiting.
  app.set("trust proxy", 2);

  app.use(createContextMiddleware(context));
  app.use(createAuthRouter());
  app.use("/api/public", publicApiRouter);
  app.use(gate);
  app.use(apiRouter);

  await mountClient(app);

  return app;
};
