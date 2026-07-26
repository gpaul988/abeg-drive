// In-memory rate limiting. This is process-local — fine for this sandbox
// and for a single-instance deployment, but does NOT work correctly across
// multiple server instances behind a load balancer (each instance would
// have its own counters). Production would use a shared store (Redis) via
// something like @upstash/ratelimit instead. Documented here rather than
// silently shipping something that looks correct but isn't at scale.

import { NextResponse } from "next/server";

interface Bucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, Bucket>();

// Periodic cleanup so this map doesn't grow unbounded in a long-running
// process — not strictly necessary for short-lived dev sessions, but
// correct hygiene for anything closer to production.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (now - bucket.windowStart > 60 * 60 * 1000) buckets.delete(key);
  }
}, 10 * 60 * 1000).unref?.();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds?: number;
}

export function checkRateLimit(key: string, maxAttempts: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now - existing.windowStart > windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  if (existing.count >= maxAttempts) {
    const retryAfterSeconds = Math.ceil((existing.windowStart + windowMs - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  existing.count += 1;
  return { allowed: true, remaining: maxAttempts - existing.count };
}

/** Best-effort client IP from standard proxy headers, falling back to a
 * constant so rate limiting still degrades gracefully (shared bucket)
 * rather than throwing when no IP is available (e.g. in some test
 * environments). */
export function getClientIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

/** Returns a 429 response if the limit was hit, or null if the caller
 * should proceed. Keeps each route's rate-limit check to one line. */
export function enforceRateLimit(req: Request, bucketName: string, maxAttempts: number, windowMs: number) {
  const key = `${bucketName}:${getClientIP(req)}`;
  const result = checkRateLimit(key, maxAttempts, windowMs);
  if (!result.allowed) {
    return NextResponse.json(
      { error: "too_many_requests", retryAfterSeconds: result.retryAfterSeconds },
      { status: 429, headers: { "Retry-After": String(result.retryAfterSeconds ?? 60) } }
    );
  }
  return null;
}
