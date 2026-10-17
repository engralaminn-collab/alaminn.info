/**
 * scripts/verify-db.ts
 * ------------------------------------------------------------------
 * Alaminn.info — Verify the live database is healthy.
 *
 * Node.js-compatible and aligned with the authoritative SQLite provider.
 *
 * What it does:
 *   1. Confirms DB connection works.
 *   2. Counts rows in every user table.
 *   3. Reports anomalies (empty tables that should never be empty,
 *      suspiciously small tables, connection failures).
 *   4. For SQLite: runs PRAGMA integrity_check + foreign_key_check.
 *   5. Exits 0 if healthy, 1 if not.
 *
 * Usage:
 *   npx tsx scripts/verify-db.ts
 *   npm run db:verify
 */
import { createPrismaClient } from "../src/lib/prisma-client";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const _PROJECT_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
);

function resolveDbPath(): string | null {
  const envUrl = process.env.DATABASE_URL || "";
  const match = envUrl.match(/^file:(.+)$/);
  if (match) return resolve(match[1]);
  return null;
}

const DB_PATH = resolveDbPath();
const IS_SQLITE = DB_PATH !== null;

interface TableCount {
  name: string;
  rowCount: number;
}

// Tables that are expected to always have rows after seeding.
const EXPECTED_NONEMPTY_TABLES = new Set<string>([
  "User",
  "Project",
  "Article",
  "Resource",
  "ImpactRecord",
  "CaseStudy",
  "Inquiry",
  "Opportunity",
  "AiTask",
  "MeetingRequest",
  "NewsletterSubscriber",
  "Contact",
  "Task",
  "AiApproval",
]);

function line(s = ""): void {
  console.log(s);
}
function err(s: string): void {
  console.error(s);
}

async function main(): Promise<number> {
  if (!IS_SQLITE || !DB_PATH) {
    err("DATABASE_URL must use file: because the authoritative schema is SQLite.");
    return 1;
  }
  if (!existsSync(DB_PATH)) {
    err(`Database file not found: ${DB_PATH}`);
    return 1;
  }

  line("── DB Verify ──────────────────────────────────────────");
  line(`Database: ${DB_PATH}`);
  line("Provider: sqlite");
  line();

  const prisma = createPrismaClient(`file:${DB_PATH}`);
  let anomalies = 0;

  try {
    // 1. Connection test
    try {
      await prisma.$queryRaw`SELECT 1`;
      line("Connection      : ok");
    } catch (e) {
      err(`Connection failed: ${(e as Error).message}`);
      return 1;
    }

    // 2. SQLite-only PRAGMA checks
    if (IS_SQLITE) {
      try {
        const integrity = await prisma.$queryRawUnsafe<
          { integrity_check: string }[]
        >("PRAGMA integrity_check");
        const intOk =
          integrity.length === 1 && integrity[0].integrity_check === "ok";
        line(
          `integrity_check : ${intOk ? "ok" : JSON.stringify(integrity)}`,
        );
        if (!intOk) anomalies++;
      } catch {
        line("integrity_check : skipped (cannot run on this DB)");
      }

      try {
        const fkCheck = await prisma.$queryRawUnsafe<unknown[]>(
          "PRAGMA foreign_key_check",
        );
        const fkOk = fkCheck.length === 0;
        line(
          `foreign_key_check: ${fkOk ? "ok (no violations)" : `${fkCheck.length} violation(s)`}`,
        );
        if (!fkOk) {
          anomalies++;
          for (const v of fkCheck) {
            line(`  ⚠ FK violation: ${JSON.stringify(v)}`);
          }
        }
      } catch {
        line("foreign_key_check: skipped");
      }
    }

    // 3. Enumerate tables
    let tables: { name: string }[];
    if (IS_SQLITE) {
      tables = await prisma.$queryRawUnsafe<{ name: string }[]>(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%' AND name NOT LIKE '_alaminn_%' ORDER BY name",
      );
    } else {
      tables = [];
    }
    line(`Tables in schema : ${tables.length}`);

    // 4. Row counts per table
    line();
    line("Row counts:");
    const counts: TableCount[] = [];
    let totalRows = 0;
    for (const t of tables) {
      let rowCount = -1;
      try {
        const r = await prisma.$queryRawUnsafe<{ n: bigint | number }[]>(
          `SELECT COUNT(*) AS n FROM \`${t.name}\``,
        );
        const n = r[0]?.n;
        rowCount = typeof n === "bigint" ? Number(n) : (n ?? 0);
      } catch (e) {
        rowCount = -1;
        line(
          `  ⚠ Could not count rows in ${t.name}: ${(e as Error).message}`,
        );
        anomalies++;
      }
      counts.push({ name: t.name, rowCount });
      totalRows += rowCount > 0 ? rowCount : 0;
    }

    // Pretty print
    const nameWidth = Math.max(8, ...counts.map((c) => c.name.length));
    line(`  ${"Table".padEnd(nameWidth)}  ${"Rows".padStart(10)}  Status`);
    line(`  ${"─".repeat(nameWidth)}  ${"──────────"}  ${"─".repeat(10)}`);
    for (const c of counts) {
      let status = "ok";
      if (c.rowCount < 0) status = "ERROR";
      else if (
        c.rowCount === 0 &&
        EXPECTED_NONEMPTY_TABLES.has(c.name)
      ) {
        status = "EMPTY (expected non-empty)";
        anomalies++;
      } else if (c.rowCount === 0) {
        status = "empty";
      }
      line(
        `  ${c.name.padEnd(nameWidth)}  ${String(c.rowCount).padStart(10)}  ${status}`,
      );
    }
    line(`  ${"─".repeat(nameWidth)}  ${"──────────"}  ${"─".repeat(10)}`);
    line(`  ${"TOTAL".padEnd(nameWidth)}  ${String(totalRows).padStart(10)}`);

    // 5. Application migration history
    const requiredMigrations = [
      "00000000000000_initial",
      "20261017193000_add_password_reset_fields",
      "20261017200000_add_email_delivery_queue",
      "20261017203000_add_two_factor_auth",
    ];
    const migrations = await prisma.$queryRawUnsafe<{ name: string }[]>(
      'SELECT "name" FROM "_alaminn_migrations" ORDER BY "name"',
    );
    const recorded = new Set(migrations.map((migration) => migration.name));
    const missing = requiredMigrations.filter((migration) => !recorded.has(migration));
    line();
    line(`Application migrations recorded: ${migrations.length}`);
    if (missing.length) {
      anomalies += missing.length;
      for (const migration of missing) line(`  ⚠ Missing migration: ${migration}`);
    } else {
      line("Application migration status: up to date");
    }

    line();
    line("── Summary ────────────────────────────────────────────");
    if (anomalies === 0) {
      line(`✓ Database is healthy. (0 anomalies)`);
      return 0;
    }
    err(`✗ ${anomalies} anomaly/anomalies detected — investigate before relying on this DB.`);
    return 1;
  } finally {
    try {
      await prisma.$disconnect();
    } catch {
      /* swallow */
    }
  }
}

main()
  .then((code) => process.exit(code))
  .catch((e) => {
    err(`Unhandled error: ${e.message}`);
    process.exit(1);
  });
