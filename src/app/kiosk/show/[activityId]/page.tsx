import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { requireKiosk } from "@/lib/auth/kiosk-guard";
import { db } from "@/lib/db";
import { KioskTopBar } from "@/components/kiosk/KioskTopBar";

function appBaseUrl(): string {
  const base = process.env.APP_URL?.replace(/\/+$/, "");
  if (base) return base;
  return "http://localhost:3000";
}

export default async function KioskShow({
  params,
}: {
  params: Promise<{ activityId: string }>;
}) {
  const { username } = await requireKiosk();
  const { activityId } = await params;

  const activity = await db.activity.findUnique({
    where: { id: activityId },
    include: {
      event: { select: { id: true, name: true, active: true } },
    },
  });
  if (!activity || !activity.active || !activity.event.active) {
    notFound();
  }

  const checkInUrl = `${appBaseUrl()}/check-in/${activity.qrToken}`;
  const qrDataUrl = await QRCode.toDataURL(checkInUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 720,
    color: { dark: "#1e3a8a", light: "#ffffff" },
  });
  const backHref = `/kiosk/${activity.event.id}`;

  return (
    <>
      <KioskTopBar username={username} active="events" />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-4 py-6 sm:px-6">
        <div className="flex w-full items-center justify-between gap-3">
          <Link
            href={backHref}
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-stone-300 bg-white px-4 text-sm font-medium text-stone-700 shadow-sm transition-colors hover:bg-stone-50 active:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
          >
            <BackArrow />
            Change activity
          </Link>
          <div className="text-right">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-stone-500 dark:text-stone-400">
              {activity.event.name}
            </p>
          </div>
        </div>

        <div className="mt-6 w-full rounded-2xl border-2 border-brand-700 bg-white p-6 text-center shadow-lg dark:border-brand-500 dark:bg-stone-50">
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
            {activity.name}
          </h1>
          {activity.description && (
            <p className="mt-2 text-sm text-stone-600">
              {activity.description}
            </p>
          )}

          <div className="mx-auto mt-6 w-full max-w-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrDataUrl}
              alt={`QR for ${activity.name}`}
              className="block h-auto w-full"
              width={720}
              height={720}
            />
          </div>

          <p className="mt-6 font-mono text-xs uppercase tracking-[0.25em] text-stone-500">
            Or enter this code
          </p>
          <p className="mt-1 font-mono text-5xl font-bold tracking-widest text-brand-700">
            {activity.fallbackCode}
          </p>
          <p className="mt-3 text-xs text-stone-500">
            Open the camera, scan, or type the code at{" "}
            <span className="font-mono">/check-in</span>
          </p>
        </div>
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
