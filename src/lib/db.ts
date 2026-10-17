import type { PrismaClient } from "@prisma/client";
import { env } from "@/lib/env";
import { createPrismaClient } from "@/lib/prisma-client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  __prismaVersion?: string;
};

// Bust the development hot-reload cache when schema or adapter strategy changes.
const SCHEMA_VERSION = "v6-query-compiler-libsql-2026-10";
const cachedVersion = globalForPrisma.__prismaVersion;
const cachedPrisma = globalForPrisma.prisma;

if (cachedVersion !== SCHEMA_VERSION && cachedPrisma) {
  cachedPrisma.$disconnect().catch(() => {});
  globalForPrisma.prisma = undefined;
}

export const db =
  globalForPrisma.__prismaVersion === SCHEMA_VERSION && globalForPrisma.prisma
    ? globalForPrisma.prisma
    : createPrismaClient(env().databaseUrl, ["error", "warn"]);

if (!env().isProd) {
  globalForPrisma.prisma = db;
  globalForPrisma.__prismaVersion = SCHEMA_VERSION;
}
