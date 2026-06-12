import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    //console.log("token:", token);
    const path = request.nextUrl.pathname;
    //console.log("path:", path);

    const isAuthPage = path.startsWith("/auth");
    const isProtectedRoutes =
      path.startsWith("/stock") ||
      path.startsWith("/broker") ||
      path.startsWith("/interaction") ||
      path.startsWith("/leads") ||
      path.startsWith("/owner") ||
      path === "/";

    if (isProtectedRoutes && !token) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    if (isAuthPage && token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
