import { z } from "zod";

import { MAX_ODE_LENGTH } from "#/shared/ode.ts";

export const odeText = z
  .string()
  .max(MAX_ODE_LENGTH)
  .refine((value) => value.trim() !== "");

export const trimmedText = (maxLength: number) =>
  z.string().trim().min(1).max(maxLength);
