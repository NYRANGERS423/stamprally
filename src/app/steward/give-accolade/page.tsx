import { requireSteward } from "@/lib/auth/steward";
import { db } from "@/lib/db";
import { UserHeader } from "@/components/user/UserHeader";
import { GrantAccoladeFlow } from "@/components/steward/GrantAccoladeFlow";

export default async function StewardGiveAccoladePage() {
  await requireSteward("accolades", "/steward/give-accolade");
  const templates = await db.accoladeTemplate.findMany({
    where: { active: true },
    orderBy: [{ eventId: "asc" }, { createdAt: "desc" }],
    include: { event: { select: { id: true, name: true } } },
  });

  return (
    <>
      <UserHeader />
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
