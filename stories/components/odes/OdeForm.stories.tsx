import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import OdeForm from "@/client/components/odes/OdeForm";

import { withMainColumn } from "@stories/decorators";
import { BUSY_MESSAGE, LONG_TOPIC, SAMPLE_TOPIC } from "@stories/fixtures";

type Story = StoryObj<typeof OdeForm>;

const meta: Meta<typeof OdeForm> = {
  args: { onSubmit: fn(), onTopicChange: fn(), topic: "" },
  component: OdeForm,
  decorators: [withMainColumn],
  parameters: { layout: "fullscreen" },
};

export default meta;

export const Idle: Story = {};

export const TopicEntered: Story = {
  args: { topic: SAMPLE_TOPIC },
};

export const Writing: Story = {
  args: { isWriting: true, topic: SAMPLE_TOPIC },
};

export const WritingLongTopic: Story = {
  args: { isWriting: true, topic: LONG_TOPIC },
};

export const WithError: Story = {
  args: { error: BUSY_MESSAGE, topic: SAMPLE_TOPIC },
};
