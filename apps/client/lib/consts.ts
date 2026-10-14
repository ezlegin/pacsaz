/**
 * Absolute origin this deployment is publicly reachable at.
 *
 * It is needed wherever a full URL is required rather than a relative one: the
 * payment gateway sends the user's browser back to `siteUrl + /payment/result`,
 * and robots.txt points crawlers at the sitemap on this origin.
 *
 * `NEXT_PUBLIC_MAIN_URL` wins; Vercel exposes the production domain to functions
 * at runtime, so preview and production deployments work without extra config;
 * local development runs the client on its own port.
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_MAIN_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined) ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://pacsaz.ir");
