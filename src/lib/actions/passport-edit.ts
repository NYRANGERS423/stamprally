"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/auth/session";
import { deletePhoto, processAndStorePhoto } from "@/lib/uploads/photo";

export interface PassportEditState {
  error?: string;
  ok?: boolean;
}

const profileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(80),
  lastName: z.string().trim().min(1, "Last name is required").max(80),
  occupation: z
    .string()
    .trim()
    .max(120)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
});

export async function updateProfileAction(
  _prev: PassportEditState,
  formData: FormData,
): Promise<PassportEditState> {
  const session = await getUserSession();
  if (!session.userId) redirect("/login");
  if (session.mustChangePassword) redirect("/force-change-password");

  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }
  await db.user.update({
    where: { id: session.userId },
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      occupation: parsed.data.occupation,
    },
  });
  revalidatePath("/passport");
  revalidatePath("/passport/edit");
  return { ok: true };
}

export async function uploadPhotoAction(
  _prev: PassportEditState,
  formData: FormData,
): Promise<PassportEditState> {
  const session = await getUserSession();
  if (!session.userId) redirect("/login");
  if (session.mustChangePassword) redirect("/force-change-password");

  const file = formData.get("photo");
  if (!(file instanceof File)) {
    return { error: "No photo provided" };
  }

  const result = await processAndStorePhoto(file);
  if (!result.ok) {
    return { error: result.error };
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { photoPath: true },
  });
  const prev = user?.photoPath ?? null;

  await db.user.update({
    where: { id: session.userId },
    data: { photoPath: result.storedPath },
  });

  if (prev && prev !== result.storedPath) {
    await deletePhoto(prev);
  }

  revalidatePath("/passport");
  revalidatePath("/passport/edit");
  return { ok: true };
}

export async function removePhotoAction(): Promise<void> {
  const session = await getUserSession();
  if (!session.userId) redirect("/login");
  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { photoPath: true },
  });
  if (user?.photoPath) {
    await db.user.update({
      where: { id: session.userId },
      data: { photoPath: null },
    });
    await deletePhoto(user.photoPath);
  }
  revalidatePath("/passport");
  revalidatePath("/passport/edit");
}
