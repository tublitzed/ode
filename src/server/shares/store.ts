import { randomBytes } from "node:crypto";

import { getDb } from "#/server/db.ts";
import type { SharedOde } from "#/shared/ode.ts";

const ID_BYTES = 8;

export const createSharedOde = async ({ ode, topic }: SharedOde) => {
  const id = randomBytes(ID_BYTES).toString("hex");

  await getDb().sharedOde.create({ data: { id, ode, topic } });

  return id;
};

export const getSharedOde = async (
  id: string,
): Promise<SharedOde | undefined> => {
  const sharedOde = await getDb().sharedOde.findUnique({
    select: { ode: true, topic: true },
    where: { id },
  });

  return sharedOde ?? undefined;
};
