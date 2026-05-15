# Stamprally — Product Spec

> Source of truth for V1 features and future roadmap. Keep this in sync with reality as decisions evolve.

## Concept

Internal "fake passport" web app where company employees create a profile (their "passport") and collect **stamps** by visiting **Activities** at company **Events**. Designed to be configurable and scalable across multiple events and years.

## Personas

- **User / Traveller** — employee with a passport
- **Admin** — designated administrator(s); env-var login; full override on any data
- **Kiosk** — shared account logged in on event-day check-in stations; admin-managed in DB; multi-device concurrent login allowed

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
- **Kiosk auth**: DB-managed user; admin creates the credentials; concurrent multi-device login allowed

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
- Each Activity has a unique long QR token + short fallback code (4 digits)
- Each Activity has a `points` value (admin-editable, default 1) that feeds the points leaderboard
- Activity can be active / inactive

### Check-in flow

- User taps "Stamp new place" in their passport
- Camera opens; user scans QR at the activity station
- OR enters fallback 4-digit code manually
- Stamp recorded; passport refreshes; toast shows the new stamp

### Kiosk UI

- Logged-in kiosk picks: Event → Activity → renders large QR + fallback code on screen
- "Give accolade" flow: kiosk picks an accolade from the catalog, then scans each user's passport QR (or types their 6-character code) to grant it. Rapid-fire scanner for handing accolades to a whole group quickly.
- Stays on the chosen surface until the kiosk operator navigates elsewhere

### Stats & leaderboards

- **Personal** (on `/passport`): stamps collected, events participated, accolade count
- **Per-event leaderboard** (on `/events/[slug]`): ranked by stamps within that event, with per-user accolade count shown alongside
- **Overall leaderboard** (on `/leaderboard`): three boards behind a switcher
  - **Points** (default) — sum of stamp.activity.points + accolade.points
  - **Stamps** — most stamps collected
  - **Accolades** — most accolades earned
  Each board supports date filters (all time, this year, each quarter of the current and previous year) and an event filter
- **Accolades**: all accolades are admin-managed — there is no auto-awarded layer. The `AccoladeTemplate` catalog at `/admin/accolades` defines the available accolades (label, emoji, theme, optional event tag, point value, active/inactive). Admins grant them per-user at `/admin/users/[id]`; kiosk operators grant them by scanning passport QRs at `/kiosk/give-accolade`. Granted accolades snapshot the template's fields so editing a template later does not retroactively rescore past grants.

### Admin panel

- Users / passports: search, view, override any field, reset password
- Signup access codes: CRUD
- Dropdown lists: Departments, Companies, Regions (CRUD; soft-deactivate)
- Events / Activities: CRUD; generate QR + fallback code; activity points
- Accolade catalog: CRUD on `AccoladeTemplate` rows (label, emoji, theme, event tag, points, active)
- Per-user grant/revoke of accolades from `/admin/users/[id]`
- Kiosk users: CRUD
- Photo upload limits: edit at runtime
- Audit log: view all admin actions

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
