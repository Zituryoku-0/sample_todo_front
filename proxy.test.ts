import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth";
import { proxy } from "./proxy";

const token = (exp: number) => `header.${btoa(JSON.stringify({ exp }))}.signature`;
const request = (path: string, jwt?: string) => {
  const headers = jwt ? { cookie: `${ACCESS_TOKEN_COOKIE}=${jwt}` } : undefined;
  return new NextRequest(`http://localhost${path}`, { headers });
};

describe("proxy", () => {
  it("未認証のホームアクセスをログインへ送る", () => {
    expect(proxy(request("/home")).headers.get("location")).toBe("http://localhost/login");
  });

  it("期限切れトークンを削除する", () => {
    const response = proxy(request("/home", token(1)));
    expect(response.headers.get("location")).toBe("http://localhost/login");
    expect(response.cookies.get(ACCESS_TOKEN_COOKIE)?.value).toBe("");
  });

  it("認証済みのログイン画面をホームへ送る", () => {
    const response = proxy(request("/login", token(Math.floor(Date.now() / 1000) + 3600)));
    expect(response.headers.get("location")).toBe("http://localhost/home");
  });

  it("認証済みのホームアクセスを通す", () => {
    const response = proxy(request("/home", token(Math.floor(Date.now() / 1000) + 3600)));
    expect(response.headers.get("location")).toBeNull();
  });
});
