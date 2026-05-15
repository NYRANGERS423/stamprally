"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { requireAdmin } from "@/lib/auth/admin-guard";

export interface KioskUserFormState {
  error?: string;
  ok?: boolean;
}

const createSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Username must be at least 3 characters")
    .max(40)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, digits, and hyphens"),
  password: z.string().min(12, "Password must be at least 12 characters").max(200),
  label: z
    .string()
    .trim()
    .max(120)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
});

export async function createKioskUserAction(
  _prev: KioskUserFormState,
  formData: FormData,
): Promise<KioskUserFormState> {
  await requireAdmin();
  const parsed = createSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const hash = await hashPassword(parsed.data.password);
  try {
    await db.kioskUser.create({
      data: {
        username: parsed.data.username,
        passwordHash: hash,
        label: parsed.data.label,
      },
    });
  } catch {
    return { error: "A kiosk user with that username already exists" };
  }
  revalidatePath("/admin/kiosk-users");
  return { ok: true };
}

export async function rotateKioskPasswordAction(
  id: string,
  newPassword: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin();
  if (typeof newPassword !== "string" || newPassword.length < 12) {
    return { ok: false, error: "Password must be at least 12 characters" };
  }
  if (newPassword.length > 200) {
    return { ok: false, error: "Password is too long" };
  }
  const hash = await hashPassword(newPassword);
  await db.kioskUser.update({
    where: { id },
    data: { passwordHash: hash },
  });
  revalidatePath("/admin/kiosk-users");
  return { ok: true };
}

export async function toggleKioskUserActiveAction(
  id: string,
  active: boolean,
): Promise<void> {
  await requireAdmin();
  await db.kioskUser.update({ where: { id }, data: { active } });
  revalidatePath("/admin/kiosk-users");
}

export async function deleteKioskUserAction(id: string): Promise<void> {
  await requireAdmin();
  await db.kioskUser.delete({ where: { id } });
  revalidatePath("/admin/kiosk-users");
}
