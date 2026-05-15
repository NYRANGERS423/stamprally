# Design Brief

## 1. What is this app, in one sentence?

A digital "passport" for employees at any kind of organization — they collect stamps at company events and activities, earn accolades, and compare standings on fun, themed leaderboards. Built for an employee-engagement committee to roll out across all staff.

## 2. Who uses it?

| Role | Count | Notes |
|---|---|---|
| **Users** (employees) | ~200 | Ages roughly 25–55. **95% on phones**, occasionally desktop. |
| **Admin** | 1 person | Single account; designs events, manages the accolade catalog, oversees users. |
| **Kiosk** | 1 shared account | A single shared kiosk login used on event-day stations. (Multi-device concurrent login is already supported, so one set of credentials covers any number of physical stations.) |

Mobile-first is non-negotiable. Desktop is a "looks fine here too" tier, not a primary target.

## 3. Primary user actions

In order of expected frequency over a typical month:

1. **Browse — between events** (the most-time activity). Users open the app to see the leaderboard, check their own ranks, look at other people's passports / accolades, "what does everyone have that I don't?" This is the most-frequent use and the design should make it **inviting and rewarding to poke around in.**
2. **Stamp — during an event**. When an event runs, users open the app many times in one day to scan a QR (or type a 6-digit code) at each activity station. This is a quick, focused interaction — the path from "open app" to "stamp collected" needs to be fast.
3. **Show off**. After an event or accolade, users will pull up their own passport to look at it. Theme-switching at `/passport/edit` is a self-expression vector.

## 4. What's working today

Everything functionally. **This is a UI refinement exercise, not a redesign.** Keep the spine of what's there — the themed passport card, the three-board leaderboard switcher, the kiosk grant flow, the accolade chips. Refine, don't rebuild.

## 5. What's not working

Nothing concrete. The brief is "find me the rough edges I haven't noticed myself" — consistency, missing affordances, polish opportunities. Designer's job is to surface those.

## 6. The vibe

**Playful · friendly · official-but-fun**

It should feel like a real passport (the credibility of the stamp/leaderboard system depends on it not feeling like a joke) but with warmth and whimsy — this is an employee-engagement product, not a corporate compliance tool.

## 7. References

None provided. Designer should use the existing three themes (Classic Blue 🇺🇸, Container Terminal 🏗️, Earth Day 🌱) as anchors for the visual tonal range, plus the design vocabulary already present in `globals.css` (`brand-*` blues, `stamp-*` ambers, stone-family neutrals).

## 8. Constraints / non-negotiables

The defaults stand:

- **Mobile-first.** 95% of users will hit it on a phone. 44px minimum tap targets, 16px inputs, drawer nav below `md` are already in.
- **Light AND dark mode.** Class-based dark mode is wired up; every surface must work in both.
- **Three themes** (Classic Blue / Container Terminal / Earth Day) are the baseline. Per-user, only affects `/passport`. Adding more is a registry append in `src/lib/themes.ts`.
- No external CDN restrictions. No accessibility constraints beyond standard WCAG-AA contrast.

## 9. Success metric

> "The UI looks more polished and consistent, is more aware of user ease and engagement, and is inviting / attractive to interact with — pulls users in to engage."

Translation: a design pass succeeds when the app feels worth opening for its own sake, even between events. Polish + invitation > new features.

## 10. Open questions for the designer

**Open to suggestions.** The user has no specific asks, but is explicitly interested in:

- **Browse / discovery affordances**: ways to look around, "see what I have vs. what others have," peek at someone else's passport, scan accolades by event. The current `/leaderboard` is functional but isn't a *destination* the way the passport is. How could it become one without becoming overwhelming?
- **Quality-of-life details**: micro-interactions, hover/press states, empty-state design, transitions between screens that today are abrupt.
- **Anything missing**: if you see a navigation cul-de-sac or a feature that's clearly implied but not built (e.g. tapping a user's name on the leaderboard could lead somewhere?), call it out.

Constraint on suggestions: **avoid overwhelming.** Don't propose a redesign of every surface; suggest the 3–5 highest-leverage changes that move the needle on polish and engagement.

---

## Reference: what already exists

- Three pre-built themes drive `/passport` visuals (see [`globals.css`](globals.css) and `src/lib/themes.ts` upstream)
- Brand colours are blue-family (`brand-50` → `brand-900`) and amber (`stamp-500` / `stamp-600`)
- Class-based dark mode is wired up; every `dark:` utility applies based on user preference
- Mobile-first: 44px tap targets, drawer nav under `md`, `touch-action: manipulation` everywhere
- Per-theme stamp-landing keyframes for first-time stamp animations; honours `prefers-reduced-motion`
- A "Show my ID" QR sheet on `/passport` (kiosk operators scan it to grant accolades)
- A clickable accolade chip pattern that opens a description modal — recently shipped, may inspire similar patterns elsewhere
