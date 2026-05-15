"use server";

import { revalidatePath } from "next/cache";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { requireAdmin } from "@/lib/auth/admin-guard";

// Readable temp password — no 0/O/1/l/I, no leading digit.
const PW_ALPHABET = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
function generateTempPassword(length = 14): string {
  const buf = randomBytes(length);
  let pw = "";
  for (const b of buf) pw += PW_ALPHABET[b % PW_ALPHABET.length];
  return pw;
}

export async function resetUserPasswordAction(
  userId: string,
): Promise<{ ok: true; password: string } | { ok: false; error: string }> {
  await requireAdmin();
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!user) return { ok: false, error: "User not found" };

  const password = generateTempPassword();
  const passwordHash = await hashPassword(password);
  await db.user.update({
    where: { id: userId },
    data: { passwordHash, mustChangePassword: true },
  });
  revalidatePath(`/admin/users/${userId}`);
  return { ok: true, password };
}
