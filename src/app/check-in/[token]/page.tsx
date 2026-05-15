import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/auth/session";
import { UserHeader } from "@/components/user/UserHeader";
import { AutoRedirect } from "@/components/passport/AutoRedirect";

type CheckInResult =
  | { kind: "ok"; activityName: string; eventName: string }
  | {
      kind: "already";
      activityName: string;
      eventName: string;
      stampedAt: Date;
    }
  | { kind: "inactive" }
  | { kind: "not_found" };

async function performCheckIn(
  userId: string,
  token: string,
): Promise<CheckInResult> {
  const activity = await db.activity.findUnique({
    where: { qrToken: token },
    include: {
      event: { select: { name: true, active: true } },
    },
  });
  if (!activity) return { kind: "not_found" };
  if (!activity.active || !activity.event.active) {
    return { kind: "inactive" };
  }
  const existing = await db.stamp.findUnique({
    where: { userId_activityId: { userId, activityId: activity.id } },
    select: { stampedAt: true },
  });
  if (existing) {
    return {
      kind: "already",
      activityName: activity.name,
      eventName: activity.event.name,
      stampedAt: existing.stampedAt,
    };
  }
  try {
    await db.stamp.create({
      data: { userId, activityId: activity.id },
    });
    revalidatePath("/passport");
    return {
      kind: "ok",
      activityName: activity.name,
      eventName: activity.event.name,
    };
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      const after = await db.stamp.findUnique({
        where: { userId_activityId: { userId, activityId: activity.id } },
        select: { stampedAt: true },
      });
      if (after) {
        return {
          kind: "already",
          activityName: activity.name,
          eventName: activity.event.name,
          stampedAt: after.stampedAt,
        };
      }
    }
    throw e;
  }
}

export default async function CheckInByToken({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const session = await getUserSession();
  if (!session.userId) {
    redirect(`/login?next=${encodeURIComponent(`/check-in/${token}`)}`);
  }
  if (session.mustChangePassword) {
    redirect("/force-change-password");
  }

  const result = await performCheckIn(session.userId, token);
  const isOk = result.kind === "ok";
  const passportHref = isOk
    ? `/passport?stamped=${encodeURIComponent(result.activityName)}`
    : "/passport";

  return (
    <>
      <UserHeader active="stamp" />
      {isOk && <AutoRedirect href={passportHref} delayMs={1200} />}
      <main className="flex flex-1 items-center justify-center px-4 py-6 sm:px-6 sm:py-10">
        <div className="w-full max-w-sm">
          <ResultCard result={result} />
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href={passportHref}
              className="inline-flex h-12 items-center justify-center rounded-full bg-brand-600 px-6 text-sm font-medium text-white shadow-sm hover:bg-brand-700 active:bg-brand-700"
            >
              {isOk ? "Open my passport" : "Open my passport"}
            </Link>
            <Link
              href="/check-in"
              className="inline-flex h-12 items-center justify-center rounded-full border border-stone-300 bg-white px-6 text-sm font-medium text-stone-900 hover:bg-stone-100 active:bg-stone-200 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:hover:bg-stone-800"
            >
              Stamp another
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

function ResultCard({ result }: { result: CheckInResult }) {
  switch (result.kind) {
    case "ok":
      return (
        <Card
          tone="emerald"
          icon={<StampIcon />}
          title="Stamp collected!"
          lines={[
            <p key="a" className="text-base font-semibold">
              {result.activityName}
            </p>,
            <p key="b" className="text-sm opacity-80">
              {result.eventName}
            </p>,
            <p key="c" className="text-xs opacity-70">
              Returning to your passport…
            </p>,
          ]}
        />
      );
    case "already":
      return (
        <Card
          tone="amber"
          icon={<CheckIcon />}
          title="Already in your passport"
          lines={[
            <p key="a" className="text-base font-semibold">
              {result.activityName}
            </p>,
            <p key="b" className="text-sm opacity-80">
              {result.eventName}
            </p>,
            <p key="c" className="text-xs opacity-70">
              First stamped {result.stampedAt.toLocaleString()}
            </p>,
          ]}
        />
      );
    case "inactive":
      return (
        <Card
          tone="amber"
          icon={<WarnIcon />}
          title="That stop isn't available"
          lines={[
            <p key="a" className="text-sm">
              This activity (or its event) has been deactivated.
            </p>,
          ]}
        />
      );
    case "not_found":
      return (
        <Card
          tone="red"
          icon={<WarnIcon />}
          title="We couldn't find that QR"
          lines={[
            <p key="a" className="text-sm">
              The link may have been regenerated. Ask the kiosk for the
              current QR or fallback code.
            </p>,
          ]}
        />
      );
  }
}

type Tone = "emerald" | "amber" | "red";

const TONE: Record<Tone, string> = {
  emerald:
    "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100",
  amber:
    "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100",
  red: "border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/40 dark:text-red-100",
};

function Card({
  tone,
  icon,
  title,
  lines,
}: {
  tone: Tone;
  icon: React.ReactNode;
  title: string;
  lines: React.ReactNode[];
}) {
  return (
    <div className={`rounded-2xl border-2 p-6 text-center ${TONE[tone]}`}>
      <div className="mx-auto flex h-16 w-16 items-center justify-center">
        {icon}
      </div>
      <h1 className="mt-3 text-xl font-semibold tracking-tight">{title}</h1>
      <div className="mt-3 flex flex-col items-center gap-1.5">
        {lines.map((line, i) => (
          <div key={`line-${i}`} className="w-full">
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}

function StampIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12l3 3 5-6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

function WarnIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    </svg>
  );
}
