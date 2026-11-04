import "@/client/instrument";

import { reactErrorHandler } from "@sentry/react";
import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";

import "@/client/index.css";

import LoginPage from "@/client/components/LoginPage";
import SharedOdePage from "@/client/components/SharedOdePage";
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

createRoot(root, {
  onCaughtError: reactErrorHandler(),
  onRecoverableError: reactErrorHandler(),
  onUncaughtError: reactErrorHandler(),
}).render(<StrictMode>{renderPage()}</StrictMode>);
