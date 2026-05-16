import "server-only";
import { db } from "@/lib/db";

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
