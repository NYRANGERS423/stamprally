"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { generateQrToken, generateUniqueFallbackCode } from "@/lib/qr-codes";

export interface ActivityFormState {
  error?: string;
  ok?: boolean;
}

// `datetime-local` inputs hand back YYYY-MM-DDTHH:MM (no timezone),
// which `new Date()` interprets as local time. That matches what the
// admin saw when typing it; we just store the resulting UTC instant.
const optionalDateTime = z
  .string()
  .optional()
  .or(z.literal(""))
  .transform((v) => (v ? new Date(v) : null))
  .refine((d) => d == null || !Number.isNaN(d.getTime()), {
    message: "Invalid date/time",
  });

const baseFields = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  description: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
  location: z
    .string()
    .trim()
    .max(200)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
  startTime: optionalDateTime,
  endTime: optionalDateTime,
  order: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? Number.parseInt(v, 10) : 0))
    .refine((n) => Number.isFinite(n), { message: "Order must be a number" }),
  points: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? Number.parseInt(v, 10) : 1))
    .refine((n) => Number.isFinite(n) && n >= 0 && n <= 999, {
      message: "Points must be 0–999",
    }),
});

function revalidate(eventId: string) {
  revalidatePath(`/admin/events/${eventId}`);
}

export async function createActivityAction(
  eventId: string,
  _prev: ActivityFormState,
  formData: FormData,
): Promise<ActivityFormState> {
  await requireAdmin();
  const parsed = baseFields.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const qrToken = generateQrToken();
  const fallbackCode = await generateUniqueFallbackCode();
  await db.activity.create({
    data: {
      eventId,
      name: parsed.data.name,
      description: parsed.data.description,
      location: parsed.data.location,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      order: parsed.data.order,
      points: parsed.data.points,
      qrToken,
      fallbackCode,
    },
  });
  revalidate(eventId);
  return { ok: true };
}

export async function updateActivityAction(
  eventId: string,
  activityId: string,
  _prev: ActivityFormState,
  formData: FormData,
): Promise<ActivityFormState> {
  await requireAdmin();
  const parsed = baseFields.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  await db.activity.update({
    where: { id: activityId },
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      location: parsed.data.location,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      order: parsed.data.order,
      points: parsed.data.points,
    },
  });
  revalidate(eventId);
  return { ok: true };
}

export async function toggleActivityActiveAction(
  eventId: string,
  activityId: string,
  active: boolean,
): Promise<void> {
  await requireAdmin();
  await db.activity.update({
    where: { id: activityId },
    data: { active },
  });
  revalidate(eventId);
}

export async function regenerateActivityCodesAction(
  eventId: string,
  activityId: string,
): Promise<void> {
  await requireAdmin();
  const qrToken = generateQrToken();
  const fallbackCode = await generateUniqueFallbackCode();
  await db.activity.update({
    where: { id: activityId },
    data: { qrToken, fallbackCode },
  });
  revalidate(eventId);
}

export async function deleteActivityAction(
  eventId: string,
  activityId: string,
): Promise<void> {
  await requireAdmin();
  await db.activity.delete({ where: { id: activityId } });
  revalidate(eventId);
}
