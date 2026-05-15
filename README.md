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

---

## Production image

Every push to `main` triggers [GitHub Actions](.github/workflows/publish.yml) to build and publish a multi-arch image to **GHCR**:

```
ghcr.io/nyrangers423/stamprally:latest
ghcr.io/nyrangers423/stamprally:sha-<short-commit>
```

The image is **self-contained**: it includes the Prisma CLI + migration files. On every start, the container's entrypoint runs `prisma migrate deploy` (no-op when nothing's pending), then launches the Next.js standalone server. No separate migrate service or job is needed.

---

## Production deploy — Unraid Docker UI (recommended)

This setup uses two containers configured directly in the Unraid Docker tab. No SSH, no compose file, no `git clone`. Updates are just "force update" in the UI (or scheduled via the [Auto Update Applications](https://forums.unraid.net/topic/89343-plugin-auto-update-applications/) plugin).

### 1. Pre-flight

- Make sure your Unraid Docker tab has a **custom network** (so the two containers can talk by name). On Unraid: **Settings → Docker → enable advanced view → Preserve user defined networks: Yes**, then SSH in once and run:
  ```
  docker network create stamprally-net
  ```
- Pick where the data lives. Conventional: `/mnt/user/appdata/stamprally/`. Create it from the Unraid file manager, or SSH:
  ```
  mkdir -p /mnt/user/appdata/stamprally/db
  mkdir -p /mnt/user/appdata/stamprally/uploads
  ```
- Generate two long random strings — one for `POSTGRES_PASSWORD`, one for `AUTH_SECRET`. From Unraid shell:
  ```
  openssl rand -base64 32
  openssl rand -base64 32
  ```

### 2. Postgres container (do this first)

Unraid Docker tab → **Add Container**. Fill in:

| Field | Value |
|---|---|
| Name | `stamprally-db` |
| Repository | `postgres:16-alpine` |
| Network Type | `Custom: stamprally-net` |
| **Variables — add:** | |
| `POSTGRES_USER` | `stamprally` |
| `POSTGRES_PASSWORD` | _(your generated value — same one you'll paste into the app container below)_ |
| `POSTGRES_DB` | `stamprally` |
| `PGDATA` | `/var/lib/postgresql/data/pgdata` |
| **Paths — add:** | |
| Container Path | `/var/lib/postgresql/data` |
| Host Path | `/mnt/user/appdata/stamprally/db` |
| Access Mode | Read/Write |

Apply. The container should show "started" within a few seconds. Logs (click the icon) should end with `database system is ready to accept connections`.

### 3. App container

Add Container → fill in:

| Field | Value |
|---|---|
| Name | `stamprally` |
| Repository | `ghcr.io/nyrangers423/stamprally:latest` |
| Network Type | `Custom: stamprally-net` |
| **Port — add:** | |
| Container Port | `3000` |
| Host Port | `3000` _(or whatever you want to publish on)_ |
| Connection Type | TCP |
| **Variables — add:** | |
| `DATABASE_URL` | `postgresql://stamprally:<POSTGRES_PASSWORD>@stamprally-db:5432/stamprally` |
| `ADMIN_USERNAME` | `admin` _(or whatever)_ |
| `ADMIN_PASSWORD` | _(your admin password)_ |
| `AUTH_SECRET` | _(your generated 32+ char value)_ |
| `APP_URL` | `http://<unraid-ip>:3000` _(temporary; update to your real HTTPS URL once your reverse proxy is wired up)_ |
| **Paths — add:** | |
| Container Path | `/app/uploads` |
| Host Path | `/mnt/user/appdata/stamprally/uploads` |
| Access Mode | Read/Write |

Apply. Watch the logs — they should show:
```
[entrypoint] Applying database migrations...
...
All migrations have been successfully applied.
[entrypoint] Starting: node server.js
✓ Ready in Xms
```

Visit `http://<unraid-ip>:3000` — Stamprally landing page should load.

### 4. Reverse proxy + HTTPS

The app listens on **plain HTTP** inside the container. Your reverse proxy terminates TLS and forwards to the published port.

- Proxy host: `stamprally.<your-domain>`
- Forward to: `http://<unraid-ip>:<APP_PORT>` (typically 3000)
- TLS: managed by the proxy (Let's Encrypt or your wildcard cert)

**Important:** the session cookie has `Secure: true` in production, so HTTPS at the proxy is **required** — login won't work over plain HTTP from the public URL. Direct `http://unraid-ip:3000` access on your LAN works for testing because browsers exempt LAN IPs from the `Secure` requirement on some flag combinations, but don't rely on this.

After the reverse proxy is live: edit the `stamprally` container → set `APP_URL=https://stamprally.<your-domain>` → Apply. The container restarts and QR codes generated from then on point at the public URL.

### 5. First-run bootstrap

Open `https://<your-domain>/admin/login` and sign in with `ADMIN_USERNAME` / `ADMIN_PASSWORD`. Then in order:
1. **Departments / Companies / Regions** — add at least one of each (signup dropdowns).
2. **Access codes** — create a code (e.g. `LAUNCH-2026`) and share it with the first wave of users.
3. **Kiosk users** — create at least one (e.g. `front-desk` + a strong password).
4. **Events → Destinations → Activities** — set up your first event.

Users sign up at `/signup`. Kiosks sign in at `/kiosk/login` and pick an activity to display its QR.

### 6. Backups

Both data dirs live under `/mnt/user/appdata/stamprally/` — easy to back up with the **CA Backup / Restore Appdata** plugin. Recommended schedule: nightly, retain 7 days.

Or by hand from the Unraid shell:
```
# Database
docker exec stamprally-db pg_dump -U stamprally stamprally \
  > /mnt/user/backups/stamprally-$(date +%F).sql

# Uploads
tar -czf /mnt/user/backups/stamprally-uploads-$(date +%F).tar.gz \
  -C /mnt/user/appdata/stamprally uploads
```

### 7. Updates

Each push to `main` rebuilds the image. To pull the new version on Unraid:
- **Manual:** Unraid Docker tab → `stamprally` container → **Force update**. Pulls the new `:latest`, recreates the container, entrypoint re-runs `migrate deploy` (applies any new migrations), serves with the new code. Data in `/mnt/user/appdata/stamprally/` is untouched.
- **Auto:** install the **Auto Update Applications** plugin and set `stamprally` to auto-update on whatever cadence you like.

---

## Production deploy — alternative: compose + SSH

If you'd rather skip the Docker UI and just paste compose commands:

```
ssh root@<unraid-ip>
mkdir -p /mnt/user/appdata/stamprally
cd /mnt/user/appdata/stamprally
# Either clone (if git is available) or scp the compose + .env file here.
curl -L https://raw.githubusercontent.com/NYRANGERS423/stamprally/main/docker-compose.prod.yml -o docker-compose.prod.yml
curl -L https://raw.githubusercontent.com/NYRANGERS423/stamprally/main/.env.example -o .env
# Edit .env with production secrets, then:
DATA_DIR=/mnt/user/appdata/stamprally docker compose -f docker-compose.prod.yml up -d
```

This pulls the published image from GHCR, creates the two containers, and bind-mounts `/mnt/user/appdata/stamprally/{db,uploads}` for data.

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
| `/admin/...` | Admin | Events tree, kiosk users, access codes, dropdowns, settings |
| `/kiosk/login`, `/kiosk/...` | Kiosk | Event/destination/activity picker + QR display |

---

## Troubleshooting

- **`AUTH_SECRET env var must be set and at least 32 characters long`** — set or lengthen `AUTH_SECRET`.
- **Postgres container won't start with permission error on `/var/lib/postgresql/data`** — make sure `PGDATA=/var/lib/postgresql/data/pgdata` is set (so Postgres creates a writable subdir inside the bind mount, instead of trying to use the mount root which may have non-standard ownership on Unraid user shares).
- **QR codes point at the wrong domain** — `APP_URL` is read at render time. Update the env var on the `stamprally` container and Apply — the container restarts and new QR codes use the new URL.
- **Signed-in user gets bounced back to /login on every request** — usually means the public URL is HTTP rather than HTTPS. The session cookie has `Secure: true` in prod, so requests must arrive over HTTPS via your reverse proxy.
- **`stamprally` container can't reach `stamprally-db`** — both containers need to be on the same custom Docker network. Check `Network Type: Custom: stamprally-net` on both containers.
