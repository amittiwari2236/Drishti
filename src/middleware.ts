import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PREFIXES = [
  "/login",
  "/explore",
  "/api/auth",
  "/api/cron",
  "/api/public",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic =
    pathname === "/" ||
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
  const sessionCookie =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  if (!isPublic && !sessionCookie) {
    const url = new URL("/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Everything except static assets and Next internals.
    "/((?!_next/static|_next/image|favicon.ico|images/.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
