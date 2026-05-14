import "server-only";

// Naive in-memory token-bucket. Per-process (does not scale beyond one
// container) but fine for V1. Replace with Redis if we run multi-instance.
const buckets = new Map<string, number[]>();

export function rateLimit(opts: {
  key: string;
  max: number;
  windowMs: number;
}): { ok: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const cutoff = now - opts.windowMs;
  const hits = (buckets.get(opts.key) ?? []).filter((t) => t > cutoff);
  if (hits.length >= opts.max) {
    buckets.set(opts.key, hits);
    return { ok: false, retryAfterMs: hits[0] + opts.windowMs - now };
  }
  hits.push(now);
  buckets.set(opts.key, hits);
  return { ok: true };
}
