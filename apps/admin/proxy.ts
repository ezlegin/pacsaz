import { verifyAdminToken } from "@repo/auth/adminToken";
import { NextRequest, NextResponse } from "next/server";

export const loginPageRoute = "/login";

export async function proxy(req: NextRequest) {
  const { nextUrl } = req;

  // Development-only playgrounds (the editor v2 canvas) need no account. The
  // pages themselves return 404 outside development as well.
  if (process.env.NODE_ENV === "development" && nextUrl.pathname.startsWith("/dev/")) {
    return NextResponse.next();
  }

  const isAuthRoute = nextUrl.pathname.startsWith(loginPageRoute);

  // The token is decrypted and checked, not just looked for: a cookie with the
  // right name and any value used to open the whole panel.
  const adminId = await verifyAdminToken(req);

  if (!adminId && !isAuthRoute) {
    return NextResponse.redirect(new URL(loginPageRoute, nextUrl));
  }

  // A signed-in admin is not sent away from /login here. The token can be valid
  // for an admin that was deleted since; the panel layout sends that session to
  // /login, and bouncing it back from there would loop. The login page redirects
  // a live admin itself.

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|fonts|images|public).*)",
  ],
};
