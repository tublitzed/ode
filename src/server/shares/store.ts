import type { Db } from "#/server/db.ts";
import { parseMosaic, toComparison } from "#/shared/ode.ts";
import type { SharedOde } from "#/shared/ode.ts";

export const createSharedOde = async (
  db: Db,
  { comparison, mosaic, ode, topic }: SharedOde,
) => {
  const hasComparison = Object.keys(comparison ?? {}).length > 0;

  const { id } = await db.sharedOde.create({
    data: {
      comparison: hasComparison ? comparison : undefined,
      mosaic,
      ode,
      topic,
    },
    select: { id: true },
  });

  return id;
};

export const getSharedOde = async (
  db: Db,
  id: string,
): Promise<SharedOde | undefined> => {
  const sharedOde = await db.sharedOde.findUnique({
    select: { comparison: true, mosaic: true, ode: true, topic: true },
    where: { id },
  });

  if (!sharedOde) {
    return undefined;
  }

  const { comparison, mosaic, ode, topic } = sharedOde;
  const savedComparison = toComparison(comparison);
  const savedMosaic = parseMosaic(mosaic);

  return {
    ...(Object.keys(savedComparison).length > 0 && {
      comparison: savedComparison,
    }),
    ...(savedMosaic && { mosaic: savedMosaic }),
    ode,
    topic,
  };
};
