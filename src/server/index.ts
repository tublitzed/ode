import { createServer } from "node:http";

import { createApp } from "#/server/app.ts";
import { createClient } from "#/server/client.ts";

const isProduction = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT ?? 3000);
const server = createServer();

const app = await createApp({
  ...(await createClient({ isProduction, server })),
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
