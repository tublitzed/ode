export const MAX_ODE_LENGTH = 5000;
export const MAX_TOPIC_LENGTH = 100;

export type OdeResponse =
  | { ode: string; status: "ode" }
  | { reason: string; status: "declined"; suggestions: string[] };
