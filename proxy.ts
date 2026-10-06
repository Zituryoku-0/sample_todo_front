import { NextRequest, NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE, isJwtActive } from "@/lib/auth";

const LOGIN_PATH = "/login";
const HOME_PATH = "/home";

export function proxy(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  const authenticatied = token ? isJwtActive(token) : false;

  // トークンチェック
  if (request.nextUrl.pathname === LOGIN_PATH) {
    if (authenticatied) {
      return NextResponse.redirect(new URL(HOME_PATH, request.url));
    }

    return NextResponse.next();
  }

  if (authenticatied) {
    // パス「/」はホームに返す
    if (request.nextUrl.pathname === "/") {
      return NextResponse.redirect(new URL(HOME_PATH, request.url));
    }
    return NextResponse.next();
  }

  // トークン不正
  const response = NextResponse.redirect(new URL(LOGIN_PATH, request.url));

  // 期限切れのCookie削除
  if (token) {
    response.cookies.delete(ACCESS_TOKEN_COOKIE);
  }

  return response;
}

export const config = {
  matcher: ["/", "/login", "/home/:path*"],
};
