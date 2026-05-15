# Stamprally

A fun internal "passport" app — employees collect stamps at company events and activities.

See [docs/SPEC.md](docs/SPEC.md) for the full product spec.

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

> Local dev uses **two containers** (`app` + `db`) for fast hot reload. Production deploys use **a single combined container** — see below.

---

## Production image

Every push to `main` triggers [GitHub Actions](.github/workflows/publish.yml) to build a single combined image and publish it to **GHCR**:

```
ghcr.io/nyrangers423/stamprally:latest
ghcr.io/nyrangers423/stamprally:sha-<short-commit>
```

The image **bundles Postgres 16 and the Stamprally Next.js app together** in one container. On start, an entrypoint script:
1. Starts Postgres in the background
2. Waits for it to accept connections
3. Applies any pending Prisma migrations (no-op when there's nothing new)
4. Starts the Next.js standalone server in the foreground

Data lives on two host bind mounts (Postgres data and uploaded photos), so it survives container recreation and updates.

---

## Production deploy — Unraid Docker UI (recommended)

This is a **single-container** setup. Open the Unraid Docker tab → **Add Container**:

| Field | Value |
|---|---|
| Name | `stamprally` |
| Repository | `ghcr.io/nyrangers423/stamprally:latest` |
| **Port — add:** | |
| Container Port | `3000` |
| Host Port | `3000` _(or whatever's free)_ |
| Connection Type | TCP |
| **Path — add #1 (Postgres data):** | |
| Container Path | `/var/lib/postgresql/data` |
| Host Path | `/mnt/user/appdata/stamprally/db` |
| Access Mode | Read/Write |
| **Path — add #2 (Uploads):** | |
| Container Path | `/app/uploads` |
| Host Path | `/mnt/user/appdata/stamprally/uploads` |
| Access Mode | Read/Write |
| **Variables — add:** | |
| `POSTGRES_USER` | `stamprally` |
| `POSTGRES_PASSWORD` | _(strong random string)_ |
| `POSTGRES_DB` | `stamprally` |
| `ADMIN_USERNAME` | `admin` _(or whatever)_ |
| `ADMIN_PASSWORD` | _(your admin password)_ |
| `AUTH_SECRET` | _(strong random 32+ char string)_ |
| `APP_URL` | `http://<unraid-ip>:3000` _(temporary; switch to the HTTPS URL once your reverse proxy is wired up)_ |

Apply. Unraid auto-creates the bind-mount directories.

### Verify

Click `stamprally` → **Logs**. You should see (paraphrased):

```
[entrypoint] Starting Postgres...
... database system is ready to accept connections
[entrypoint] Postgres is ready.
[entrypoint] Applying database migrations...
All migrations have been successfully applied.
[entrypoint] Starting Stamprally...
✓ Ready in Xms
```

Visit `http://<unraid-ip>:3000` — Stamprally landing page should load.

### Reverse proxy + HTTPS

The app listens on **plain HTTP** inside the container. Your reverse proxy terminates TLS and forwards to the published port.

- Proxy host: `stamprally.<your-domain>`
- Forward to: `http://<unraid-ip>:<APP_PORT>` (typically 3000)
- TLS: managed by the proxy (Let's Encrypt or your wildcard cert)

**Important:** the session cookie has `Secure: true` in production, so HTTPS at the proxy is **required** — login won't stick over plain HTTP from a public URL.

After the reverse proxy is live: edit the `stamprally` container → set `APP_URL=https://stamprally.<your-domain>` → Apply. The container restarts and any QR codes generated from then on point at the public URL.

### First-run bootstrap

Open `https://<your-domain>/admin/login` and sign in with `ADMIN_USERNAME` / `ADMIN_PASSWORD`. Then in order:
1. **Departments / Companies / Regions** — add at least one of each (signup dropdowns).
2. **Access codes** — create a code (e.g. `LAUNCH-2026`) and share it with the first wave of users.
3. **Kiosk users** — create at least one (e.g. `front-desk` + a strong password).
4. **Events → Activities** — set up your first event and its activity stations (each gets its own QR + 4-digit fallback code).
5. **Accolades** — seed `/admin/accolades` with a catalog of awards (see [docs/accolade-seed-suggestions.md](docs/accolade-seed-suggestions.md) for starter ideas).

Users sign up at `/signup`. Kiosks sign in at `/kiosk/login` and pick an activity to display its QR.

### Backups

Both data dirs live under `/mnt/user/appdata/stamprally/` — back them up with the **CA Backup / Restore Appdata** plugin. Recommended schedule: nightly, retain 7 days.

Or by hand from the Unraid shell:
```
# Database (pg_dump from inside the running container)
docker exec stamprally pg_dump -U stamprally stamprally \
  > /mnt/user/backups/stamprally-$(date +%F).sql

# Uploads
tar -czf /mnt/user/backups/stamprally-uploads-$(date +%F).tar.gz \
  -C /mnt/user/appdata/stamprally uploads
```

### Updates

Each push to `main` rebuilds the image automatically. To pull the new version on Unraid:
- **Manual:** Unraid Docker tab → `stamprally` container → **Force update**. New `:latest` is pulled, container recreates, entrypoint reapplies any new migrations, app serves with new code. Data in `/mnt/user/appdata/stamprally/` is untouched.
- **Auto:** install the **Auto Update Applications** plugin and set `stamprally` to auto-update on your preferred cadence.

---

## Production deploy — alternative: compose + SSH

If you'd rather use compose instead of the Unraid Docker UI:

```
ssh root@<unraid-ip>
mkdir -p /mnt/user/appdata/stamprally
cd /mnt/user/appdata/stamprally

# Grab the compose file + env template
curl -L https://raw.githubusercontent.com/NYRANGERS423/stamprally/main/docker-compose.prod.yml -o docker-compose.prod.yml
curl -L https://raw.githubusercontent.com/NYRANGERS423/stamprally/main/.env.example -o .env

# Edit .env with production secrets, then:
DATA_DIR=/mnt/user/appdata/stamprally docker compose -f docker-compose.prod.yml up -d
```

Same combined image, same bind-mount layout — just a different way to wire it up.

---

## Routes overview

| Path | Audience | Notes |
|---|---|---|
| `/` | Public | Landing page with sign-up / sign-in / kiosk-sign-in links |
| `/signup`, `/login`, `/force-change-password` | Public | User auth |
| `/passport`, `/passport/edit` | User | Profile, photo cropper, signature, tags, stats, accolades |
| `/check-in`, `/check-in/[token]` | User | Type the 4-digit code or scan a QR |
| `/events`, `/events/[slug]` | User | Event list + leaderboard + progress |
| `/admin/login`, `/admin/...` | Admin | env-var creds. Events tree, kiosk users, access codes, dropdowns, settings |
| `/kiosk/login`, `/kiosk/...` | Kiosk | Event/activity picker + QR display, plus a "Give accolade" flow for handing out awards by scanning a user's passport |
| `/leaderboard` | User | Top stampers / accolade-earners / points-ranked, filterable by quarter or event |

---

## Troubleshooting

- **`AUTH_SECRET env var must be set and at least 32 characters long`** — set or lengthen `AUTH_SECRET`.
- **Container won't start, Postgres complains about data directory** — make sure the `/var/lib/postgresql/data` bind mount path exists on the host and isn't readonly. The bundled Postgres uses `PGDATA=/var/lib/postgresql/data/pgdata` so the mount root itself can have non-Postgres contents.
- **QR codes point at the wrong domain** — `APP_URL` is read at render time. Update the env var on the `stamprally` container and Apply — the container restarts and new QR codes use the new URL.
- **Signed-in user gets bounced back to /login on every request** — usually means the public URL is HTTP rather than HTTPS. The session cookie has `Secure: true` in prod, so requests must arrive over HTTPS via your reverse proxy.
- **Container restarts in a loop** — check `docker logs stamprally`. The combined entrypoint will exit the container if either Postgres or the app crashes; Unraid's `restart: unless-stopped` policy will restart it. If Postgres can't start, fix the data dir permissions or contents.
