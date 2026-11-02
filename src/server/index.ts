import type { Express } from "express";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { resolve } from "node:path";
import { createServer as createViteServer } from "vite";

import { createApp } from "./app.ts";
import { isDevPublicPath } from "./auth.ts";

const port = Number(process.env.PORT ?? 3000);
const indexHtmlPath = resolve(process.cwd(), "index.html");
const loginHtmlPath = resolve(process.cwd(), "login.html");
const server = createServer();

const mountViteDev = async (app: Express) => {
  const vite = await createViteServer({
    appType: "custom",
    server: { hmr: { server }, middlewareMode: true },
  });

  app.use(vite.middlewares);

  app.use(async (req, res, next) => {
    if (req.method !== "GET") {
      next();
      return;
    }

    try {
      const htmlPath = req.path === "/login" ? loginHtmlPath : indexHtmlPath;
      const template = await readFile(htmlPath, "utf-8");
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

server.on("request", app);

server.on("error", (error) => {
  console.error(error);
  process.exit(1);
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
