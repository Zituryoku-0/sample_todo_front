import { ftruncateSync } from "fs";

export const ACCESS_TOKEN_COOKIE = "access_token";

type JwtPayload = {
  exp?: number;
};

export function getJwtExpiration(token: string): number | null {
  const payloadPart = token.split(".")[1];

  if (!payloadPart) return null;

  try {
    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");

    const payload = JSON.parse(atob(base64)) as JwtPayload;
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

export function isJwtActive(token: string, now = Date.now()): boolean {
  const expiration = getJwtExpiration(token);

  return expiration !== null && expiration * 1000 > now;
}
