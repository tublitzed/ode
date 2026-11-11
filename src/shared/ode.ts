export const MAX_CHANGE_REQUEST_LENGTH = 300;
export const MAX_CHANGE_REQUESTS = 10;
export const MAX_ODE_LENGTH = 5000;
export const MAX_TOPIC_LENGTH = 100;

export const ODE_TYPES = ["horatian", "irregular", "pindaric"] as const;

export type OdeType = (typeof ODE_TYPES)[number];

export const DEFAULT_ODE_TYPE: OdeType = "irregular";

export const COMPARISON_TYPES: OdeType[] = ["pindaric", "horatian"];

export const ODE_TYPE_DETAILS: Record<
  OdeType,
  { description: string; label: string }
> = {
  horatian: {
    description: "Matching stanzas in a calm, reflective voice.",
    label: "Horatian ode",
  },
  irregular: {
    description:
      "Also called Cowleyan. Stanzas and line lengths change as the poem goes.",
    label: "Irregular ode",
  },
  pindaric: {
    description: "A ceremonial song of praise in three formal parts.",
    label: "Pindaric ode",
  },
};

export const isOdeType = (value: unknown): value is OdeType =>
  ODE_TYPES.includes(value as OdeType);

const TILE_HUES = ["b", "g", "k", "n", "o", "r", "y"] as const;
const TILE_TONES = [1, 2, 3, 4] as const;

export const TILE_COLORS = [
  ...TILE_HUES.flatMap((hue) =>
    TILE_TONES.map((tone) => `${hue}${tone}` as const),
  ),
  "C",
  "K",
  "W",
] as const;

export type TileColor = (typeof TILE_COLORS)[number];

export type MosaicShape = { d: string; fill: TileColor };

export const isTileColor = (value: unknown): value is TileColor =>
  TILE_COLORS.includes(value as TileColor);

export const MAX_MOSAIC_SHAPES = 60;
const MAX_PATH_LENGTH = 4000;
// Allows only characters valid in SVG path data (commands, numbers, separators), so `d` can't carry markup or other text.
const PATH_DATA = /^[MmLlHhVvCcSsQqTtAaZz0-9eE\s,.+-]+$/;

export const isMosaicShape = (value: unknown): value is MosaicShape =>
  typeof value === "object" &&
  value !== null &&
  "d" in value &&
  "fill" in value &&
  typeof value.d === "string" &&
  value.d.length <= MAX_PATH_LENGTH &&
  PATH_DATA.test(value.d) &&
  isTileColor(value.fill);

export const parseMosaic = (value: unknown): MosaicShape[] | undefined =>
  Array.isArray(value) &&
  value.length <= MAX_MOSAIC_SHAPES &&
  value.every(isMosaicShape)
    ? value
    : undefined;

export type Comparison = Partial<Record<OdeType, string>>;

const isComparisonOde = ([type, ode]: [string, unknown]) =>
  COMPARISON_TYPES.includes(type as OdeType) &&
  typeof ode === "string" &&
  ode.trim().length > 0 &&
  ode.length <= MAX_ODE_LENGTH;

export const toComparison = (value: unknown): Comparison => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(Object.entries(value).filter(isComparisonOde));
};

export type SharedOde = {
  comparison?: Comparison;
  mosaic?: MosaicShape[];
  ode: string;
  topic: string;
};

export type OdeResponse =
  | { mosaic?: MosaicShape[]; ode: string; status: "ode" }
  | { reason: string; status: "declined"; suggestions: string[] };
