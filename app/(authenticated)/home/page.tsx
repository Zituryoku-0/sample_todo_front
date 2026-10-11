import type { Metadata } from "next";
import Header from "@/app/components/header";
import {
    Center,
    Paper,
    Title,
} from "@mantine/core";
import TodoList from "@/app/components/todo-list";

export const metadata: Metadata = {
    title: "ホーム | Todo",
    description: "Todoリストのホーム画面",
};

export default function Home() {

    return (
        <Center component="main" mih="100vh" px="md">
            <Paper withBorder shadow="sm" p="xl" radius="md" w="100%" maw={420}>
                <Header />
                <Title order={2} ta="center" mb="lg">
                    Todo
                </Title>
                <TodoList />
            </Paper>
        </Center>
    );
}
