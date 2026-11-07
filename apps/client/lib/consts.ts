/**
 * Absolute origin this deployment is publicly reachable at.
 *
 * It is needed wherever a full URL is required rather than a relative one: the
 * payment gateway sends the user's browser back to `siteUrl + /payment/result`,
 * and robots.txt points crawlers at the sitemap on this origin.
 *
 * `NEXT_PUBLIC_MAIN_URL` wins (it is inlined at build time by the GitHub
 * workflow); local development runs the client on its own port.
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_MAIN_URL ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://pacsaz.ir");
