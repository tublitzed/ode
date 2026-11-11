import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import OdeDeclined from "@/client/components/odes/OdeDeclined";

import { withMainColumn } from "@stories/decorators";

type Story = StoryObj<typeof OdeDeclined>;

const meta: Meta<typeof OdeDeclined> = {
  args: {
    onEnterDifferentTopic: fn(),
    onSelectSuggestion: fn(),
  },
  component: OdeDeclined,
  decorators: [withMainColumn],
  parameters: { layout: "fullscreen" },
};

export default meta;

export const UnusableTopic: Story = {
  args: {
    reason:
      "That looks like random keyboard letters rather than a subject I can celebrate.",
    suggestions: ["Morning coffee", "Rainy day umbrellas", "Old library books"],
  },
};

export const UnsafeTopic: Story = {
  args: {
    reason: "I keep my odes all-ages, so I can't write sexual content.",
    suggestions: ["Morning coffee", "A well-worn quilt", "Rain on rooftops"],
  },
};

export const ModelRefusal: Story = {
  args: {
    reason: "That subject isn’t in our songbook. Try another one.",
    suggestions: ["Tomatoes", "A rainy morning", "My favorite mug"],
  },
};
