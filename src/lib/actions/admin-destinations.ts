"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin-guard";

export interface DestinationFormState {
  error?: string;
  ok?: boolean;
}

const baseFields = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  description: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
  order: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? Number.parseInt(v, 10) : 0))
    .refine((n) => Number.isFinite(n), { message: "Order must be a number" }),
});

export async function createDestinationAction(
  eventId: string,
  _prev: DestinationFormState,
  formData: FormData,
): Promise<DestinationFormState> {
  await requireAdmin();
  const parsed = baseFields.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  await db.destination.create({
    data: {
      eventId,
      name: parsed.data.name,
      description: parsed.data.description,
      order: parsed.data.order,
    },
  });
  revalidatePath(`/admin/events/${eventId}`);
  return { ok: true };
}

export async function updateDestinationAction(
  eventId: string,
  destId: string,
  _prev: DestinationFormState,
  formData: FormData,
): Promise<DestinationFormState> {
  await requireAdmin();
  const parsed = baseFields.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  await db.destination.update({
    where: { id: destId },
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      order: parsed.data.order,
    },
  });
  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath(`/admin/events/${eventId}/destinations/${destId}`);
  return { ok: true };
}

export async function deleteDestinationAction(
  eventId: string,
  destId: string,
): Promise<void> {
  await requireAdmin();
  await db.destination.delete({ where: { id: destId } });
  revalidatePath(`/admin/events/${eventId}`);
  redirect(`/admin/events/${eventId}`);
}
