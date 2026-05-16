import "server-only";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/auth/session";

// Stewards are existing users who hold an admin-issued grant to run
// the stamp + accolade flows (the surfaces that used to live under
// /kiosk). All lookups go through here so route guards, hamburger
// visibility, and action-level permission checks read from one place.

export interface ActiveStewardGrant {
  id: string;
  canStamp: boolean;
  canGrantAccolades: boolean;
  expiresAt: Date | null;
  grantedAt: Date;
  grantedByAdmin: string;
}

// Returns the user's currently-active grant (newest non-revoked, not
// past its expiresAt) or null if they're not a steward.
export async function getActiveStewardGrant(
  userId: string,
): Promise<ActiveStewardGrant | null> {
  const row = await db.stewardGrant.findFirst({
    where: {
      userId,
      revokedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    orderBy: { grantedAt: "desc" },
    select: {
      id: true,
      canStamp: true,
      canGrantAccolades: true,
      expiresAt: true,
      grantedAt: true,
      grantedByAdmin: true,
    },
  });
  return row;
}

export async function isSteward(userId: string): Promise<boolean> {
  return (await getActiveStewardGrant(userId)) !== null;
}

export async function canStamp(userId: string): Promise<boolean> {
  const g = await getActiveStewardGrant(userId);
  return g?.canStamp ?? false;
}

export async function canGrantAccolades(userId: string): Promise<boolean> {
  const g = await getActiveStewardGrant(userId);
  return g?.canGrantAccolades ?? false;
}

export type StewardPerm = "stamp" | "accolades";

// Page-level guard. Redirects unauthenticated users to /login (with
// a ?next= back-link), forces logged-in non-stewards back to their
// passport, and enforces the per-perm flag when one is requested.
// Returns the active grant + session user id so callers can record
// audit attribution.
export async function requireSteward(
  perm?: StewardPerm,
  currentPath = "/steward",
): Promise<{ userId: string; grant: ActiveStewardGrant }> {
  const session = await getUserSession();
  if (!session.userId) {
    redirect(`/login?next=${encodeURIComponent(currentPath)}`);
  }
  if (session.mustChangePassword) redirect("/force-change-password");

  const grant = await getActiveStewardGrant(session.userId);
  if (!grant) redirect("/passport?need=steward");
  if (perm === "stamp" && !grant.canStamp) redirect("/steward");
  if (perm === "accolades" && !grant.canGrantAccolades) redirect("/steward");

  return { userId: session.userId, grant };
}
