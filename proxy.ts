import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Optimistic redirects ONLY — checks for the session cookie's presence, not its
// validity. Real auth (decode + role + ownership) lives in pages/Server Actions.
const PUBLIC_ROUTES = ["/login", "/signup"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession =
    request.cookies.has("authjs.session-token") ||
    request.cookies.has("__Secure-authjs.session-token");
  const isPublic = PUBLIC_ROUTES.some((p) => pathname.startsWith(p));

  if (!hasSession && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (hasSession && isPublic) {
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  // Skip API routes (incl. /api/auth), Next internals, and static files.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
