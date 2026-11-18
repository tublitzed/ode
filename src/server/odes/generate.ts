import { z } from "zod";

import { anthropic, MAX_TOKENS, MODEL } from "#/server/llm/anthropic.ts";
import {
  buildOdeSystemPrompt,
  buildOdeUserMessage,
} from "#/server/llm/prompts/ode.ts";
import type { OdeResponse, OdeType } from "#/shared/ode.ts";

const REFUSAL_REASON = "That subject isn’t in our songbook. Try another one.";
const STATIC_SUGGESTIONS = ["Tomatoes", "A rainy morning", "My favorite mug"];

export type Revision = {
  changeRequests: string[];
  previousOde: string;
};

export type GenerateOptions = {
  revision?: Revision;
  sourceOde?: string;
};

const ModelOutput = z.object({
  ode: z.string(),
  reason: z.string(),
  status: z.enum(["declined", "ode"]),
  suggestions: z.array(z.string()),
});

type ModelOutput = z.infer<typeof ModelOutput>;

const readJson = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Response was not valid JSON");
  }
};

const parseOutput = (text: string): ModelOutput => {
  const output = ModelOutput.safeParse(readJson(text));
  if (!output.success) {
    throw new Error("Response did not match the output schema");
  }

  return output.data;
};

const toOdeResponse = ({
  ode,
  reason,
  status,
  suggestions,
}: ModelOutput): OdeResponse => {
  if (status === "ode") {
    return { ode, status };
  }

  return {
    reason,
    status,
    suggestions: suggestions.length > 0 ? suggestions : STATIC_SUGGESTIONS,
  };
};

export const generateOde = async (
  topic: string,
  type: OdeType,
  options: GenerateOptions = {},
): Promise<OdeResponse> => {
  const response = await anthropic.messages.create({
    max_tokens: MAX_TOKENS,
    messages: [{ content: buildOdeUserMessage(topic, options), role: "user" }],
    model: MODEL,
    output_config: {
      effort: "high",
      format: { schema: z.toJSONSchema(ModelOutput), type: "json_schema" },
    },
    system: buildOdeSystemPrompt(type, options),
  });

  if (response.stop_reason === "refusal") {
    return {
      reason: REFUSAL_REASON,
      status: "declined",
      suggestions: STATIC_SUGGESTIONS,
    };
  }

  if (response.stop_reason !== "end_turn") {
    throw new Error(`Unexpected stop reason: ${response.stop_reason}`);
  }

  const text = response.content.find((block) => block.type === "text");
  if (!text) {
    throw new Error("Response had no text block");
  }

  return toOdeResponse(parseOutput(text.text));
};
