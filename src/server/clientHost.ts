import * as Sentry from "@sentry/node";
import express from "express";
import type { Express, RequestHandler } from "express";
import { readFile } from "node:fs/promises";
import type { Server } from "node:http";
import { extname, join } from "node:path";

import { isDevPublicPath } from "#/server/auth.ts";
import type { IsPublicPath } from "#/server/auth.ts";
import { collectEntryFiles } from "#/server/manifest.ts";
import type { Manifest } from "#/server/manifest.ts";
import { renderPreview } from "#/server/shares/renderPreview.ts";
import { getSharedOde } from "#/server/shares/store.ts";
import { getSharedOdeId } from "#/shared/sharedOdePath.ts";

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

const loadSharedOde = async (id: string) => {
  try {
    const sharedOde = await getSharedOde(id);
    return { found: sharedOde !== undefined, sharedOde };
  } catch (error) {
    Sentry.captureException(error);
    return { found: true, sharedOde: undefined };
  }
};

export const createPageHandler =
  (renderHtml: ClientMode["renderHtml"]): RequestHandler =>
  async (req, res, next) => {
    if (req.method !== "GET" || extname(req.path) !== "") {
      next();
      return;
    }

    try {
      const html = await renderHtml(req.originalUrl);
      const sharedOdeId = getSharedOdeId(req.path);

      if (!sharedOdeId) {
        res.type("html").send(html);
        return;
      }

      const { found, sharedOde } = await loadSharedOde(sharedOdeId);

      res
        .status(found ? 200 : 404)
        .type("html")
        .send(sharedOde ? renderPreview(html, sharedOde) : html);
    } catch (error) {
      next(error);
    }
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

      app.use(createPageHandler(mode.renderHtml));
    },
  };
};
