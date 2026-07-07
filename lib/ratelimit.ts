type RateLimitBucket = {
  windowStartMs: number;
  count: number;
};

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
  nowMs?: number;
};

export type RateLimitResult =
  | {
      allowed: true;
      remaining: number;
      resetAt: string;
    }
  | {
      allowed: false;
      retryAfterSeconds: number;
      resetAt: string;
    };

const globalForRateLimit = globalThis as unknown as {
  costAiLocalRateLimit?: Map<string, RateLimitBucket>;
};

const buckets =
  globalForRateLimit.costAiLocalRateLimit ?? new Map<string, RateLimitBucket>();

globalForRateLimit.costAiLocalRateLimit = buckets;

function sweepExpiredBuckets(nowMs: number, windowMs: number) {
  if (buckets.size < 1000) return;

  for (const [key, bucket] of buckets.entries()) {
    if (nowMs - bucket.windowStartMs > windowMs * 2) {
      buckets.delete(key);
    }
  }
}

export function checkLocalRateLimit({
  key,
  limit,
  windowMs,
  nowMs = Date.now()
}: RateLimitOptions): RateLimitResult {
  sweepExpiredBuckets(nowMs, windowMs);

  const existing = buckets.get(key);
  const bucket =
    existing && nowMs - existing.windowStartMs < windowMs
      ? existing
      : {
          windowStartMs: nowMs,
          count: 0
        };
  const resetAtMs = bucket.windowStartMs + windowMs;
  const resetAt = new Date(resetAtMs).toISOString();

  if (bucket.count >= limit) {
    buckets.set(key, bucket);

    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((resetAtMs - nowMs) / 1000)),
      resetAt
    };
  }

  bucket.count += 1;
  buckets.set(key, bucket);

  return {
    allowed: true,
    remaining: Math.max(0, limit - bucket.count),
    resetAt
  };
}
