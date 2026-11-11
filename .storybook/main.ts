import type { StorybookConfig } from "@storybook/react-vite";
import { fileURLToPath } from "node:url";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
  core: { disableTelemetry: true },
  framework: "@storybook/react-vite",
  stories: ["../stories/**/*.stories.tsx"],
  viteFinal: (viteConfig) =>
    mergeConfig(viteConfig, {
      resolve: {
        alias: {
          "@stories": fileURLToPath(new URL("../stories", import.meta.url)),
        },
      },
    }),
};

export default config;
