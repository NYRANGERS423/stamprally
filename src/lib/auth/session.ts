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

export interface KioskSession {
  kioskUserId?: string;
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

const baseCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
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

function kioskOpts(): SessionOptions {
  return {
    password: requireSecret(),
    cookieName: "stamprally_kiosk",
    cookieOptions: { ...baseCookieOptions, maxAge: 60 * 60 * 24 * 7 },
  };
}

export async function getUserSession() {
  return getIronSession<UserSession>(await cookies(), userOpts());
}

export async function getAdminSession() {
  return getIronSession<AdminSession>(await cookies(), adminOpts());
}

export async function getKioskSession() {
  return getIronSession<KioskSession>(await cookies(), kioskOpts());
}
