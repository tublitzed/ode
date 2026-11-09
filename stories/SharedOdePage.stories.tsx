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

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

const mockShareRequest =
  (respond: () => Promise<Response> | Response) => () => {
    const realFetch = window.fetch;

    window.fetch = async () => respond();

    return () => {
      window.fetch = realFetch;
    };
  };

const meta: Meta<typeof SharedOdePage> = {
  args: { id: "x7Kq2mPa9LwR" },
  component: SharedOdePage,
  title: "SharedOdePage",
};

export default meta;

export const Found: Story = {
  beforeEach: mockShareRequest(() =>
    jsonResponse({ ode: SAMPLE_ODE, topic: "Tomatoes" }),
  ),
};

export const WithComparison: Story = {
  beforeEach: mockShareRequest(() =>
    jsonResponse({
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
    }),
  ),
};

export const LongTopic: Story = {
  beforeEach: mockShareRequest(() =>
    jsonResponse({ ode: SAMPLE_ODE, topic: "a".repeat(100) }),
  ),
};

export const Loading: Story = {
  beforeEach: mockShareRequest(() => new Promise<Response>(() => {})),
};

export const NotFound: Story = {
  beforeEach: mockShareRequest(() =>
    jsonResponse({ error: "We couldn't find that ode." }, 404),
  ),
};

export const LoadError: Story = {
  beforeEach: mockShareRequest(() =>
    jsonResponse(
      { error: "Something went wrong loading this ode. Try again." },
      500,
    ),
  ),
};
