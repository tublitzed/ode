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
  ode: string;
  topic: string;
};

export type OdeResponse =
  | { ode: string; status: "ode" }
  | { reason: string; status: "declined"; suggestions: string[] };
