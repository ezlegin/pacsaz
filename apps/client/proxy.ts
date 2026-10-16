import { onDevelepe } from "@repo/lib/data/consts";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  const { nextUrl, cookies } = req;
  const token = cookies.get(
    onDevelepe ? "authjs.session-token" : "__Secure-authjs.session-token",
  )?.value;
  const isLoggedIn = !!token;

  // Scheduled jobs authenticate with a shared secret rather than a session, and
  // they are server-to-server calls that must receive a JSON status instead of a
  // redirect to the login page. Their own handler is the gate.
  const isExemptApiRoute = exemptApiRoutes.some((route) =>
    nextUrl.pathname.startsWith(route),
  );

  const isPrivateRoute = privateRoutes.some((route) =>
    nextUrl.pathname.startsWith(route),
  );

  const isAuthRoute = ["/login"].some((route) =>
    nextUrl.pathname.startsWith(route),
  );

  if (!isLoggedIn && isPrivateRoute && !isAuthRoute && !isExemptApiRoute) {
    const returnUrl = nextUrl.pathname + nextUrl.search;
    const loginUrl = new URL(loginPageRoute, nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", returnUrl);

    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL("/panel", nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|fonts|images|public).*)",
  ],
};

export const loginPageRoute = "/login";
export const privateRoutes = [
  "/panel",
  "/onboarding",
  "/api",
  "/checkout-result",
  "/payment",
];

/**
 * Routes under `/api` that are reachable without a session because they carry
 * their own authentication. `/api/cron` verifies a shared secret
 * (`CRON_SECRET`) and answers 401/503 as JSON; letting the proxy redirect it to
 * the login page would hide that contract from the scheduler.
 */
export const exemptApiRoutes = ["/api/cron"];
