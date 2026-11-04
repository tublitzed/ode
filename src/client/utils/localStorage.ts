const STORAGE_KEY = "ode:lastOde";

export type LastOde = {
  ode: string;
  topic: string;
};

export const loadLastOde = (): LastOde | undefined => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return undefined;
    }

    const { ode, topic } = JSON.parse(stored);
    if (typeof ode !== "string" || typeof topic !== "string") {
      return undefined;
    }

    return { ode, topic };
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
