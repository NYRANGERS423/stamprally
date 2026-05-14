# Stamprally

A fun internal "passport" app — employees collect stamps at company events and activities.

See [CLAUDE.md](CLAUDE.md) for development conventions and [docs/SPEC.md](docs/SPEC.md) for the full product spec.

## Quick start (local dev)

**Prereqs:** Node 24+, npm 11+, Docker Desktop, git.

1. Copy env defaults: `cp .env.example .env` and adjust values.
2. Install JS deps: `npm install`
3. Start Postgres (Docker): `docker compose up -d db`
4. Apply migrations: `npx prisma migrate dev`
5. Run the app: `npm run dev` → http://localhost:3000

## Full Docker stack (app + db together)

```
docker compose up --build
```

App at http://localhost:3000, Postgres at `localhost:5432`. Source is mounted for hot reload.

## Production deploy (Unraid + reverse proxy)

1. SSH to the server; `git pull` latest.
2. Ensure `.env` on the server has production values (see `.env.example`).
3. Build + start: `docker compose -f docker-compose.prod.yml up -d --build`
4. Reverse proxy forwards your domain → app port (default `3000`).

Data lives in named Docker volumes (`postgres_data`, `uploads`) and survives image rebuilds.

## Scripts

See the **Commands** section in [CLAUDE.md](CLAUDE.md).

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind v4 · Prisma 7 · PostgreSQL 16 · Docker
