"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rate-limit";

export interface AdminLoginState {
  error?: string;
}

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function adminLoginAction(
  _prev: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Username and password required" };
  }

  const rl = rateLimit({
    key: `admin-login:${parsed.data.username}`,
    max: 5,
    windowMs: 60 * 1000,
  });
  if (!rl.ok) {
    return { error: "Too many attempts — wait a minute and try again" };
  }

  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedPass = process.env.ADMIN_PASSWORD;
  if (!expectedUser || !expectedPass) {
    return {
      error:
        "Admin credentials are not configured on the server (ADMIN_USERNAME / ADMIN_PASSWORD)",
    };
  }

  // Constant-time-ish compare — these strings are short and trusted to be
  // human-typed, so a basic equality check is acceptable here.
  if (
    parsed.data.username !== expectedUser ||
    parsed.data.password !== expectedPass
  ) {
    return { error: "Invalid username or password" };
  }

  const session = await getAdminSession();
  session.isAdmin = true;
  session.username = expectedUser;
  await session.save();
  redirect("/admin");
}

export async function adminLogoutAction() {
  const session = await getAdminSession();
  session.destroy();
  redirect("/admin/login");
}
