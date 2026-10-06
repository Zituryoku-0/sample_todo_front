import { NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE, getJwtExpiration } from "@/lib/auth";
import { fromJSONSchema, success } from "zod";

type LoginResponse = {
  accessToken?: string;
  access_token?: string;
};

export async function POST(requst: Request) {
  const apiUrl = process.env.AUTH_API_URL;

  if (!apiUrl) {
    return NextResponse.json(
      { message: "認証APIが設定されていません。" },
      { status: 500 },
    );
  }

  try {
    const credentials: unknown = await requst.json();

    const nestResponse = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
      cache: "no-store",
    });

    if (!nestResponse.ok) {
      return NextResponse.json(
        { message: "ログインに失敗しました。" },
        { status: nestResponse.status },
      );
    }

    const data = (await nestResponse.json()) as LoginResponse;
    const token = data.accessToken ?? data.access_token;
    const expiration = token ? getJwtExpiration(token) : null;

    const maxAge = expiration ? expiration - Math.floor(Date.now() / 1000) : 0;

    if (!token || maxAge <= 0) {
      return NextResponse.json(
        { message: "有効なトークンを取得できませんでした。" },
        { status: 502 },
      );
    }

    const response = NextResponse.json({ success: true });

    response.cookies.set(ACCESS_TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    return response;
  } catch {
    return NextResponse.json(
      { message: "認証サーバーに接続できませんでした。" },
      { status: 502 },
    );
  }
}
