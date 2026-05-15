"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/auth/session";
import { THEMES, type ThemeId } from "@/lib/themes";

export interface ThemeFormState {
  error?: string;
  ok?: boolean;
}

export async function updateThemeAction(
  _prev: ThemeFormState,
  formData: FormData,
): Promise<ThemeFormState> {
  const session = await getUserSession();
  if (!session.userId) redirect("/login");
  if (session.mustChangePassword) redirect("/force-change-password");

  const raw = formData.get("theme");
  if (typeof raw !== "string" || !(raw in THEMES)) {
    return { error: "Invalid theme" };
  }
  await db.user.update({
    where: { id: session.userId },
    data: { theme: raw as ThemeId },
  });
  revalidatePath("/passport");
  revalidatePath("/passport/edit");
  return { ok: true };
}
