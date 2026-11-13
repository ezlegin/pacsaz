import { prisma } from "../lib/prisma";

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSeconds: number };

/**
 * Counts one hit on `key` in a fixed window and says whether it is within
 * `limit`. The count and the window reset happen in one SQL statement, so
 * requests fired at the same moment cannot all slip under the limit.
 *
 * Fails open: if the database call itself fails, the request is allowed and
 * the error logged, because locking every user out is worse than a missed
 * count. Old rows are harmless (each is reset on its next hit) and are pruned
 * now and then.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
  try {
    const rows = await prisma.$queryRaw<{ count: number; resetAt: Date }[]>`
      INSERT INTO "RateLimit" ("key", "count", "resetAt")
      VALUES (${key}, 1, (now() AT TIME ZONE 'UTC') + make_interval(secs => ${windowSeconds}))
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE WHEN "RateLimit"."resetAt" <= (now() AT TIME ZONE 'UTC') THEN 1 ELSE "RateLimit"."count" + 1 END,
        "resetAt" = CASE WHEN "RateLimit"."resetAt" <= (now() AT TIME ZONE 'UTC')
          THEN (now() AT TIME ZONE 'UTC') + make_interval(secs => ${windowSeconds}) ELSE "RateLimit"."resetAt" END
      RETURNING "count", "resetAt"`;
    const row = rows[0];
    if (Math.random() < 0.01) void prune();
    if (!row || row.count <= limit) return { ok: true };
    return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil((row.resetAt.getTime() - Date.now()) / 1000)) };
  } catch (error) {
    console.error("rateLimit failed", error);
    return { ok: true };
  }
}

/** Clears a key, e.g. failed logins after a successful one. */
export async function resetRateLimit(key: string) {
  await prisma.rateLimit.deleteMany({ where: { key } }).catch(() => {});
}

async function prune() {
  await prisma.rateLimit.deleteMany({ where: { resetAt: { lt: new Date(Date.now() - 86_400_000) } } }).catch(() => {});
}

/**
 * The caller's IP from the proxy's headers. nginx-proxy sets `X-Real-IP` to
 * the connecting address; the client can forge the start of
 * `X-Forwarded-For` but not the last entry the proxy appends.
 */
export function clientIp(headers: Headers): string {
  const real = headers.get("x-real-ip")?.trim();
  if (real) return real;
  const forwarded = headers.get("x-forwarded-for")?.split(",").at(-1)?.trim();
  return forwarded || "unknown";
}

/** "۳ دقیقه" style wait for Persian messages. */
export function waitFa(seconds: number): string {
  const fa = (n: number) => n.toLocaleString("fa-IR");
  if (seconds < 60) return `${fa(seconds)} ثانیه`;
  if (seconds < 3600) return `${fa(Math.ceil(seconds / 60))} دقیقه`;
  return `${fa(Math.ceil(seconds / 3600))} ساعت`;
}
