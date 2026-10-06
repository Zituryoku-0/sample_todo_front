"use client";

import { Button, Text } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleLogout() {
        if (loading) return;

        setLoading(true);

        try {
            const response = await fetch("/api/logout", {
                method: "POST",
            });

            if (!response.ok) {
                throw new Error("ログアウトに失敗しました。");
            }

            router.replace("/login");
            router.refresh();
        } catch {
            setError('ログアウトに失敗しました。');
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            {error && (
                <Text c="red" role="alert">
                    {error}
                </Text>
            )}
            <Button
                onClick={handleLogout}
                loading={loading}
            >
                ログアウト
            </Button>
        </>
    )
}