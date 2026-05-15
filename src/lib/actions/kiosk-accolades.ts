"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireKiosk } from "@/lib/auth/kiosk-guard";

export interface KioskGrantState {
  ok?: boolean;
  alreadyHad?: boolean;
  userName?: string;
  templateLabel?: string;
  error?: string;
  // bumps every result so the UI can react to repeated grants of the same
  // accolade to the same user (useful when the user re-presses Grant)
  nonce?: number;
}

const schema = z.object({
  templateId: z.string().trim().min(1, "Pick an accolade first"),
  userCode: z.string().trim().min(1, "User code is required"),
});

// Server action used by the kiosk flow. Takes a template id (picked first)
// and a user "code" — either a full cuid (from the user's QR) or the last
// 6 chars of the cuid (the readable fallback shown on their passport).
export async function kioskGrantAccoladeAction(
  _prev: KioskGrantState,
  formData: FormData,
): Promise<KioskGrantState> {
  const { username } = await requireKiosk();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid input",
      nonce: Date.now(),
    };
  }

  const tpl = await db.accoladeTemplate.findUnique({
    where: { id: parsed.data.templateId },
    select: {
      id: true,
      label: true,
      description: true,
      emoji: true,
      themeId: true,
      eventId: true,
      active: true,
    },
  });
  if (!tpl || !tpl.active) {
    return { error: "That accolade is no longer available", nonce: Date.now() };
  }

  // Resolve the user. Accept either full cuid or 6-char short code.
  const raw = parsed.data.userCode.trim();
  let user: { id: string; firstName: string; lastName: string } | null = null;

  // Full id lookup first.
  user = await db.user.findUnique({
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
      if (matches.length === 1) {
        user = matches[0];
      } else if (matches.length > 1) {
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

  // Idempotency: same accolade (label + eventId) already on this user?
  const existing = await db.accolade.findFirst({
    where: {
      userId: user.id,
      label: tpl.label,
      eventId: tpl.eventId,
    },
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
      awardedBy: `kiosk:${username}`,
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
