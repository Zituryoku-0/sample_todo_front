import { NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth";
import { success } from "zod";

export async function POST() {
  const response = NextResponse.json({
    success: true,
  });

  response.cookies.delete(ACCESS_TOKEN_COOKIE);

  return response;
}
