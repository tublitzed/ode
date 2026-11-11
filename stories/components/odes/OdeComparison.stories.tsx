import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import OdeComparison from "@/client/components/odes/OdeComparison";
import type { OdeSlot } from "@/client/components/odes/OdeComparison";
import { Button } from "@/client/components/ui/button";

import { withMainColumn } from "@stories/decorators";
import {
  BUSY_MESSAGE,
  comparisonColumns,
  GENERATING_SLOT,
  HORATIAN_SLOT,
  PINDARIC_SLOT,
  SAMPLE_MOSAIC,
  SAMPLE_TOPIC,
  SOURCE_COLUMN,
} from "@stories/fixtures";

type Story = StoryObj<typeof OdeComparison>;

const BUSY_SLOT: OdeSlot = { message: BUSY_MESSAGE, status: "failed" };

const withColumns = (pindaric: OdeSlot, horatian: OdeSlot) => [
  SOURCE_COLUMN,
  ...comparisonColumns(pindaric, horatian),
];

const meta: Meta<typeof OdeComparison> = {
  args: {
    actions: (
      <Button className="col-span-2" size="compact">
        Write another ode
      </Button>
    ),
    columns: withColumns(PINDARIC_SLOT, HORATIAN_SLOT),
    mosaic: SAMPLE_MOSAIC,
    onRetry: fn(),
    topic: SAMPLE_TOPIC,
  },
  component: OdeComparison,
  decorators: [withMainColumn],
  parameters: { layout: "fullscreen" },
};

export default meta;

export const Complete: Story = {};

export const Writing: Story = {
  args: { columns: withColumns(GENERATING_SLOT, GENERATING_SLOT) },
};

export const SectionTooltip: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.hover(
      await canvas.findByRole("button", { name: "Strophe" }),
    );
  },
};

export const OneFailed: Story = {
  args: { columns: withColumns(BUSY_SLOT, HORATIAN_SLOT) },
};

export const OneDeclined: Story = {
  args: {
    columns: withColumns(PINDARIC_SLOT, {
      message: "That subject isn’t in our songbook. Try another one.",
      status: "failed",
    }),
  },
};

export const BothFailed: Story = {
  args: { columns: withColumns(BUSY_SLOT, BUSY_SLOT) },
};

export const WithoutMosaic: Story = {
  args: { mosaic: undefined },
};
