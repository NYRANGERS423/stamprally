import "server-only";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session.isAdmin) {
    redirect("/admin/login");
  }
  return session;
}
