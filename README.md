# Stamprally

A fun internal "passport" app — employees collect stamps at company events and activities.

See [CLAUDE.md](CLAUDE.md) for development conventions and [docs/SPEC.md](docs/SPEC.md) for the full product spec.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · Prisma 6 · PostgreSQL 16 · Docker · iron-session · sharp · @node-rs/argon2 · qrcode

---

## Local development

**Prereqs:** Node 24+, npm 11+, Docker Desktop, git.

```
cp .env.example .env
docker compose up -d --build
```

Open http://localhost:3000. Source is bind-mounted, so edits hot-reload inside the container.

First-time-only:
```
docker compose exec app npx prisma migrate dev
```

Useful commands:
```
docker compose logs -f app             # tail Next.js dev server output
docker compose exec app npm run typecheck
docker compose exec app npm run lint
docker compose exec app npx prisma studio   # GUI db browser
docker compose down                    # stop everything (data persists)
docker compose down -v                 # nuke data too
```

---

## Production deploy (Unraid + reverse proxy)

The production setup is a 3-service Compose stack:

| Service | What it does |
|---|---|
| `db` | PostgreSQL 16, data on a named volume |
| `migrate` | One-shot — runs `prisma migrate deploy` against `db`, then exits |
| `app` | Next.js standalone build. Waits for `migrate` to finish, then serves |

The app listens on **plain HTTP** inside the container. Your reverse proxy (SWAG / Nginx Proxy Manager / Traefik) terminates TLS and forwards to the published port.

### 1. Prepare environment variables

On the deploy host, copy `.env.example` to `.env` and fill in **production values**:

```
# Database
POSTGRES_USER=stamprally
POSTGRES_PASSWORD=<strong random>
POSTGRES_DB=stamprally

# App
APP_PORT=3000                          # host port to publish
APP_URL=https://stamprally.example.com # absolute URL behind your reverse proxy

# Admin (env-var-based; not stored in DB)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<strong random>

# Session secret — must be ≥ 32 chars. Generate with: openssl rand -base64 32
AUTH_SECRET=<long random>
```

`POSTGRES_PASSWORD`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `AUTH_SECRET`, and `APP_URL` are **required** — the compose file refuses to start if any are missing.

`APP_URL` is what the kiosk encodes into QR codes, so it must match the URL your users will actually visit.

### 2. Pull and start

```
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

`up -d` waits for `db` to be healthy, runs `migrate` to completion, then starts `app`. On every redeploy, the migrate service re-checks for pending migrations and applies them automatically. Existing data in the `postgres_data` and `uploads` volumes is preserved.

Check the stack:
```
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f app
```

### 3. Point the reverse proxy at it

Forward your domain → `http://<docker-host>:${APP_PORT}` (defaults to 3000).

Typical SWAG / NPM setup:
- Proxy host: `stamprally.example.com`
- Forward to: `http://<unraid-ip>:3000`
- TLS: managed by the proxy (Let's Encrypt etc.)
- Optionally enable HTTP→HTTPS redirect on the proxy

The app sets `Secure` on session cookies when `NODE_ENV=production`, so HTTPS at the proxy is **required** for login to work. (Plain HTTP via the public URL would drop the cookie.)

### 4. First-run bootstrap

After the stack is up:
1. Visit `https://your-domain/admin/login`, sign in with `ADMIN_USERNAME` / `ADMIN_PASSWORD`.
2. **Departments / Companies / Regions** — add at least one of each (these populate the signup dropdowns).
3. **Access codes** — create a code (e.g. `LAUNCH-2026`) and give it to users for signup.
4. **Kiosk users** — create at least one (e.g. `front-desk`).
5. **Events → Destinations → Activities** — set up your first event.

Users sign up at `/signup` using the access code. Kiosks sign in at `/kiosk/login` and display QR codes for users to scan.

### 5. Backups

The Postgres data and uploaded photos live in Docker named volumes (`stamprally_postgres_data`, `stamprally_uploads` — exact names depend on the compose project name). Back them up regularly.

**Database snapshot (logical dump):**
```
docker compose -f docker-compose.prod.yml exec db \
  pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" \
  > backups/stamprally-$(date +%F).sql
```

**Restore a dump into a fresh DB:**
```
cat backups/stamprally-2026-05-14.sql | \
  docker compose -f docker-compose.prod.yml exec -T db \
  psql -U "$POSTGRES_USER" "$POSTGRES_DB"
```

**Uploads volume:** dump it to a tar file. Replace the volume name with your actual one (`docker volume ls`):
```
docker run --rm -v stamprally_uploads:/data -v "$(pwd)"/backups:/backup alpine \
  tar -czf /backup/uploads-$(date +%F).tar.gz -C /data .
```

Schedule both with Unraid's User Scripts plugin (e.g. nightly at 02:00).

### 6. Updating to a new version

```
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

`build` rebuilds whichever image layers changed. `migrate` re-runs `migrate deploy` (no-op when nothing's pending). `app` restarts with the new code. Data in the volumes is untouched.

---

## Routes overview

| Path | Audience | Notes |
|---|---|---|
| `/` | Public | Landing page with sign-up / sign-in / kiosk-sign-in links |
| `/signup`, `/login`, `/force-change-password` | Public | User auth |
| `/passport`, `/passport/edit` | User | Profile, photo cropper, signature, tags, stats, accolades |
| `/check-in`, `/check-in/[token]` | User | Type the 4-digit code or scan a QR |
| `/events`, `/events/[slug]` | User | Event list + leaderboard + progress |
| `/admin/login` | Admin | env-var creds |
| `/admin`, `/admin/events`, `/admin/events/[id]`, `/admin/events/[id]/destinations/[id]` | Admin | Full event tree |
| `/admin/kiosk-users`, `/admin/access-codes`, `/admin/dropdowns/{departments,companies,regions}`, `/admin/settings` | Admin | Setup |
| `/kiosk/login`, `/kiosk`, `/kiosk/[eventId]`, `/kiosk/[eventId]/[destId]`, `/kiosk/show/[activityId]` | Kiosk | Event/destination/activity picker + QR display |

---

## Troubleshooting

- **`AUTH_SECRET env var must be set and at least 32 characters long`** — set or lengthen `AUTH_SECRET` in `.env`.
- **`POSTGRES_PASSWORD is required in production`** — the prod compose file refuses to start with empty secrets; set them in `.env`.
- **Migrations are stuck or out of sync** — `docker compose -f docker-compose.prod.yml logs migrate` shows the Prisma output. `docker compose -f docker-compose.prod.yml run --rm migrate npx prisma migrate status` for a status report.
- **QR codes point at the wrong domain** — `APP_URL` is read at render time, so update it in `.env` and `docker compose -f docker-compose.prod.yml up -d` to pick up the new value.
- **Signed-in user gets bounced back to /login on every request** — usually means `NODE_ENV=production` + HTTP-only access. The session cookie has `Secure: true` in prod, so requests must arrive over HTTPS (via your reverse proxy).
