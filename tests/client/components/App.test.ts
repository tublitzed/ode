import { describe, expect, it } from "vitest";

import { toComparisonColumns } from "@/client/components/App";

describe("toComparisonColumns", () => {
  it("restores no columns when nothing was compared", () => {
    expect(toComparisonColumns({})).toEqual([]);
  });

  it("restores both saved odes in column order", () => {
    expect(toComparisonColumns({ horatian: "Calm", pindaric: "Hail" })).toEqual(
      [
        { slot: { ode: "Hail", status: "ode" }, type: "pindaric" },
        { slot: { ode: "Calm", status: "ode" }, type: "horatian" },
      ],
    );
  });

  it("restores an unsaved ode as a column to write again", () => {
    expect(toComparisonColumns({ pindaric: "Hail" })).toEqual([
      { slot: { ode: "Hail", status: "ode" }, type: "pindaric" },
      {
        slot: {
          message: "This ode didn't finish. Try writing it again.",
          status: "failed",
        },
        type: "horatian",
      },
    ]);
  });
});
