import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { db } from "@/lib/db";

export default async function AdminDashboard() {
  await requireAdmin();

  const [
    userCount,
    accessCodeCount,
    enabledAccessCodeCount,
    departmentCount,
    companyCount,
    regionCount,
  ] = await Promise.all([
    db.user.count(),
    db.accessCode.count(),
    db.accessCode.count({ where: { enabled: true } }),
    db.department.count(),
    db.company.count(),
    db.region.count(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          Overview of the Stamprally system.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Users" value={userCount} />
        <StatCard
          label="Access codes"
          value={`${enabledAccessCodeCount} / ${accessCodeCount}`}
          hint="enabled / total"
        />
        <StatCard label="Departments" value={departmentCount} />
        <StatCard label="Companies" value={companyCount} />
        <StatCard label="Regions" value={regionCount} />
      </div>

      {departmentCount === 0 || companyCount === 0 || regionCount === 0 ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          <p className="font-medium">Setup needed</p>
          <p className="mt-1">
            Users can&apos;t sign up until at least one{" "}
            <Link
              href="/admin/dropdowns/departments"
              className="underline underline-offset-4"
            >
              department
            </Link>
            ,{" "}
            <Link
              href="/admin/dropdowns/companies"
              className="underline underline-offset-4"
            >
              company
            </Link>
            ,{" "}
            <Link
              href="/admin/dropdowns/regions"
              className="underline underline-offset-4"
            >
              region
            </Link>
            , and{" "}
            <Link
              href="/admin/access-codes"
              className="underline underline-offset-4"
            >
              access code
            </Link>{" "}
            exist.
          </p>
        </div>
      ) : enabledAccessCodeCount === 0 ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          No enabled access codes — signups are currently closed. Create or
          enable one from{" "}
          <Link
            href="/admin/access-codes"
            className="underline underline-offset-4"
          >
            access codes
          </Link>
          .
        </div>
      ) : null}
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
      <p className="text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      {hint && (
        <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
          {hint}
        </p>
      )}
    </div>
  );
}
