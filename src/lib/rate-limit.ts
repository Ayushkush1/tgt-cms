interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory, per server instance: a light brake on form spam, not a hard guarantee.
const rateLimitStore = new Map<string, RateLimitRecord>();

export function rateLimit(key: string, limit: number, windowMs: number): { success: boolean } {
  const now = Date.now();

  // Drop expired keys as we go so the map never grows unbounded
  for (const [storedKey, record] of rateLimitStore) {
    if (now > record.resetTime) rateLimitStore.delete(storedKey);
  }

  const record = rateLimitStore.get(key);
  if (!record) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { success: true };
  }
  if (record.count >= limit) return { success: false };

  record.count += 1;
  return { success: true };
}

/** The visitor's IP: forwarded by the website as x-client-ip, else read from proxy headers. */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-client-ip") ?? request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip")?.trim() ?? "unknown";
}
