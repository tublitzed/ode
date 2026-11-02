import express from "express";
import type { Express } from "express";

import { createAuth } from "#/server/auth.ts";
import type { IsPublicPath } from "#/server/auth.ts";
import type { GenerateOde } from "#/server/generateOde.ts";
import { createAuthRouter, createOdesRouter } from "#/server/routes/routes.ts";

type AppOptions = {
  generateOde: GenerateOde;
  isPublicPath: IsPublicPath;
  mountClient: (app: Express) => Promise<void> | void;
  password: string | undefined;
  secureCookies: boolean;
};

export const createApp = async ({
  generateOde,
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
  app.use(createOdesRouter(generateOde));

  await mountClient(app);

  return app;
};
