import "@/client/instrument";

import { reactErrorHandler } from "@sentry/react";
import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";

import "@fontsource-variable/figtree/index.css";
import "@fontsource-variable/newsreader/index.css";
import "@fontsource/young-serif/index.css";
import "@/client/index.css";

import LoginPage from "@/client/components/LoginPage";
import SharedOdePage from "@/client/components/shares/SharedOdePage";
import { logNightingale } from "@/client/utils/consoleNightingale";
import { getSharedOdeId } from "@/shared/sharedOdePath";

// Load the app bundle only after logged in.
const App = lazy(() => import("@/client/components/App"));

const root = document.getElementById("root");

if (!root) {
  throw new Error("Missing #root element");
}

const isLoginPage = window.location.pathname === "/login";

if (isLoginPage) {
  document.title = "Log in · ode";
}

const sharedOdeId = getSharedOdeId(window.location.pathname);

// SPA with a login page and a shared ode page that's outside the auth gate.
const renderPage = () => {
  if (isLoginPage) {
    return <LoginPage />;
  }

  if (sharedOdeId) {
    return <SharedOdePage id={sharedOdeId} />;
  }

  return (
    <Suspense>
      <App />
    </Suspense>
  );
};

logNightingale();

createRoot(root, {
  onCaughtError: reactErrorHandler(),
  onRecoverableError: reactErrorHandler(),
  onUncaughtError: reactErrorHandler(),
}).render(<StrictMode>{renderPage()}</StrictMode>);
