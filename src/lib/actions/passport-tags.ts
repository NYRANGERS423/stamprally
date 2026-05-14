"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/auth/session";

export interface TagFormState {
  error?: string;
  ok?: boolean;
}

const tagSchema = z.object({
  key: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Tag name is required")
    .max(40, "Tag name is too long")
    .regex(
      /^[a-z0-9_ -]+$/,
      "Use letters, numbers, spaces, hyphens, or underscores",
    )
    .transform((v) => v.replace(/[\s-]+/g, "_")),
  value: z
    .string()
    .trim()
    .min(1, "Tag value is required")
    .max(120, "Tag value is too long"),
});

export async function addTagAction(
  _prev: TagFormState,
  formData: FormData,
): Promise<TagFormState> {
  const session = await getUserSession();
  if (!session.userId) redirect("/login");
  if (session.mustChangePassword) redirect("/force-change-password");

  const parsed = tagSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid tag" };
  }

  // Cap total tags per user so the passport stays readable.
  const count = await db.passportTag.count({
    where: { userId: session.userId },
  });
  const existing = await db.passportTag.findUnique({
    where: {
      userId_key: { userId: session.userId, key: parsed.data.key },
    },
  });
  if (!existing && count >= 12) {
    return { error: "You can have up to 12 tags. Remove one to add more." };
  }

  await db.passportTag.upsert({
    where: {
      userId_key: { userId: session.userId, key: parsed.data.key },
    },
    update: { value: parsed.data.value },
    create: {
      userId: session.userId,
      key: parsed.data.key,
      value: parsed.data.value,
    },
  });
  revalidatePath("/passport");
  revalidatePath("/passport/edit");
  return { ok: true };
}

export async function removeTagAction(tagId: string): Promise<void> {
  const session = await getUserSession();
  if (!session.userId) redirect("/login");
  await db.passportTag.deleteMany({
    where: { id: tagId, userId: session.userId },
  });
  revalidatePath("/passport");
  revalidatePath("/passport/edit");
}
