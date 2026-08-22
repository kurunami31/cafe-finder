import { headers } from "next/headers";

const buckets = new Map<string, number[]>();

/**
 * Best-effort IP rate limiting. Complements the per-session database limits:
 * cookies can be cleared by an attacker, but shared-infrastructure IPs cannot.
 * In-memory state is per serverless instance — this is a speed bump, not a wall.
 */
export async function checkRateLimit(
  action: string,
  limit: number,
  windowMs: number
): Promise<boolean> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown";
  const key = `${action}:${ip}`;
  const now = Date.now();

  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) return false;

  recent.push(now);
  buckets.set(key, recent);

  if (buckets.size > 10_000) {
    for (const [k, times] of buckets) {
      if (times.every((t) => now - t >= windowMs)) buckets.delete(k);
    }
  }
  return true;
}
