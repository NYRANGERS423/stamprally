import "server-only";
import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/auth/session";

export async function requireUser(currentPath?: string) {
  const session = await getUserSession();
  if (!session.userId) {
    const next = currentPath ? `?next=${encodeURIComponent(currentPath)}` : "";
    redirect(`/login${next}`);
  }
  if (session.mustChangePassword) {
    redirect("/force-change-password");
  }
  return { userId: session.userId };
}
