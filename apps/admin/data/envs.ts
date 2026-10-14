import { onDevelepe } from "@repo/lib/data/consts";

/**
 * The public site is a separate deployment on its own domain (pacsaz.ir; the
 * admin is served from admin.pacsaz.ir), so links out of the admin need an
 * absolute origin.
 *
 * `NEXT_PUBLIC_MAIN_URL` is that origin in production; local development runs
 * the client on its own port.
 */
export const mainURL =
  process.env.NEXT_PUBLIC_MAIN_URL ??
  (onDevelepe ? "http://localhost:3000" : "https://pacsaz.ir");
