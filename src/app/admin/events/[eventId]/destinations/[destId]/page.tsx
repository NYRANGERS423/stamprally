import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { db } from "@/lib/db";
import { DestinationDetailPanel } from "@/components/admin/DestinationDetailPanel";

export default async function DestinationDetailPage({
  params,
}: {
  params: Promise<{ eventId: string; destId: string }>;
}) {
  await requireAdmin();
  const { eventId, destId } = await params;
  const dest = await db.destination.findUnique({
    where: { id: destId },
    include: { event: { select: { id: true, name: true } } },
  });
  if (!dest || dest.eventId !== eventId) notFound();
  const activities = await db.activity.findMany({
    where: { destinationId: destId },
    orderBy: [{ active: "desc" }, { createdAt: "asc" }],
    include: { _count: { select: { stamps: true } } },
  });
  return (
    <DestinationDetailPanel
      event={dest.event}
      dest={{
        id: dest.id,
        eventId: dest.eventId,
        name: dest.name,
        description: dest.description,
        order: dest.order,
      }}
      activities={activities}
    />
  );
}
