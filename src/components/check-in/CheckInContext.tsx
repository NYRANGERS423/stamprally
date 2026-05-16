import "server-only";
import { db } from "@/lib/db";
import { eventStateFor } from "@/components/events/EventStatus";

// Pass 04 / design-handoff §4.4.4 — slim context strip above the
// camera + code cards. Tells the user which event(s) are live today
// so the kiosk QR they're about to scan makes sense in context.
// Returns null when nothing is active today (omit entirely, don't
// reserve space).

export async function CheckInContext() {
  const now = new Date();
  const events = await db.event.findMany({
    where: { active: true },
    orderBy: [{ startDate: "asc" }],
    select: { id: true, name: true, startDate: true, endDate: true },
  });

  const activeToday = events.filter(
    (e) => eventStateFor(true, e.startDate, e.endDate, now) === "today",
  );
  if (activeToday.length === 0) return null;

  return (
    <div className="w-full rounded-xl border border-brand-100 bg-brand-50 px-4 py-2.5 text-sm text-brand-800 dark:border-brand-900/60 dark:bg-brand-900/30 dark:text-brand-200">
      <p className="flex flex-wrap items-baseline gap-x-2">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-700/70 dark:text-brand-300/80">
          Active today
        </span>
        <span>{activeToday.map((e) => e.name).join(" · ")}</span>
      </p>
    </div>
  );
}
