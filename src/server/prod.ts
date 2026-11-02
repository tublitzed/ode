import express from "express";
import type { Express } from "express";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";

import { collectEntryFiles } from "./manifest.ts";
import type { Manifest } from "./manifest.ts";

export const createProdClient = async (distDir: string) => {
  const manifestPath = join(distDir, ".vite", "manifest.json");
  const manifest: Manifest = JSON.parse(await readFile(manifestPath, "utf-8"));
  const loginFiles = collectEntryFiles(manifest, "login.html");
  const indexHtmlPath = join(distDir, "index.html");
  const loginHtmlPath = join(distDir, "login.html");

  return {
    isPublicPath: (path: string) => loginFiles.has(path),
    mountClient: (app: Express) => {
      app.use(express.static(distDir, { index: false }));

      app.use((req, res, next) => {
        if (req.method !== "GET" || extname(req.path) !== "") {
          next();
          return;
        }

        res.sendFile(req.path === "/login" ? loginHtmlPath : indexHtmlPath);
      });
    },
  };
};
