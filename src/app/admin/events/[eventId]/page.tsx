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
  const destinations = await db.destination.findMany({
    where: { eventId },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { activities: true } } },
  });
  return <EventDetailPanel event={event} destinations={destinations} />;
}
