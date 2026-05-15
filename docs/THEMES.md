# Adding a new passport theme

Themes change the visual identity of every user's passport without touching app behaviour. Users pick one from `/passport/edit`.

A `Theme` is a registry entry in `src/lib/themes.ts` — a set of Tailwind class strings, SVG paths, and a couple of pattern data URIs. There is no DB table per theme; the only stored value is `User.theme` (a string ID).

## Files involved

| File | Why |
|---|---|
| `src/lib/themes.ts` | The Theme registry. Every new theme lives here. |
| `src/app/globals.css` | Add new `@keyframes` here if you want a custom stamp-landing animation. |
| `prisma/migrations/<ts>_<name>/migration.sql` | Only if you're **renaming** an existing theme ID — write `UPDATE "User" SET theme = '<new>' WHERE theme = '<old>'`. New themes need no migration. |

## Required fields on `Theme`

(Full type lives in `src/lib/themes.ts`.)

### Identity
| Field | What | Recommendation |
|---|---|---|
| `id` | URL-safe unique key | kebab-case, generic (no company names): `holiday-2026`, `summer-quarter` |
| `label` | Picker title | Title Case: "Holiday 2026" |
| `description` | One-line picker subtitle | Set the vibe in 6–10 words |
| `emoji` | Tiny visual hint | One emoji that captures the feel |
| `swatchGradient` | 3-stop Tailwind gradient for the picker preview | `from-blue-200 via-pink-200 to-yellow-200` style |

### The passport card chrome
| Field | What | Watch for |
|---|---|---|
| `cardClass` | Outer card: border + gradient bg | Include `dark:` variants for both border and bg |
| `headerStripClass` / `headerTextClass` | Top strip with "Passport · Stamprally" | Pair must have strong contrast |
| `footerStripClass` / `footerTextClass` | Bottom strip with "Stamps on next page" | Mirror the header |
| `labelClass` | Small mono-cap labels on the data fields (`Nationality`, `Citizen since`, …) | Subtle is fine — ~60% opacity of theme accent |
| `photoBorderClass` | Frame around the user photo | Match the accent colour |

### The stamps card
| Field | What | Watch for |
|---|---|---|
| `stampsCardClass` | The whole "Stamps" card below the passport | Usually a *different* gradient from the passport card so the page-flip is obvious |
| `stampsHeaderClass` / `stampsHeaderTextClass` | "Stamps · N" strip at the top | High contrast in BOTH modes — header backgrounds tend to be solid/dark |
| `stampsLabelClass` | Event name headers and stamp count *inside* the stamps card | **This is the one that breaks most often.** Must contrast with `stampsCardClass`. Don't use the same colour family as the card bg. |
| `stampChipClass` | The bordered circle for each stamp impression | White (or dark equivalent) is safest — high contrast on any tinted card |
| `stampChipTextClass` | Activity name + date inside an impression | Dark neutral for light mode, light neutral for dark mode |

### The shared bits (tags, signature, dividers, CTA)
| Field | What |
|---|---|
| `tagChipClass` / `tagChipKeyClass` | "About me" chips: value + key |
| `dividerClass` | Dashed separators between passport sections |
| `signatureColorClass` | Stroke colour for the signature SVG |
| `ctaClass` | "Stamp new place" pill button on `/passport` |

### Decoration & motion
| Field | What |
|---|---|
| `bgPattern` | URL-encoded SVG data URI tiled over the passport card |
| `stampsBgPattern` | Same for the stamps card |
| `stampSvgPath` | `d` attribute for the chip icon inside each impression (24×24 viewBox, stroke=currentColor) |
| `stampLandClass` | CSS class that runs the theme's stamp-landing animation (declared in `globals.css`) |

## Colour palette guidelines

Every colour-bearing class needs a light **and** a `dark:` variant. Test both.

Rules of thumb:
- **Don't pair same-family colours.** `text-orange-700` on `bg-orange-100` looks designed but reads badly. Use a neutral (slate / stone / brand) for text against a tinted background.
- **Avoid pure black/white.** Use `text-stone-900` / `text-brand-100` etc. — softer, less harsh.
- **Borders at 30–50% opacity** look intentional without screaming.
- **The chip border colour** is what carries the theme identity inside the stamps section. Make it pop.

## Decorative pattern guidelines

`bgPattern` and `stampsBgPattern` are URL-encoded SVG data URIs. The full string starts with `url("data:image/svg+xml;utf8,<svg ...>...</svg>")`.

- Tile size: 20–80 px works for most patterns.
- Opacity: **0.06–0.20**. Above 0.25 it competes with the content.
- Use single quotes inside the SVG so you don't have to escape double quotes in the surrounding CSS string.
- `#` in CSS hex colours must be `%23` inside a data URI: `fill='%231e3a8a'`.

Example:
```
url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><circle cx='10' cy='10' r='0.8' fill='%231e3a8a' opacity='0.18'/></svg>")
```

## Stamp icon path requirements

`stampSvgPath` is just the `d` attribute of an SVG `<path>`. It's rendered with:
- `viewBox="0 0 24 24"`
- `fill="none"`, `stroke="currentColor"`, `strokeWidth="2"`
- `strokeLinecap="round"`, `strokeLinejoin="round"`

So design for **stroke-based** icons. Keep the path under ~12 commands. Examples in current themes:
- Classic: checkmark — `M5 12l5 5L20 7`
- Container Terminal: container with corrugation — `M3 9 L21 9 L21 15 L3 15 Z M7 9 L7 15 M11 9 L11 15 M15 9 L15 15 M18 9 L18 15`
- Earth Day: leaf — `M12 3 C 7 7 7 17 12 21 C 17 17 17 7 12 3 Z M12 5 L12 19`

## Adding a custom landing animation

In `src/app/globals.css`:

```css
@keyframes stamp-land-myvibe {
  0%   { transform: scale(0) rotate(-15deg); opacity: 0; }
  60%  { transform: scale(1.15) rotate(3deg);  opacity: 1; }
  100% { transform: scale(1) rotate(0deg);     opacity: 1; }
}

.stamp-land-myvibe {
  animation: stamp-land-myvibe 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@media (prefers-reduced-motion: reduce) {
  .stamp-land-myvibe { animation: none; }
}
```

Then set `stampLandClass: "stamp-land-myvibe"` on your theme.

**Always** add the `prefers-reduced-motion` override — it's a real accessibility requirement.

## Step-by-step: adding "Holiday 2026"

1. Pick an ID: `holiday-2026`.
2. Pick a 3–5 colour palette and decide which goes where (card border, accent, text on header strip, etc.).
3. Open `src/lib/themes.ts`:
   - Add `"holiday-2026"` to the `ThemeId` union.
   - Append a new object to `THEMES_LIST` with every field above.
4. Sketch your `bgPattern` and `stampsBgPattern` in an SVG editor (Figma, Boxy SVG), export, and URL-encode the result.
5. Pick a stamp icon — a star? a tree? a snowflake? — and grab its `d` attribute.
6. (Optional) Add a custom landing animation in `globals.css`.
7. Run the checklist below.
8. Commit.

## Pre-ship checklist

Switch to your theme on `/passport/edit` and walk through `/passport`:

1. ✅ Header strip text is readable
2. ✅ Field labels (`Nationality`, etc.) are visible but not loud
3. ✅ Tag chips ("About me") have clear contrast — value bold, key muted but still readable
4. ✅ Signature SVG (if user has one) is visible
5. ✅ Section dividers (dashed) are visible without overpowering content
6. ✅ "Stamps · N" header is readable
7. ✅ **Event labels INSIDE the stamps card pop against the tinted bg** ← the most common failure
8. ✅ Stamp impression: name, MAR, day, '26 all readable
9. ✅ `bgPattern` is subtle, not loud
10. ✅ Landing animation runs once when arriving with `?stamped=<name>`
11. ✅ Repeat #1–#10 in **dark mode** (flip your OS dark mode or temporarily set `<html class="dark">`)
12. ✅ Mobile width — no overflow, tap targets feel right

## Common failures

- **`labelClass` is too muted inside `stampsCardClass`.** Use `stampsLabelClass` (full strength, no opacity reduction) for event headers in the stamps card. Don't reuse `labelClass` there.
- **Same-family colour text on same-family bg.** `text-orange-700` on `bg-orange-50` is a classic mistake. Drop in slate / stone / neutral.
- **Forgot the `dark:` variant.** Every visible text or background colour needs both.
- **Pattern opacity too high.** Above 0.25 makes the page look noisy.
- **Forgot to URL-encode `#`.** Inside data URIs, `#ff5500` must be `%23ff5500`.
- **Animation without `prefers-reduced-motion`.** Always add the override.
- **Renaming an ID without a migration.** Users who picked the old ID will silently fall back to `default`. Write `UPDATE "User" SET theme = '<new>' WHERE theme = '<old>'` in a migration.

## Where this doc lives

Tracked in the repo at `docs/THEMES.md`. Both humans and AI coding assistants should treat this as the source of truth before touching `src/lib/themes.ts`.
