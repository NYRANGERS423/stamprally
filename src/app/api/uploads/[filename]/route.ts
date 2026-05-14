import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { isValidPhotoFilename, uploadDir } from "@/lib/uploads/photo";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  if (!isValidPhotoFilename(filename)) {
    return new NextResponse("Not found", { status: 404 });
  }
  const filePath = path.join(uploadDir(), filename);
  try {
    await stat(filePath);
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
  const data = await readFile(filePath);
  return new NextResponse(new Uint8Array(data), {
    status: 200,
    headers: {
      "Content-Type": "image/jpeg",
      // Content-hashed names — safe to cache aggressively.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
