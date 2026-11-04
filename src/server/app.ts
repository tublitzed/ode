import express from "express";
import type { Express } from "express";

import { createAuth } from "#/server/auth.ts";
import type { IsPublicPath } from "#/server/auth.ts";
import { createAuthRouter, odesRouter } from "#/server/routes/routes.ts";

type AppOptions = {
  isPublicPath: IsPublicPath;
  mountClient: (app: Express) => Promise<void> | void;
  password: string | undefined;
  secureCookies: boolean;
};

export const createApp = async ({
  isPublicPath,
  mountClient,
  password,
  secureCookies,
}: AppOptions) => {
  const { expectedPassword, gate, key } = createAuth({
    isPublicPath,
    password,
  });

  const app = express();

  app.use(createAuthRouter({ expectedPassword, key, secureCookies }));
  app.use(gate);
  app.use(odesRouter);

  await mountClient(app);

  return app;
};
