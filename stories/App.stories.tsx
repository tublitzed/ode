import type { Meta, StoryObj } from "@storybook/react-vite";
import { fireEvent } from "storybook/test";

import App from "@/client/components/App";
import { saveLastOde } from "@/client/utils/localStorage";

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

type Story = StoryObj<typeof App>;
type PlayContext = Parameters<NonNullable<Story["play"]>>[0];
type ForceView = NonNullable<NonNullable<Story["args"]>["forceView"]>;
type Column = NonNullable<ForceView["columns"]>[number];
type ColumnSlot = Column["slot"];

const BUSY_MESSAGE =
  "Every poet is mid-verse right now. Try again in a moment.";
const LONG_TOPIC = "a".repeat(100);

const GENERATING_SLOT: ColumnSlot = { status: "generating" };
const HORATIAN_SLOT: ColumnSlot = { ode: SAMPLE_HORATIAN_ODE, status: "ode" };
const PINDARIC_SLOT: ColumnSlot = { ode: SAMPLE_PINDARIC_ODE, status: "ode" };

const comparisonView = (
  pindaric: ColumnSlot,
  horatian: ColumnSlot,
): ForceView => ({
  columns: [
    { slot: pindaric, type: "pindaric" },
    { slot: horatian, type: "horatian" },
  ],
  isFresh: false,
  ode: SAMPLE_ODE,
  status: "ode",
  topic: "Tomatoes",
});

const enterTopic = ({ canvas }: PlayContext, topic: string) => {
  fireEvent.change(canvas.getByRole("textbox"), { target: { value: topic } });
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
  args: { forceView: { status: "generating", topic: "Tomatoes" } },
};

export const GeneratingLongTopic: Story = {
  args: { forceView: { status: "generating", topic: LONG_TOPIC } },
};

export const Ode: Story = {
  args: {
    forceView: {
      isFresh: false,
      ode: SAMPLE_ODE,
      status: "ode",
      topic: "Tomatoes",
    },
  },
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
  args: { forceView: comparisonView(GENERATING_SLOT, GENERATING_SLOT) },
};

export const ComparisonComplete: Story = {
  args: { forceView: comparisonView(PINDARIC_SLOT, HORATIAN_SLOT) },
};

export const ComparisonSectionTooltip: Story = {
  args: { forceView: comparisonView(PINDARIC_SLOT, HORATIAN_SLOT) },
  play: async ({ canvas, userEvent }) => {
    await userEvent.hover(
      await canvas.findByRole("button", { name: "Strophe" }),
    );
  },
};

export const ComparisonOneFailed: Story = {
  args: {
    forceView: comparisonView(
      { message: BUSY_MESSAGE, status: "failed" },
      HORATIAN_SLOT,
    ),
  },
};

export const ComparisonOneDeclined: Story = {
  args: {
    forceView: comparisonView(PINDARIC_SLOT, {
      message: "That subject isn’t in our songbook. Try another one.",
      status: "failed",
    }),
  },
};

export const ComparisonBothFailed: Story = {
  args: {
    forceView: comparisonView(
      { message: BUSY_MESSAGE, status: "failed" },
      { message: BUSY_MESSAGE, status: "failed" },
    ),
  },
};

export const ComparisonSaved: Story = {
  beforeEach: () => {
    saveLastOde({
      comparison: {
        horatian: SAMPLE_HORATIAN_ODE,
        pindaric: SAMPLE_PINDARIC_ODE,
      },
      ode: SAMPLE_ODE,
      topic: "Tomatoes",
    });
  },
};

export const ComparisonSavedOneMissing: Story = {
  beforeEach: () => {
    saveLastOde({
      comparison: { pindaric: SAMPLE_PINDARIC_ODE },
      ode: SAMPLE_ODE,
      topic: "Tomatoes",
    });
  },
};

export const DeclinedUnusableTopic: Story = {
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

export const DeclinedUnsafeTopic: Story = {
  args: {
    forceView: {
      reason: "I keep my odes all-ages, so I can't write sexual content.",
      status: "declined",
      suggestions: ["Morning coffee", "A well-worn quilt", "Rain on rooftops"],
    },
  },
};

export const DeclinedModelRefusal: Story = {
  args: {
    forceView: {
      reason: "That subject isn’t in our songbook. Try another one.",
      status: "declined",
      suggestions: ["Tomatoes", "A rainy morning", "My favorite mug"],
    },
  },
};

export const ErrorBusy: Story = {
  args: { forceView: { message: BUSY_MESSAGE, status: "error" } },
};

export const ErrorUnreachable: Story = {
  args: {
    forceView: {
      message:
        "Our poet wandered off in search of inspiration. Try again in a moment.",
      status: "error",
    },
  },
};

export const ErrorUnexpected: Story = {
  args: {
    forceView: {
      message: "Our poet dropped the quill. Try again.",
      status: "error",
    },
  },
};

export const ErrorBadGateway: Story = {
  args: {
    forceView: {
      message: "The muse lost the thread. Try again.",
      status: "error",
    },
  },
};

export const ErrorOffline: Story = {
  args: {
    forceView: {
      message: "Ode is out of earshot. Check your connection and try again.",
      status: "error",
    },
  },
};
