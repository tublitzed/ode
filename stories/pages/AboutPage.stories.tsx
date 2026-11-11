import type { Meta, StoryObj } from "@storybook/react-vite";

import AboutPage from "@/client/components/AboutPage";

type Story = StoryObj<typeof AboutPage>;

const meta: Meta<typeof AboutPage> = {
  component: AboutPage,
  parameters: { layout: "fullscreen" },
};

export default meta;

export const Default: Story = {};
