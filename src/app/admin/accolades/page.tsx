import { requireAdmin } from "@/lib/auth/admin-guard";
import { db } from "@/lib/db";
import { AccoladeTemplatesPanel } from "@/components/admin/AccoladeTemplatesPanel";

export default async function AccoladesAdminPage() {
  await requireAdmin();
  const [templates, events] = await Promise.all([
    db.accoladeTemplate.findMany({
      orderBy: [{ active: "desc" }, { createdAt: "desc" }],
      include: { event: { select: { id: true, name: true } } },
    }),
    db.event.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  return <AccoladeTemplatesPanel templates={templates} events={events} />;
}
