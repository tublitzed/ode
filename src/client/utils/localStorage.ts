import { isOdeType } from "@/shared/ode";
import type { OdeType } from "@/shared/ode";

const STORAGE_KEY = "ode:lastOde";

export type SavedComparison = Partial<Record<OdeType, string>>;

export type LastOde = {
  comparison?: SavedComparison;
  ode: string;
  topic: string;
};

const readComparison = (value: unknown): SavedComparison =>
  Object.fromEntries(
    Object.entries(value ?? {}).filter(
      ([type, ode]) => isOdeType(type) && typeof ode === "string",
    ),
  );

export const loadLastOde = (): LastOde | undefined => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return undefined;
    }

    const { comparison, ode, topic } = JSON.parse(stored);
    if (typeof ode !== "string" || typeof topic !== "string") {
      return undefined;
    }

    return { comparison: readComparison(comparison), ode, topic };
  } catch {
    return undefined;
  }
};

export const saveLastOde = (lastOde: LastOde) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lastOde));
  } catch {
    return;
  }
};

export const saveComparisonOde = (type: OdeType, ode: string) => {
  const lastOde = loadLastOde();
  if (!lastOde) {
    return;
  }

  saveLastOde({
    ...lastOde,
    comparison: { ...lastOde.comparison, [type]: ode },
  });
};
