import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/auth/session";

// GET /check-in/<qrToken>
// Used by both:
//   - the in-app camera scanner (window.location.assign(...))
//   - native camera apps that follow the QR's URL
//
// Performs the stamp side-effect, then 303-redirects to /passport with a
// query param the client uses to show the appropriate banner. Doing this in
// a Route Handler instead of a server component keeps DB writes out of the
// render path — the cause of the 'server error 487401736@E7' style failures.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const session = await getUserSession();

  if (!session.userId) {
    return NextResponse.redirect(
      new URL(`/login?next=/check-in/${token}`, request.url),
    );
  }
  if (session.mustChangePassword) {
    return NextResponse.redirect(
      new URL("/force-change-password", request.url),
    );
  }

  const activity = await db.activity.findUnique({
    where: { qrToken: token },
    include: { event: { select: { name: true, active: true } } },
  });

  if (!activity) {
    return NextResponse.redirect(
      new URL("/passport?stampError=not_found", request.url),
    );
  }
  if (!activity.active || !activity.event.active) {
    return NextResponse.redirect(
      new URL("/passport?stampError=inactive", request.url),
    );
  }

  const existing = await db.stamp.findUnique({
    where: {
      userId_activityId: { userId: session.userId, activityId: activity.id },
    },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.redirect(
      new URL(
        `/passport?already=${encodeURIComponent(activity.name)}`,
        request.url,
      ),
    );
  }

  try {
    await db.stamp.create({
      data: { userId: session.userId, activityId: activity.id },
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      // Lost the race; another stamp landed concurrently. Treat as already.
      return NextResponse.redirect(
        new URL(
          `/passport?already=${encodeURIComponent(activity.name)}`,
          request.url,
        ),
      );
    }
    throw e;
  }

  return NextResponse.redirect(
    new URL(
      `/passport?stamped=${encodeURIComponent(activity.name)}`,
      request.url,
    ),
  );
}
