import type { Express } from "express";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createServer as createViteServer } from "vite";

import { createApp } from "./app.ts";
import { isDevPublicPath } from "./auth.ts";

const port = Number(process.env.PORT ?? 3000);
const indexHtmlPath = resolve(process.cwd(), "index.html");

const mountViteDev = async (app: Express) => {
  const vite = await createViteServer({
    appType: "custom",
    server: { middlewareMode: true },
  });

  app.use(vite.middlewares);

  app.use(async (req, res, next) => {
    if (req.method !== "GET") {
      next();
      return;
    }

    try {
      const template = await readFile(indexHtmlPath, "utf-8");
      const html = await vite.transformIndexHtml(req.originalUrl, template);
      res.status(200).type("html").send(html);
    } catch (error) {
      vite.ssrFixStacktrace(error as Error);
      next(error);
    }
  });
};

const app = await createApp({
  isPublicPath: isDevPublicPath,
  mountClient: mountViteDev,
  password: process.env.APP_PASSWORD,
  secureCookies: process.env.NODE_ENV === "production",
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
