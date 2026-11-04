import { beforeEach, describe, expect, it, vi } from "vitest";

import { generateOde } from "@/server/odes/generate.ts";

const { create } = vi.hoisted(() => ({ create: vi.fn() }));

vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    beta = { messages: { create } };
  },
}));

const REFUSAL_SUGGESTIONS = ["Tomatoes", "A rainy morning", "My favorite mug"];

const modelResponse = (output: object) => ({
  content: [{ text: JSON.stringify(output), type: "text" }],
  stop_reason: "end_turn",
});

beforeEach(() => {
  create.mockReset();
});

describe("generateOde", () => {
  it("returns the ode Claude writes", async () => {
    create.mockResolvedValueOnce(
      modelResponse({
        ode: "O tomato,\nstar of earth",
        reason: "",
        status: "ode",
        suggestions: [],
      }),
    );

    await expect(generateOde("Tomatoes")).resolves.toEqual({
      ode: "O tomato,\nstar of earth",
      status: "ode",
    });
  });

  it("sends the topic inside topic tags", async () => {
    create.mockResolvedValueOnce(
      modelResponse({ ode: "O", reason: "", status: "ode", suggestions: [] }),
    );

    await generateOde("Tomatoes");

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [{ content: "<topic>Tomatoes</topic>", role: "user" }],
      }),
    );
  });

  it("returns a decline with Claude's reason and suggestions", async () => {
    create.mockResolvedValueOnce(
      modelResponse({
        ode: "",
        reason: "That looks like random letters.",
        status: "declined",
        suggestions: ["Morning coffee", "Rain", "Old books"],
      }),
    );

    await expect(generateOde("asdfghjkl")).resolves.toEqual({
      reason: "That looks like random letters.",
      status: "declined",
      suggestions: ["Morning coffee", "Rain", "Old books"],
    });
  });

  it("falls back to static suggestions when a decline has none", async () => {
    create.mockResolvedValueOnce(
      modelResponse({
        ode: "",
        reason: "That looks like random letters.",
        status: "declined",
        suggestions: [],
      }),
    );

    await expect(generateOde("asdfghjkl")).resolves.toEqual({
      reason: "That looks like random letters.",
      status: "declined",
      suggestions: REFUSAL_SUGGESTIONS,
    });
  });

  it("turns a refusal into a decline", async () => {
    create.mockResolvedValueOnce({ content: [], stop_reason: "refusal" });

    await expect(generateOde("anything")).resolves.toEqual({
      reason: "That's not a subject we can write an ode about.",
      status: "declined",
      suggestions: REFUSAL_SUGGESTIONS,
    });
  });

  it("throws on an unexpected stop reason", async () => {
    create.mockResolvedValueOnce({ content: [], stop_reason: "max_tokens" });

    await expect(generateOde("Tomatoes")).rejects.toThrow(
      "Unexpected stop reason: max_tokens",
    );
  });

  it("throws when the response has no text block", async () => {
    create.mockResolvedValueOnce({ content: [], stop_reason: "end_turn" });

    await expect(generateOde("Tomatoes")).rejects.toThrow(
      "Response had no text block",
    );
  });

  it("throws without repeating the output when it isn't valid JSON", async () => {
    create.mockResolvedValueOnce({
      content: [{ text: "O tomato, not JSON", type: "text" }],
      stop_reason: "end_turn",
    });

    await expect(generateOde("Tomatoes")).rejects.toThrow(
      /^Response was not valid JSON$/,
    );
  });

  it("passes API errors through to the caller", async () => {
    const error = new Error("API failure");
    create.mockRejectedValueOnce(error);

    await expect(generateOde("Tomatoes")).rejects.toBe(error);
  });
});
