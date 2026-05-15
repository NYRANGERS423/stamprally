# Routes

Every page in `src/app`. Audience is determined by which guard the page calls (`requireUser`, `requireAdmin`, `requireKiosk`, or none for public). "Route Handler" entries return data, not UI.

## Public

| URL | What it shows | Data |
|---|---|---|
| `/` | Landing page. Main CTAs: "Get my passport" (signup), "Sign in". Subtle pill links to Admin / Kiosk sign-in below | — |
| `/signup` | Registration: access code, email/password, name, dropdowns for department / company / region | Department, Company, Region |
| `/login` | User sign-in with redirect support (`?next=…`) | — |
| `/admin/login` | Admin sign-in (env-var credentials) | — |
| `/kiosk/login` | Kiosk station sign-in (multi-device login allowed) | — |
| `/force-change-password` | Force-change-password screen shown after an admin reset | — |
| `/api/uploads/[filename]` (Route Handler) | Serves user photos from `/uploads` with immutable cache headers | — |

## User (employee passport flow)

| URL | What it shows | Data |
|---|---|---|
| `/passport` | The headline screen — themed passport card with photo, name, passport number, tags, signature. Below: stats tiles (stamps / events / accolades), accolade chips (tap to see description), themed stamp impressions grouped by event. A `StampedFlash` banner appears at the top after a successful check-in | User, Stamp, Activity, Event, Accolade, Tag, Department, Company, Region |
| `/passport/edit` | Theme selector, photo crop & upload, name / occupation form, tag editor, signature canvas. Back-pill returns to `/passport` | User, Tag, AppConfig |
| `/check-in` | Two paths to stamp: "Open camera & scan" (QR scanner) and a 4-digit code input. No autofocus on the input so the keypad doesn't pop open on mount | — |
| `/check-in/[token]` (Route Handler) | No UI. Creates the stamp, redirects to `/passport?stamped=<name>` (or `?already` / `?stampError`) | Activity, Event, Stamp |
| `/events` | List of active events with the user's stamp progress in each (progress bar) | Event, Activity, Stamp |
| `/events/[slug]` | Event detail: progress bar, activity checklist (stamped vs not), leaderboard ranked by stamps with a star + count next to anyone who has event-tagged accolades | Event, Activity, Stamp, Accolade |
| `/leaderboard` | Three-board switcher: **Points** (default) / **Stamps** / **Accolades**. Filter dropdowns for date range (all-time, this year, each quarter of the current and last year) and event. Top 100 ranked rows | User, Stamp, Accolade, Event |

## Kiosk

| URL | What it shows | Data |
|---|---|---|
| `/kiosk` | Event picker for kiosks. Amber "★ Give accolade" pill in the header takes them to the grant flow | Event |
| `/kiosk/[eventId]` | Activity picker for the chosen event. Shows fallback codes for quick reference | Event, Activity |
| `/kiosk/show/[activityId]` | Full-screen display of an activity's QR + 4-digit fallback code. The card stays light in both light/dark mode (so camera scans are clean) | Activity, Event |
| `/kiosk/give-accolade` | Two-step flow. Step 1: pick an accolade template tile. Step 2: scanner (camera + 6-char code) — each grant flashes green on the video, increments a session counter, and is haptic on supported devices. Camera does **not** auto-open; operator taps to start | AccoladeTemplate, Event |

## Admin

All admin pages share a sidebar / drawer layout via `<AdminShell>`.

| URL | What it shows | Data |
|---|---|---|
| `/admin` | Dashboard. Headline numbers: users, events, stamps, access codes, kiosk users | User, Event, Stamp, AccessCode, KioskUser |
| `/admin/users` | Searchable user list with stamp / accolade counts | User |
| `/admin/users/[userId]` | User detail. Reset password (returns a one-time temp password), grant / remove stamps, grant accolade (from the catalog or as a one-off) with points field, revoke accolades | User, Stamp, Accolade, AccoladeTemplate, Event |
| `/admin/events` | Event list + Create-event form | Event |
| `/admin/events/[eventId]` | Event detail. Edit event fields. Add Activity form (name / order / points / description). Each activity row has inline Edit, Toggle active, Regenerate QR + fallback code, Delete | Event, Activity |
| `/admin/accolades` | Accolade-template catalog. Add or inline-edit (emoji, label, points, theme, event tag). Each row shows "Worth N pts" | AccoladeTemplate, Event |
| `/admin/kiosk-users` | Kiosk station credentials CRUD | KioskUser |
| `/admin/access-codes` | Signup-gate access codes. Create with optional expiry / max-uses | AccessCode |
| `/admin/dropdowns/departments` | CRUD for Department dropdown (used in signup) | Department |
| `/admin/dropdowns/companies` | CRUD for Company dropdown | Company |
| `/admin/dropdowns/regions` | CRUD for Region dropdown | Region |
| `/admin/settings` | Photo upload constraints: max MB, output pixel size, JPEG quality | AppConfig |

---

## Notes for a designer

- **`/passport` is the headline screen.** Most user time and pride lives here. The passport card is themed (3 themes today). It's mobile-first and looks intentionally like a real passport ID page — that nostalgic, official-but-playful tone is the design anchor.
- **Theme system** affects only `/passport` visuals (card, stamps, divider, signature ink, accolade chips). Other screens use neutral stone + brand-blue.
- **Stamps animate in** on first land via per-theme keyframes (`stamp-land-classic`, `stamp-land-container`, `stamp-land-leaf`). Respects `prefers-reduced-motion`.
- **`StampedFlash` banner** at the top of `/passport` after a check-in has 4 modes: `stamped` (green + "Stamp another →" CTA), `already` (amber), `not_found` (red), `inactive` (stone).
- **Admin and Kiosk are utility surfaces.** They share visual language (sticky header, cards, pills) but don't carry the theme system — they're neutral stone + brand-blue.
- **Auth pages** share an `AuthChooserFooter` that cross-links user / admin / kiosk sign-in.
