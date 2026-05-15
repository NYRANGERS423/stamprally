# Design Brief

> **Fill this in by hand before sharing.** Designers do their best work when they understand the *why*, not just the *what*.

## 1. What is this app, in one sentence?

<!-- e.g. "A playful internal passport where our employees collect stamps at company events." -->

## 2. Who uses it?

<!-- Three audiences:
     – Users: regular employees at the company
     – Admins: a small ops team (1–3 people) who set up events and manage the catalog
     – Kiosk operators: event-day staff at activity stations who hand out accolades
   How many of each? What devices? Any accessibility considerations? -->

## 3. Primary user action

<!-- What does a user do most? Scan a QR? Browse the leaderboard? Show off their passport?
     Rank these in order of expected frequency. -->

## 4. What's working today?

<!-- What about the current design do you want to keep? -->

## 5. What's not working?

<!-- Specific pain points you've noticed in testing or use. Be specific:
     "Stamps section feels cramped on small phones" beats "feels off". -->

## 6. The vibe

<!-- Adjectives only. Pick 3–5 that capture the tone you want.
     Examples: playful, official-but-fun, retro, minimal, premium, warm, technical, nostalgic. -->

## 7. References

<!-- Anything you've seen elsewhere that captures the right feel.
     Real passports? Boarding passes? A specific app or product? Drop links or descriptions. -->

## 8. Constraints

<!-- - Mobile-first. Most users will hit it on a phone.
     - All audiences need light AND dark mode.
     - Three themes: Classic Blue (default), Container Terminal, Earth Day. More themes are easy to add.
     - Admin and kiosk are utility surfaces (less brand-heavy than the user passport).
     - No external CDN restrictions. -->

## 9. Success metric

<!-- How will you know the redesign is better? -->

## 10. Open questions for the designer

<!-- e.g. "Should the points-leaderboard be the default tab, or should stamps be?"
     "Is there a way to make the accolade chips feel more 'earned' on the passport?" -->

---

## Reference: what already exists

- Three pre-built themes drive `/passport` visuals (see [`globals.css`](globals.css) and the THEMES section in [`COMPONENTS.md`](COMPONENTS.md))
- Brand colours are blue-family (`brand-50` → `brand-900`) and amber (`stamp-500` / `stamp-600`)
- Class-based dark mode is wired up; every `dark:` utility applies based on user preference
- Mobile-first: 44px tap targets, drawer nav under `md`, `touch-action: manipulation`
