import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { db } from "@/lib/db";
import { KpiTile } from "@/components/admin/KpiTile";
import { CatalogRow } from "@/components/admin/CatalogRow";
import { EYEBROW } from "@/lib/ui";

export default async function AdminDashboard() {
  await requireAdmin();

  const now = new Date();
  const startOfToday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    userCount,
    accessCodeCount,
    enabledAccessCodeCount,
    departmentCount,
    companyCount,
    regionCount,
    eventCount,
    activeEventCount,
    kioskUserCount,
    accoladeTemplateCount,
    stampsTodayCount,
    activeUsersWeek,
  ] = await Promise.all([
    db.user.count(),
    db.accessCode.count(),
    db.accessCode.count({ where: { enabled: true } }),
    db.department.count(),
    db.company.count(),
    db.region.count(),
    db.event.count(),
    db.event.count({ where: { active: true } }),
    db.kioskUser.count(),
    db.accoladeTemplate.count(),
    db.stamp.count({ where: { stampedAt: { gte: startOfToday } } }),
    db.stamp
      .findMany({
        where: { stampedAt: { gte: weekAgo } },
        select: { userId: true },
        distinct: ["userId"],
      })
      .then((rows) => rows.length),
  ]);

  const setupIncomplete =
    departmentCount === 0 || companyCount === 0 || regionCount === 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          Overview of the Stamprally system.
        </p>
      </div>

      {/* Hero KPIs */}
      <section>
        <h2 className={`${EYEBROW} mb-3`}>This week</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <KpiTile
            label="Users active · 7d"
            value={activeUsersWeek}
            hint={`of ${userCount} total`}
            tone="brand"
            href="/admin/users"
          />
          <KpiTile
            label="Stamps today"
            value={stampsTodayCount}
            tone="stamp"
            href="/admin/events"
          />
          <KpiTile
            label="Events live"
            value={`${activeEventCount}`}
            hint={`of ${eventCount} total`}
            tone="ok"
            href="/admin/events"
          />
        </div>
      </section>

      {/* Catalog */}
      <section>
        <h2 className={`${EYEBROW} mb-3`}>Catalog</h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <CatalogRow
            label="Companies"
            count={companyCount}
            href="/admin/dropdowns/companies"
          />
          <CatalogRow
            label="Departments"
            count={departmentCount}
            href="/admin/dropdowns/departments"
          />
          <CatalogRow
            label="Regions"
            count={regionCount}
            href="/admin/dropdowns/regions"
          />
          <CatalogRow
            label="Kiosk users"
            count={kioskUserCount}
            href="/admin/kiosk-users"
          />
          <CatalogRow
            label="Access codes"
            count={`${enabledAccessCodeCount}/${accessCodeCount}`}
            href="/admin/access-codes"
          />
          <CatalogRow
            label="Accolade templates"
            count={accoladeTemplateCount}
            href="/admin/accolades"
          />
        </div>
      </section>

      {setupIncomplete ? (
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
