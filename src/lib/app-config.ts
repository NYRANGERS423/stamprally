import "server-only";
import { db } from "@/lib/db";

const KEYS = {
  uploadMaxMb: "upload.max_mb",
  uploadOutputPx: "upload.output_px",
  uploadOutputQuality: "upload.output_quality",
  siteTitle: "site.title",
} as const;

export interface PhotoSettings {
  maxMb: number;
  outputPx: number;
  outputQuality: number;
}

const DEFAULTS: PhotoSettings = {
  maxMb: parseEnvNum(process.env.UPLOAD_MAX_MB, 5),
  outputPx: parseEnvNum(process.env.UPLOAD_OUTPUT_PX, 800),
  outputQuality: parseEnvNum(process.env.UPLOAD_OUTPUT_QUALITY, 80),
};

function parseEnvNum(v: string | undefined, fallback: number): number {
  if (!v) return fallback;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

export async function getPhotoSettings(): Promise<PhotoSettings> {
  const rows = await db.appConfig.findMany({
    where: {
      key: { in: [KEYS.uploadMaxMb, KEYS.uploadOutputPx, KEYS.uploadOutputQuality] },
    },
  });
  const byKey = new Map(rows.map((r) => [r.key, r.value]));
  return {
    maxMb: numFromConfig(byKey.get(KEYS.uploadMaxMb), DEFAULTS.maxMb, 1, 50),
    outputPx: numFromConfig(byKey.get(KEYS.uploadOutputPx), DEFAULTS.outputPx, 200, 2000),
    outputQuality: numFromConfig(
      byKey.get(KEYS.uploadOutputQuality),
      DEFAULTS.outputQuality,
      40,
      100,
    ),
  };
}

export async function setPhotoSettings(s: PhotoSettings): Promise<void> {
  const clamped: PhotoSettings = {
    maxMb: clamp(s.maxMb, 1, 50),
    outputPx: clamp(s.outputPx, 200, 2000),
    outputQuality: clamp(s.outputQuality, 40, 100),
  };
  await db.$transaction([
    upsertConfig(KEYS.uploadMaxMb, String(clamped.maxMb)),
    upsertConfig(KEYS.uploadOutputPx, String(clamped.outputPx)),
    upsertConfig(KEYS.uploadOutputQuality, String(clamped.outputQuality)),
  ]);
}

function upsertConfig(key: string, value: string) {
  return db.appConfig.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

function numFromConfig(
  raw: string | undefined,
  fallback: number,
  min: number,
  max: number,
): number {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return fallback;
  return clamp(n, min, max);
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

// ── Sitewide custom title ──────────────────────────────────────────────────
// Optional centered header title that admins can set from the admin
// Settings page. Returns null when no title has been configured; the
// header falls back to the default "Stamprally" wordmark in that case.
export async function getSiteTitle(): Promise<string | null> {
  const row = await db.appConfig.findUnique({
    where: { key: KEYS.siteTitle },
  });
  const raw = row?.value?.trim();
  return raw ? raw : null;
}

export async function setSiteTitle(value: string | null): Promise<void> {
  const trimmed = (value ?? "").trim().slice(0, 80);
  if (!trimmed) {
    await db.appConfig.deleteMany({ where: { key: KEYS.siteTitle } });
    return;
  }
  await db.appConfig.upsert({
    where: { key: KEYS.siteTitle },
    update: { value: trimmed },
    create: { key: KEYS.siteTitle, value: trimmed },
  });
}
