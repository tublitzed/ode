import { sentryVitePlugin } from "@sentry/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ command, mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ""), ...process.env };
  const uploadSourceMaps =
    command === "build" && Boolean(env.SENTRY_AUTH_TOKEN);

  if (command === "build") {
    console.log(
      `Sentry source map upload: ${uploadSourceMaps ? "enabled" : "skipped (SENTRY_AUTH_TOKEN unset)"}`,
    );
  }

  return {
    build: {
      emptyOutDir: true,
      manifest: true,
      outDir: "dist/client",
      rolldownOptions: {
        input: {
          app: fileURLToPath(new URL("./index.html", import.meta.url)),
          login: fileURLToPath(new URL("./login.html", import.meta.url)),
        },
      },
      sourcemap: uploadSourceMaps ? "hidden" : false,
    },
    plugins: [
      react(),
      tailwindcss(),
      uploadSourceMaps &&
        sentryVitePlugin({
          authToken: env.SENTRY_AUTH_TOKEN,
          errorHandler: (error) => {
            throw error;
          },
          org: env.SENTRY_ORG,
          project: env.SENTRY_PROJECT,
          release: {
            name: env.SENTRY_RELEASE ?? env.RAILWAY_GIT_COMMIT_SHA,
          },
          sourcemaps: {
            filesToDeleteAfterUpload: ["dist/client/**/*.map"],
          },
          telemetry: false,
        }),
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  };
});
