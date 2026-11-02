import express from "express";
import type { Express } from "express";

import { createAuth } from "./auth.ts";
import type { IsPublicPath } from "./auth.ts";

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
  const { gate, router } = createAuth({
    isPublicPath,
    password,
    secureCookies,
  });

  const app = express();

  app.use(router);
  app.use(gate);

  await mountClient(app);

  return app;
};
