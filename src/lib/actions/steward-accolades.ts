"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSteward } from "@/lib/auth/steward";

export interface StewardGrantState {
  ok?: boolean;
  alreadyHad?: boolean;
  userName?: string;
  templateLabel?: string;
  error?: string;
  // Bumps on every result so the UI can react when the same accolade
  // is granted to the same user twice (rapid-fire flow).
  nonce?: number;
}

const schema = z.object({
  templateId: z.string().trim().min(1, "Pick an accolade first"),
  userCode: z.string().trim().min(1, "User code is required"),
});

// Steward-side: grant a catalog accolade to a recipient identified
// by their passport id (full cuid from a scanned QR, or the readable
// 6-char suffix). Records the granting steward's full name in
// Accolade.awardedBy so the recipient sees who handed it to them.
export async function stewardGrantAccoladeAction(
  _prev: StewardGrantState,
  formData: FormData,
): Promise<StewardGrantState> {
  const { userId: stewardUserId } = await requireSteward("accolades");

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid input",
      nonce: Date.now(),
    };
  }

  const [tpl, steward] = await Promise.all([
    db.accoladeTemplate.findUnique({
      where: { id: parsed.data.templateId },
      select: {
        id: true,
        label: true,
        description: true,
        emoji: true,
        themeId: true,
        eventId: true,
        points: true,
        active: true,
      },
    }),
    db.user.findUnique({
      where: { id: stewardUserId },
      select: { firstName: true, lastName: true },
    }),
  ]);
  if (!tpl || !tpl.active) {
    return { error: "That accolade is no longer available", nonce: Date.now() };
  }
  if (!steward) {
    return { error: "Steward account not found", nonce: Date.now() };
  }

  // Resolve recipient. Accept either full cuid or 6-char suffix.
  const raw = parsed.data.userCode.trim();
  let user: { id: string; firstName: string; lastName: string } | null =
    await db.user.findUnique({
      where: { id: raw },
      select: { id: true, firstName: true, lastName: true },
    });
  if (!user) {
    const lower = raw.toLowerCase();
    if (/^[a-z0-9]{6}$/.test(lower)) {
      const matches = await db.user.findMany({
        where: { id: { endsWith: lower } },
        select: { id: true, firstName: true, lastName: true },
        take: 2,
      });
      if (matches.length === 1) user = matches[0];
      else if (matches.length > 1) {
        return {
          error: "Code matched more than one user — scan the QR instead",
          nonce: Date.now(),
        };
      }
    }
  }
  if (!user) {
    return { error: "No user matched that code", nonce: Date.now() };
  }

  // Idempotency: same template (label + eventId) already on this user?
  const existing = await db.accolade.findFirst({
    where: { userId: user.id, label: tpl.label, eventId: tpl.eventId },
    select: { id: true },
  });
  if (existing) {
    return {
      ok: true,
      alreadyHad: true,
      userName: `${user.firstName} ${user.lastName}`,
      templateLabel: tpl.label,
      nonce: Date.now(),
    };
  }

  await db.accolade.create({
    data: {
      userId: user.id,
      label: tpl.label,
      description: tpl.description,
      emoji: tpl.emoji,
      themeId: tpl.themeId,
      eventId: tpl.eventId,
      points: tpl.points,
      // Stored as plain name; AccoladeList renders it verbatim. Legacy
      // "kiosk:<username>" rows continue to display with the existing
      // prefix branch.
      awardedBy: `${steward.firstName} ${steward.lastName}`,
    },
  });
  revalidatePath("/passport");

  return {
    ok: true,
    alreadyHad: false,
    userName: `${user.firstName} ${user.lastName}`,
    templateLabel: tpl.label,
    nonce: Date.now(),
  };
}
