import { requireAdmin } from "@/lib/auth/admin-guard";
import { db } from "@/lib/db";
import { StewardsPanel } from "@/components/admin/StewardsPanel";

export default async function StewardsAdminPage() {
  await requireAdmin();

  const [users, grants] = await Promise.all([
    db.user.findMany({
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    }),
    db.stewardGrant.findMany({
      orderBy: [{ grantedAt: "desc" }],
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    }),
  ]);

  const now = new Date();
  const active = grants.filter(
    (g) => g.revokedAt === null && (g.expiresAt === null || g.expiresAt > now),
  );
  // History = everything else, including expired grants and revoked ones,
  // in newest-first order (already sorted by grantedAt desc).
  const history = grants.filter(
    (g) => g.revokedAt !== null || (g.expiresAt !== null && g.expiresAt <= now),
  );

  // For the picker, hide users who already have an active grant so the
  // admin can't accidentally double-grant. (They can revoke + re-grant
  // if they want to change permissions.)
  const activeUserIds = new Set(active.map((g) => g.userId));
  const grantableUsers = users.filter((u) => !activeUserIds.has(u.id));

  return (
    <StewardsPanel
      grantableUsers={grantableUsers}
      activeGrants={active}
      historyGrants={history}
    />
  );
}
