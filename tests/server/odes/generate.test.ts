import { beforeEach, describe, expect, it, vi } from "vitest";

import { generateOde } from "@/server/odes/generate.ts";

const { create } = vi.hoisted(() => ({ create: vi.fn() }));

vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages = { create };
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

    await expect(generateOde("Tomatoes", "irregular")).resolves.toEqual({
      ode: "O tomato,\nstar of earth",
      status: "ode",
    });
  });

  it("sends the topic inside topic tags", async () => {
    create.mockResolvedValueOnce(
      modelResponse({ ode: "O", reason: "", status: "ode", suggestions: [] }),
    );

    await generateOde("Tomatoes", "irregular");

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

    await expect(generateOde("asdfghjkl", "irregular")).resolves.toEqual({
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

    await expect(generateOde("asdfghjkl", "irregular")).resolves.toEqual({
      reason: "That looks like random letters.",
      status: "declined",
      suggestions: REFUSAL_SUGGESTIONS,
    });
  });

  it("turns a refusal into a decline", async () => {
    create.mockResolvedValueOnce({ content: [], stop_reason: "refusal" });

    await expect(generateOde("anything", "irregular")).resolves.toEqual({
      reason: "That subject isn’t in our songbook. Try another one.",
      status: "declined",
      suggestions: REFUSAL_SUGGESTIONS,
    });
  });

  it.each([
    ["horatian", "Horatian ode", ["Pindaric ode", "Cowleyan"]],
    ["irregular", "irregular (Cowleyan) ode", ["Horatian ode", "Pindaric ode"]],
    ["pindaric", "Pindaric ode", ["Horatian ode", "Cowleyan"]],
  ] as const)(
    "asks for a %s ode and no other form",
    async (type, expected, otherForms) => {
      create.mockResolvedValueOnce(
        modelResponse({ ode: "O", reason: "", status: "ode", suggestions: [] }),
      );

      await generateOde("Tomatoes", type);

      const { system } = create.mock.calls[0][0];
      expect(system).toContain(expected);
      otherForms.forEach((form) => expect(system).not.toContain(form));
    },
  );

  it("leaves source ode instructions out without a source ode", async () => {
    create.mockResolvedValueOnce(
      modelResponse({ ode: "O", reason: "", status: "ode", suggestions: [] }),
    );

    await generateOde("Tomatoes", "pindaric");

    expect(create.mock.calls[0][0].system).not.toContain("<source_ode>");
  });

  it("sends the source ode in its own tags with instructions", async () => {
    create.mockResolvedValueOnce(
      modelResponse({ ode: "O", reason: "", status: "ode", suggestions: [] }),
    );

    await generateOde("Tomatoes", "pindaric", {
      sourceOde: "O tomato,\nstar of earth",
    });

    const request = create.mock.calls[0][0];
    expect(request.messages).toEqual([
      {
        content:
          "<topic>Tomatoes</topic>\n<source_ode>O tomato,\nstar of earth</source_ode>",
        role: "user",
      },
    ]);
    expect(request.system).toContain("<source_ode>");
  });

  it("leaves revision instructions out without a revision", async () => {
    create.mockResolvedValueOnce(
      modelResponse({ ode: "O", reason: "", status: "ode", suggestions: [] }),
    );

    await generateOde("Tomatoes", "irregular");

    expect(create.mock.calls[0][0].system).not.toContain("<change_request>");
  });

  it("sends a first revision without earlier requests", async () => {
    create.mockResolvedValueOnce(
      modelResponse({ ode: "O", reason: "", status: "ode", suggestions: [] }),
    );

    await generateOde("Tomatoes", "irregular", {
      revision: { changeRequests: ["Mention basil"], previousOde: "O tomato" },
    });

    const request = create.mock.calls[0][0];
    expect(request.messages).toEqual([
      {
        content:
          "<topic>Tomatoes</topic>\n<previous_ode>O tomato</previous_ode>\n<change_request>Mention basil</change_request>",
        role: "user",
      },
    ]);
    expect(request.system).toContain("<change_request>");
    expect(request.system).not.toContain("<source_ode>");
  });

  it("sends earlier requests separately from the new one", async () => {
    create.mockResolvedValueOnce(
      modelResponse({ ode: "O", reason: "", status: "ode", suggestions: [] }),
    );

    await generateOde("Tomatoes", "irregular", {
      revision: {
        changeRequests: ["Keep it short", "Make it funny", "Mention basil"],
        previousOde: "O tomato",
      },
    });

    expect(create.mock.calls[0][0].messages[0].content).toBe(
      [
        "<topic>Tomatoes</topic>",
        "<previous_ode>O tomato</previous_ode>",
        "<earlier_requests>",
        "<request>Keep it short</request>",
        "<request>Make it funny</request>",
        "</earlier_requests>",
        "<change_request>Mention basil</change_request>",
      ].join("\n"),
    );
  });

  it("throws on an unexpected stop reason", async () => {
    create.mockResolvedValueOnce({ content: [], stop_reason: "max_tokens" });

    await expect(generateOde("Tomatoes", "irregular")).rejects.toThrow(
      "Unexpected stop reason: max_tokens",
    );
  });

  it("throws when the response has no text block", async () => {
    create.mockResolvedValueOnce({ content: [], stop_reason: "end_turn" });

    await expect(generateOde("Tomatoes", "irregular")).rejects.toThrow(
      "Response had no text block",
    );
  });

  it("throws without repeating the output when it isn't valid JSON", async () => {
    create.mockResolvedValueOnce({
      content: [{ text: "O tomato, not JSON", type: "text" }],
      stop_reason: "end_turn",
    });

    await expect(generateOde("Tomatoes", "irregular")).rejects.toThrow(
      /^Response was not valid JSON$/,
    );
  });

  it("passes API errors through to the caller", async () => {
    const error = new Error("API failure");
    create.mockRejectedValueOnce(error);

    await expect(generateOde("Tomatoes", "irregular")).rejects.toBe(error);
  });
});
