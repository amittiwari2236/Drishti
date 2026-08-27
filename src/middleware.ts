import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PUBLIC_PATHS = ["/login", "/api/auth", "/api/cron"];

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (searchParams.get("clear_session") === "true") {
    const url = new URL("/login", request.url);
    const response = NextResponse.redirect(url);
    response.cookies.delete("better-auth.session_token");
    return response;
  }

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const sessionCookie = getSessionCookie(request);

  if (!isPublic && !sessionCookie) {
    const url = new URL("/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname === "/login" && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Everything except static assets and Next internals.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
