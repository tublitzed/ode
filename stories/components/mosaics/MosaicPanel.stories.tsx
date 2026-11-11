import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import MosaicPanel from "@/client/components/mosaics/MosaicPanel";
import { NIGHTINGALE } from "@/client/utils/nightingale";

import { SAMPLE_MOSAIC } from "@stories/fixtures";

type Story = StoryObj<typeof MosaicPanel>;

const meta: Meta<typeof MosaicPanel> = {
  args: {
    className: "max-w-100",
    label: "A mosaic of a tomato",
    onLaid: fn(),
    shapes: SAMPLE_MOSAIC,
    state: "laid",
  },
  component: MosaicPanel,
};

export default meta;

export const Waiting: Story = {
  args: { label: "An empty mosaic, waiting for its picture", state: "waiting" },
};

export const Laying: Story = {
  args: { state: "laying" },
};

export const Laid: Story = {};

export const Nightingale: Story = {
  args: {
    label: "A mosaic of a nightingale singing on a branch",
    shapes: NIGHTINGALE,
  },
};
