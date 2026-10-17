import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";

/**
 * Construct the generated query-compiler client for the authoritative SQLite
 * schema. Keeping adapter setup in one place prevents scripts and workers from
 * accidentally instantiating a native-engine client or accepting mysql://.
 */
export function createPrismaClient(
  databaseUrl: string,
  log: Array<"query" | "info" | "warn" | "error"> = ["error"],
): PrismaClient {
  if (!databaseUrl.startsWith("file:")) {
    throw new Error(
      "DATABASE_URL must use file: while prisma/schema.prisma is configured for SQLite.",
    );
  }

  return new PrismaClient({
    adapter: new PrismaLibSQL({ url: databaseUrl }),
    log,
  });
}
