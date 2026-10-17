import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  __prismaVersion?: string
}

const SCHEMA_VERSION = 'v5-analytics-2026-07'

const cachedVersion = globalForPrisma.__prismaVersion
const cachedPrisma = globalForPrisma.prisma

if (cachedVersion !== SCHEMA_VERSION && cachedPrisma) {
  cachedPrisma.$disconnect().catch(() => {})
  globalForPrisma.prisma = undefined
}

const dbUrl = process.env.DATABASE_URL || 'file:prisma/dev.db'
const adapter = new PrismaLibSql({ url: dbUrl })

export const db =
  (globalForPrisma.__prismaVersion === SCHEMA_VERSION && globalForPrisma.prisma)
    ? globalForPrisma.prisma
    : new PrismaClient({
        adapter,
        log: ['error', 'warn'],
      })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
  globalForPrisma.__prismaVersion = SCHEMA_VERSION
}
