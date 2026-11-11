import type {
  OdeColumn,
  OdeSlot,
} from "@/client/components/odes/OdeComparison";
import { SKETCHES } from "@/client/utils/sketches";
import { DEFAULT_ODE_TYPE } from "@/shared/ode";
import type { MosaicShape } from "@/shared/ode";

export const SAMPLE_ODE = `O tomato, red lantern on the tangled vine,
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

export const SAMPLE_PINDARIC_ODE = `Strophe
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

export const SAMPLE_HORATIAN_ODE = `A lantern red hangs low upon the vine,
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

export const SAMPLE_MOSAIC: MosaicShape[] =
  SKETCHES.find(({ topic }) => topic === "tomatoes")?.shapes ?? [];

export const SAMPLE_TOPIC = "Tomatoes";
export const LONG_TOPIC = "a".repeat(100);
export const BUSY_MESSAGE =
  "Every poet is mid-verse right now. Try again in a moment.";

export const GENERATING_SLOT: OdeSlot = { status: "generating" };
export const HORATIAN_SLOT: OdeSlot = {
  ode: SAMPLE_HORATIAN_ODE,
  status: "ode",
};
export const PINDARIC_SLOT: OdeSlot = {
  ode: SAMPLE_PINDARIC_ODE,
  status: "ode",
};

export const comparisonColumns = (
  pindaric: OdeSlot,
  horatian: OdeSlot,
): OdeColumn[] => [
  { slot: pindaric, type: "pindaric" },
  { slot: horatian, type: "horatian" },
];

export const SOURCE_COLUMN: OdeColumn = {
  slot: { ode: SAMPLE_ODE, status: "ode" },
  type: DEFAULT_ODE_TYPE,
};
