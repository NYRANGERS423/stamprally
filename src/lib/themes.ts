export type ThemeId = "default" | "apm-terminals" | "earth-day";

export interface Theme {
  id: ThemeId;
  label: string;
  description: string;
  emoji: string;
  // Tailwind utility class strings applied at each layer of the passport card.
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
  // Tiny swatch for the theme selector card.
  swatchGradient: string;
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
  },
  {
    id: "apm-terminals",
    label: "APM Terminals",
    description: "Port-side palette — deep navy + container orange.",
    emoji: "🚢",
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
