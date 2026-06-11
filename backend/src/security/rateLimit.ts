import type { Request, Response, NextFunction } from "express";

type Bucket = { resetAt: number; count: number };
const buckets = new Map<string, Bucket>();

export function createMemoryRateLimit(options: { windowMs: number; max: number; keyPrefix: string }) {
  return function rateLimit(req: Request, res: Response, next: NextFunction) {
    const key = `${options.keyPrefix}:${req.ip}:${req.path}`;
    const now = Date.now();
    const current = buckets.get(key);
    if (!current || current.resetAt <= now) {
      buckets.set(key, { resetAt: now + options.windowMs, count: 1 });
      return next();
    }
    current.count += 1;
    if (current.count > options.max) {
      res.setHeader("Retry-After", Math.ceil((current.resetAt - now) / 1000).toString());
      return res.status(429).json({ ok: false, error: "rate_limited" });
    }
    return next();
  };
}

export function cleanupRateLimitBuckets() {
  const now = Date.now();
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}
