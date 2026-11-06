import { adminSessionCookieName, onDevelepe } from "@repo/lib/data/consts";
import { getToken } from "next-auth/jwt";

/**
 * Verifies the admin session cookie of a request and returns the admin id it
 * carries, or null.
 *
 * The admin proxy used to treat any cookie with the right name as a session, so
 * a hand-made cookie opened every page. This decrypts and checks the token with
 * the same key and salt the admin Auth.js config signs it with (see
 * `admin.config.ts`), without touching the database, so it is cheap enough to
 * run on every request. Whether the admin still exists is checked by
 * `requireAdmin` in the app.
 */
export const verifyAdminToken = async (req: Request): Promise<string | null> => {
  const base = process.env.AUTH_SECRET;
  if (!base) return null;

  try {
    const token = await getToken({
      req,
      secret: `${base}#admin`,
      cookieName: adminSessionCookieName,
      salt: adminSessionCookieName,
      secureCookie: !onDevelepe,
    });
    const id = token?.id;
    return typeof id === "string" && id !== "" ? id : null;
  } catch {
    return null;
  }
};
