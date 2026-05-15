# Screens to capture

Eight screenshots cover the design surface. Don't try to capture all 30+ routes — pick these eight, in both light and dark mode where noted, and the reviewer will see the visual vocabulary.

Capture on a **mobile viewport** (e.g. 390×844 — a stock iPhone size). The app is mobile-first; mobile shots are more representative than desktop.

**Save them in [`screenshots/`](screenshots/)** using the naming convention `<number>-<screen>-<theme/mode>.png` (e.g. `1-landing-light.png`). See [`screenshots/README.md`](screenshots/README.md) for the full file list.

## The eight

- [ ] **1. Landing — `/`** *(light + dark)*
  The first impression. Three sign-in entry points (user / admin / kiosk) plus the headline. Public-facing.

- [ ] **2. Passport — `/passport`** *(Classic Blue theme, dark mode)*
  The headline screen. Themed passport card up top, "Show my ID" pill in the Accolades section, stats tiles, accolade chips, themed stamp impressions grouped by event. The pride-of-place view.

- [ ] **3. Passport — `/passport`** *(Earth Day theme OR Container Terminal theme, light mode)*
  Same page as #2 but with a different theme picked. Demonstrates the theme system's visual range — different colours, fonts, stamp icon, background pattern, landing animation.

- [ ] **4. Check-in — `/check-in`** *(light)*
  How users earn stamps. Two paths visible: camera-scan button and 4-digit code input.

- [ ] **5. Event detail — `/events/[slug]`** *(light)*
  Event leaderboard. Progress bar, activity checklist (stamped vs not), top-50 ranked by stamps with the per-event accolade star + count alongside.

- [ ] **6. Overall leaderboard — `/leaderboard`** *(dark)*
  Three-board switcher pill at top (Points / Stamps / Accolades). Filter dropdowns. Top 100 rows. The board switcher and compact row layout are the design hinge.

- [ ] **7. Kiosk grant flow — `/kiosk/give-accolade`** *(scanner step, light)*
  After picking an accolade template. Shows the pinned accolade card with session counter, "Open camera & scan" button, manual code input. **Bonus** if you can capture a green ✓ flash mid-grant.

- [ ] **8. Admin event detail — `/admin/events/[eventId]`** *(desktop viewport, light)*
  The most representative admin surface. Sidebar nav, event details form, add-activity form (with points), inline-editable activity rows. Captures the admin visual language.

## Optional / supplemental

- **Stamp success flash** — after a successful check-in, a green sticky banner with "Stamp another →" CTA appears at the top of `/passport`. Worth a shot if you can repro it cleanly.
- **Accolade detail modal** — tap any accolade chip on `/passport` to open the description modal. Shows the descriptions, points, event tag, and award details. Worth a shot.
- **Admin drawer (mobile)** — `/admin/*` on mobile collapses the sidebar into a drawer. Tap the hamburger to open. One shot covers all admin pages on phones.

## Capture tips

- **Light vs dark**: use the theme toggle in the top-right of every header (sun / moon / desktop icon). Cycles system → light → dark.
- **Theme**: pick a theme at `/passport/edit` → Theme selector.
- **Pre-fill data**: if there's nothing on the leaderboard or no accolades, the empty states are themselves worth capturing — but consider seeding a few stamps + a couple of accolades for #2 / #3 / #5 / #6 so the visuals have weight.

---

## What to skip

These add nothing the eight above don't already cover:

- `/signup`, `/login`, `/admin/login`, `/kiosk/login` — same auth-pill pattern with the cross-link footer; one is representative.
- `/passport/edit` — utility form, less brand-heavy.
- The remaining admin pages — same shell, just different forms.
- The kiosk activity-display page (`/kiosk/show/[activityId]`) — a single big QR; nothing to design.
