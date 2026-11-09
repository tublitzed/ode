import { randomBytes } from "node:crypto";

import { getDb } from "#/server/db.ts";
import { toComparison } from "#/shared/ode.ts";
import type { SharedOde } from "#/shared/ode.ts";

const ID_BYTES = 8;

export const createSharedOde = async ({
  comparison,
  ode,
  topic,
}: SharedOde) => {
  const id = randomBytes(ID_BYTES).toString("hex");
  const hasComparison = Object.keys(comparison ?? {}).length > 0;

  await getDb().sharedOde.create({
    data: {
      comparison: hasComparison ? comparison : undefined,
      id,
      ode,
      topic,
    },
  });

  return id;
};

export const getSharedOde = async (
  id: string,
): Promise<SharedOde | undefined> => {
  const sharedOde = await getDb().sharedOde.findUnique({
    select: { comparison: true, ode: true, topic: true },
    where: { id },
  });

  if (!sharedOde) {
    return undefined;
  }

  const { comparison, ode, topic } = sharedOde;
  const savedComparison = toComparison(comparison);

  return Object.keys(savedComparison).length > 0
    ? { comparison: savedComparison, ode, topic }
    : { ode, topic };
};
