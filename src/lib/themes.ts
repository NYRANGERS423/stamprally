export type ThemeId = "default" | "apm-terminals" | "earth-day";

export interface Theme {
  id: ThemeId;
  label: string;
  description: string;
  emoji: string;

  // Tailwind classes
  pageBgClass: string;
  cardClass: string;
  headerStripClass: string;
  headerTextClass: string;
  footerStripClass: string;
  footerTextClass: string;
  labelClass: string;
  photoBorderClass: string;
  stampsCardClass: string;
  stampsHeaderClass: string;
  stampsHeaderTextClass: string;
  stampChipClass: string;
  stampChipTextClass: string;
  ctaClass: string;
  swatchGradient: string;

  // Item 1: subtle decorative SVG pattern, applied as an absolute-positioned
  // overlay on the passport card. URL-encoded SVG data URIs.
  bgPattern: string;
  stampsBgPattern: string;

  // Item 3: SVG path d= for the stamp chip icon (24×24 viewBox, stroke-based).
  stampSvgPath: string;

  // Item 6: class wired in globals.css that runs the theme's "stamp lands"
  // animation. Applied to the just-stamped chip after a successful check-in.
  stampLandClass: string;
}

const THEMES_LIST: Theme[] = [
  {
    id: "default",
    label: "Classic Blue",
    description: "Crisp navy + cream — the standard issue look.",
    emoji: "🗽",
    pageBgClass: "",
    cardClass:
      "border-2 border-brand-700 bg-gradient-to-br from-brand-50 to-brand-100 shadow-lg dark:border-brand-500 dark:from-brand-900/40 dark:to-brand-900/10",
    headerStripClass:
      "border-b-2 border-dashed border-brand-700/60 px-6 py-3 dark:border-brand-500/60",
    headerTextClass:
      "text-center font-mono text-xs uppercase tracking-[0.4em] text-brand-900 dark:text-brand-300",
    footerStripClass:
      "border-t-2 border-dashed border-brand-700/60 bg-brand-50/60 px-6 py-3 dark:border-brand-500/60 dark:bg-brand-900/20",
    footerTextClass:
      "text-center font-mono text-[10px] uppercase tracking-[0.3em] text-brand-900/70 dark:text-brand-300/70",
    labelClass:
      "font-mono text-[10px] uppercase tracking-[0.2em] text-brand-900/60 dark:text-brand-300/70",
    photoBorderClass:
      "border-2 border-brand-700/40 bg-white dark:border-brand-500/40 dark:bg-stone-900",
    stampsCardClass:
      "border-2 border-brand-700 bg-amber-50/60 dark:border-brand-500 dark:bg-amber-950/20",
    stampsHeaderClass:
      "border-b-2 border-dashed border-brand-700/60 px-6 py-3 dark:border-brand-500/60",
    stampsHeaderTextClass:
      "text-center font-mono text-xs uppercase tracking-[0.4em] text-brand-900 dark:text-brand-300",
    stampChipClass:
      "border-2 border-stamp-600 bg-white shadow-sm dark:bg-stone-900",
    stampChipTextClass: "text-stone-900 dark:text-stone-100",
    ctaClass:
      "bg-stamp-600 text-white hover:bg-stamp-500 active:bg-stamp-500",
    swatchGradient: "from-brand-100 via-brand-200 to-amber-100",
    // Subtle navy dot grid
    bgPattern:
      "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><circle cx='10' cy='10' r='0.8' fill='%231e3a8a' opacity='0.18'/></svg>\")",
    stampsBgPattern:
      "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28'><path d='M14 4 L18 12 L26 14 L18 16 L14 24 L10 16 L2 14 L10 12 Z' fill='%23b45309' opacity='0.07'/></svg>\")",
    stampSvgPath: "M5 12l5 5L20 7",
    stampLandClass: "stamp-land-classic",
  },
  {
    id: "apm-terminals",
    label: "APM Terminals",
    description:
      "Container terminal — STS cranes, vessels, and stacks of TEUs.",
    emoji: "🏗️",
    pageBgClass: "",
    cardClass:
      "border-2 border-orange-500 bg-gradient-to-br from-slate-100 to-slate-200 shadow-lg dark:border-orange-400 dark:from-slate-900 dark:to-slate-800",
    headerStripClass:
      "border-b-4 border-orange-500 bg-slate-900 px-6 py-3 dark:bg-slate-950",
    headerTextClass:
      "text-center font-mono text-xs uppercase tracking-[0.4em] text-orange-400",
    footerStripClass:
      "border-t-4 border-orange-500 bg-slate-900 px-6 py-3 dark:bg-slate-950",
    footerTextClass:
      "text-center font-mono text-[10px] uppercase tracking-[0.3em] text-orange-300/80",
    labelClass:
      "font-mono text-[10px] uppercase tracking-[0.2em] text-orange-700 dark:text-orange-400",
    photoBorderClass:
      "border-2 border-orange-500 bg-white dark:bg-slate-900",
    stampsCardClass:
      "border-2 border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20",
    stampsHeaderClass:
      "border-b-4 border-orange-500 bg-slate-900 px-6 py-3 dark:bg-slate-950",
    stampsHeaderTextClass:
      "text-center font-mono text-xs uppercase tracking-[0.4em] text-orange-400",
    stampChipClass:
      "border-2 border-orange-500 bg-white shadow-sm dark:bg-slate-900",
    stampChipTextClass: "text-slate-900 dark:text-slate-100",
    ctaClass:
      "bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-600",
    swatchGradient: "from-slate-900 via-orange-500 to-orange-300",
    // Tiled container outlines with end-door corrugation lines
    bgPattern:
      "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='40'><rect x='8' y='12' width='28' height='16' rx='1' stroke='%23f97316' stroke-width='1' fill='none' opacity='0.18'/><line x1='12' y1='14' x2='12' y2='26' stroke='%23f97316' stroke-width='0.5' opacity='0.18'/><line x1='32' y1='14' x2='32' y2='26' stroke='%23f97316' stroke-width='0.5' opacity='0.18'/><rect x='44' y='12' width='28' height='16' rx='1' stroke='%23f97316' stroke-width='1' fill='none' opacity='0.18'/><line x1='48' y1='14' x2='48' y2='26' stroke='%23f97316' stroke-width='0.5' opacity='0.18'/><line x1='68' y1='14' x2='68' y2='26' stroke='%23f97316' stroke-width='0.5' opacity='0.18'/></svg>\")",
    stampsBgPattern:
      "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><path d='M-5 25 L25 -5 M-5 35 L35 -5 M-5 45 L45 -5' stroke='%23f97316' stroke-width='3' opacity='0.08'/></svg>\")",
    // Container outline (rect + 3 corrugation lines)
    stampSvgPath:
      "M3 9 L21 9 L21 15 L3 15 Z M7 9 L7 15 M11 9 L11 15 M15 9 L15 15 M18 9 L18 15",
    stampLandClass: "stamp-land-container",
  },
  {
    id: "earth-day",
    label: "Earth Day",
    description: "Leafy greens + sky — for sustainability events.",
    emoji: "🌱",
    pageBgClass: "",
    cardClass:
      "border-2 border-emerald-600 bg-gradient-to-br from-emerald-50 via-green-50 to-sky-100 shadow-lg dark:border-emerald-400 dark:from-emerald-900/40 dark:via-green-900/30 dark:to-sky-900/30",
    headerStripClass:
      "border-b-2 border-dashed border-emerald-700/70 bg-emerald-100/70 px-6 py-3 dark:border-emerald-400/70 dark:bg-emerald-900/30",
    headerTextClass:
      "text-center font-mono text-xs uppercase tracking-[0.4em] text-emerald-900 dark:text-emerald-200",
    footerStripClass:
      "border-t-2 border-dashed border-emerald-700/70 bg-emerald-100/70 px-6 py-3 dark:border-emerald-400/70 dark:bg-emerald-900/30",
    footerTextClass:
      "text-center font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-900/80 dark:text-emerald-200/80",
    labelClass:
      "font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-300",
    photoBorderClass:
      "border-2 border-emerald-600/60 bg-white dark:border-emerald-400/60 dark:bg-emerald-950",
    stampsCardClass:
      "border-2 border-emerald-600 bg-gradient-to-br from-emerald-50 to-lime-50 dark:from-emerald-950/30 dark:to-lime-950/20",
    stampsHeaderClass:
      "border-b-2 border-dashed border-emerald-700/70 bg-emerald-100/70 px-6 py-3 dark:border-emerald-400/70 dark:bg-emerald-900/30",
    stampsHeaderTextClass:
      "text-center font-mono text-xs uppercase tracking-[0.4em] text-emerald-900 dark:text-emerald-200",
    stampChipClass:
      "border-2 border-emerald-600 bg-white shadow-sm dark:bg-emerald-950",
    stampChipTextClass: "text-emerald-900 dark:text-emerald-100",
    ctaClass:
      "bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-500",
    swatchGradient: "from-emerald-200 via-lime-200 to-sky-200",
    // Scattered leaves
    bgPattern:
      "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><path d='M15 25 q 5 -10 13 -3 q -1 9 -13 3 z' fill='%23059669' opacity='0.18'/><path d='M27 23 q 2 -1 3 0' stroke='%23047857' stroke-width='0.5' fill='none' opacity='0.3'/><path d='M40 48 q 5 -8 12 -2 q -1 8 -12 2 z' fill='%23059669' opacity='0.18'/></svg>\")",
    stampsBgPattern:
      "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='50' height='50'><path d='M25 10 q 8 5 0 25 q -8 -20 0 -25 z' fill='%23059669' opacity='0.08'/></svg>\")",
    // Leaf outline with center stem
    stampSvgPath:
      "M12 3 C 7 7 7 17 12 21 C 17 17 17 7 12 3 Z M12 5 L12 19",
    stampLandClass: "stamp-land-leaf",
  },
];

export const THEMES: Record<ThemeId, Theme> = Object.fromEntries(
  THEMES_LIST.map((t) => [t.id, t]),
) as Record<ThemeId, Theme>;

export const THEME_LIST = THEMES_LIST;

export function getTheme(id: string | null | undefined): Theme {
  if (id && id in THEMES) return THEMES[id as ThemeId];
  return THEMES.default;
}
