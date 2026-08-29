import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/report",
  "/leaderboard",
  "/kelas",
  "/users",
  "/approval",
  "/course",
  "/level",
  "/code_question",
  "/roles",
  "/permission",
  "/badge",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("access_token")?.value;

  let user: any = null;

  if (token) {
    try {
      const payloadBase64 = token.split(".")[1];
      const decodedPayload = Buffer.from(payloadBase64, "base64").toString("utf-8");
      user = JSON.parse(decodedPayload);
    } catch (err) {
      console.log("Failed to parse JWT payload");
    }
  }

  // Dashboard Admin / Teacher
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const role = (user.roles as string[])?.[0];

    if (role === "student") {
      return NextResponse.redirect(
        new URL("/student/dashboard", request.url)
      );
    }
  }

  // Dashboard Student
  if (pathname.startsWith("/student")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const role = (user.roles as string[])?.[0];

    if (role === "super" || role === "teacher") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Login/Register
  if (pathname === "/login" || pathname === "/register") {
    if (user) {
      const role = (user.roles as string[])?.[0];

      if (role === "student") {
        return NextResponse.redirect(
          new URL("/student/dashboard", request.url)
        );
      }

      return NextResponse.redirect(
        new URL("/dashboard", request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|assets|logo).*)",
  ],
};