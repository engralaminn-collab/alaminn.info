#!/usr/bin/env bash
# Safe CyberPanel/VPS release procedure for the authoritative SQLite schema.
# Production execution is opt-in and stops on every failed validation.
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

fail() { printf '[deploy] ERROR: %s\n' "$*" >&2; exit 1; }
log() { printf '[deploy] %s\n' "$*"; }

[[ "${ALLOW_PRODUCTION_DEPLOY:-}" == "yes" ]] || fail "Set ALLOW_PRODUCTION_DEPLOY=yes after reviewing FINAL_PRODUCTION_AUDIT.md."
[[ -f .env ]] || fail ".env is missing; create it outside version control from .env.example."
command -v node >/dev/null || fail "Node.js 22+ is required."
command -v npm >/dev/null || fail "npm is required."

major="$(node -p 'Number(process.versions.node.split(`.`)[0])')"
(( major >= 22 )) || fail "Node.js 22+ is required (found $(node --version))."

provider="$(node --env-file=.env -p 'String(process.env.DATABASE_URL || ``).split(`:`)[0]')"
[[ "$provider" == "file" ]] || fail "DATABASE_URL must use the authoritative file: SQLite provider."

log "Installing the exact audited dependency graph"
npm ci

# Back up only when an existing database is present. The migration runner
# creates an empty first-deploy database safely and refuses partial schemas.
db_path="$(node --env-file=.env -e 'const p=(process.env.DATABASE_URL||``).slice(5); console.log(require(`path`).resolve(p))')"
if [[ -f "$db_path" ]]; then
  log "Creating and verifying a pre-deploy database backup"
  node --env-file=.env ./node_modules/tsx/dist/cli.mjs scripts/backup-db.ts
fi

log "Applying non-destructive SQLite migrations"
node --env-file=.env scripts/migrate-sqlite.mjs
node --env-file=.env scripts/migrate-sqlite.mjs --check

log "Generating the portable Prisma client and building"
npm run db:generate
npm run build

log "Running static and automated acceptance gates"
npm run typecheck
npm run lint
npm test

if command -v pm2 >/dev/null; then
  log "Reloading PM2 with checked-in ecosystem configuration"
  pm2 startOrReload ecosystem.config.cjs --update-env
  pm2 save
else
  log "PM2 is not installed; build is ready. Start with NODE_ENV=production node server.js."
fi

log "Deploy procedure complete. Provider/live acceptance still requires post-deploy tests."
