import Link from "next/link";
import { notFound } from "next/navigation";
import { requireKiosk } from "@/lib/auth/kiosk-guard";
import { db } from "@/lib/db";
import { KioskTopBar } from "@/components/kiosk/KioskTopBar";

export default async function KioskActivities({
  params,
}: {
  params: Promise<{ eventId: string; destId: string }>;
}) {
  const { username } = await requireKiosk();
  const { eventId, destId } = await params;

  const dest = await db.destination.findUnique({
    where: { id: destId },
    include: {
      event: { select: { id: true, name: true, active: true } },
      activities: {
        where: { active: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!dest || dest.eventId !== eventId || !dest.event.active) notFound();

  return (
    <>
      <KioskTopBar username={username} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <Link
          href={`/kiosk/${eventId}`}
          className="inline-flex h-10 items-center rounded-md px-3 text-sm font-medium text-stone-600 hover:bg-stone-100 active:bg-stone-200 dark:text-stone-400 dark:hover:bg-stone-800"
        >
          ← {dest.event.name}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {dest.name}
        </h1>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          Pick an activity to display its QR code.
        </p>

        {dest.activities.length === 0 ? (
          <p className="mt-8 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            No active activities here.
          </p>
        ) : (
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {dest.activities.map((a) => (
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
