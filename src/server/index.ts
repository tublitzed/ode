import { createServer } from "node:http";
import { resolve } from "node:path";

import { createApp } from "./app.ts";

const isProduction = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT ?? 3000);
const server = createServer();

const createClient = async () => {
  if (isProduction) {
    const { createProdClient } = await import("./prod.ts");
    return createProdClient(resolve(process.cwd(), "dist", "client"));
  }

  const { createDevClient } = await import("./dev.ts");
  return createDevClient(server);
};

const app = await createApp({
  ...(await createClient()),
  password: process.env.APP_PASSWORD,
  secureCookies: isProduction,
});

server.on("request", app);

server.on("error", (error) => {
  console.error(error);
  process.exit(1);
});

server.listen(port, () => {
  console.log(`Server running: ${process.env.APP_HOST}:${port}`);
});
