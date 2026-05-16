import Link from "next/link";
import { notFound } from "next/navigation";
import { requireKiosk } from "@/lib/auth/kiosk-guard";
import { db } from "@/lib/db";
import { KioskTopBar } from "@/components/kiosk/KioskTopBar";

export default async function KioskActivities({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { username } = await requireKiosk();
  const { eventId } = await params;

  const event = await db.event.findUnique({
    where: { id: eventId },
    include: {
      activities: {
        where: { active: true },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      },
    },
  });
  if (!event || !event.active) notFound();

  return (
    <>
      <KioskTopBar username={username} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <Link
          href="/kiosk"
          className="inline-flex h-10 items-center gap-1.5 rounded-full border border-stone-300 bg-white px-4 text-sm font-medium text-stone-700 shadow-sm transition-colors hover:bg-stone-50 active:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
        >
          <BackArrow />
          All events
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">
          {event.name}
        </h1>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          Pick an activity to display its QR code.
        </p>

        {event.activities.length === 0 ? (
          <p className="mt-8 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            No active activities in this event.
          </p>
        ) : (
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {event.activities.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/kiosk/show/${a.id}`}
                  className="block rounded-xl border border-stone-200 bg-white p-5 transition-colors hover:border-brand-500 hover:bg-brand-50 active:bg-brand-100 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-brand-500 dark:hover:bg-brand-900/30"
                >
                  <div className="text-lg font-semibold">{a.name}</div>
                  {a.description && (
                    <div className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                      {a.description}
                    </div>
                  )}
                  <div className="mt-2 font-mono text-xs text-stone-500 dark:text-stone-400">
                    Code: {a.fallbackCode}
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

function BackArrow() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}
