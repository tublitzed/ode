import { z } from "zod";

import { anthropic, MAX_TOKENS, MODEL } from "#/server/llm/anthropic.ts";
import {
  buildMosaicUserMessage,
  MOSAIC_SYSTEM_PROMPT,
} from "#/server/llm/prompts/mosaic.ts";
import { isMosaicShape, MAX_MOSAIC_SHAPES, TILE_COLORS } from "#/shared/ode.ts";
import type { MosaicShape } from "#/shared/ode.ts";

const MIN_SHAPES = 5;

const OUTPUT_SCHEMA = z.toJSONSchema(
  z.object({
    shapes: z.array(z.object({ d: z.string(), fill: z.enum(TILE_COLORS) })),
  }),
);

export const toMosaic = (text: string): MosaicShape[] | undefined => {
  const output = JSON.parse(text);
  const shapes: MosaicShape[] = Array.isArray(output.shapes)
    ? output.shapes.filter(isMosaicShape).slice(0, MAX_MOSAIC_SHAPES)
    : [];

  return shapes.length < MIN_SHAPES ? undefined : shapes;
};

export const drawMosaic = async (
  topic: string,
  signal?: AbortSignal,
): Promise<MosaicShape[] | undefined> => {
  const response = await anthropic.messages.create(
    {
      max_tokens: MAX_TOKENS,
      messages: [{ content: buildMosaicUserMessage(topic), role: "user" }],
      model: MODEL,
      output_config: {
        effort: "medium",
        format: { schema: OUTPUT_SCHEMA, type: "json_schema" },
      },
      system: MOSAIC_SYSTEM_PROMPT,
    },
    { signal },
  );

  const text = response.content.find((block) => block.type === "text");
  if (response.stop_reason !== "end_turn" || !text) {
    return undefined;
  }

  return toMosaic(text.text);
};
