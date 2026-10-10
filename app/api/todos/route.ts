import { ACCESS_TOKEN_COOKIE } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

type CreateTodoRequest = {
  title: string;
};

const createTodoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Todoを入力して下さい")
    .max(100, "Todoは100文字以内で入力して下さい"),
});

export async function POST(request: Request) {
  const apiUrl = process.env.AUTH_API_URL;

  if (!apiUrl) {
    return NextResponse.json(
      { message: "APIが設定されていません。" },
      { status: 500 },
    );
  }

  try {
    const body = await request.json();
    const parsed = createTodoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message:
            z.flattenError(parsed.error).fieldErrors.title?.[0] ??
            "入力内容を確認して下さい",
        }
        { status: 400 },
      );
    }

    const title = parsed.data;

    const cookieStore = await cookies();
    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

    if (!accessToken) {
      return NextResponse.json(
        { message: "認証されていません。" },
        { status: 401 },
      );
    }

    const response = await fetch(`${apiUrl}/todos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(title),
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, {
        status: response.status,
      });
    }
    return NextResponse.json(data, {
      status: 201,
    });
  } catch {
    return NextResponse.json(
      { message: "Todoの追加に失敗しました。" },
      { status: 500 },
    );
  }
}
