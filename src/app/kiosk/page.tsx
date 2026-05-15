import Link from "next/link";
import { requireKiosk } from "@/lib/auth/kiosk-guard";
import { db } from "@/lib/db";
import { KioskTopBar } from "@/components/kiosk/KioskTopBar";

export default async function KioskHome() {
  const { username } = await requireKiosk();
  const events = await db.event.findMany({
    where: { active: true },
    orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
    include: { _count: { select: { destinations: true } } },
  });

  return (
    <>
      <KioskTopBar username={username} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Pick an event</h1>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          Only active events are shown. An admin can flip one back on if it&apos;s
          missing.
        </p>

        {events.length === 0 ? (
          <p className="mt-8 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            No active events right now. Ask an admin to create or activate one.
          </p>
        ) : (
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {events.map((event) => (
              <li key={event.id}>
                <Link
                  href={`/kiosk/${event.id}`}
                  className="block rounded-xl border border-stone-200 bg-white p-5 transition-colors hover:border-brand-500 hover:bg-brand-50 active:bg-brand-100 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-brand-500 dark:hover:bg-brand-900/30"
                >
                  <div className="text-lg font-semibold">{event.name}</div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-stone-500 dark:text-stone-400">
                    <span>{event._count.destinations} destinations</span>
                    {event.startDate && (
                      <span>
                        {event.startDate.toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
