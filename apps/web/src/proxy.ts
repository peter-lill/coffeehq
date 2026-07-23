import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/server/auth/constants";
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path === "/login" || path.startsWith("/_next/") || path === "/favicon.ico") return NextResponse.next();
  if (!request.cookies.get(AUTH_COOKIE_NAME)?.value) {
    const url = new URL("/login", request.url);
    if (path !== "/") url.searchParams.set("next", `${path}${request.nextUrl.search}`);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
export const config = { matcher: ["/((?!_next/static|_next/image).*)"] };
