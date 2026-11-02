import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rolldownOptions: {
      input: {
        app: fileURLToPath(new URL("./index.html", import.meta.url)),
        login: fileURLToPath(new URL("./login.html", import.meta.url)),
      },
    },
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
