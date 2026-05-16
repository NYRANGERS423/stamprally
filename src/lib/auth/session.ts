import "server-only";
import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";

export interface UserSession {
  userId?: string;
  mustChangePassword?: boolean;
}

export interface AdminSession {
  isAdmin?: boolean;
  username?: string;
}

function requireSecret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) {
    throw new Error(
      "AUTH_SECRET env var must be set and at least 32 characters long",
    );
  }
  return s;
}

// Cookie `Secure` flag.
// - AUTH_COOKIE_SECURE=true  → always set Secure (recommended when behind HTTPS)
// - AUTH_COOKIE_SECURE=false → never set Secure (use for HTTP testing on a LAN
//                              IP before the reverse proxy is wired up)
// - unset                    → defaults to true in production, false in dev
function cookieSecure(): boolean {
  const v = process.env.AUTH_COOKIE_SECURE?.toLowerCase();
  if (v === "true" || v === "1") return true;
  if (v === "false" || v === "0") return false;
  return process.env.NODE_ENV === "production";
}

const baseCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: cookieSecure(),
  path: "/",
};

function userOpts(): SessionOptions {
  return {
    password: requireSecret(),
    cookieName: "stamprally_user",
    cookieOptions: { ...baseCookieOptions, maxAge: 60 * 60 * 24 * 30 },
  };
}

function adminOpts(): SessionOptions {
  return {
    password: requireSecret(),
    cookieName: "stamprally_admin",
    cookieOptions: { ...baseCookieOptions, maxAge: 60 * 60 * 8 },
  };
}

export async function getUserSession() {
  return getIronSession<UserSession>(await cookies(), userOpts());
}

export async function getAdminSession() {
  return getIronSession<AdminSession>(await cookies(), adminOpts());
}
