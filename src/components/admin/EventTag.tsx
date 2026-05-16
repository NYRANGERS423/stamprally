// Pass 05 / design-handoff §4.5.4 — pill that shows which event an
// item belongs to. Used in kiosk tiles and the admin accolade
// catalog. Events don't carry a per-event color in the schema yet,
// so the "with event" variant uses a single brand tint; when events
// grow a color field this can swap to it without touching layout.
// The "standalone" variant is a dashed outline.

export function EventTag({
  eventShort,
  emoji,
}: {
  eventShort: string | null;
  emoji?: string | null;
}) {
  if (!eventShort) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-stone-300 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-stone-500 dark:border-stone-700 dark:text-stone-400">
        Standalone
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-brand-700 dark:border-brand-800 dark:bg-brand-900/40 dark:text-brand-300">
      {emoji && (
        <span aria-hidden className="text-[11px]">
          {emoji}
        </span>
      )}
      {eventShort}
    </span>
  );
}
