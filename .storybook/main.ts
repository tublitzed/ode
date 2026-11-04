import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  core: { disableTelemetry: true },
  framework: "@storybook/react-vite",
  stories: ["../stories/**/*.stories.tsx"],
};

export default config;
