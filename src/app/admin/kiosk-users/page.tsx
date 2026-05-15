import { requireAdmin } from "@/lib/auth/admin-guard";
import { db } from "@/lib/db";
import { KioskUsersPanel } from "@/components/admin/KioskUsersPanel";

export default async function KioskUsersPage() {
  await requireAdmin();
  const users = await db.kioskUser.findMany({
    orderBy: [{ active: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      username: true,
      label: true,
      active: true,
      createdAt: true,
    },
  });
  return <KioskUsersPanel users={users} />;
}
