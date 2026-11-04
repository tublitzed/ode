import * as Sentry from "@sentry/react";

import { getSharedOdeId } from "@/client/utils/sharedOdePath";

// Readers of shared odes never agreed to session recording.
const isSharedOdePage = Boolean(getSharedOdeId(window.location.pathname));

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    Sentry.browserTracingIntegration(),
    ...(isSharedOdePage ? [] : [Sentry.replayIntegration()]),
  ],
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 1.0,
  tracesSampleRate: 1.0,
});
