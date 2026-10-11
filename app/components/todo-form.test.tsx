import { MantineProvider } from "@mantine/core";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import TodoForm from "./todo-form";

const fetchMock = vi.fn();

describe("TodoForm", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() })));
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  function showForm() {
    render(<MantineProvider env="test"><TodoForm /></MantineProvider>);
  }

  it("空欄を送信せず入力エラーを表示する", () => {
    showForm();
    fireEvent.click(screen.getByRole("button", { name: "追加" }));
    expect(screen.getByText("Todoを入力して下さい")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("有効なタイトルを送信し、成功後に入力を消す", async () => {
    fetchMock.mockResolvedValue({ ok: true });
    showForm();
    fireEvent.change(screen.getByLabelText("todo"), { target: { value: "  買い物  " } });
    fireEvent.click(screen.getByRole("button", { name: "追加" }));
    await waitFor(() => expect(screen.getByLabelText("todo")).toHaveValue(""));
    expect(fetchMock).toHaveBeenCalledWith("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "買い物" }),
    });
  });

  it("API のエラーを表示する", async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({ message: "登録できません" }) });
    showForm();
    fireEvent.change(screen.getByLabelText("todo"), { target: { value: "買い物" } });
    fireEvent.click(screen.getByRole("button", { name: "追加" }));
    expect(await screen.findByText("登録できません")).toBeInTheDocument();
    expect(screen.getByLabelText("todo")).toHaveValue("買い物");
  });

  it("通信エラーを表示する", async () => {
    fetchMock.mockRejectedValue(new TypeError("network error"));
    showForm();
    fireEvent.change(screen.getByLabelText("todo"), { target: { value: "買い物" } });
    fireEvent.click(screen.getByRole("button", { name: "追加" }));
    expect(await screen.findByText("Todoの追加に失敗しました。")).toBeInTheDocument();
  });
});
