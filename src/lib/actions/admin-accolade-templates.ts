"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { THEMES } from "@/lib/themes";

export interface AccoladeTemplateFormState {
  error?: string;
  ok?: boolean;
}

const VALID_THEME_IDS = Object.keys(THEMES);

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
  themeId: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v && VALID_THEME_IDS.includes(v) ? v : null)),
  eventId: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
  points: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? Number.parseInt(v, 10) : 1))
    .refine((n) => Number.isFinite(n) && n >= 0 && n <= 999, {
      message: "Points must be 0–999",
    }),
});

export async function createAccoladeTemplateAction(
  _prev: AccoladeTemplateFormState,
  formData: FormData,
): Promise<AccoladeTemplateFormState> {
  await requireAdmin();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  await db.accoladeTemplate.create({
    data: {
      label: parsed.data.label,
      description: parsed.data.description,
      emoji: parsed.data.emoji,
      themeId: parsed.data.themeId,
      eventId: parsed.data.eventId,
      points: parsed.data.points,
    },
  });
  revalidatePath("/admin/accolades");
  return { ok: true };
}

export async function updateAccoladeTemplateAction(
  id: string,
  _prev: AccoladeTemplateFormState,
  formData: FormData,
): Promise<AccoladeTemplateFormState> {
  await requireAdmin();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  await db.accoladeTemplate.update({
    where: { id },
    data: {
      label: parsed.data.label,
      description: parsed.data.description,
      emoji: parsed.data.emoji,
      themeId: parsed.data.themeId,
      eventId: parsed.data.eventId,
      points: parsed.data.points,
    },
  });
  revalidatePath("/admin/accolades");
  return { ok: true };
}

export async function toggleAccoladeTemplateActiveAction(
  id: string,
  active: boolean,
): Promise<void> {
  await requireAdmin();
  await db.accoladeTemplate.update({ where: { id }, data: { active } });
  revalidatePath("/admin/accolades");
}

export async function deleteAccoladeTemplateAction(id: string): Promise<void> {
  await requireAdmin();
  await db.accoladeTemplate.delete({ where: { id } });
  revalidatePath("/admin/accolades");
}
