#!/usr/bin/env node

/**
 * Non-destructive SQLite migration runner for the checked-in additive history.
 * It never drops tables, deletes rows, or resets a database. This avoids a
 * native Prisma schema-engine download while keeping deployment deterministic.
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";

const checkOnly = process.argv.includes("--check");
const url = process.env.DATABASE_URL || "";
if (!url.startsWith("file:")) {
  throw new Error("DATABASE_URL must use file: for the authoritative SQLite schema.");
}

const rawPath = url.slice(5);
const databasePath = path.isAbsolute(rawPath) ? rawPath : path.resolve(process.cwd(), rawPath);
if (checkOnly && !fs.existsSync(databasePath)) {
  throw new Error(`Database does not exist: ${databasePath}`);
}
fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const client = createClient({ url: `file:${databasePath}` });

async function tableExists(name) {
  const result = await client.execute({
    sql: "SELECT 1 AS present FROM sqlite_master WHERE type='table' AND name=? LIMIT 1",
    args: [name],
  });
  return result.rows.length === 1;
}

async function columns(name) {
  const result = await client.execute(`PRAGMA table_info("${name.replaceAll('"', '""')}")`);
  return new Set(result.rows.map((row) => String(row.name)));
}

async function record(name) {
  await client.execute({
    sql: 'INSERT OR IGNORE INTO "_alaminn_migrations" ("name", "appliedAt") VALUES (?, CURRENT_TIMESTAMP)',
    args: [name],
  });
}

async function pending() {
  const items = [];
  if (!(await tableExists("User"))) {
    items.push("00000000000000_initial");
    return items;
  }
  const userColumns = await columns("User");
  if (!userColumns.has("passwordResetToken") || !userColumns.has("passwordResetExpiresAt")) {
    items.push("20261017193000_add_password_reset_fields");
  }
  if (!(await tableExists("EmailDelivery"))) {
    items.push("20261017200000_add_email_delivery_queue");
  }
  if (
    !userColumns.has("twoFactorEnabled") ||
    !userColumns.has("twoFactorSecret") ||
    !userColumns.has("twoFactorPendingSecret") ||
    !userColumns.has("twoFactorRecoveryCodes")
  ) {
    items.push("20261017203000_add_two_factor_auth");
  }
  return items;
}

try {
  const outstanding = await pending();
  if (checkOnly) {
    if (outstanding.length) {
      console.error(`Pending SQLite migrations: ${outstanding.join(", ")}`);
      process.exitCode = 1;
    } else {
      console.log(`SQLite migration status: up to date (${databasePath})`);
    }
  } else {
    if (outstanding.includes("00000000000000_initial")) {
      const userTables = await client.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_alaminn_%'",
      );
      if (userTables.rows.length !== 0) {
        throw new Error("Refusing baseline migration: database contains a partial/unknown schema.");
      }
      await client.executeMultiple(
        fs.readFileSync("prisma/migrations/00000000000000_initial/migration.sql", "utf8"),
      );
      console.log("Applied 00000000000000_initial");
    }

    await client.execute(
      'CREATE TABLE IF NOT EXISTS "_alaminn_migrations" ("name" TEXT NOT NULL PRIMARY KEY, "appliedAt" DATETIME NOT NULL)',
    );
    if (await tableExists("User")) await record("00000000000000_initial");

    const userColumns = await columns("User");
    if (!userColumns.has("passwordResetToken")) {
      await client.execute('ALTER TABLE "User" ADD COLUMN "passwordResetToken" TEXT');
    }
    if (!userColumns.has("passwordResetExpiresAt")) {
      await client.execute('ALTER TABLE "User" ADD COLUMN "passwordResetExpiresAt" DATETIME');
    }
    await client.execute(
      'CREATE INDEX IF NOT EXISTS "User_passwordResetToken_idx" ON "User"("passwordResetToken")',
    );
    await record("20261017193000_add_password_reset_fields");

    if (!(await tableExists("EmailDelivery"))) {
      await client.executeMultiple(
        fs.readFileSync("prisma/migrations/20261017200000_add_email_delivery_queue/migration.sql", "utf8"),
      );
      console.log("Applied 20261017200000_add_email_delivery_queue");
    }
    await record("20261017200000_add_email_delivery_queue");

    const twoFactorColumns = await columns("User");
    if (!twoFactorColumns.has("twoFactorEnabled")) {
      await client.execute('ALTER TABLE "User" ADD COLUMN "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false');
    }
    if (!twoFactorColumns.has("twoFactorSecret")) {
      await client.execute('ALTER TABLE "User" ADD COLUMN "twoFactorSecret" TEXT');
    }
    if (!twoFactorColumns.has("twoFactorPendingSecret")) {
      await client.execute('ALTER TABLE "User" ADD COLUMN "twoFactorPendingSecret" TEXT');
    }
    if (!twoFactorColumns.has("twoFactorRecoveryCodes")) {
      await client.execute('ALTER TABLE "User" ADD COLUMN "twoFactorRecoveryCodes" TEXT');
    }
    await record("20261017203000_add_two_factor_auth");

    const integrity = await client.execute("PRAGMA integrity_check");
    const integrityValue = String(integrity.rows[0]?.integrity_check || "");
    if (integrityValue !== "ok") throw new Error(`SQLite integrity_check failed: ${integrityValue}`);
    const foreignKeys = await client.execute("PRAGMA foreign_key_check");
    if (foreignKeys.rows.length) {
      throw new Error(`SQLite foreign_key_check found ${foreignKeys.rows.length} violation(s).`);
    }
    console.log(`SQLite migrations complete and verified (${databasePath}).`);
  }
} finally {
  client.close();
}
