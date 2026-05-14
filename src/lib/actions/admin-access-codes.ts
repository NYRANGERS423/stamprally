"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin-guard";

export interface AccessCodeFormState {
  error?: string;
  ok?: boolean;
}

const createSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(4, "Code must be at least 4 characters")
    .max(60)
    .regex(/^[A-Z0-9-]+$/, "Use only uppercase letters, digits, and hyphens"),
  label: z
    .string()
    .trim()
    .max(120)
    .optional()
    .or(z.literal(""))
    .transform((v) => v || null),
  expiresAt: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? new Date(v) : null)),
  maxUses: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? Number.parseInt(v, 10) : null))
    .refine((v) => v == null || (Number.isFinite(v) && v >= 1), {
      message: "maxUses must be a positive number or blank",
    }),
});

export async function createAccessCodeAction(
  _prev: AccessCodeFormState,
  formData: FormData,
): Promise<AccessCodeFormState> {
  await requireAdmin();
  const parsed = createSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  try {
    await db.accessCode.create({
      data: {
        code: parsed.data.code,
        label: parsed.data.label,
        expiresAt: parsed.data.expiresAt,
        maxUses: parsed.data.maxUses,
      },
    });
  } catch {
    return { error: "That code already exists" };
  }
  revalidatePath("/admin/access-codes");
  return { ok: true };
}

export async function toggleAccessCodeAction(
  id: string,
  enabled: boolean,
): Promise<void> {
  await requireAdmin();
  await db.accessCode.update({ where: { id }, data: { enabled } });
  revalidatePath("/admin/access-codes");
}

export async function deleteAccessCodeAction(id: string): Promise<void> {
  await requireAdmin();
  await db.accessCode.delete({ where: { id } });
  revalidatePath("/admin/access-codes");
}
