import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth";
import { POST } from "./route";

const fetchMock = vi.fn();
const credentials = { email: "test@example.com", password: "secret" };
const request = () => new Request("http://localhost/api/login", {
  method: "POST",
  body: JSON.stringify(credentials),
});
const token = (exp: number) => `header.${btoa(JSON.stringify({ exp }))}.signature`;

describe("POST /api/login", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("AUTH_API_URL", "https://api.example.test");
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("有効なトークンを HttpOnly Cookie に保存する", async () => {
    const jwt = token(Math.floor(Date.now() / 1000) + 3600);
    fetchMock.mockResolvedValue(Response.json({ accessToken: { accessToken: jwt } }));
    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(response.cookies.get(ACCESS_TOKEN_COOKIE)?.value).toBe(jwt);
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
    expect(fetchMock).toHaveBeenCalledWith("https://api.example.test/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
      cache: "no-store",
    });
  });

  it("バックエンドの認証失敗ステータスを返す", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }));
    expect((await POST(request())).status).toBe(401);
  });

  it("期限切れトークンを保存しない", async () => {
    fetchMock.mockResolvedValue(Response.json({ accessToken: { accessToken: token(1) } }));
    const response = await POST(request());
    expect(response.status).toBe(502);
    expect(response.cookies.get(ACCESS_TOKEN_COOKIE)).toBeUndefined();
  });

  it("通信エラーを 502 として返す", async () => {
    fetchMock.mockRejectedValue(new Error("network error"));
    expect((await POST(request())).status).toBe(502);
  });
});
