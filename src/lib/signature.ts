export const SIGNATURE_VIEWBOX = "0 0 300 100";
const PATH_REGEX = /^[MLml0-9., -]+$/;

export interface SignatureData {
  vb: string;
  paths: string[];
}

export function parseSignature(raw: string | null | undefined): SignatureData | null {
  if (!raw) return null;
  try {
    const d = JSON.parse(raw) as unknown;
    if (!d || typeof d !== "object") return null;
    const obj = d as Record<string, unknown>;
    if (typeof obj.vb !== "string") return null;
    if (!Array.isArray(obj.paths)) return null;
    const paths = obj.paths.filter(
      (p): p is string => typeof p === "string" && p.length > 0,
    );
    if (paths.length === 0) return null;
    return { vb: obj.vb, paths };
  } catch {
    return null;
  }
}

export function sanitizeSignatureJson(raw: string, maxBytes = 50_000):
  | { ok: true; data: SignatureData }
  | { ok: false; error: string } {
  if (raw.length > maxBytes) {
    return { ok: false, error: "Signature is too large" };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "Invalid signature data" };
  }
  if (!parsed || typeof parsed !== "object") {
    return { ok: false, error: "Invalid signature shape" };
  }
  const obj = parsed as Record<string, unknown>;
  if (typeof obj.vb !== "string" || obj.vb.length > 60) {
    return { ok: false, error: "Invalid viewBox" };
  }
  if (!Array.isArray(obj.paths)) {
    return { ok: false, error: "Invalid paths" };
  }
  const paths: string[] = [];
  for (const p of obj.paths) {
    if (typeof p !== "string") continue;
    if (p.length === 0 || p.length > 5000) continue;
    if (!PATH_REGEX.test(p)) continue;
    paths.push(p);
    if (paths.length >= 50) break;
  }
  if (paths.length === 0) {
    return { ok: false, error: "Signature is empty" };
  }
  return { ok: true, data: { vb: obj.vb, paths } };
}
