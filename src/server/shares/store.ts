import { PrismaPg } from "@prisma/adapter-pg";
import { randomBytes } from "node:crypto";

import { PrismaClient } from "#/generated/prisma/client.ts";

const ID_BYTES = 9;

type SharedOde = {
  ode: string;
  topic: string;
};

let client: PrismaClient | undefined;

export const getDatabaseUrl = () => {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new Error("DATABASE_URL must be set to a non-blank value.");
  }

  return databaseUrl;
};

const getClient = () => {
  client ??= new PrismaClient({
    adapter: new PrismaPg({ connectionString: getDatabaseUrl() }),
  });

  return client;
};

export const createSharedOde = async ({ ode, topic }: SharedOde) => {
  const id = randomBytes(ID_BYTES).toString("base64url");

  await getClient().sharedOde.create({ data: { id, ode, topic } });

  return id;
};

export const getSharedOde = async (
  id: string,
): Promise<SharedOde | undefined> => {
  const sharedOde = await getClient().sharedOde.findUnique({
    select: { ode: true, topic: true },
    where: { id },
  });

  return sharedOde ?? undefined;
};
