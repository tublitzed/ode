import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  loadLastOde,
  saveComparisonOde,
  saveLastOde,
} from "@/client/utils/localStorage";

const STORAGE_KEY = "ode:lastOde";

const createStorage = () => {
  const items = new Map<string, string>();

  return {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => {
      items.set(key, value);
    },
  };
};

const storeRaw = (value: unknown) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
};

beforeEach(() => {
  vi.stubGlobal("localStorage", createStorage());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("loadLastOde", () => {
  it("returns nothing when no ode is saved", () => {
    expect(loadLastOde()).toBeUndefined();
  });

  it("returns nothing when the saved value isn't valid JSON", () => {
    localStorage.setItem(STORAGE_KEY, "{not json");

    expect(loadLastOde()).toBeUndefined();
  });

  it("loads an ode saved before comparisons existed", () => {
    storeRaw({ ode: "O tomato", topic: "Tomatoes" });

    expect(loadLastOde()).toEqual({
      comparison: {},
      ode: "O tomato",
      topic: "Tomatoes",
    });
  });

  it("keeps only known forms with text in the saved comparison", () => {
    storeRaw({
      comparison: { horatian: "Calm", pindaric: 42, sonnet: "Nope" },
      ode: "O tomato",
      topic: "Tomatoes",
    });

    expect(loadLastOde()?.comparison).toEqual({ horatian: "Calm" });
  });

  it("ignores a saved comparison that isn't an object", () => {
    storeRaw({ comparison: "junk", ode: "O tomato", topic: "Tomatoes" });

    expect(loadLastOde()?.comparison).toEqual({});
  });
});

describe("saveComparisonOde", () => {
  it("adds each comparison ode to the saved ode", () => {
    saveLastOde({ ode: "O tomato", topic: "Tomatoes" });

    saveComparisonOde("pindaric", "Hail, tomato");
    saveComparisonOde("horatian", "Calm tomato");

    expect(loadLastOde()).toEqual({
      comparison: { horatian: "Calm tomato", pindaric: "Hail, tomato" },
      ode: "O tomato",
      topic: "Tomatoes",
    });
  });

  it("replaces a retried comparison ode", () => {
    saveLastOde({
      comparison: { pindaric: "First try" },
      ode: "O tomato",
      topic: "Tomatoes",
    });

    saveComparisonOde("pindaric", "Second try");

    expect(loadLastOde()?.comparison).toEqual({ pindaric: "Second try" });
  });

  it("saves nothing when there is no first ode", () => {
    saveComparisonOde("pindaric", "Hail, tomato");

    expect(loadLastOde()).toBeUndefined();
  });
});

describe("saveLastOde", () => {
  it("clears the old comparison when a new first ode is saved", () => {
    saveLastOde({ ode: "O tomato", topic: "Tomatoes" });
    saveComparisonOde("pindaric", "Hail, tomato");

    saveLastOde({ ode: "O tea", topic: "A cup of tea" });

    expect(loadLastOde()).toEqual({
      comparison: {},
      ode: "O tea",
      topic: "A cup of tea",
    });
  });
});
