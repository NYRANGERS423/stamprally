"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/auth/session";
import { sanitizeSignatureJson } from "@/lib/signature";

export interface SignatureFormState {
  error?: string;
  ok?: boolean;
}

export async function saveSignatureAction(
  _prev: SignatureFormState,
  formData: FormData,
): Promise<SignatureFormState> {
  const session = await getUserSession();
  if (!session.userId) redirect("/login");
  if (session.mustChangePassword) redirect("/force-change-password");

  const raw = formData.get("signatureJson");
  if (typeof raw !== "string") {
    return { error: "No signature submitted" };
  }
  const result = sanitizeSignatureJson(raw);
  if (!result.ok) {
    return { error: result.error };
  }
  await db.user.update({
    where: { id: session.userId },
    data: { signatureSvg: JSON.stringify(result.data) },
  });
  revalidatePath("/passport");
  revalidatePath("/passport/edit");
  return { ok: true };
}

export async function removeSignatureAction(): Promise<void> {
  const session = await getUserSession();
  if (!session.userId) redirect("/login");
  await db.user.update({
    where: { id: session.userId },
    data: { signatureSvg: null },
  });
  revalidatePath("/passport");
  revalidatePath("/passport/edit");
}
