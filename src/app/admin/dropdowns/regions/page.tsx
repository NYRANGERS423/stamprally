import { requireAdmin } from "@/lib/auth/admin-guard";
import { db } from "@/lib/db";
import { DropdownAdminPanel } from "@/components/admin/DropdownAdminPanel";

export default async function RegionsAdminPage() {
  await requireAdmin();
  const items = await db.region.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
  });
  return (
    <DropdownAdminPanel
      kind="region"
      title="Regions"
      description="Used as the &lsquo;Place of Issue&rsquo; field on each passport."
      items={items}
    />
  );
}
