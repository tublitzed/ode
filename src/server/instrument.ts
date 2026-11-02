import * as Sentry from "@sentry/node";

Sentry.init({
  dataCollection: { httpBodies: [], stackFrameVariables: false },
  dsn: process.env.SENTRY_DSN,
  environment:
    process.env.NODE_ENV === "production" ? "production" : "development",
  release: process.env.SENTRY_RELEASE ?? process.env.RAILWAY_GIT_COMMIT_SHA,
  tracesSampleRate: 1.0,
});
