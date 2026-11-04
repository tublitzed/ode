import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { fn } from "storybook/test";

import OdeDeclined from "@/client/app/OdeDeclined";
import OdeForm from "@/client/app/OdeForm";
import OdeProgress from "@/client/app/OdeProgress";
import OdeResult from "@/client/app/OdeResult";
import { Button } from "@/client/components/ui/button";

const SAMPLE_ODE = `O tomato,
warm
from the windowsill,
you sit there
round as a small
red secret.

Sliced,
you spill
seeds and sunlight
across the cutting board,
salt
falling like
tiny weather.

O tomato,
you are a garden
holding its breath,
a sun
that learned
to fit in a palm.`;

const LONG_TOPIC = "a".repeat(100);
const SUGGESTIONS = [
  "Morning coffee",
  "Rainy day umbrellas",
  "Old library books",
];

type FormStateProps = {
  error?: string;
  initialTopic?: string;
};

const FormState = ({ error, initialTopic = "" }: FormStateProps) => {
  const [topic, setTopic] = useState(initialTopic);

  return (
    <OdeForm
      error={error}
      onSubmit={fn()}
      onTopicChange={setTopic}
      topic={topic}
    />
  );
};

const meta: Meta = {
  decorators: [
    (Story) => (
      <main className="mx-auto flex min-h-svh w-full max-w-md flex-col items-center justify-center gap-4 p-4">
        <Story />
        <Button variant="ghost">Log out</Button>
      </main>
    ),
  ],
  parameters: { layout: "fullscreen" },
  title: "Ode generation",
};

export default meta;

type Story = StoryObj;

export const Idle: Story = {
  render: () => <FormState />,
};

export const TopicEntered: Story = {
  render: () => <FormState initialTopic="Tomatoes" />,
};

export const Generating: Story = {
  render: () => <OdeProgress topic="Tomatoes" />,
};

export const GeneratingLongTopic: Story = {
  render: () => <OdeProgress topic={LONG_TOPIC} />,
};

export const Ode: Story = {
  render: () => (
    <OdeResult ode={SAMPLE_ODE} onWriteAnother={fn()} topic="Tomatoes" />
  ),
};

export const OdeLongTopic: Story = {
  render: () => (
    <OdeResult ode={SAMPLE_ODE} onWriteAnother={fn()} topic={LONG_TOPIC} />
  ),
};

export const DeclinedUnusableTopic: Story = {
  render: () => (
    <OdeDeclined
      onEnterDifferentTopic={fn()}
      onSelectSuggestion={fn()}
      reason="That looks like random keyboard letters rather than a subject I can celebrate."
      suggestions={SUGGESTIONS}
    />
  ),
};

export const DeclinedUnsafeTopic: Story = {
  render: () => (
    <OdeDeclined
      onEnterDifferentTopic={fn()}
      onSelectSuggestion={fn()}
      reason="I keep my odes all-ages, so I can't write sexual content."
      suggestions={SUGGESTIONS}
    />
  ),
};

export const DeclinedModelRefusal: Story = {
  render: () => (
    <OdeDeclined
      onEnterDifferentTopic={fn()}
      onSelectSuggestion={fn()}
      reason="That's not a subject we can write an ode about."
      suggestions={["Tomatoes", "A rainy morning", "My favorite mug"]}
    />
  ),
};

export const ErrorBusy: Story = {
  render: () => (
    <FormState
      error="Ode is very busy right now. Try again in a moment."
      initialTopic="Tomatoes"
    />
  ),
};

export const ErrorUnreachable: Story = {
  render: () => (
    <FormState
      error="We couldn't reach our poet. Try again in a moment."
      initialTopic="Tomatoes"
    />
  ),
};

export const ErrorUnexpected: Story = {
  render: () => (
    <FormState
      error="Something went wrong writing your ode. Try again."
      initialTopic="Tomatoes"
    />
  ),
};

export const ErrorOffline: Story = {
  render: () => (
    <FormState
      error="We couldn't reach Ode. Check your connection and try again."
      initialTopic="Tomatoes"
    />
  ),
};
