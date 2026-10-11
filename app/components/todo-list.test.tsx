import { MantineProvider } from "@mantine/core";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TodoList from "./todo-list";

const fetchMock = vi.fn();

describe("TodoList", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() })));
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  function showList() {
    render(<MantineProvider env="test"><TodoList /></MantineProvider>);
  }

  it("初回表示で一覧を取得し、完了・未完了の Todo を表示する", async () => {
    fetchMock.mockResolvedValue(Response.json([
      { id: 1, title: "買い物", completed: false },
      { id: 2, title: "掃除", completed: true },
    ]));
    showList();

    expect(await screen.findByText("買い物")).toBeInTheDocument();
    expect(screen.getByText("掃除")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/todos");
  });

  it("取得エラーを表示し、再取得に成功したら消す", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 500 }));
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 201 }));
    fetchMock.mockResolvedValueOnce(Response.json([]));
    showList();

    expect(await screen.findByRole("alert")).toHaveTextContent("Todoの取得に失敗しました。");
    fireEvent.change(screen.getByLabelText("todo"), { target: { value: "買い物" } });
    fireEvent.click(screen.getByRole("button", { name: "追加" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
  });

  it("追加が成功したら一覧を再取得して表示を更新する", async () => {
    fetchMock.mockResolvedValueOnce(Response.json([]));
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 201 }));
    fetchMock.mockResolvedValueOnce(Response.json([{ id: 3, title: "買い物", completed: false }]));
    showList();

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    fireEvent.change(screen.getByLabelText("todo"), { target: { value: "買い物" } });
    fireEvent.click(screen.getByRole("button", { name: "追加" }));

    expect(await screen.findByText("買い物")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual(["/api/todos", "/api/todos", "/api/todos"]);
    expect(fetchMock.mock.calls[1][1].method).toBe("POST");
  });

  it("通信エラーを表示する", async () => {
    fetchMock.mockRejectedValue(new TypeError("network error"));
    showList();
    expect(await screen.findByRole("alert")).toHaveTextContent("Todoの取得に失敗しました。");
  });
});
