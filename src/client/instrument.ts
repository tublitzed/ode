import * as Sentry from "@sentry/react";
import LogRocket from "logrocket";

import { getSharedOdeId } from "@/shared/sharedOdePath";

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

const initLogRocket = () => {
  const appId = import.meta.env.VITE_LOGROCKET_APP_ID;
  if (!appId || isSharedOdePage) {
    return;
  }

  LogRocket.init(appId);
};

function gtag() {
  window.dataLayer.push(arguments);
}

const initGoogleAnalytics = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!measurementId) {
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = gtag;
  window.gtag("js", new Date());
  window.gtag("config", measurementId);
};

initLogRocket();
initGoogleAnalytics();
