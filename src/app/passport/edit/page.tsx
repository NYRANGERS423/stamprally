import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/auth/session";
import { getPhotoSettings } from "@/lib/app-config";
import { logoutAction } from "@/lib/actions/user-auth";
import { PhotoUploader } from "@/components/passport/PhotoUploader";
import { ProfileForm } from "@/components/passport/ProfileForm";
import { TagsEditor } from "@/components/passport/TagsEditor";
import { SignatureCanvas } from "@/components/passport/SignatureCanvas";

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
    <main className="flex flex-1 flex-col items-center px-6 py-10">
      <div className="w-full max-w-2xl space-y-8">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand-700 dark:text-brand-500">
              Stamprally
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Edit passport
            </h1>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-stone-700 hover:bg-stone-100 active:bg-stone-200 dark:text-stone-300 dark:hover:bg-stone-800"
            >
              Sign out
            </button>
          </form>
        </div>

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

        <div className="flex justify-between">
          <Link
            href="/passport"
            className="inline-flex h-11 items-center justify-center rounded-md px-4 text-sm font-medium text-stone-700 hover:bg-stone-100 active:bg-stone-200 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            ← Back to passport
          </Link>
        </div>
      </div>
    </main>
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
