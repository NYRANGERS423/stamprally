import { requireAdmin } from "@/lib/auth/admin-guard";
import { db } from "@/lib/db";
import { DropdownAdminPanel } from "@/components/admin/DropdownAdminPanel";

export default async function CompaniesAdminPage() {
  await requireAdmin();
  const items = await db.company.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
  });
  return (
    <DropdownAdminPanel
      kind="company"
      title="Companies"
      description="Used as the &lsquo;Issuing Authority&rsquo; field on each passport."
      items={items}
    />
  );
}
