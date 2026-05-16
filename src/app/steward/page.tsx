import Link from "next/link";
import { requireSteward } from "@/lib/auth/steward";
import { UserHeader } from "@/components/user/UserHeader";
import { EYEBROW, RITUAL_BTN } from "@/lib/ui";

export default async function StewardLanding() {
  const { grant } = await requireSteward(undefined, "/steward");
  return (
    <>
      <UserHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <header className="mb-6">
          <p className={EYEBROW}>Steward</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            What do you want to give out?
          </h1>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            Stamps come from displaying an activity QR for someone to scan.
            Accolades you grant directly to a named recipient.
            {grant.expiresAt && (
              <>
                {" "}
                Your access expires on{" "}
                <span className="font-medium">
                  {grant.expiresAt.toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                .
              </>
            )}
          </p>
        </header>

        <div className="grid gap-3 sm:grid-cols-2">
          <ActionCard
            href="/steward/events"
            disabled={!grant.canStamp}
            title="Stamps"
            description="Pick an event, then an activity. The QR appears on your screen for attendees to scan."
          />
          <ActionCard
            href="/steward/give-accolade"
            disabled={!grant.canGrantAccolades}
            title="Accolades"
            description="Pick an accolade, then scan or type the recipient's passport code."
            ritual
          />
        </div>
      </main>
    </>
  );
}

function ActionCard({
  href,
  title,
  description,
  disabled,
  ritual,
}: {
  href: string;
  title: string;
  description: string;
  disabled?: boolean;
  ritual?: boolean;
}) {
  const body = (
    <div
      className={
        "flex h-full flex-col justify-between rounded-2xl border bg-white p-5 transition-shadow dark:bg-stone-900 " +
        (disabled
          ? "border-stone-200 opacity-50 dark:border-stone-800"
          : "border-stone-200 hover:shadow-md dark:border-stone-800")
      }
    >
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          {description}
        </p>
        {disabled && (
          <p className={`${EYEBROW} mt-3 text-red-700 dark:text-red-400`}>
            Permission not granted
          </p>
        )}
      </div>
      {!disabled && (
        <span
          className={
            "mt-4 inline-flex w-fit items-center gap-1 " +
            (ritual
              ? RITUAL_BTN
              : "rounded-full bg-brand-600 px-5 h-11 text-sm font-medium text-white shadow-sm hover:bg-brand-700")
          }
        >
          Open <span aria-hidden>→</span>
        </span>
      )}
    </div>
  );
  if (disabled) return body;
  return (
    <Link href={href} className="block">
      {body}
    </Link>
  );
}
