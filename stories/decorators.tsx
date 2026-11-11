import type { Decorator } from "@storybook/react-vite";

export const withMainColumn: Decorator = (StoryComponent) => (
  <main className="flex w-full flex-col items-center px-4 pt-8 pb-20 text-center">
    <StoryComponent />
  </main>
);
