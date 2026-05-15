#!/usr/bin/env bash
# Combined container entrypoint:
#   1. fix ownership on the two bind-mounted data dirs (must run as root)
#   2. start Postgres in the background via its own entrypoint
#   3. wait for Postgres to accept connections
#   4. apply Prisma migrations (idempotent)
#   5. start the Next.js standalone server in the background
#   6. wait for either to exit, then bring the other down cleanly

set -uo pipefail

PG_PID=""
APP_PID=""

cleanup() {
  echo "[entrypoint] Shutting down..."
  if [[ -n "$APP_PID" ]] && kill -0 "$APP_PID" 2>/dev/null; then
    kill -TERM "$APP_PID" 2>/dev/null || true
  fi
  if [[ -n "$PG_PID" ]] && kill -0 "$PG_PID" 2>/dev/null; then
    kill -TERM "$PG_PID" 2>/dev/null || true
  fi
  wait 2>/dev/null || true
}
trap cleanup TERM INT

# --- 1. Permissions on the bind mounts -------------------------------------
# Container starts as root so we can chown before dropping to postgres.
chown -R postgres:postgres /var/lib/postgresql/data /app/uploads 2>/dev/null || true

# --- 2. Start Postgres ------------------------------------------------------
echo "[entrypoint] Starting Postgres (data: ${PGDATA})..."
/usr/local/bin/docker-entrypoint.sh postgres &
PG_PID=$!

# --- 3. Wait for Postgres to be ready --------------------------------------
echo "[entrypoint] Waiting for Postgres..."
ready=0
for _ in $(seq 1 90); do
  if gosu postgres pg_isready -h 127.0.0.1 -q 2>/dev/null; then
    ready=1
    break
  fi
  if ! kill -0 "$PG_PID" 2>/dev/null; then
    echo "[entrypoint] Postgres exited before becoming ready." >&2
    exit 1
  fi
  sleep 1
done

if [[ "$ready" -ne 1 ]]; then
  echo "[entrypoint] Postgres did not become ready in time." >&2
  cleanup
  exit 1
fi
echo "[entrypoint] Postgres is ready."

# --- 4. Apply migrations ----------------------------------------------------
# DATABASE_URL is computed internally regardless of any value passed in.
export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@127.0.0.1:5432/${POSTGRES_DB}"

echo "[entrypoint] Applying database migrations..."
cd /app
if ! gosu postgres bash -c "DATABASE_URL='$DATABASE_URL' ./node_modules/.bin/prisma migrate deploy"; then
  echo "[entrypoint] Migrations failed." >&2
  cleanup
  exit 1
fi

# --- 5. Start the app -------------------------------------------------------
echo "[entrypoint] Starting Stamprally..."
gosu postgres bash -c "DATABASE_URL='$DATABASE_URL' NODE_ENV=production PORT=${PORT} HOSTNAME=${HOSTNAME} exec node server.js" &
APP_PID=$!

# --- 6. Wait for either to exit --------------------------------------------
wait -n "$PG_PID" "$APP_PID"
exit_code=$?

echo "[entrypoint] A process exited (code ${exit_code}). Bringing the container down."
cleanup
exit "$exit_code"
