import { adminSessionCookieName } from "@repo/lib/data/consts";
import { NextRequest, NextResponse } from "next/server";

export const loginPageRoute = "/login";

export async function proxy(req: NextRequest) {
  const { nextUrl, cookies } = req;

  // Namespaced session cookie for this app; the name is shared with the Auth.js
  // config through @repo/lib/data/consts.
  const token = cookies.get(adminSessionCookieName)?.value;
  const isLoggedIn = !!token;

  const isPrivateRoute = ["/"].some((route) =>
    nextUrl.pathname.startsWith(route),
  );

  const isAuthRoute = [loginPageRoute].some((route) =>
    nextUrl.pathname.startsWith(route),
  );

  if (!isLoggedIn && isPrivateRoute && !isAuthRoute) {
    return NextResponse.redirect(new URL(loginPageRoute, nextUrl));
  }

  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|fonts|images|public).*)",
  ],
};
