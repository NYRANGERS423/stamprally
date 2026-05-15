import { requireAdmin } from "@/lib/auth/admin-guard";
import { db } from "@/lib/db";
import { UsersPanel } from "@/components/admin/UsersPanel";

export default async function UsersAdminPage() {
  await requireAdmin();
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      passportNumber: true,
      photoPath: true,
      mustChangePassword: true,
      _count: { select: { stamps: true, accolades: true } },
    },
  });
  return <UsersPanel users={users} />;
}
