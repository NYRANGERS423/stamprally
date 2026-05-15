"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/auth/session";

export interface CodeEntryState {
  error?: string;
}

const codeSchema = z.object({
  code: z
    .string()
    .trim()
    .min(4, "Code must be at least 4 digits")
    .max(8)
    .regex(/^\d+$/, "Code must be digits only"),
});

// Stamps the activity matching the entered fallback code and redirects to
// /passport with the appropriate banner param. Done inline rather than by
// redirecting to /check-in/[token] because a server-action → route-handler
// chain can resolve `request.url` to the container's internal bind address
// (0.0.0.0:3000), producing a broken Location header on the second hop.
export async function stampByCodeAction(
  _prev: CodeEntryState,
  formData: FormData,
): Promise<CodeEntryState> {
  const session = await getUserSession();
  if (!session.userId) redirect("/login?next=/check-in");
  if (session.mustChangePassword) redirect("/force-change-password");

  const parsed = codeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid code" };
  }
  const activity = await db.activity.findUnique({
    where: { fallbackCode: parsed.data.code },
    select: {
      id: true,
      name: true,
      active: true,
      event: { select: { active: true } },
    },
  });
  if (!activity || !activity.active || !activity.event.active) {
    return { error: "That code doesn't match any active activity" };
  }

  const existing = await db.stamp.findUnique({
    where: {
      userId_activityId: {
        userId: session.userId,
        activityId: activity.id,
      },
    },
    select: { id: true },
  });

  let target: string;
  if (existing) {
    target = `/passport?already=${encodeURIComponent(activity.name)}`;
  } else {
    try {
      await db.stamp.create({
        data: { userId: session.userId, activityId: activity.id },
      });
      target = `/passport?stamped=${encodeURIComponent(activity.name)}`;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        target = `/passport?already=${encodeURIComponent(activity.name)}`;
      } else {
        throw e;
      }
    }
  }
  revalidatePath("/passport");
  redirect(target);
}
