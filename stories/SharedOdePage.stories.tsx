import type { Meta, StoryObj } from "@storybook/react-vite";

import SharedOdePage from "@/client/components/shares/SharedOdePage";

const SAMPLE_ODE = `O tomato,
warm
from the windowsill,
you sit there
round as a small
red secret.

O tomato,
you are a garden
holding its breath.`;

type Story = StoryObj<typeof SharedOdePage>;

const meta: Meta<typeof SharedOdePage> = {
  args: { id: "x7Kq2mPa9LwR" },
  component: SharedOdePage,
  title: "SharedOdePage",
};

export default meta;

export const Found: Story = {
  args: {
    forceView: {
      sharedOde: { ode: SAMPLE_ODE, topic: "Tomatoes" },
      status: "found",
    },
  },
};

export const WithComparison: Story = {
  args: {
    forceView: {
      sharedOde: {
        comparison: {
          horatian: `A lantern red hangs low upon the vine,
And summer gathers in its quiet skin.`,
          pindaric: `Strophe
Sing, chorus, of the tomato's flame!

Antistrophe
Sing back, chorus, of its humble name!

Epode
Praise it, and be still.`,
        },
        ode: SAMPLE_ODE,
        topic: "Tomatoes",
      },
      status: "found",
    },
  },
};

export const LongTopic: Story = {
  args: {
    forceView: {
      sharedOde: { ode: SAMPLE_ODE, topic: "a".repeat(100) },
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
      message: "Something went wrong loading this ode. Try again.",
      status: "error",
    },
  },
};
