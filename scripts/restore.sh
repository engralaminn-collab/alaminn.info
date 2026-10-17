#!/usr/bin/env bash
# Compatibility wrapper for the guarded SQLite-aware restore implementation.
# The restore command remains interactive unless its implementation receives
# an explicit confirmation flag.
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
[[ -f .env ]] || { echo ".env is required." >&2; exit 1; }
exec node --env-file=.env ./node_modules/tsx/dist/cli.mjs scripts/restore-db.ts "$@"
