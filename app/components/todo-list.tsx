"use client"

import { Box, List, LoadingOverlay, Text, ThemeIcon } from "@mantine/core"
import { CheckCircleIcon, CircleDashedIcon } from "@phosphor-icons/react"
import { useCallback, useEffect, useState } from "react"
import TodoForm from "./todo-form";

type Todo = {
    id: number;
    title: string;
    completed: boolean;
};


export default function TodoList() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [todoList, setTodoList] = useState<Todo[]>([]);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch("/api/todos");
            if (!response.ok) {
                setError("Todoの取得に失敗しました。");
                return;
            }

            const todos: Todo[] = await response.json();
            setTodoList(todos);

        } catch {
            setError("Todoの取得に失敗しました。");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // 初回表示時に取得を開始し、通信中の表示も更新する。
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void load();
    }, [load]);

    return (

        <Box pos="relative">
            <LoadingOverlay
                visible={loading}
                zIndex={1000}
                overlayProps={{ radius: 'sm', blur: 2 }}
                loaderProps={{ color: 'pink', type: 'bars' }}
            />
            <List
                spacing="xs"
                size="sm"
                center
                icon={
                    <ThemeIcon color="teal" size={24} radius="xl">
                        <CheckCircleIcon size={16} />
                    </ThemeIcon>
                }
            >
                {todoList.map((todo) => (
                    <List.Item
                        key={todo.id}
                        icon={
                            <ThemeIcon color={todo.completed ? "teal" : "blue"}
                                size={24} radius="xl">
                                {todo.completed ? (
                                    <CheckCircleIcon size={16} />
                                ) : (
                                    <CircleDashedIcon size={16} />
                                )}
                            </ThemeIcon>
                        }
                    >
                        {todo.title}
                    </List.Item>
                ))}
            </List>
            {error && (
                <Text c="red" role="alert">
                    {error}
                </Text>
            )}
            <TodoForm onAdded={load} />
        </Box>
    )
}
