export const onDevelepe = process.env.NODE_ENV === "development";
export const onProduction = process.env.NODE_ENV === "production";
export const globalPageSize = 15;
export const annualPlanDisocunt = 0.3;

/**
 * Session cookie used by the admin app.
 *
 * Both Next apps are deployed from this repository onto one domain (the client
 * owns the root, the admin lives under `/admin`), and they sign in different
 * account tables. Without a distinct name the two sessions would share a single
 * cookie on that domain and overwrite each other, so the admin namespaces its
 * own. The name is read by the Auth.js config *and* by apps/admin/proxy.ts, which
 * is why it lives here instead of in either one of them.
 *
 * Auth.js requires the `__Secure-` prefix whenever cookies are sent over HTTPS.
 */
export const adminSessionCookieName = onDevelepe
  ? "admin.session-token"
  : "__Secure-admin.session-token";

