import express from "express";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createServer as createViteServer } from "vite";

const port = Number(process.env.PORT ?? 3000);
const indexHtmlPath = resolve(process.cwd(), "index.html");

const app = express();

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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
