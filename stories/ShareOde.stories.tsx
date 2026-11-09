import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";

import ShareOde from "@/client/components/shares/ShareOde";

type Story = StoryObj<typeof ShareOde>;

const SHARE_LINK = "http://localhost:3000/o/petxenaoyswtczm54pcssnr9";

const withComparisonHeaderWidth: Decorator = (StoryComponent) => (
  <div className="w-56">
    <StoryComponent />
  </div>
);

const meta: Meta<typeof ShareOde> = {
  args: { ode: "O tomato", topic: "Tomatoes" },
  component: ShareOde,
  title: "ShareOde",
};

export default meta;

export const Idle: Story = {};

export const Sharing: Story = {
  args: { forceView: { status: "sharing" } },
};

export const Copied: Story = {
  args: { forceView: { link: SHARE_LINK, status: "copied" } },
};

export const CopiedInComparisonHeader: Story = {
  args: { forceView: { link: SHARE_LINK, status: "copied" } },
  decorators: [withComparisonHeaderWidth],
};

export const ClipboardBlocked: Story = {
  args: { forceView: { link: SHARE_LINK, status: "clipboardBlocked" } },
};

export const ClipboardBlockedInComparisonHeader: Story = {
  args: { forceView: { link: SHARE_LINK, status: "clipboardBlocked" } },
  decorators: [withComparisonHeaderWidth],
};

export const Failed: Story = {
  args: {
    forceView: {
      message: "Something went wrong sharing your ode. Try again.",
      status: "error",
    },
  },
};
