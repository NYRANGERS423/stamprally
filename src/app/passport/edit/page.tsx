import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/auth/session";
import { getPhotoSettings } from "@/lib/app-config";
import { PhotoUploader } from "@/components/passport/PhotoUploader";
import { ProfileForm } from "@/components/passport/ProfileForm";
import { TagsEditor } from "@/components/passport/TagsEditor";
import { SignatureCanvas } from "@/components/passport/SignatureCanvas";
import { ThemeSelector } from "@/components/passport/ThemeSelector";
import { UserHeader } from "@/components/user/UserHeader";
import { type ThemeId } from "@/lib/themes";

export default async function EditPassportPage() {
  const session = await getUserSession();
  if (!session.userId) redirect("/login");
  if (session.mustChangePassword) redirect("/force-change-password");

  const [user, photoSettings] = await Promise.all([
    db.user.findUnique({
      where: { id: session.userId },
      include: {
        department: true,
        company: true,
        region: true,
        tags: { orderBy: { key: "asc" } },
      },
    }),
    getPhotoSettings(),
  ]);
  if (!user) redirect("/login");

  return (
    <>
      <UserHeader active="edit" />
      <main className="flex flex-1 flex-col items-center px-4 py-6 sm:px-6 sm:py-10">
        <div className="w-full max-w-2xl space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit passport
          </h1>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            Personalise your passport. Photo and most fields can be changed any time.
          </p>
        </div>

        <Card title="Theme">
          <ThemeSelector current={(user.theme ?? "default") as ThemeId} />
        </Card>

        <Card title="Photo">
          <PhotoUploader
            currentPath={user.photoPath}
            maxMb={photoSettings.maxMb}
          />
        </Card>

        <Card title="Name &amp; working title">
          <ProfileForm
            firstName={user.firstName}
            lastName={user.lastName}
            occupation={user.occupation}
          />
        </Card>

        <Card title="About you">
          <TagsEditor tags={user.tags} />
        </Card>

        <Card title="Signature">
          <p className="mb-3 text-xs text-stone-500 dark:text-stone-400">
            Sign with your mouse or finger. It&apos;ll appear at the bottom of
            your passport.
          </p>
          <SignatureCanvas initialJson={user.signatureSvg} />
        </Card>

        <Card title="Locked details">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <LockedItem label="Email" value={user.email} />
            <LockedItem label="Passport number" value={user.passportNumber} mono />
            <LockedItem
              label="Nationality"
              value={user.department?.name ?? "—"}
            />
            <LockedItem
              label="Issuing authority"
              value={user.company?.name ?? "—"}
            />
            <LockedItem
              label="Place of issue"
              value={user.region?.name ?? "—"}
            />
            <LockedItem
              label="Citizen since"
              value={user.startDate.toLocaleDateString()}
            />
          </dl>
          <p className="mt-4 text-xs text-stone-500 dark:text-stone-400">
            These fields are locked. Ask an admin if anything needs to change.
          </p>
        </Card>

        <div className="flex justify-center">
          <Link
            href="/passport"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-stone-300 bg-white px-6 text-sm font-medium text-stone-900 shadow-sm transition-colors hover:bg-stone-100 active:bg-stone-200 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:hover:bg-stone-800"
          >
            <svg
              width="16"
              height="16"
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
            Back to passport
          </Link>
        </div>
        </div>
      </main>
    </>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
      <div className="border-b border-stone-200 px-5 py-3 dark:border-stone-800">
        <h2 className="text-sm font-medium">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function LockedItem({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
        {label}
      </dt>
      <dd
        className={
          "mt-0.5 text-stone-900 dark:text-stone-100 " + (mono ? "font-mono" : "")
        }
      >
        {value}
      </dd>
    </div>
  );
}
