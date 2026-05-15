# Stamprally — Design Handoff

A self-contained packet for design review. **Everything a designer needs is in this folder; nothing outside it is required reading.**

## What this is

Stamprally is an internal-only web app where employees collect "passport stamps" at company events and earn accolades. It's not a public product — the audience is one company's employees, plus a small admin team and a few kiosk operators on event days.

This handoff is a snapshot of v1.0.0 (commit [`46d5829`](https://github.com/NYRANGERS423/stamprally/commit/46d5829)).

## Files in this folder

| File | What it's for |
|---|---|
| [`BRIEF.md`](BRIEF.md) | Goals, constraints, vibe — **fill in by hand before sharing** |
| [`ROUTES.md`](ROUTES.md) | Every page in the app, its audience, and what data it shows |
| [`COMPONENTS.md`](COMPONENTS.md) | Shared components, their props, and where they appear |
| [`screens.md`](screens.md) | Checklist of which screens to capture for review (6–8 shots, not 30) |
| [`globals.css`](globals.css) | Tailwind v4 token file — all design tokens live here |

## Stack at a glance

- **Next.js 16** (App Router) · React 19 · TypeScript
- **Tailwind v4** with inline `@theme` tokens (no `tailwind.config.*` file)
- **Class-based dark mode** via `@custom-variant`; user can toggle light / dark / system from any header
- **Three themes** drive passport visual variation: Classic Blue 🇺🇸 (default), Container Terminal 🏗️, Earth Day 🌱. Theme is per-user and only affects `/passport`
- **Mobile-first**: all tap targets ≥ 44px, 16px inputs, drawer admin nav below `md`
- All UI components live under `src/components/`; design tokens in [`globals.css`](globals.css); shared button/card classes in `src/lib/ui.ts`

## How to use this for review

1. Read [`BRIEF.md`](BRIEF.md) first (once filled in) — sets the why
2. Skim [`ROUTES.md`](ROUTES.md) to understand the surface area
3. Scan [`screens.md`](screens.md) for the screens that matter most
4. Reference [`COMPONENTS.md`](COMPONENTS.md) and [`globals.css`](globals.css) for the visual vocabulary
