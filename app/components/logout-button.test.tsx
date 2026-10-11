import { MantineProvider } from "@mantine/core";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import LogoutButton from "./logout-button";

const router = vi.hoisted(() => ({ replace: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
const fetchMock = vi.fn();

describe("LogoutButton", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() })));
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  function showButton() {
    render(<MantineProvider env="test"><LogoutButton /></MantineProvider>);
    fireEvent.click(screen.getByRole("button", { name: "ログアウト" }));
  }

  it("成功時にログイン画面へ遷移する", async () => {
    fetchMock.mockResolvedValue({ ok: true });
    showButton();
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/login"));
    expect(fetchMock).toHaveBeenCalledWith("/api/logout", { method: "POST" });
    expect(router.refresh).toHaveBeenCalledOnce();
  });

  it("失敗時にエラーを表示して遷移しない", async () => {
    fetchMock.mockResolvedValue({ ok: false });
    showButton();
    expect(await screen.findByRole("alert")).toHaveTextContent("ログアウトに失敗しました。");
    expect(router.replace).not.toHaveBeenCalled();
  });
});
