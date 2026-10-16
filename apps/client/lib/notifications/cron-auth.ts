import { timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

/**
 * Shared-secret gate for the `/api/cron/*` endpoints.
 *
 * The jobs are triggered by an external scheduler (cron-job.org), so there is no
 * session to check. A single `CRON_SECRET` protects them; it is read at request
 * time so a missing variable fails closed in the handler rather than turning an
 * empty string into a valid password at import time.
 *
 * Accepted forms, so the same secret works whichever the scheduler offers:
 *   - `Authorization: Bearer <secret>`   (preferred, keeps it out of logs)
 *   - `?key=<secret>`                    (cron-job.org's URL field)
 */
export const CRON_SECRET_HEADER = "authorization";

/** Length-independent comparison, so a wrong secret leaks no timing signal. */
const safeEqual = (a: string, b: string) => {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
};

export const isCronAuthorized = (request: NextRequest): boolean => {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const header = request.headers.get(CRON_SECRET_HEADER);
  const bearer = header?.toLowerCase().startsWith("bearer ")
    ? header.slice(7).trim()
    : null;

  const provided = bearer ?? request.nextUrl.searchParams.get("key");

  return provided ? safeEqual(provided, secret) : false;
};
