"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin-guard";

export async function grantStampAction(
  userId: string,
  activityId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin();
  if (!userId || !activityId) {
    return { ok: false, error: "User and activity are required" };
  }
  const activity = await db.activity.findUnique({
    where: { id: activityId },
    select: { id: true },
  });
  if (!activity) return { ok: false, error: "Activity not found" };
  try {
    await db.stamp.create({ data: { userId, activityId } });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return { ok: false, error: "User already has this stamp" };
    }
    throw e;
  }
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/passport");
  return { ok: true };
}

export async function removeStampAction(stampId: string): Promise<void> {
  await requireAdmin();
  const stamp = await db.stamp.findUnique({
    where: { id: stampId },
    select: { userId: true },
  });
  if (!stamp) return;
  await db.stamp.delete({ where: { id: stampId } });
  revalidatePath(`/admin/users/${stamp.userId}`);
  revalidatePath("/passport");
}
