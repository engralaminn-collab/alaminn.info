#!/usr/bin/env bash
# Compatibility wrapper for the verified SQLite-aware backup implementation.
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
[[ -f .env ]] || { echo ".env is required." >&2; exit 1; }
exec node --env-file=.env ./node_modules/tsx/dist/cli.mjs scripts/backup-db.ts "$@"
