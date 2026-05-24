import { onDevelepe } from "@repo/lib/data/consts";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  const { nextUrl, cookies } = req;
  const token = cookies.get(
    onDevelepe ? "authjs.session-token" : "__Secure-authjs.session-token",
  )?.value;
  const isLoggedIn = !!token;

  const isPrivateRoute = privateRoutes.some((route) =>
    nextUrl.pathname.startsWith(route),
  );

  const isAuthRoute = ["/login"].some((route) =>
    nextUrl.pathname.startsWith(route),
  );

  if (!isLoggedIn && isPrivateRoute && !isAuthRoute) {
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
