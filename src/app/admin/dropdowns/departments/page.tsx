import { requireAdmin } from "@/lib/auth/admin-guard";
import { db } from "@/lib/db";
import { DropdownAdminPanel } from "@/components/admin/DropdownAdminPanel";

export default async function DepartmentsAdminPage() {
  await requireAdmin();
  const items = await db.department.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
  });
  return (
    <DropdownAdminPanel
      kind="department"
      title="Departments"
      description="Used as the &lsquo;Nationality&rsquo; field on each passport. Locked once a user signs up."
      items={items}
    />
  );
}
