import { describe, expect, it } from "vitest";
import { getJwtExpiration, isJwtActive } from "./auth";

const token = (payload: unknown) => `header.${btoa(JSON.stringify(payload))}.signature`;

describe("JWT の期限", () => {
  it("exp を取得する", () => {
    expect(getJwtExpiration(token({ exp: 100 }))).toBe(100);
  });

  it.each(["broken", "header.@@@.signature", token({}), token({ exp: "100" })])("不正なトークンを拒否する", (value) => {
    expect(getJwtExpiration(value)).toBeNull();
    expect(isJwtActive(value)).toBe(false);
  });

  it("期限の前だけ有効とする", () => {
    expect(isJwtActive(token({ exp: 100 }), 99_999)).toBe(true);
    expect(isJwtActive(token({ exp: 100 }), 100_000)).toBe(false);
  });
});
