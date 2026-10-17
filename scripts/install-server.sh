#!/usr/bin/env bash
# Minimal host preparation for Alaminn.info. This script deliberately does not
# create a MariaDB database: the authoritative release schema is SQLite.
set -Eeuo pipefail

[[ "${EUID}" -eq 0 ]] || { echo "Run host preparation as root." >&2; exit 1; }

APP_ROOT="${APP_ROOT:-/var/www/alaminn.info}"
APP_USER="${APP_USER:-alaminn}"

command -v node >/dev/null || { echo "Install Node.js 22+ before continuing." >&2; exit 1; }
major="$(node -p 'Number(process.versions.node.split(`.`)[0])')"
(( major >= 22 )) || { echo "Node.js 22+ is required." >&2; exit 1; }

if ! id "$APP_USER" >/dev/null 2>&1; then
  useradd --system --create-home --shell /bin/bash "$APP_USER"
fi

install -d -o "$APP_USER" -g "$APP_USER" \
  "$APP_ROOT" "$APP_ROOT/db" "$APP_ROOT/db/backups" \
  "$APP_ROOT/storage/logs" "$APP_ROOT/storage/backups" \
  "$APP_ROOT/storage/temporary" "$APP_ROOT/storage/exports"

echo "Host directories are ready at $APP_ROOT."
echo "Clone the audited branch, create a mode-600 .env outside Git, then run:"
echo "  sudo -u $APP_USER ALLOW_PRODUCTION_DEPLOY=yes scripts/deploy-cyberpanel.sh"
