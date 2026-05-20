type RateLimitEntry = {
  count: number;
  lastRequest: number;
};

const cache = new Map<string, RateLimitEntry>();

export function rateLimit(
  ip: string,
  limit: number = 5,
  windowMs: number = 60000,
) {
  const now = Date.now();
  const entry = cache.get(ip);

  if (!entry) {
    cache.set(ip, { count: 1, lastRequest: now });
    return { success: true };
  }

  if (now - entry.lastRequest > windowMs) {
    entry.count = 1;
    entry.lastRequest = now;
    return { success: true };
  }

  if (entry.count >= limit) {
    return { success: false };
  }

  entry.count++;
  return { success: true };
}
