#!/bin/sh
# Kartly container entrypoint: sync schema, seed, then serve.
set -e

cd /app

echo "kartly: waiting for database schema sync..."
if [ -n "$(ls -A server/prisma/migrations 2>/dev/null | grep -v migration_lock.toml || true)" ]; then
  npx prisma migrate deploy --schema server/prisma/schema.prisma
else
  # no migration files yet (first boot) — create schema directly
  npx prisma db push --schema server/prisma/schema.prisma --skip-generate
fi

echo "kartly: seeding..."
npx tsx server/prisma/seed.ts || echo "kartly: seed skipped/failed (continuing)"

echo "kartly: starting server on :${PORT:-4000}"
exec node server/dist/server.js
