import type { Express } from "express";
import { readFile } from "node:fs/promises";
import type { Server } from "node:http";
import { resolve } from "node:path";
import { createServer as createViteServer } from "vite";

import { isDevPublicPath } from "./auth.ts";

const indexHtmlPath = resolve(process.cwd(), "index.html");
const loginHtmlPath = resolve(process.cwd(), "login.html");

export const createDevClient = (server: Server) => ({
  isPublicPath: isDevPublicPath,
  mountClient: async (app: Express) => {
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
  },
});
