import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { db } from "@/lib/db";
import { UserDetailPanel } from "@/components/admin/UserDetailPanel";

export default async function AdminUserDetail({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  await requireAdmin();
  const { userId } = await params;
  const [user, stamps, accolades, activities, templates, events] =
    await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          passportNumber: true,
          photoPath: true,
          occupation: true,
          mustChangePassword: true,
          startDate: true,
        },
      }),
      db.stamp.findMany({
        where: { userId },
        orderBy: { stampedAt: "desc" },
        include: {
          activity: {
            select: {
              id: true,
              name: true,
              event: { select: { id: true, name: true } },
            },
          },
        },
      }),
      db.accolade.findMany({
        where: { userId },
        orderBy: { awardedAt: "desc" },
      }),
      db.activity.findMany({
        where: { active: true, event: { active: true } },
        orderBy: [{ event: { name: "asc" } }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          event: { select: { name: true } },
        },
      }),
      db.accoladeTemplate.findMany({
        where: { active: true },
        orderBy: [{ eventId: "asc" }, { label: "asc" }],
        include: { event: { select: { name: true } } },
      }),
      db.event.findMany({
        where: { active: true },
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      }),
    ]);
  if (!user) notFound();

  return (
    <UserDetailPanel
      user={user}
      stamps={stamps}
      accolades={accolades}
      activities={activities.map((a) => ({
        id: a.id,
        name: a.name,
        eventName: a.event.name,
      }))}
      templates={templates.map((t) => ({
        id: t.id,
        label: t.label,
        description: t.description,
        emoji: t.emoji,
        themeId: t.themeId,
        eventId: t.eventId,
        eventName: t.event?.name ?? null,
      }))}
      events={events}
    />
  );
}
