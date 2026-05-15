import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { db } from "@/lib/db";
import { EventDetailPanel } from "@/components/admin/EventDetailPanel";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  await requireAdmin();
  const { eventId } = await params;
  const event = await db.event.findUnique({ where: { id: eventId } });
  if (!event) notFound();
  const activities = await db.activity.findMany({
    where: { eventId },
    orderBy: [{ active: "desc" }, { order: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { stamps: true } } },
  });
  return <EventDetailPanel event={event} activities={activities} />;
}
