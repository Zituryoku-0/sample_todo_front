import { describe, expect, it } from "vitest";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth";
import { POST } from "./route";

describe("POST /api/logout", () => {
  it("認証 Cookie を削除する", async () => {
    const response = await POST();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(response.headers.get("set-cookie")).toContain(`${ACCESS_TOKEN_COOKIE}=`);
    expect(response.cookies.get(ACCESS_TOKEN_COOKIE)?.value).toBe("");
  });
});
