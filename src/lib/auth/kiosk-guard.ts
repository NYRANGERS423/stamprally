import "server-only";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getKioskSession } from "@/lib/auth/session";

export async function requireKiosk() {
  const session = await getKioskSession();
  if (!session.kioskUserId) {
    redirect("/kiosk/login");
  }
  // Verify the user still exists and is active.
  const user = await db.kioskUser.findUnique({
    where: { id: session.kioskUserId },
    select: { id: true, username: true, active: true },
  });
  if (!user || !user.active) {
    session.destroy();
    await session.save();
    redirect("/kiosk/login");
  }
  return { kioskUserId: user.id, username: user.username };
}
