import Image from "next/image";
import Link from "next/link";
import { AccoladeList } from "@/components/passport/AccoladeList";
import { SignatureRender } from "@/components/passport/SignatureRender";
import { EYEBROW } from "@/lib/ui";
import { displayTagLabel } from "@/lib/passport-tags";
import type { SignatureData } from "@/lib/signature";
import type { ManualAccolade } from "@/lib/passport-stats";
import type { Theme } from "@/lib/themes";

// Pass 03 extraction. Pulled the three passport surfaces (themed ID
// card, accolades section, stamps card) out of /passport/page.tsx so
// the new /u/[id] read-only route can reuse the same rendering. The
// owner view (/passport) supplies an editHref + a MyIdSheet node; the
// reader view (/u/[id]) passes null for both.

interface UserTag {
  id: string;
  key: string;
  value: string;
}

interface UserForPassport {
  id: string;
  firstName: string;
  lastName: string;
  passportNumber: string;
  photoPath: string | null;
  occupation: string | null;
  theme: string;
  department: { name: string } | null;
  company: { name: string } | null;
  region: { name: string } | null;
  tags: UserTag[];
}

interface StampForPassport {
  id: string;
  stampedAt: Date;
  activity: { name: string };
}

interface EventGroup {
  eventId: string;
  eventName: string;
  stamps: StampForPassport[];
}

export function PassportSurfaces({
  user,
  manualAccolades,
  eventGroups,
  startedOn,
  signature,
  theme,
  editHref,
  accoladesHeaderExtras,
  newlyStampedActivityName,
}: {
  user: UserForPassport;
  manualAccolades: ManualAccolade[];
  eventGroups: EventGroup[];
  startedOn: string;
  signature: SignatureData | null;
  theme: Theme;
  editHref: string | null;
  accoladesHeaderExtras?: React.ReactNode;
  newlyStampedActivityName?: string | null;
}) {
  const totalStamps = eventGroups.reduce((acc, g) => acc + g.stamps.length, 0);
  const totalAccolades = manualAccolades.length;

  return (
    <>
      <div className={"relative overflow-hidden rounded-2xl " + theme.cardClass}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: theme.bgPattern }}
        />
        <div className="relative">
          <div className={theme.headerStripClass}>
            <p className={theme.headerTextClass}>
              {theme.emoji} Passport · Stamprally
            </p>
          </div>
          <div className="p-6">
            <div className="flex gap-4">
              <div
                className={
                  "relative h-28 w-28 shrink-0 overflow-hidden rounded-md " +
                  theme.photoBorderClass
                }
              >
                {user.photoPath ? (
                  <Image
                    src={`/api/uploads/${user.photoPath}`}
                    alt={`${user.firstName} ${user.lastName}`}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-stone-400">
                    No photo
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <p className={theme.labelClass}>Surname / Name</p>
                  <p className="text-lg font-semibold uppercase leading-tight tracking-wide">
                    {user.lastName}
                  </p>
                  <p className="text-base leading-tight">{user.firstName}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3">
              <Row label="Passport number" labelClass={theme.labelClass}>
                <span className="font-mono text-sm">{user.passportNumber}</span>
              </Row>
              <Row label="Citizen since" labelClass={theme.labelClass}>
                {startedOn}
              </Row>
              <Row label="Nationality" labelClass={theme.labelClass}>
                {user.department?.name ?? "—"}
              </Row>
              <Row label="Place of issue" labelClass={theme.labelClass}>
                {user.region?.name ?? "—"}
              </Row>
              <div className="col-span-2">
                <Row label="Issuing authority" labelClass={theme.labelClass}>
                  {user.company?.name ?? "—"}
                </Row>
              </div>
              {user.occupation && (
                <div className="col-span-2">
                  <Row label="Occupation" labelClass={theme.labelClass}>
                    {user.occupation}
                  </Row>
                </div>
              )}
            </div>

            {user.tags.length > 0 && (
              <div
                className={`mt-5 border-t border-dashed pt-4 ${theme.dividerClass}`}
              >
                <p className={theme.labelClass}>About me</p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {user.tags.map((tag) => (
                    <li
                      key={tag.id}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${theme.tagChipClass}`}
                    >
                      <span className={theme.tagChipKeyClass}>
                        {displayTagLabel(tag.key)}:
                      </span>
                      <span className="font-medium">{tag.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {signature && (
              <div
                className={`mt-5 border-t border-dashed pt-3 ${theme.dividerClass}`}
              >
                <p className={theme.labelClass}>Signature</p>
                <SignatureRender
                  data={signature}
                  className={`mt-1 block h-14 w-full ${theme.signatureColorClass}`}
                />
              </div>
            )}
          </div>
          <div className={theme.footerStripClass}>
            <p className={theme.footerTextClass}>Stamps on next page</p>
          </div>
        </div>
        {editHref && (
          <Link
            href={editHref}
            aria-label="Edit passport"
            className="absolute bottom-3 left-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-stone-700 shadow-sm ring-1 ring-stone-300/70 backdrop-blur transition-colors hover:bg-white hover:text-stone-900 dark:bg-stone-900/80 dark:text-stone-300 dark:ring-stone-700/70 dark:hover:bg-stone-900 dark:hover:text-stone-100"
          >
            <PencilIcon />
          </Link>
        )}
      </div>

      <section
        id="accolades"
        className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900"
      >
        <div className="flex items-center justify-between gap-3 border-b border-stone-200 px-4 py-3 dark:border-stone-800">
          <h2 className={EYEBROW}>Accolades</h2>
          {accoladesHeaderExtras}
        </div>
        {totalAccolades > 0 ? (
          <AccoladeList accolades={manualAccolades} defaultThemeId={user.theme} />
        ) : (
          <p className="px-4 py-6 text-center text-xs text-stone-500 dark:text-stone-400">
            No accolades yet. Show your ID at a kiosk to receive one.
          </p>
        )}
      </section>

      <section
        id="stamps"
        className={`relative mt-6 overflow-hidden rounded-2xl ${theme.stampsCardClass}`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: theme.stampsBgPattern }}
        />
        <div className="relative">
          <div className={theme.stampsHeaderClass}>
            <p className={theme.stampsHeaderTextClass}>
              Stamps · {totalStamps}
            </p>
          </div>
          <div className="space-y-7 p-5">
            {eventGroups.length === 0 ? (
              <p className="py-8 text-center text-sm text-stone-600 dark:text-stone-400">
                No stamps yet. Tap &ldquo;Stamp&rdquo; in the top nav at any
                event to collect your first.
              </p>
            ) : (
              eventGroups.map((group) => (
                <div key={group.eventId}>
                  <div
                    className={`mb-3 flex items-end justify-between border-b border-dashed pb-2 ${theme.dividerClass}`}
                  >
                    <h3 className={theme.stampsLabelClass}>{group.eventName}</h3>
                    <span
                      className={`${theme.stampsLabelClass} text-[9px] opacity-70`}
                    >
                      {group.stamps.length} stamp
                      {group.stamps.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <ul className="flex flex-wrap items-center justify-around gap-4 sm:gap-6">
                    {group.stamps.map((s) => {
                      const isNew =
                        newlyStampedActivityName === s.activity.name;
                      return (
                        <li key={s.id}>
                          <StampImpression
                            activityName={s.activity.name}
                            stampedAt={s.stampedAt}
                            iconPath={theme.stampSvgPath}
                            chipClass={theme.stampChipClass}
                            textClass={theme.stampChipTextClass}
                            landingClass={isNew ? theme.stampLandClass : ""}
                          />
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function Row({
  label,
  children,
  labelClass,
}: {
  label: string;
  children: React.ReactNode;
  labelClass?: string;
}) {
  return (
    <div>
      <p
        className={
          labelClass ??
          "font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400"
        }
      >
        {label}
      </p>
      <div className="text-stone-900 dark:text-stone-100">{children}</div>
    </div>
  );
}

function PencilIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function rotationFromId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) | 0;
  }
  return (Math.abs(h) % 15) - 7;
}

function StampImpression({
  activityName,
  stampedAt,
  iconPath,
  chipClass,
  textClass,
  landingClass,
}: {
  activityName: string;
  stampedAt: Date;
  iconPath: string;
  chipClass: string;
  textClass: string;
  landingClass: string;
}) {
  const month = stampedAt
    .toLocaleDateString(undefined, { month: "short" })
    .toUpperCase();
  const day = stampedAt.getDate();
  const year = stampedAt.getFullYear() % 100;
  const rot = rotationFromId(activityName + stampedAt.toISOString());
  return (
    <div
      className={`relative h-24 w-24 sm:h-28 sm:w-28 ${landingClass}`}
      style={{ transform: `rotate(${rot}deg)` }}
    >
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center rounded-full ${chipClass}`}
      >
        <span
          aria-hidden
          className={`absolute inset-1.5 rounded-full border border-dashed ${textClass} opacity-40`}
        />
        <div className={`relative flex flex-col items-center px-2 ${textClass}`}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d={iconPath} />
          </svg>
          <p className="mt-0.5 line-clamp-2 text-center text-[9px] font-bold uppercase leading-tight tracking-wide">
            {activityName}
          </p>
          <p className="mt-0.5 font-mono text-[10px] font-bold leading-none">
            {month}
          </p>
          <p className="font-mono text-base font-black leading-none">{day}</p>
          <p className="mt-0.5 font-mono text-[8px] opacity-70">
            &apos;{year}
          </p>
        </div>
      </div>
    </div>
  );
}
