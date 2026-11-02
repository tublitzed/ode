import "@/client/instrument";

import { reactErrorHandler } from "@sentry/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@/index.css";

import LoginPage from "@/client/login/LoginPage";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Missing #root element");
}

createRoot(root, {
  onCaughtError: reactErrorHandler(),
  onRecoverableError: reactErrorHandler(),
  onUncaughtError: reactErrorHandler(),
}).render(
  <StrictMode>
    <LoginPage />
  </StrictMode>,
);
