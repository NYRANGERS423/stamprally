# Outstanding work — backlog

Things considered, scoped, and intentionally deferred. Each item below has been
weighed against either shipping or "good-enough-for-now" and parked. The
ordering is rough priority — top of each section first.

Last refresh: 2026-05-16 (after v1.3.0).

---

## Audit + observability

### Stamp.operatorUserId population
**Status:** Column exists (migration `20260519000000_steward_grants` added it
in v1.3.0); population logic is not wired.

**What it does:** When a steward shows a QR for activity X via
`/steward/show/[activityId]`, the next user to scan that QR within ~5 min has
their resulting stamp attributed back to the showing steward. The column is
already there, nullable.

**How to implement:**
- Log every `/steward/show/[activityId]` page load into a small lookup
  (either a new `StewardShow {id, stewardUserId, activityId, shownAt}` table,
  or reuse `AdminAuditLog` with `action="steward.show"`).
- In `src/app/check-in/[token]/route.ts`, before `db.stamp.create`, query the
  log for the most recent show of that `activityId` within the last N minutes
  and set `operatorUserId` if found.
- Surface the attribution on the accolade chip ("Stewarded by Jane") and on
  `/admin/stewards` (last 10 stamps facilitated per steward).

**Size:** ~30 lines of correlation code + 50 lines of UI surface. No migration
if reusing `AdminAuditLog`; one if adding a dedicated table.

**Why deferred:** No active complaint and the StewardGrant table already gives
admins a usable audit trail (who got steward access, when, by whom).
Attribution is fidelity polish that becomes useful when there's a complaint to
investigate.

### Admin dashboard SparkBars + AttentionList
**Status:** Pass 05 spec defined them; current dashboard has hero KPIs +
catalog grid but neither of these visuals.

**What it does:** A 7-day stamp-count sparkline next to a short "needs your
attention" list (e.g. "3 access codes expire this week", "5 new signups since
yesterday").

**How to implement:** New `getDashboardKpis()` server loader, `<SparkBars>`
CSS-only bar chart, `<AttentionList>` with tone-dot rows. Wire into
`/admin/page.tsx`.

**Size:** ~150 lines + the loader.

**Why deferred:** Dashboard is functional; this is decorative.

---

## User-facing polish

### `/events/[slug]` hero refactor
**Status:** The mini-rank section uses `<RankRow>` and the activity list is
clickable (`<ActivityList>`), both per Pass 04 spec. The hero card itself was
not rewritten — current view uses the older "back-pill + name" header layout.

**What it does:** 52px theme-tinted emoji avatar + name + short-name eyebrow
(mono caps in theme color) + a state-aware progress card below ("Your
progress" → "You finished" at 100%, background swaps to emerald).

**How to implement:** Rewrite the top of `src/app/events/[slug]/page.tsx`.
The pieces (`EventStatus`, theme emoji, etc.) already exist.

**Size:** ~200 lines.

**Why deferred:** Functional, just dated.

### 4-cell mono digit code entry on `/check-in`
**Status:** Code-entry form uses a single `<input>` with wide tracking.

**What it does:** Replace the single field with four separate 52px tall input
cells, one per digit. Typing auto-advances focus; backspace goes back; Submit
auto-enables when all four cells are filled. Standard OTP/PIN pattern (Apple
Pay, Google login, Discord 2FA all use it).

**How to implement:** New client component that manages four refs and the
focus dance. Submit button uses the joined value as the existing form field.
~80 lines.

**Why deferred:** The current single-input form works fine. The 4-cell version
is a polish touch — better visual feedback and bigger tap targets per digit.
Worth doing if you ever observe people fat-fingering codes on mobile.

### `<FailStrip>` on `/check-in`
**Status:** Errors come back through the `<StampedFlash>` modes already
(red `not_found`, amber `inactive`). Pass 04 spec wanted a dedicated inline
strip ABOVE the camera card.

**Why deferred:** Functionally redundant with the existing flash modes. Worth
revisiting only if the inline-banner placement matters more than the flash
position.

---

## Operator-facing polish (low urgency)

### Amber "Editing" frame for inline-edit rows
**Status:** When admin clicks Edit on an activity row or accolade-template
row, it just becomes a form. Pass 05 spec wanted an amber-tinted frame with a
floating "EDITING" pill so it visually pops vs read mode.

**How to implement:** Style overrides in `EventDetailPanel` and
`AccoladeTemplatesPanel`. ~100 lines.

**Why deferred:** Operator-only, low-frequency surface.

### GrantAccoladeFlow tile refresh
**Status:** Picker tiles in the steward accolade flow render the template
emoji + label + description + event name. Pass 05 spec had a polished layout
(64px ringed emoji, real description with 2-line clamp, `<EventTag>` pill at
the bottom).

**How to implement:** Style update inside
`src/components/steward/GrantAccoladeFlow.tsx`. ~80 lines. Would consume the
already-built `<EventTag>` component which currently has no callers.

**Why deferred:** Operator-only.

### Rank page accolade peek + chevron preview
**Status:** Pass 03 spec wanted each rank row to show up to 3 small ringed
accolade emoji + a "+N" chip, plus a tap-to-expand chevron that reveals top-3
accolade names + most-recent stamp date.

**How to implement:** Loader extension on `fetchLeaderboard` to surface each
row's top accolades, plus a client `<details>` per row. ~150 lines.

**Why deferred:** Names already link to `/u/[id]` (full passport) which gives
the same info without the inline real estate.

---

## V2+ (originally in SPEC.md, still on the table)

- SMTP → magic-link login + token password resets
- Team / department-vs-department leaderboards
- Cross-event "frequent flyer" awards
- Photo / note attached to a stamp
- Activity capacity / time-window limits
- Export passport as PDF
- Slack / Teams notifications on milestones
- SSO (SAML / Azure AD / Okta)
- Multi-tenant (multiple companies in one deployment)
