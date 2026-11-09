import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "#/generated/prisma/client.ts";

export type Db = PrismaClient;

const getDatabaseUrl = () => {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new Error("DATABASE_URL must be set to a non-blank value.");
  }

  return databaseUrl;
};

export const createDb = (): Db =>
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: getDatabaseUrl() }),
  });
