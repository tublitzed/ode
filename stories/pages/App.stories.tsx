import type { Meta, StoryObj } from "@storybook/react-vite";
import { fireEvent } from "storybook/test";

import App from "@/client/components/App";
import { saveLastOde } from "@/client/utils/localStorage";

import {
  BUSY_MESSAGE,
  comparisonColumns,
  HORATIAN_SLOT,
  PINDARIC_SLOT,
  SAMPLE_HORATIAN_ODE,
  SAMPLE_MOSAIC,
  SAMPLE_ODE,
  SAMPLE_PINDARIC_ODE,
  SAMPLE_TOPIC,
} from "@stories/fixtures";

type Story = StoryObj<typeof App>;

const meta: Meta<typeof App> = {
  beforeEach: () => {
    localStorage.clear();
  },
  component: App,
  parameters: { layout: "fullscreen" },
};

export default meta;

export const Idle: Story = {};

export const TopicEntered: Story = {
  play: ({ canvas }) => {
    fireEvent.change(canvas.getByRole("textbox"), {
      target: { value: SAMPLE_TOPIC },
    });
  },
};

export const Generating: Story = {
  args: { forceView: { status: "generating", topic: SAMPLE_TOPIC } },
};

export const Ode: Story = {
  args: {
    forceView: {
      changeRequests: [],
      isFresh: false,
      mosaic: SAMPLE_MOSAIC,
      ode: SAMPLE_ODE,
      status: "ode",
      topic: SAMPLE_TOPIC,
    },
  },
};

export const Comparison: Story = {
  args: {
    forceView: {
      changeRequests: [],
      columns: comparisonColumns(PINDARIC_SLOT, HORATIAN_SLOT),
      isFresh: false,
      mosaic: SAMPLE_MOSAIC,
      ode: SAMPLE_ODE,
      status: "ode",
      topic: SAMPLE_TOPIC,
    },
  },
};

export const Declined: Story = {
  args: {
    forceView: {
      reason:
        "That looks like random keyboard letters rather than a subject I can celebrate.",
      status: "declined",
      suggestions: [
        "Morning coffee",
        "Rainy day umbrellas",
        "Old library books",
      ],
    },
  },
};

export const ErrorMessage: Story = {
  args: { forceView: { message: BUSY_MESSAGE, status: "error" } },
};

export const SavedOdeOnReload: Story = {
  beforeEach: () => {
    saveLastOde({
      mosaic: SAMPLE_MOSAIC,
      ode: SAMPLE_ODE,
      topic: SAMPLE_TOPIC,
    });
  },
};

export const SavedComparisonOnReload: Story = {
  beforeEach: () => {
    saveLastOde({
      comparison: {
        horatian: SAMPLE_HORATIAN_ODE,
        pindaric: SAMPLE_PINDARIC_ODE,
      },
      mosaic: SAMPLE_MOSAIC,
      ode: SAMPLE_ODE,
      topic: SAMPLE_TOPIC,
    });
  },
};

export const SavedComparisonOneMissing: Story = {
  beforeEach: () => {
    saveLastOde({
      comparison: { pindaric: SAMPLE_PINDARIC_ODE },
      mosaic: SAMPLE_MOSAIC,
      ode: SAMPLE_ODE,
      topic: SAMPLE_TOPIC,
    });
  },
};
