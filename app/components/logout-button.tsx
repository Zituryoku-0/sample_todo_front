"use client";

import { Button } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

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

            router.replace("/page/login");
            router.refresh();
        } catch {
            setLoading(false);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Button
            onClick={handleLogout}
            loading={loading}
        >
            ログアウト
        </Button>
    )
}