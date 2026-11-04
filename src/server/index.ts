import { createServer } from "node:http";

import { createApp } from "#/server/app.ts";
import { createClientHost } from "#/server/clientHost.ts";
import { getDatabaseUrl } from "#/server/db.ts";

getDatabaseUrl();

const isProduction = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT ?? 3000);
const server = createServer();

const clientHost = await createClientHost({ isProduction, server });

const app = await createApp({
  isPublicPath: clientHost.isPublicPath,
  mountClient: clientHost.mountClient,
});

server.on("request", app);

server.on("error", (error) => {
  console.error(error);
  process.exit(1);
});

server.listen(port, () => {
  console.log(`Server running: ${process.env.APP_HOST}:${port}`);
});
