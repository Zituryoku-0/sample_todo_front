"use client";
import { Alert, Button, Stack, TextInput } from "@mantine/core";
import { useState } from "react";
import { z } from "zod";

const todoSchema = z.object({
    title: z.string().trim().min(1, "Todoを入力して下さい").max(100, "Todoは100も字以内で入力して下さい"),
});

export default function TodoForm() {
    const [title, setTitle] = useState("");
    const [error, setError] = useState("");
    const [titleError, setTitleError] = useState("");
    const [isSubmit, setIsSubmit] = useState(false);

    const handleSubmit = async () => {

        const result = todoSchema.safeParse({ title });

        if (!result.success) {
            const flattend = z.flattenError(result.error);
            setTitleError(flattend.fieldErrors.title?.[0] ?? "入力内容を確認して下さい");
            return;
        }

        try {
            setIsSubmit(true);

            const response = await fetch("/api/todos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(result.data),
            });

            if (!response.ok) {
                const data = (await response.json()) as {
                    message?: string;
                };

                setError(data.message ?? "Todoの追加に失敗しました。");
                return;
            }

            setTitle("");
        } catch {
            setError("Todoの追加に失敗しました。");
        } finally {
            setIsSubmit(false);
        }
    };

    return (
        <>
            <Stack>
                {error && (
                    <Alert c="red">
                        {error}
                    </Alert>
                )}
            </Stack>

            <TextInput
                label="todo"
                placeholder="Todoを入力して下さい"
                value={title}
                onChange={(event) => setTitle(event.currentTarget.value)}
                error={titleError} />

            <Button
                onClick={handleSubmit}
                loading={isSubmit}>
                追加
            </Button>

        </>
    )
}