import Anthropic from "@anthropic-ai/sdk";

const REQUEST_TIMEOUT_MS = 60_000;

// Used for both ode generation and mosaic creation.
export const MODEL = "claude-sonnet-5-5";
export const MAX_TOKENS = 16_000;

export const anthropic = new Anthropic({
  maxRetries: 1,
  timeout: REQUEST_TIMEOUT_MS,
});
