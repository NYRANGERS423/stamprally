# Components

Shared components from `src/components/`. Grouped by directory. Props show the main exported component's interface (shortened where types are domain-heavy). "Where used" lists the routes / parent components that import each.

Button and card shared classes live in `src/lib/ui.ts` — designers should know about: `PRIMARY_BTN`, `SECONDARY_BTN`, `SMALL_BTN`, `DANGER_BTN`, `INPUT_CLASS`, `TEXTAREA_CLASS`, `CARD`, `CARD_HEADER`.

---

## Top-level (`src/components/`)

| Component | Purpose | Props | Where used |
|---|---|---|---|
| `ThemeToggle` | Icon button in every header. Cycles **system → light → dark**. Saves to `localStorage`; system mode listens to `prefers-color-scheme` live | `className?` | `UserHeader`, `KioskTopBar`, `AdminShell` |

## Auth (`src/components/auth/`)

| Component | Purpose | Props | Where used |
|---|---|---|---|
| `LoginForm` | User sign-in form, supports `?next=…` redirect | `next?` | `/login` |
| `SignupForm` | Registration: access code + email/password + name + 3 dropdowns | `departments`, `companies`, `regions` | `/signup` |
| `ChangePasswordForm` | Force-change-password form shown after admin reset | — | `/force-change-password` |
| `AdminLoginForm` | Admin sign-in (env-var credentials) | — | `/admin/login` |
| `AuthChooserFooter` | Shared footer with cross-links between user / admin / kiosk sign-ins | `current: "user" \| "admin" \| "kiosk"` | All 4 sign-in pages |

## User chrome (`src/components/user/`)

| Component | Purpose | Props | Where used |
|---|---|---|---|
| `UserHeader` | Sticky top nav for user flows: brand mark, nav tabs (Passport / Events / Ranks / Stamp), theme toggle, logout. Mobile-first: hides wordmark below `sm`, tight padding | `active?: "passport" \| "events" \| "stamp" \| "leaderboard" \| "edit"`, `nav?`, `showLogout?` | `/passport`, `/passport/edit`, `/events`, `/events/[slug]`, `/check-in`, `/leaderboard` |

## Passport (`src/components/passport/`)

| Component | Purpose | Props | Where used |
|---|---|---|---|
| `MyIdSheet` | "Show my ID" pill button in the Accolades header. Tap → bottom-sheet/centred modal with the user's QR code + 6-character short code. Used at kiosks to grant accolades | `userId`, `name` | `/passport` |
| `AccoladeList` | Renders user accolade chips. **Each chip is tappable** → modal with full description, event tag, point value, award date, granted-by (admin name or "Kiosk @username") | `accolades`, `defaultThemeId` | `/passport` |
| `StampedFlash` | Sticky top banner after check-in. 4 modes: `stamped` (green, includes "Stamp another →" CTA, 10s timer) / `already` (amber) / `not_found` (red) / `inactive` (stone). Auto-dismiss with manual close | `mode`, `activityName?` | `/passport` (rendered when `?stamped` / `?already` / `?stampError` is in the URL) |
| `PhotoUploader` | File-picker → cropper → upload. Shows current photo with remove. Honours admin-configured max MB | `currentPath`, `maxMb` | `/passport/edit` |
| `ImageCropper` | Canvas-based crop/scale UI for the chosen photo. Mounted by `PhotoUploader` | `file`, `saving`, `onCrop`, `maxOutput` | `PhotoUploader` |
| `SignatureCanvas` | HTML-canvas signature pad. Mouse + touch. Saves as compact SVG path | `initialJson` | `/passport/edit` |
| `SignatureRender` | Renders a signature SVG inline (used inside the themed passport card) | `data`, `className?` | `/passport` |
| `ThemeSelector` | Radio grid of 3 themes with emoji + label + colour swatch | `current` | `/passport/edit` |
| `TagsEditor` | Add/remove custom passport tags (key + value). Suggests common keys via chips | `tags` | `/passport/edit` |
| `ProfileForm` | Edit name + occupation. Server action | `firstName`, `lastName`, `occupation` | `/passport/edit` |

## Check-in (`src/components/check-in/`)

| Component | Purpose | Props | Where used |
|---|---|---|---|
| `CameraScanner` | Full QR scanner via `qr-scanner`. Probes camera support up-front; hides itself entirely on devices without one. Big "Open camera" CTA → live preview | — | `/check-in` |
| `CodeEntryForm` | 4-digit numeric code entry. Big-letter monospace input, no autofocus (so the keypad doesn't pop on mount) | — | `/check-in` |

## Kiosk (`src/components/kiosk/`)

| Component | Purpose | Props | Where used |
|---|---|---|---|
| `KioskTopBar` | Sticky top nav for kiosk flows. Mirrors `UserHeader`: brand mark, **Events / Accolades** nav tabs, theme toggle, logout. Shows `@username` on `md:` and up | `username`, `active?: "events" \| "accolades"` | All kiosk routes |
| `KioskLoginForm` | Kiosk station sign-in | — | `/kiosk/login` |
| `GrantAccoladeFlow` | The kiosk grant flow. Step 1: tile grid of active accolade templates. Step 2: pinned accolade card + session counter, "Open camera & scan" button, manual 6-char code input. On each grant, an inline green/amber/red flash appears on the video for 1.8s; haptic vibrate on supported devices | `templates: TemplateOpt[]` | `/kiosk/give-accolade` |

## Leaderboard (`src/components/leaderboard/`)

| Component | Purpose | Props | Where used |
|---|---|---|---|
| `LeaderboardFilterBar` | Two-dropdown filter bar: "When" (date range) and "Event". Pushes URL params and re-renders server-side | `ranges`, `events`, `selectedBoard`, `selectedRange`, `selectedEvent` | `/leaderboard` |

## Admin (`src/components/admin/`)

All client components (admin pages are interactive forms). All use the shared button / card classes from `src/lib/ui.ts`.

| Component | Purpose | Props | Where used |
|---|---|---|---|
| `AdminShell` | Sidebar layout + drawer nav (below `md`). Sticky top header with brand mark, theme toggle, logout. Sidebar nav has 10 items | `children`, `logoutForm` | All `/admin/*` (via `src/app/admin/layout.tsx`) |
| `UsersPanel` | Searchable user list with avatar, name, stamp count, accolade count | `users` | `/admin/users` |
| `UserDetailPanel` | Per-user card: photo + identity, password reset, stamps list with Grant + Remove, accolades list with template chips + manual fields + Grant + Revoke. Points field on the grant form | `user`, `stamps`, `accolades`, `activities`, `templates`, `events` | `/admin/users/[userId]` |
| `EventsPanel` | Create-event form + list with activity counts | `events` | `/admin/events` |
| `EventDetailPanel` | Event edit form, Add-activity form (name / order / points / description), list of activities. **New in v1**: each row has an inline-Edit mode that updates name/description/order/points | `event`, `activities` | `/admin/events/[eventId]` |
| `AccoladeTemplatesPanel` | Accolade catalog. Add form + list. **Inline-edit** mode per row updates emoji / label / points / description / theme / event tag | `templates`, `events` | `/admin/accolades` |
| `KioskUsersPanel` | Kiosk station credentials CRUD | `users` | `/admin/kiosk-users` |
| `AccessCodePanel` | Signup-gate codes CRUD with enable / disable | `codes` | `/admin/access-codes` |
| `DropdownAdminPanel` | Generic CRUD for the three dropdowns (Department / Company / Region) | `type`, `items` | `/admin/dropdowns/*` |
| `PhotoSettingsForm` | Photo upload config: max MB, output pixel size, JPEG quality | `maxMb`, `outputPx`, `outputQuality` | `/admin/settings` |

---

## Shared patterns to mind

- **Back-pill** style: `inline-flex h-10 items-center gap-1.5 rounded-full border border-stone-300 bg-white px-4 text-sm font-medium text-stone-700 shadow-sm`. Used across `/passport/edit`, `/events/[slug]`, all kiosk pages. Designers redoing back-navigation: keep them consistent.
- **Card** is `rounded-xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900`. Card header is a left-padded bar.
- **Brand colours**: blue family (`brand-50` → `brand-900`) for primary actions. Amber (`stamp-500` / `stamp-600`) for stamp-related accents (the star icon for accolades, points highlights).
- **Tone colours** for status banners: emerald (success), amber (warning / duplicate), red (error), stone (neutral / inactive).
- **Animations**: per-theme stamp-landing keyframes in `globals.css` (`stamp-land-classic`, `stamp-land-container`, `stamp-land-leaf`); kiosk grant flash (`kiosk-flash`). All respect `prefers-reduced-motion`.
