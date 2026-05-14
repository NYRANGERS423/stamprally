import "server-only";
import { createHash } from "node:crypto";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { getPhotoSettings } from "@/lib/app-config";

const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");

export interface PhotoUploadResult {
  ok: true;
  storedPath: string;
}

export interface PhotoUploadError {
  ok: false;
  error: string;
}

export async function processAndStorePhoto(
  file: File,
): Promise<PhotoUploadResult | PhotoUploadError> {
  if (!file || file.size === 0) {
    return { ok: false, error: "No file uploaded" };
  }

  const settings = await getPhotoSettings();
  const maxBytes = settings.maxMb * 1024 * 1024;

  if (file.size > maxBytes) {
    return {
      ok: false,
      error: `Photo is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max is ${settings.maxMb} MB.`,
    };
  }

  if (!file.type.startsWith("image/")) {
    return { ok: false, error: "Only image files are allowed" };
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());

  let outputBuffer: Buffer;
  try {
    outputBuffer = await sharp(inputBuffer, { failOn: "none" })
      .rotate() // honor EXIF orientation
      .resize(settings.outputPx, settings.outputPx, {
        fit: "cover",
        position: "centre",
      })
      .jpeg({ quality: settings.outputQuality, progressive: true })
      .toBuffer();
  } catch {
    return { ok: false, error: "That file does not look like a valid image" };
  }

  const hash = createHash("sha256").update(outputBuffer).digest("hex").slice(0, 24);
  const filename = `${hash}.jpg`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, filename), outputBuffer);

  return { ok: true, storedPath: filename };
}

export async function deletePhoto(filename: string | null | undefined): Promise<void> {
  if (!filename) return;
  if (!/^[a-f0-9]{24}\.jpg$/.test(filename)) return;
  try {
    await unlink(path.join(UPLOAD_DIR, filename));
  } catch {
    // best-effort; missing file is fine
  }
}

export function isValidPhotoFilename(name: string): boolean {
  return /^[a-f0-9]{24}\.jpg$/.test(name);
}

export function uploadDir(): string {
  return UPLOAD_DIR;
}
