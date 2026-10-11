import { ACCESS_TOKEN_COOKIE } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { todo } from "node:test";
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

export async function GET() {
  const apiUrl = process.env.AUTH_API_URL;

  if (!apiUrl) {
    return NextResponse.json(
      { message: "APIが設定されていません。" },
      { status: 500 },
    );
  }

  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

    if (!accessToken) {
      return NextResponse.json(
        { message: "認証されていません。" },
        { status: 401 },
      );
    }

    const response = await fetch(`${apiUrl}/todos`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(data, {
        status: response.status,
      });
    }
    const todos = await response.json();

    return NextResponse.json(todos);
  } catch {
    return NextResponse.json(
      { message: "Todoの取得に失敗しました。" },
      { status: 500 },
    );
  }
}

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
        },
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

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(data, {
        status: response.status,
      });
    }
    return NextResponse.json(
      { message: "Todoを追加しました。" },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { message: "Todoの追加に失敗しました。" },
      { status: 500 },
    );
  }
}
