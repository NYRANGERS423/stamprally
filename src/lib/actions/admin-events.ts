"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { slugify } from "@/lib/qr-codes";

export interface EventFormState {
  error?: string;
  ok?: boolean;
}

const optionalDate = z
  .string()
  .optional()
  .or(z.literal(""))
  .transform((v) => (v ? new Date(v) : null))
  .refine((d) => d == null || !Number.isNaN(d.getTime()), {
    message: "Invalid date",
  });

const createSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .max(60)
    .regex(/^[a-z0-9-]*$/, "Slug can only contain lowercase letters, digits, and hyphens")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
  startDate: optionalDate,
  endDate: optionalDate,
});

export async function createEventAction(
  _prev: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  await requireAdmin();
  const parsed = createSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  let slug = parsed.data.slug?.trim() || slugify(parsed.data.name);
  if (!slug) slug = "event-" + Math.floor(Math.random() * 100000);
  try {
    await db.event.create({
      data: {
        name: parsed.data.name,
        slug,
        description: parsed.data.description,
        startDate: parsed.data.startDate,
        endDate: parsed.data.endDate,
      },
    });
  } catch {
    return { error: "An event with that slug already exists" };
  }
  revalidatePath("/admin/events");
  return { ok: true };
}

const updateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Slug is required")
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, digits, and hyphens"),
  description: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
  startDate: optionalDate,
  endDate: optionalDate,
});

export async function updateEventAction(
  eventId: string,
  _prev: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  await requireAdmin();
  const parsed = updateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  try {
    await db.event.update({
      where: { id: eventId },
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description,
        startDate: parsed.data.startDate,
        endDate: parsed.data.endDate,
      },
    });
  } catch {
    return { error: "Could not save (slug collision?)" };
  }
  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${eventId}`);
  return { ok: true };
}

export async function toggleEventActiveAction(
  eventId: string,
  active: boolean,
): Promise<void> {
  await requireAdmin();
  await db.event.update({ where: { id: eventId }, data: { active } });
  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${eventId}`);
}

export async function deleteEventAction(eventId: string): Promise<void> {
  await requireAdmin();
  await db.event.delete({ where: { id: eventId } });
  revalidatePath("/admin/events");
  redirect("/admin/events");
}
