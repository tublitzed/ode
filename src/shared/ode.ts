export const MAX_ODE_LENGTH = 5000;
export const MAX_TOPIC_LENGTH = 100;

export type SharedOde = {
  ode: string;
  topic: string;
};

export type OdeResponse =
  | { ode: string; status: "ode" }
  | { reason: string; status: "declined"; suggestions: string[] };
