"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin-guard";

export interface StewardFormState {
  error?: string;
  ok?: boolean;
}

const grantSchema = z.object({
  userId: z.string().trim().min(1, "Pick a user"),
  canStamp: z.preprocess((v) => v === "on" || v === true, z.boolean()),
  canGrantAccolades: z.preprocess(
    (v) => v === "on" || v === true,
    z.boolean(),
  ),
  expiresAt: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? new Date(v) : null))
    .refine((d) => d == null || !Number.isNaN(d.getTime()), {
      message: "Invalid expiration",
    }),
});

export async function grantStewardAction(
  _prev: StewardFormState,
  formData: FormData,
): Promise<StewardFormState> {
  const admin = await requireAdmin();
  const parsed = grantSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { userId, canStamp, canGrantAccolades, expiresAt } = parsed.data;

  if (!canStamp && !canGrantAccolades) {
    return {
      error: "Pick at least one permission (Stamp or Grant accolades)",
    };
  }

  // Refuse to grant unless the recipient actually exists.
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!user) return { error: "User not found" };

  // A new grant supersedes any active one for the same user. We
  // revoke the previous active grant rather than mutate it in place
  // so the history captures the swap.
  await db.$transaction(async (tx) => {
    await tx.stewardGrant.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
        revokedReason: "Superseded by new grant",
      },
    });
    await tx.stewardGrant.create({
      data: {
        userId,
        grantedByAdmin: admin.username ?? "admin",
        canStamp,
        canGrantAccolades,
        expiresAt,
      },
    });
  });

  revalidatePath("/admin/stewards");
  revalidatePath("/admin"); // dashboard KPI
  return { ok: true };
}

export async function revokeStewardAction(
  grantId: string,
  reason?: string,
): Promise<void> {
  await requireAdmin();
  await db.stewardGrant.update({
    where: { id: grantId },
    data: {
      revokedAt: new Date(),
      revokedReason: reason?.trim() || "Revoked",
    },
  });
  revalidatePath("/admin/stewards");
  revalidatePath("/admin");
}
