import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import OdeResult from "@/client/components/odes/OdeResult";

import { withMainColumn } from "@stories/decorators";
import {
  LONG_TOPIC,
  SAMPLE_MOSAIC,
  SAMPLE_ODE,
  SAMPLE_TOPIC,
} from "@stories/fixtures";

type Story = StoryObj<typeof OdeResult>;

const meta: Meta<typeof OdeResult> = {
  args: {
    changeRequest: "",
    isFresh: false,
    isRevising: false,
    mosaic: SAMPLE_MOSAIC,
    ode: SAMPLE_ODE,
    onChangeRequestChange: fn(),
    onCompare: fn(),
    onRevise: fn(),
    onWriteAnother: fn(),
    topic: SAMPLE_TOPIC,
  },
  component: OdeResult,
  decorators: [withMainColumn],
  parameters: { layout: "fullscreen" },
};

export default meta;

export const Laid: Story = {};

export const LayingFreshOde: Story = {
  args: { isFresh: true },
};

export const WithoutMosaic: Story = {
  args: { mosaic: undefined },
};

export const LongTopic: Story = {
  args: { topic: LONG_TOPIC },
};
