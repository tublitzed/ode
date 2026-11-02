import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@/index.css";

import LoginPage from "./LoginPage";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Missing #root element");
}

createRoot(root).render(
  <StrictMode>
    <LoginPage />
  </StrictMode>,
);
