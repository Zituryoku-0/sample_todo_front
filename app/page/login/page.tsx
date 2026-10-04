import {
    Button,
    Center,
    Paper,
    PasswordInput,
    Stack,
    TextInput,
    Title,
} from "@mantine/core";

export default function Login() {
    return (
        <Center component="main" mih="100vh" px="md">
            <Paper withBorder shadow="sm" p="xl" radius="md" w="100%" maw={420}>
                <Title order={2} ta="center" mb="lg">
                    ログイン
                </Title>

                <form>
                    <Stack gap="md">
                        <TextInput
                            label="ユーザーID"
                            placeholder="ユーザーIDを入力"
                            name="userId"
                            autoComplete="username"
                        />
                        <PasswordInput
                            label="パスワード"
                            placeholder="パスワードを入力"
                            name="password"
                            autoComplete="current-password"
                        />
                        {/* type="submit" だと認証情報が URL に付与されるため button にしている */}
                        <Button type="button" fullWidth mt="sm">
                            ログインする
                        </Button>
                    </Stack>
                </form>
            </Paper>
        </Center>
    );
}
