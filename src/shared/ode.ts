export const MAX_TOPIC_LENGTH = 100;

export type OdeResponse =
  | { ode: string; status: "ode" }
  | { reason: string; status: "declined"; suggestions: string[] };
