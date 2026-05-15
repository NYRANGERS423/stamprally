"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin-guard";

export interface GrantAccoladeState {
  error?: string;
  ok?: boolean;
}

const schema = z.object({
  label: z.string().trim().min(1, "Label is required").max(80),
  description: z
    .string()
    .trim()
    .max(240)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
  emoji: z
    .string()
    .trim()
    .max(8)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
});

export async function grantAccoladeAction(
  userId: string,
  _prev: GrantAccoladeState,
  formData: FormData,
): Promise<GrantAccoladeState> {
  const session = await requireAdmin();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  await db.accolade.create({
    data: {
      userId,
      label: parsed.data.label,
      description: parsed.data.description,
      emoji: parsed.data.emoji,
      awardedBy: session.username ?? "admin",
    },
  });
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/passport");
  return { ok: true };
}

export async function revokeAccoladeAction(accoladeId: string): Promise<void> {
  await requireAdmin();
  const a = await db.accolade.findUnique({
    where: { id: accoladeId },
    select: { userId: true },
  });
  if (!a) return;
  await db.accolade.delete({ where: { id: accoladeId } });
  revalidatePath(`/admin/users/${a.userId}`);
  revalidatePath("/passport");
}
