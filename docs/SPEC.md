# Stamprally — Product Spec

> Source of truth for V1 features and future roadmap. Keep this in sync with reality as decisions evolve.

## Concept

Internal "fake passport" web app where company employees create a profile (their "passport") and collect **stamps** by visiting **Activities** at company **Events**. Designed to be configurable and scalable across multiple events and years.

## Personas

- **User / Traveller** — employee with a passport
- **Admin** — designated administrator(s); env-var login; full override on any data
- **Steward** — a regular User who an admin has temporarily promoted (via `/admin/stewards`) to run events on their own device: display activity QRs and grant accolades. Grants carry optional expiration and per-permission flags (`canStamp`, `canGrantAccolades`). The Steward menu appears in the user's hamburger only while their grant is active. Replaces the v1.2 "Kiosk" shared-account model.

## Domain model

```
Event   1—*  Activity   1—*  Stamp   *—1  User
                                            *—*  PassportTag (free-form personal tags)
                                            *—*  Accolade    (admin-granted award; snapshots a template)
                                            *—1  Department / Company / Region

AccoladeTemplate (catalog) ──[snapshot at grant]──>  Accolade
```

Each Activity and AccoladeTemplate carries a `points` value (default 1) so
stamps and accolades feed a points-based leaderboard alongside the
count-based stamps and accolades boards.

## V1 features

### Auth & onboarding

- **Signup gate**: access code (admin-managed; can rotate / enable / disable; optional expiry; optional max-uses)
- **User auth**: email + password; argon2id hashing
- **Password reset (no SMTP)**: admin sets a default password and flips `mustChangePassword=true`; user is forced to change it on next login before accessing anything else
- **Admin auth**: env vars `ADMIN_USERNAME` / `ADMIN_PASSWORD`
- **Steward auth**: regular user session — no separate login. Admin grants steward access at `/admin/stewards` via the `StewardGrant` model (newest non-revoked, non-expired row = active). Grants record `grantedByAdmin`, `grantedAt`, optional `expiresAt`, `revokedAt`/`revokedReason`, and the `canStamp` / `canGrantAccolades` permission flags. The full table doubles as the audit trail.

### Passport profile

| Field | Source | Editable by user? |
|---|---|---|
| First / Last name | user input | yes |
| Email | user input at signup | yes |
| Photo ("Passport photo") | upload (real or avatar); server-compressed | yes |
| Department ("Nationality") | admin dropdown | locked |
| Company ("Issuing Authority") | admin dropdown | locked |
| Region ("Place of Issue") | admin dropdown | locked |
| Start date ("Citizen Since") | one-time set at signup | locked |
| Passport number | auto-generated (e.g. `APM-NL-2026-00472`) | locked |
| Occupation / "working title" | user input, with playful placeholder hints | yes |
| Signature | canvas-drawn | yes |
| Personal tags (eye color, height, coffee order, spirit animal…) | suggested chips + free-form | yes |

Admin can override **all** fields on any profile.

### Photo handling

- Client-side cropper (square, draggable / pan-zoom center)
- Server compresses via sharp (defaults: 800×800, ~80% JPEG)
- Limits **configurable by admin** at runtime (max upload MB, output resolution, output quality)
- Stored on Docker named volume mounted at `/uploads`
- Filenames are content-hashed; user records store the path only

### Events & activities (admin-managed)

- CRUD: Event → Activity (flat — no intermediate Destination layer)
- Event has optional `emoji` (admin-editable, surfaces on events list, event detail hero, and steward picker)
- Activity has optional `location`, `startTime`, `endTime` surfaced on the user-facing clickable activity sheet
- Each Activity has a unique long QR token + short fallback code (4 digits)
- Each Activity has a `points` value (admin-editable, default 1) that feeds the points leaderboard
- Activity can be active / inactive
- Events list is grouped by lifecycle on `/events`: **Happening now / Coming up / Past** with state pills (today / soon / upcoming / closed / done)
- Per-event "stamped by N" social count surfaces on the event card when N ≥ 5

### Check-in flow

- User taps "Stamp new place" in their passport
- Camera opens; user scans QR at the activity station
- OR enters fallback 4-digit code manually
- Stamp recorded; passport refreshes; toast shows the new stamp

### Steward UI

- Lives at `/steward/*`. Available only to users with an active `StewardGrant`. The `Steward` entry appears in the standard user hamburger automatically.
- Landing page picks **Stamps** or **Accolades**. Cards grey out for permissions the user wasn't granted.
- Stamps flow: pick Event → pick Activity → render large QR + 4-digit fallback code on the steward's own screen for recipients to scan.
- Accolades flow: pick accolade template from the catalog, then scan each recipient's passport QR (or type their 6-character code) to grant it. Camera stays on between users; code field clears after each successful grant.
- `Accolade.awardedBy` records the steward's full name on every new grant. Legacy `"kiosk:<username>"` rows from v1.2 and earlier continue to display as `Kiosk @username`.

### Stats & leaderboards

- **Personal** (on `/passport`): inline stat strip ("N stamps · M events · K accolades") plus the full stamps grid grouped by event. Stamps are paged at **6 per page** via `?stampPage=N` so passports stay snappy as a user collects many stamps over time. Page slicing is flat across all stamps (newest-first); event-name headers still appear on whichever events the page lands on. The `/u/[id]` read-only passport uses the same pagination.
- **Per-event mini-rank** (on `/events/[slug]`): top 5 by overall points within that event. Renders with the same `<RankRow>` shape as the global rank for visual consistency, with an "All ranks →" link to `/leaderboard?event=<id>`.
- **Global rank** (on `/leaderboard`, labelled "Rank" in the nav): three boards behind a switcher, **all ranked by points**:
  - **Overall** (default) — `stampPoints + accoladePoints`
  - **Stamp pts** — sum of `activity.points` for the user's stamps
  - **Accolade pts** — sum of `accolade.points` for the user's accolades
  Each board supports date filters (all time, this year, each quarter of the current and previous year) and an event filter. Every user appears in the rank — even at 0 pts — so newcomers can see themselves at the bottom and have something to aim for.
- **Accolades**: all accolades are admin-managed — there is no auto-awarded layer. The `AccoladeTemplate` catalog at `/admin/accolades` defines the available accolades (label, emoji, theme, optional event tag, point value, active/inactive). Admins grant them per-user at `/admin/users/[id]`; stewards grant them by scanning passport QRs at `/steward/give-accolade`. Granted accolades snapshot the template's fields so editing a template later does not retroactively rescore past grants.

### Admin panel

- Users / passports: search, view, override any field, reset password
- Signup access codes: CRUD
- Dropdown lists: Departments, Companies, Regions (CRUD; soft-deactivate)
- Events / Activities: CRUD; per-event emoji; per-activity location + start/end times; generate QR + fallback code; activity points
- Accolade catalog: CRUD on `AccoladeTemplate` rows (label, emoji, theme, event tag, points, active)
- Per-user grant/revoke of accolades from `/admin/users/[id]`
- **Stewards**: user-dropdown picker, per-permission checkboxes (`canStamp`, `canGrantAccolades`), optional expiration, grant button. Active list with inline revoke + reason. Chronological history of every grant ever issued — doubles as the audit log for who handed out access.
- Site title (centered header text): edit at runtime via `/admin/settings`
- Photo upload limits: edit at runtime via `/admin/settings`
- Dashboard: 3 hero KPI tiles (Users active · 7d / Stamps today / Events live) + catalog grid (Companies / Departments / Regions / Stewards / Access codes / Accolade templates)

## Future / V2+

- SMTP integration → magic-link login + token-based password resets
- Team-based competitions (department vs department; region vs region)
- Cross-event "frequent flyer" awards
- Photo / note attached to a stamp
- Activity capacity / time-window limits
- Export passport as PDF souvenir
- Social: "who else stamped this place?", reactions
- Slack / Teams notifications
- Company SSO (SAML / Azure AD / Okta)
- Multi-tenant (multiple companies in one deployment)

## First event (target)

- **Go Green / Earth Day** — multiple sustainability-themed activity stations
