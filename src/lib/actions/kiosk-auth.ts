"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { getKioskSession } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rate-limit";

export interface KioskLoginState {
  error?: string;
}

const schema = z.object({
  username: z.string().trim().toLowerCase().min(1),
  password: z.string().min(1),
});

export async function kioskLoginAction(
  _prev: KioskLoginState,
  formData: FormData,
): Promise<KioskLoginState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Invalid username or password" };
  }
  const rl = rateLimit({
    key: `kiosk-login:${parsed.data.username}`,
    max: 10,
    windowMs: 60 * 1000,
  });
  if (!rl.ok) {
    return { error: "Too many attempts — wait a minute and try again" };
  }
  const user = await db.kioskUser.findUnique({
    where: { username: parsed.data.username },
  });
  if (!user || !user.active) {
    return { error: "Invalid username or password" };
  }
  const ok = await verifyPassword(user.passwordHash, parsed.data.password);
  if (!ok) {
    return { error: "Invalid username or password" };
  }
  const session = await getKioskSession();
  session.kioskUserId = user.id;
  session.username = user.username;
  await session.save();
  redirect("/kiosk");
}

export async function kioskLogoutAction() {
  const session = await getKioskSession();
  session.destroy();
  redirect("/kiosk/login");
}
