#!/bin/sh
# Production container entrypoint.
# Applies any pending Prisma migrations, then execs the passed command
# (defaults to `node server.js` per the Dockerfile CMD).

set -eu

if [ -x ./node_modules/.bin/prisma ]; then
  echo "[entrypoint] Applying database migrations..."
  ./node_modules/.bin/prisma migrate deploy
elif [ -f ./node_modules/prisma/build/index.js ]; then
  echo "[entrypoint] Applying database migrations (via node)..."
  node ./node_modules/prisma/build/index.js migrate deploy
else
  echo "[entrypoint] Prisma CLI not found — skipping migrate." >&2
fi

echo "[entrypoint] Starting: $*"
exec "$@"
