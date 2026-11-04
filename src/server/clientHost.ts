import express from "express";
import type { Express } from "express";
import { readFile } from "node:fs/promises";
import type { Server } from "node:http";
import { extname, join } from "node:path";

import { isDevPublicPath } from "#/server/auth.ts";
import type { IsPublicPath } from "#/server/auth.ts";
import { collectEntryFiles } from "#/server/manifest.ts";
import type { Manifest } from "#/server/manifest.ts";

type ClientHostOptions = {
  isProduction: boolean;
  server: Server;
};

type ClientMode = {
  isPublicPath: IsPublicPath;
  renderHtml: (url: string) => Promise<string>;
  serveStatic: (app: Express) => void;
};

const rootDir = process.cwd();
const distDir = join(rootDir, "dist", "client");

const createProdMode = async (): Promise<ClientMode> => {
  const manifestPath = join(distDir, ".vite", "manifest.json");
  const manifest: Manifest = JSON.parse(await readFile(manifestPath, "utf-8"));
  const entryFiles = collectEntryFiles(manifest, "index.html");

  return {
    isPublicPath: (path) => entryFiles.has(path),
    renderHtml: () => readFile(join(distDir, "index.html"), "utf-8"),
    serveStatic: (app) => {
      app.use(express.static(distDir, { index: false }));
    },
  };
};

// Dev mode to support hot reloading.
const createDevMode = async (server: Server): Promise<ClientMode> => {
  const { createServer } = await import("vite");
  const vite = await createServer({
    appType: "custom",
    server: { hmr: { server }, middlewareMode: true },
  });

  return {
    isPublicPath: isDevPublicPath,
    renderHtml: async (url) =>
      vite.transformIndexHtml(
        url,
        await readFile(join(rootDir, "index.html"), "utf-8"),
      ),
    serveStatic: (app) => {
      app.use(vite.middlewares);
    },
  };
};

export const createClientHost = async ({
  isProduction,
  server,
}: ClientHostOptions) => {
  const mode = isProduction
    ? await createProdMode()
    : await createDevMode(server);

  return {
    isPublicPath: mode.isPublicPath,
    mountClient: (app: Express) => {
      mode.serveStatic(app);

      app.use(async (req, res, next) => {
        if (req.method !== "GET" || extname(req.path) !== "") {
          next();
          return;
        }

        try {
          const html = await mode.renderHtml(req.originalUrl);
          res.type("html").send(html);
        } catch (error) {
          next(error);
        }
      });
    },
  };
};
