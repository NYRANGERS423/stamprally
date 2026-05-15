import { requireAdmin } from "@/lib/auth/admin-guard";
import { db } from "@/lib/db";
import { EventsPanel } from "@/components/admin/EventsPanel";

export default async function EventsAdminPage() {
  await requireAdmin();
  const events = await db.event.findMany({
    orderBy: [{ active: "desc" }, { startDate: "desc" }, { createdAt: "desc" }],
    include: { _count: { select: { destinations: true } } },
  });
  return <EventsPanel events={events} />;
}
