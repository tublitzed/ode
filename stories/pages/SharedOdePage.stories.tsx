import type { Meta, StoryObj } from "@storybook/react-vite";

import SharedOdePage from "@/client/components/shares/SharedOdePage";

import {
  LONG_TOPIC,
  SAMPLE_HORATIAN_ODE,
  SAMPLE_MOSAIC,
  SAMPLE_ODE,
  SAMPLE_PINDARIC_ODE,
  SAMPLE_TOPIC,
} from "@stories/fixtures";

type Story = StoryObj<typeof SharedOdePage>;

const meta: Meta<typeof SharedOdePage> = {
  args: { id: "x7Kq2mPa9LwR" },
  component: SharedOdePage,
  parameters: { layout: "fullscreen" },
};

export default meta;

export const Found: Story = {
  args: {
    forceView: {
      sharedOde: {
        mosaic: SAMPLE_MOSAIC,
        ode: SAMPLE_ODE,
        topic: SAMPLE_TOPIC,
      },
      status: "found",
    },
  },
};

export const FoundWithoutMosaic: Story = {
  args: {
    forceView: {
      sharedOde: { ode: SAMPLE_ODE, topic: SAMPLE_TOPIC },
      status: "found",
    },
  },
};

export const WithComparison: Story = {
  args: {
    forceView: {
      sharedOde: {
        comparison: {
          horatian: SAMPLE_HORATIAN_ODE,
          pindaric: SAMPLE_PINDARIC_ODE,
        },
        mosaic: SAMPLE_MOSAIC,
        ode: SAMPLE_ODE,
        topic: SAMPLE_TOPIC,
      },
      status: "found",
    },
  },
};

export const LongTopic: Story = {
  args: {
    forceView: {
      sharedOde: { mosaic: SAMPLE_MOSAIC, ode: SAMPLE_ODE, topic: LONG_TOPIC },
      status: "found",
    },
  },
};

export const Loading: Story = {
  args: { forceView: { status: "loading" } },
};

export const NotFound: Story = {
  args: { forceView: { status: "notFound" } },
};

export const LoadError: Story = {
  args: {
    forceView: {
      message: "We couldn’t hear this ode just now. Try again in a moment.",
      status: "error",
    },
  },
};
