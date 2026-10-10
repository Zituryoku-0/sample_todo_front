import { ACCESS_TOKEN_COOKIE } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type CreateTodoRequest = {
  title: string;
};

export async function POST(request: Request) {
  const apiUrl = process.env.AUTH_API_URL;

  if (!apiUrl) {
    return NextResponse.json(
      { message: "APIが設定されていません。" },
      { status: 500 },
    );
  }

  try {
    const body = (await request.json()) as CreateTodoRequest;
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
      body: JSON.stringify(body),
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
