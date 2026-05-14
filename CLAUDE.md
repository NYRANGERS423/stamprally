@AGENTS.md

# Stamprally

A fun, configurable internal web app where employees collect "passport stamps" at company events and activities. Multi-event, multi-year, with leaderboards and accolades.

**Full product spec:** [docs/SPEC.md](docs/SPEC.md) — source of truth for V1 features and roadmap. Read before implementing new features.

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** — single full-stack container
- **Tailwind CSS v4**
- **Prisma** ORM + **PostgreSQL 16**
- **@node-rs/argon2** for password hashing (cross-platform prebuilt binaries; no native build tools needed)
- **sharp** for server-side image compression
- **qrcode** for QR generation
- **zod** for input validation
- Auth library: TBD (likely Auth.js v5; install when Phase 1 starts)

## Commands

```bash
# Dev
npm run dev              # Next.js dev server on http://localhost:3000
npm run build && npm start
npm run lint
npm run typecheck        # tsc --noEmit
npm run format           # prettier --write .

# Database
npx prisma migrate dev --name <description>   # create + apply migration
npx prisma migrate deploy                     # apply only (production)
npx prisma generate                           # regen client after schema edit
npx prisma studio                             # GUI browser

# Docker — local dev
docker compose up --build       # full stack (app + postgres)
docker compose down
docker compose logs -f app

# Docker — production-like (mirrors deployment)
docker compose -f docker-compose.prod.yml up -d --build
```

## Conventions

- Strict TypeScript; avoid `any` (use `unknown` + narrow)
- Absolute imports from `@/` (configured in `tsconfig.json`)
- Server components by default; `"use client"` only when needed
- Mutations via server actions or route handlers (App Router pattern)
- Validate **all** external input with zod at the boundary
- Database access only from server code (never expose Prisma client to client components)
- Photo files written to `/uploads` (Docker named volume in prod, `./uploads` locally — gitignored)

## Security (non-negotiable)

- Passwords: **argon2id** via `@node-rs/argon2` — never plaintext, never logged
- Admin auth: env vars `ADMIN_USERNAME` / `ADMIN_PASSWORD` (see `.env.example`)
- Kiosk auth: DB-managed users created by admin; multi-device login allowed
- Force password change on next login when `user.mustChangePassword === true`
- Rate-limit login endpoints
- Never commit `.env`, photos, or DB files (see `.gitignore`)

## Database

- Schema source of truth: [prisma/schema.prisma](prisma/schema.prisma)
- After editing schema: `npx prisma migrate dev --name <description>`
- Migrations carry user data across deploys; **never edit applied migrations**
- Use named volumes (`postgres_data`, `uploads`) so `docker compose pull && up -d` does not wipe data

## Docker workflow

- Local dev: `docker compose up` uses `Dockerfile.dev` (mounts source for hot reload)
- Production: `Dockerfile` produces a slim Next.js standalone image
- Reverse proxy (Unraid SWAG / NPM / Traefik) terminates TLS; app listens on plain HTTP

## Git / GitHub

- Repo: private; HTTPS via `gh` CLI auth
- Feature branches: `feat/<short-name>` or `fix/<short-name>`
- Conventional commits encouraged
- Use `gh pr create` for PRs; never force-push to `main`
