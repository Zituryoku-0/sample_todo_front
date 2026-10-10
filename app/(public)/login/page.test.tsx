import { MantineProvider } from "@mantine/core";
import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Login from "./page";
import "@testing-library/jest-dom/vitest";

const router = vi.hoisted(() => ({
    replace: vi.fn(),
    refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
    useRouter: () => router,
}));

const fetchMock = vi.fn();

function renderLogin() {
    render(
        <MantineProvider env="test">
            <Login />
        </MantineProvider>,
    );
}

function submitLogin() {
    fireEvent.change(screen.getByLabelText("メールアドレス"), {
        target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("パスワード"), {
        target: { value: "test-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "ログインする" }));
}

describe("ログイン画面", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        vi.stubGlobal("matchMedia", vi.fn((query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(() => true),
        })));
        vi.stubGlobal("fetch", fetchMock);
        vi.stubEnv("NEXT_PUBLIC_AUTH_API_URL", "https://api.example.test");
    });

    afterEach(() => {
        cleanup();
        vi.unstubAllGlobals();
        vi.unstubAllEnvs();
    });

    it("初期表示", () => {
        renderLogin();
        expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
        expect(screen.getByLabelText("パスワード")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "ログインする" }),
        ).toBeInTheDocument();
    });

    it("未入力ならエラーを表示し、APIを呼ばない", () => {
        renderLogin();

        fireEvent.click(screen.getByRole("button", { name: "ログインする" }));

        expect(
            screen.getByText("メールアドレスを入力して下さい。"),
        ).toBeInTheDocument();
        expect(
            screen.getByText("パスワードを入力して下さい。"),
        ).toBeInTheDocument();
        expect(fetchMock).not.toHaveBeenCalled();
        expect(router.replace).not.toHaveBeenCalled();
    });

    it("ログイン成功時に入力内容を送信し、トップへ遷移する", async () => {
        fetchMock.mockResolvedValue({ ok: true, status: 200 });
        renderLogin();

        submitLogin();

        await waitFor(() => {
            expect(router.replace).toHaveBeenCalledWith("/home");
        });

        expect(fetchMock).toHaveBeenCalledWith(
            "/api/login",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    email: "test@example.com",
                    password: "test-password",
                }),
            },
        );
        expect(router.refresh).toHaveBeenCalledOnce();
    });

    it.each([
        [401, "ユーザーIDまたはパスワードが違います。"],
        [500, "ログインに失敗しました。"],
    ])("HTTP %i の場合にエラーを表示する", async (status, message) => {
        fetchMock.mockResolvedValue({ ok: false, status });
        renderLogin();

        submitLogin();

        expect(await screen.findByRole("alert")).toHaveTextContent(message);
        expect(router.replace).not.toHaveBeenCalled();
        expect(router.refresh).not.toHaveBeenCalled();
    });

    it("通信に失敗した場合にエラーを表示する", async () => {
        fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
        renderLogin();

        submitLogin();

        expect(await screen.findByRole("alert")).toHaveTextContent("サーバーに接続できませんでした。");
        expect(router.replace).not.toHaveBeenCalled();
    })
})

