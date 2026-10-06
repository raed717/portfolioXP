/**
 * Fixed-window, in-memory rate limiter. Good enough for a portfolio contact form; on serverless
 * hosts each instance keeps its own window, so treat it as a speed bump, not a guarantee.
 */
export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return function check(key: string, now = Date.now()): { ok: boolean; retryAfterMs: number } {
    const entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return { ok: true, retryAfterMs: 0 };
    }
    entry.count += 1;
    return entry.count <= limit
      ? { ok: true, retryAfterMs: 0 }
      : { ok: false, retryAfterMs: entry.resetAt - now };
  };
}
