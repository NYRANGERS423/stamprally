import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/auth/session";

// Build the redirect base URL.
//
// `request.url` in the standalone Next server is the container's
// internal bind address (HOSTNAME=0.0.0.0:PORT) because Next does
// not trust X-Forwarded-* headers by default. Using it as the
// `base` argument of `new URL(...)` produces a Location header that
// points at 0.0.0.0 and breaks the redirect for anyone hitting us
// through a reverse proxy. When APP_URL is set (which it is in any
// reverse-proxied deploy), use that instead so the Location header
// reflects the public URL the user actually came in on.
function redirectTo(path: string, request: NextRequest): NextResponse {
  const base = process.env.APP_URL?.replace(/\/+$/, "");
  const url = base ? `${base}${path}` : new URL(path, request.url).toString();
  return NextResponse.redirect(url);
}

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
    return redirectTo(`/login?next=/check-in/${token}`, request);
  }
  if (session.mustChangePassword) {
    return redirectTo("/force-change-password", request);
  }

  const activity = await db.activity.findUnique({
    where: { qrToken: token },
    include: { event: { select: { name: true, active: true } } },
  });

  if (!activity) {
    return redirectTo("/passport?stampError=not_found", request);
  }
  if (!activity.active || !activity.event.active) {
    return redirectTo("/passport?stampError=inactive", request);
  }

  const existing = await db.stamp.findUnique({
    where: {
      userId_activityId: { userId: session.userId, activityId: activity.id },
    },
    select: { id: true },
  });
  if (existing) {
    return redirectTo(
      `/passport?already=${encodeURIComponent(activity.name)}`,
      request,
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
      return redirectTo(
        `/passport?already=${encodeURIComponent(activity.name)}`,
        request,
      );
    }
    throw e;
  }

  return redirectTo(
    `/passport?stamped=${encodeURIComponent(activity.name)}`,
    request,
  );
}
