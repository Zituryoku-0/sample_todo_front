"use client";

import Header from "@/app/components/header";
import {
    Button,
    Center,
    Paper,
    PasswordInput,
    Stack,
    Text,
    TextInput,
    Title,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

const userSchema = z.object({
    userId: z.string().min(1, "ユーザーIDを入力して下さい。"),
    password: z.string().min(1, "パスワードを入力して下さい。"),
});

type FieldErrors = {
    userId?: string[];
    password?: string[];
};

export default function Home() {
    const router = useRouter();
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);



    async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        if (loading) return;

        const formData = new FormData(event.currentTarget);
        const userId = String(formData.get("userId") ?? "").trim();
        const password = String(formData.get("password") ?? "");

        const apiUrl = process.env.NEXT_PUBLIC_AUTH_API_URL;

        setError("");

        const result = userSchema.safeParse({
            userId,
            password
        });

        if (!result.success) {
            const error = z.flattenError(result.error);
            setFieldErrors(error.fieldErrors);
            return;
        }
        setFieldErrors({});
        setLoading(true);

        try {
            const response = await fetch(`/api/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(result.data),
            });

            // ログイン失敗
            if (!response.ok) {
                setError(
                    response.status === 401 ? "ユーザーIDまたはパスワードが違います。"
                        : "ログインに失敗しました。",
                );
                return;
            }

            router.replace("/home");
            router.refresh();
        } catch {
            setError("サーバーに接続できませんでした。");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Center component="main" mih="100vh" px="md">
            <Paper withBorder shadow="sm" p="xl" radius="md" w="100%" maw={420}>
                <Header />
                <form onSubmit={handleSubmit} noValidate>
                    <Title order={2} ta="center" mb="lg">
                        ホーム画面
                    </Title>
                </form >
            </Paper>
        </Center>
    );
}
