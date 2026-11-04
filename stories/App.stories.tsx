import type { Meta, StoryObj } from "@storybook/react-vite";
import { fireEvent } from "storybook/test";

import App from "@/client/components/App";
import { saveLastOde } from "@/client/utils/localStorage";
import type { OdeResponse } from "@/shared/ode";

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

type Story = StoryObj<typeof App>;
type PlayContext = Parameters<NonNullable<Story["play"]>>[0];

const LONG_TOPIC = "a".repeat(100);

const ODE_RESPONSE: OdeResponse = { ode: SAMPLE_ODE, status: "ode" };

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

const declinedResponse = (reason: string, suggestions: string[]) => {
  const declined: OdeResponse = { reason, status: "declined", suggestions };

  return (topic: string) =>
    suggestions.includes(topic)
      ? jsonResponse(ODE_RESPONSE)
      : jsonResponse(declined);
};

const mockOdeRequest = (
  respond: (topic: string) => Promise<Response> | Response,
) => {
  const realFetch = window.fetch;

  window.fetch = async (input, init) =>
    input === "/api/odes"
      ? respond(JSON.parse(String(init?.body)).topic)
      : realFetch(input, init);

  return () => {
    window.fetch = realFetch;
  };
};

const enterTopic = ({ canvas }: PlayContext, topic: string) => {
  fireEvent.change(canvas.getByRole("textbox"), { target: { value: topic } });
};

const submitTopic = async (context: PlayContext, topic = "Tomatoes") => {
  enterTopic(context, topic);
  await context.userEvent.click(
    context.canvas.getByRole("button", { name: "Write my ode" }),
  );
};

const meta: Meta<typeof App> = {
  beforeEach: () => {
    localStorage.clear();
  },
  component: App,
  parameters: { layout: "fullscreen" },
  title: "App",
};

export default meta;

export const Idle: Story = {};

export const TopicEntered: Story = {
  play: (context) => enterTopic(context, "Tomatoes"),
};

export const Generating: Story = {
  beforeEach: () => mockOdeRequest(() => new Promise(() => {})),
  play: (context) => submitTopic(context),
};

export const GeneratingLongTopic: Story = {
  beforeEach: () => mockOdeRequest(() => new Promise(() => {})),
  play: (context) => submitTopic(context, LONG_TOPIC),
};

export const Ode: Story = {
  beforeEach: () => mockOdeRequest(() => jsonResponse(ODE_RESPONSE)),
  play: (context) => submitTopic(context),
};

export const SavedOdeOnReload: Story = {
  beforeEach: () => {
    saveLastOde({ ode: SAMPLE_ODE, topic: "Tomatoes" });
  },
};

export const SavedOdeLongTopic: Story = {
  beforeEach: () => {
    saveLastOde({ ode: SAMPLE_ODE, topic: LONG_TOPIC });
  },
};

export const DeclinedUnusableTopic: Story = {
  beforeEach: () =>
    mockOdeRequest(
      declinedResponse(
        "That looks like random keyboard letters rather than a subject I can celebrate.",
        ["Morning coffee", "Rainy day umbrellas", "Old library books"],
      ),
    ),
  play: (context) => submitTopic(context, "asdfghjkl"),
};

export const DeclinedUnsafeTopic: Story = {
  beforeEach: () =>
    mockOdeRequest(
      declinedResponse(
        "I keep my odes all-ages, so I can't write sexual content.",
        ["Morning coffee", "A well-worn quilt", "Rain on rooftops"],
      ),
    ),
  play: (context) => submitTopic(context, "An unsafe topic"),
};

export const DeclinedModelRefusal: Story = {
  beforeEach: () =>
    mockOdeRequest(
      declinedResponse("That's not a subject we can write an ode about.", [
        "Tomatoes",
        "A rainy morning",
        "My favorite mug",
      ]),
    ),
  play: (context) => submitTopic(context, "A refused topic"),
};

export const ErrorBusy: Story = {
  beforeEach: () =>
    mockOdeRequest(() =>
      jsonResponse(
        { error: "Ode is very busy right now. Try again in a moment." },
        503,
      ),
    ),
  play: (context) => submitTopic(context),
};

export const ErrorUnreachable: Story = {
  beforeEach: () =>
    mockOdeRequest(() =>
      jsonResponse(
        { error: "We couldn't reach our poet. Try again in a moment." },
        502,
      ),
    ),
  play: (context) => submitTopic(context),
};

export const ErrorUnexpected: Story = {
  beforeEach: () =>
    mockOdeRequest(() =>
      jsonResponse(
        { error: "Something went wrong writing your ode. Try again." },
        500,
      ),
    ),
  play: (context) => submitTopic(context),
};

export const ErrorBadGateway: Story = {
  beforeEach: () =>
    mockOdeRequest(
      () => new Response("<html>Bad Gateway</html>", { status: 502 }),
    ),
  play: (context) => submitTopic(context),
};

export const ErrorOffline: Story = {
  beforeEach: () =>
    mockOdeRequest(() => Promise.reject(new TypeError("Failed to fetch"))),
  play: (context) => submitTopic(context),
};
