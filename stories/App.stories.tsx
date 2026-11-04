import type { Meta, StoryObj } from "@storybook/react-vite";
import { fireEvent } from "storybook/test";

import App from "@/client/components/App";
import { saveLastOde } from "@/client/utils/localStorage";
import type { OdeResponse, OdeType } from "@/shared/ode";

const SAMPLE_ODE = `O tomato, red lantern on the tangled vine,
warm as a cheek that the noon has kissed,
you hang there heavy, taut, and fine,
while bees stitch the air through the morning mist.
I pluck you, and my fingers smell of summer's green,
the sweetest sharp thing I have ever seen.

Slice you, and the seeds spill out like jewels in jelly,
and juice runs down my wrist and tickles my belly.
A pinch of salt, a crust of bread,
and every grumpy thought has fled.

You simmer down in a pot on the stove,
and the windows fog like a cozy cove;
every pasta twirl and pizza's sweet swirl
sets a small sun on the plate for a hungry boy or girl,
round little planets we cheerfully ate!
Oh, what a feast, and oh, how great!
So here's to the globe that every garden grows,
a whole red cosmos planted in rows!`;

const SAMPLE_PINDARIC_ODE = `Strophe
Hear me, assembled gardens, hear me sing
of lanterns lit upon the tangled vine,
each one a warm red cheek the noon will bring
to heavy ripeness, taut and crowned with shine,
while bees stitch morning mist with threads of gold,
and green-sharp summer clings to hands that hold.

Antistrophe
Now slice one open: see the jewels spill
through jelly, while the juice runs down the wrist;
a pinch of salt, a crust of bread, and still
each grumbling thought is by that bite dismissed;
so let the pot fog every window pane,
and set small suns on plates for us again.

Epode
O globe of garden days,
red planet, row on row,
we praise you as we go
to feast in summer's blaze.`;

const SAMPLE_HORATIAN_ODE = `A lantern red hangs low upon the vine,
and bees go stitching through the morning air;
I reach, and find it warm, and call it mine,
my fingers smelling green and sharp and rare.

I set the blade to slice it on the board,
and seeds slip out in jelly, bright and wet;
the juice runs down my wrist, a scarlet hoard,
with salt and bread, and nothing to regret.

At dusk I let them simmer in the pot,
and steam climbs up to cloud the window glass,
as evening loosens, knot by gentle knot,
and sweetness thickens as the hours pass.

A bowl of pasta, steaming, takes its place,
a twirl of fork, a sun upon the plate,
and red light warms the corners of my face;
I eat in silence, and the world can wait.

Outside, the garden rows lie dim and still,
each vine a quiet promise in the dark;
I think of how a single seed can fill
a summer with its small and crimson spark.`;

const SAMPLE_ODES: Record<OdeType, string> = {
  horatian: SAMPLE_HORATIAN_ODE,
  irregular: SAMPLE_ODE,
  pindaric: SAMPLE_PINDARIC_ODE,
};

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

const sampleOdeResponse = (type: OdeType) =>
  jsonResponse({ ode: SAMPLE_ODES[type], status: "ode" });

const mockOdeRequest = (
  respond: (topic: string, type: OdeType) => Promise<Response> | Response,
) => {
  const realFetch = window.fetch;

  window.fetch = async (input, init) => {
    if (input !== "/api/odes") {
      return realFetch(input, init);
    }

    const { topic, type } = JSON.parse(String(init?.body));
    return respond(topic, type);
  };

  return () => {
    window.fetch = realFetch;
  };
};

const saveSampleOde = () => {
  saveLastOde({ ode: SAMPLE_ODE, topic: "Tomatoes" });
};

const startComparison = ({ canvas, userEvent }: PlayContext) =>
  userEvent.click(
    canvas.getByRole("button", { name: "Compare Pindaric and Horatian odes" }),
  );

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

export const ComparisonGenerating: Story = {
  beforeEach: () => {
    saveSampleOde();
    return mockOdeRequest(() => new Promise(() => {}));
  },
  play: startComparison,
};

export const ComparisonComplete: Story = {
  beforeEach: () => {
    saveSampleOde();
    return mockOdeRequest((_topic, type) => sampleOdeResponse(type));
  },
  play: startComparison,
};

export const ComparisonSectionTooltip: Story = {
  beforeEach: () => {
    saveSampleOde();
    return mockOdeRequest((_topic, type) => sampleOdeResponse(type));
  },
  play: async (context) => {
    await startComparison(context);
    await context.userEvent.hover(
      await context.canvas.findByRole("button", { name: "Strophe" }),
    );
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
