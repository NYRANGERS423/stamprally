# Stamprally — Product Spec

> Source of truth for V1 features and future roadmap. Keep this in sync with reality as decisions evolve.

## Concept

Internal "fake passport" web app where company employees create a profile (their "passport") and collect **stamps** by visiting **Activities** within **Destinations** at company **Events**. Designed to be configurable and scalable across multiple events and years.

## Personas

- **User / Traveller** — employee with a passport
- **Admin** — designated administrator(s); env-var login; full override on any data
- **Kiosk** — shared account logged in on event-day check-in stations; admin-managed in DB; multi-device concurrent login allowed

## Domain model

```
Event   1—*  Destination   1—*  Activity   1—*  Stamp  *—1  User
                                                              *—*  PassportTag (free-form personal tags)
                                                              *—1  Department / Company / Region
```

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

- CRUD: Event → Destination → Activity tree
- Each Activity has a unique long QR token + short fallback code (4 digits)
- Activity can be active / inactive

### Check-in flow

- User taps "Stamp new place" in their passport
- Camera opens; user scans QR at the activity station
- OR enters fallback 4-digit code manually
- Stamp recorded; passport refreshes; toast shows the new stamp

### Kiosk UI

- Logged-in kiosk picks: Event → Destination → Activity
- Renders large QR + fallback code on screen
- Stays on screen until kiosk picks a different activity

### Stats

- **Personal**: stamps collected, events participated, current streaks
- **Leaderboard**: per event and all-time
- **Accolades** (auto-awarded):
  - Fast Traveller — top N% by check-in speed within an event
  - Globetrotter — visited every activity in an event
  - Early Bird — first to check in at a given activity
  - Marathoner — most events across a calendar year
  - Completionist — 100% of activities across all events in a year
- **Manual accolades**: admin can grant a custom badge to a person or team

### Admin panel

- Users / passports: search, view, override any field, reset password
- Signup access codes: CRUD
- Dropdown lists: Departments, Companies, Regions (CRUD; soft-deactivate)
- Events / Destinations / Activities: CRUD; generate QR + fallback code
- Kiosk users: CRUD
- Photo upload limits: edit at runtime
- Manual accolades: grant / revoke
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
