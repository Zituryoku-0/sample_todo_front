"use client";

import Header from "@/app/components/header";
import {
    Center,
    Paper,
    Title,
} from "@mantine/core";



export default function Home() {

    return (
        <Center component="main" mih="100vh" px="md">
            <Paper withBorder shadow="sm" p="xl" radius="md" w="100%" maw={420}>
                <Header />
                <Title order={2} ta="center" mb="lg">
                    これはホーム画面です。
                </Title>
            </Paper>
        </Center>
    );
}
