import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const cookieGet = vi.hoisted(() => vi.fn());
vi.mock("next/headers", () => ({ cookies: async () => ({ get: cookieGet }) }));

const fetchMock = vi.fn();
const request = (body: unknown) => new Request("http://localhost/api/todos", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

describe("POST /api/todos", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("AUTH_API_URL", "https://api.example.test");
    vi.stubGlobal("fetch", fetchMock);
    cookieGet.mockReturnValue({ value: "test-token" });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("入力を検証してから転送する", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 201 }));
    const response = await POST(request({ title: "  買い物  " }));

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ message: "Todoを追加しました。" });
    expect(fetchMock).toHaveBeenCalledWith("https://api.example.test/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer test-token",
      },
      body: JSON.stringify({ title: "買い物" }),
      cache: "no-store",
    });
  });

  it("空の成功レスポンスでも 500 にしない", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 201 }));
    expect((await POST(request({ title: "買い物" }))).status).toBe(201);
  });

  it.each(["", "  ", 123])("不正なタイトル %s を拒否する", async (title) => {
    const response = await POST(request({ title }));
    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("認証 Cookie がなければ送信しない", async () => {
    cookieGet.mockReturnValue(undefined);
    const response = await POST(request({ title: "買い物" }));
    expect(response.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("バックエンドのエラーを転送する", async () => {
    fetchMock.mockResolvedValue(Response.json({ message: "登録できません" }, { status: 400 }));
    const response = await POST(request({ title: "買い物" }));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: "登録できません" });
  });

  it("通信に失敗したら 500 を返す", async () => {
    fetchMock.mockRejectedValue(new TypeError("network error"));
    const response = await POST(request({ title: "買い物" }));
    expect(response.status).toBe(500);
  });
});
