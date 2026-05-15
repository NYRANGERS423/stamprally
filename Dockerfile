# syntax=docker/dockerfile:1.7
#
# Single-container deploy: Postgres + Stamprally in one image.
# - Postgres official image as base (battle-tested entrypoint + init).
# - Node 24 runtime added on top.
# - Combined entrypoint backgrounds postgres, waits, applies Prisma
#   migrations, then launches the Next.js standalone server.

# ── all-deps ──────────────────────────────────────────────────────────────────
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ── prod-deps ─────────────────────────────────────────────────────────────────
FROM node:24-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# ── builder ───────────────────────────────────────────────────────────────────
FROM node:24-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# ── runner ────────────────────────────────────────────────────────────────────
FROM postgres:16-alpine AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# Postgres data lives in a subdir of the bind-mounted /var/lib/postgresql/data
# so the mount root is allowed to contain unrelated junk (Unraid user shares
# sometimes have lost+found etc.).
ENV PGDATA=/var/lib/postgresql/data/pgdata

# Node runtime + bash (for the combined entrypoint) + tini (PID 1 / signals).
# gosu is already in the postgres base image.
RUN apk add --no-cache nodejs bash tini

WORKDIR /app

# Standalone bundle, public, static, prisma schema
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

# Production node_modules (full tree incl. Prisma CLI + transitive deps) +
# the generated Prisma client.
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Both processes run as the existing postgres user (UID 70).
RUN chown -R postgres:postgres /app

# Combined entrypoint
COPY docker/combined-entrypoint.sh /usr/local/bin/combined-entrypoint.sh
RUN chmod +x /usr/local/bin/combined-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--", "/usr/local/bin/combined-entrypoint.sh"]
CMD ["node", "server.js"]
