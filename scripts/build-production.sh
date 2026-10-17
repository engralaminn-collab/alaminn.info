#!/bin/bash
# Production build script — works with npm OR bun.
# For Hostinger Node.js Web App: use `npm ci` + `npm run build` + `node .next/standalone/server.js`.
set -e
cd "$(dirname "$0")/.."

# Detect package manager
if command -v bun &>/dev/null && [ -f bun.lock ]; then
  echo "Using Bun..."
  bun install
  bun run db:generate
  bun run build
elif command -v npm &>/dev/null; then
  echo "Using npm..."
  npm ci
  npx prisma generate
  npm run build
else
  echo "ERROR: Neither bun nor npm found." >&2
  exit 1
fi

echo "✓ Build complete. Start with: node .next/standalone/server.js"
