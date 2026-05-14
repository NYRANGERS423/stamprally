"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { setPhotoSettings } from "@/lib/app-config";

export interface SettingsFormState {
  error?: string;
  ok?: boolean;
}

const schema = z.object({
  maxMb: z.coerce.number().int().min(1).max(50),
  outputPx: z.coerce.number().int().min(200).max(2000),
  outputQuality: z.coerce.number().int().min(40).max(100),
});

export async function updatePhotoSettingsAction(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  await requireAdmin();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  await setPhotoSettings(parsed.data);
  revalidatePath("/admin/settings");
  return { ok: true };
}
