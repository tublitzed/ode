import type { Meta, StoryObj } from "@storybook/react-vite";

import LoginPage from "@/client/components/LoginPage";

type Story = StoryObj<typeof LoginPage>;
type PlayContext = Parameters<NonNullable<Story["play"]>>[0];

const respondToLogin = (status: number) => () => {
  const originalFetch = window.fetch;

  window.fetch = (input, init) =>
    String(input) === "/api/login"
      ? Promise.resolve(new Response(null, { status }))
      : originalFetch(input, init);

  return () => {
    window.fetch = originalFetch;
  };
};

const submitPassword = async ({ canvas, userEvent }: PlayContext) => {
  await userEvent.type(canvas.getByLabelText(/password/i), "not-it");
  await userEvent.click(canvas.getByRole("button", { name: "Log in" }));
  await canvas.findByRole("alert");
};

const meta: Meta<typeof LoginPage> = {
  component: LoginPage,
  parameters: { layout: "fullscreen" },
};

export default meta;

export const Idle: Story = {};

export const WrongPassword: Story = {
  beforeEach: respondToLogin(401),
  play: submitPassword,
};

export const ServerError: Story = {
  beforeEach: respondToLogin(500),
  play: submitPassword,
};
