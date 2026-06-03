type RateBucket = {
  count: number;
  windowStart: number;
};

const buckets = new Map<string, RateBucket>();

/**
 * Returns true if the action is allowed, false if maxAttempts was exceeded within windowMs.
 */
export function rateLimitAction(
  key: string,
  maxAttempts: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now - bucket.windowStart >= windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return true;
  }

  if (bucket.count >= maxAttempts) {
    return false;
  }

  bucket.count += 1;
  return true;
}
