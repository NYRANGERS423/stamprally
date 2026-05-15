import { requireKiosk } from "@/lib/auth/kiosk-guard";
import { db } from "@/lib/db";
import { KioskTopBar } from "@/components/kiosk/KioskTopBar";
import { GrantAccoladeFlow } from "@/components/kiosk/GrantAccoladeFlow";

export default async function KioskGiveAccoladePage() {
  const { username } = await requireKiosk();
  const templates = await db.accoladeTemplate.findMany({
    where: { active: true },
    orderBy: [{ eventId: "asc" }, { createdAt: "desc" }],
    include: { event: { select: { id: true, name: true } } },
  });

  return (
    <>
      <KioskTopBar username={username} active="accolades" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <GrantAccoladeFlow
          templates={templates.map((t) => ({
            id: t.id,
            label: t.label,
            description: t.description,
            emoji: t.emoji,
            themeId: t.themeId,
            event: t.event,
          }))}
        />
      </main>
    </>
  );
}
