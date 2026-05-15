"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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
      qrToken: true,
      active: true,
      destination: { select: { event: { select: { active: true } } } },
    },
  });
  if (
    !activity ||
    !activity.active ||
    !activity.destination.event.active
  ) {
    return { error: "That code doesn't match any active activity" };
  }
  revalidatePath("/passport");
  redirect(`/check-in/${activity.qrToken}`);
}
