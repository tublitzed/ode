import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";

import ShareOde from "@/client/components/shares/ShareOde";

type Story = StoryObj<typeof ShareOde>;

const SHARE_LINK = "http://localhost:3000/o/petxenaoyswtczm54pcssnr9";

const withNarrowWidth: Decorator = (StoryComponent) => (
  <div className="w-56">
    <StoryComponent />
  </div>
);

const meta: Meta<typeof ShareOde> = {
  args: { ode: "O tomato", topic: "Tomatoes" },
  component: ShareOde,
};

export default meta;

export const Idle: Story = {};

export const Sharing: Story = {
  args: { forceView: { status: "sharing" } },
};

export const Copied: Story = {
  args: { forceView: { link: SHARE_LINK, status: "copied" } },
};

export const CopiedNarrow: Story = {
  args: { forceView: { link: SHARE_LINK, status: "copied" } },
  decorators: [withNarrowWidth],
};

export const ClipboardBlocked: Story = {
  args: { forceView: { link: SHARE_LINK, status: "clipboardBlocked" } },
};

export const ClipboardBlockedNarrow: Story = {
  args: { forceView: { link: SHARE_LINK, status: "clipboardBlocked" } },
  decorators: [withNarrowWidth],
};

export const Failed: Story = {
  args: {
    forceView: {
      message: "The ode slipped as we framed it. Try sharing again.",
      status: "error",
    },
  },
};
