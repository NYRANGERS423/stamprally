import { requireAdmin } from "@/lib/auth/admin-guard";
import { db } from "@/lib/db";
import { AccessCodePanel } from "@/components/admin/AccessCodePanel";

export default async function AccessCodesPage() {
  await requireAdmin();
  const codes = await db.accessCode.findMany({
    orderBy: [{ createdAt: "desc" }],
  });
  return <AccessCodePanel codes={codes} />;
}
