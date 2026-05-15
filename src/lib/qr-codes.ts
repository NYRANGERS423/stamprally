import "server-only";
import { randomBytes, randomInt } from "node:crypto";
import { db } from "@/lib/db";

// 32-char hex token used inside the QR code URL.
export function generateQrToken(): string {
  return randomBytes(16).toString("hex");
}

// Short numeric code users can type if a QR scan fails.
// Tries 4 digits first, falls back to 5 if collisions get high.
export async function generateUniqueFallbackCode(): Promise<string> {
  for (let i = 0; i < 50; i++) {
    const code = String(randomInt(0, 10_000)).padStart(4, "0");
    const existing = await db.activity.findUnique({
      where: { fallbackCode: code },
      select: { id: true },
    });
    if (!existing) return code;
  }
  for (let i = 0; i < 50; i++) {
    const code = String(randomInt(0, 100_000)).padStart(5, "0");
    const existing = await db.activity.findUnique({
      where: { fallbackCode: code },
      select: { id: true },
    });
    if (!existing) return code;
  }
  throw new Error("Could not allocate a unique fallback code");
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
