# syntax=docker/dockerfile:1.7

# ── all-deps ──────────────────────────────────────────────────────────────────
# Full dependency tree (dev + prod) for the build itself.
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ── prod-deps ─────────────────────────────────────────────────────────────────
# Production-only dependency tree. Used to populate the runtime image with the
# Prisma CLI plus all of its transitive deps (effect, etc.), so the running
# container can apply migrations on startup without a separate migrate service.
FROM node:24-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# ── builder ───────────────────────────────────────────────────────────────────
# Compiles the Next.js standalone bundle.
FROM node:24-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# ── runner ────────────────────────────────────────────────────────────────────
# Self-contained production image. Migrates on startup, then serves.
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Proper PID 1 + signal handling for graceful shutdowns
RUN apk add --no-cache tini

# Non-root user
RUN addgroup -S app -g 1001 && adduser -S app -G app -u 1001

# Standalone server bundle (Next.js) + static + public
COPY --from=builder --chown=app:app /app/public ./public
COPY --from=builder --chown=app:app /app/.next/standalone ./
COPY --from=builder --chown=app:app /app/.next/static ./.next/static

# Schema + migrations
COPY --from=builder --chown=app:app /app/prisma ./prisma

# Overlay the full production node_modules over the standalone bundle's minimal
# one. This gives the Prisma CLI + every transitive dep it needs (effect, etc.)
# Versions match because both stages used the same package-lock.json.
COPY --from=prod-deps --chown=app:app /app/node_modules ./node_modules

# Re-overlay the generated Prisma client (created during `prisma generate`,
# not present in a fresh `npm ci`).
COPY --from=builder --chown=app:app /app/node_modules/.prisma ./node_modules/.prisma

# Startup script — applies migrations, then execs the CMD.
COPY --chown=app:app docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Uploads dir owned by the app user. When bind-mounted from a host path,
# the host's ownership wins — see README for the Unraid permission fix.
RUN mkdir -p /app/uploads && chown app:app /app/uploads

USER app
EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--", "/usr/local/bin/entrypoint.sh"]
CMD ["node", "server.js"]
