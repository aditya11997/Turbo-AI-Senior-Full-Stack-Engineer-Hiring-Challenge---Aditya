import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import NoteEditorPage from "../page";

const pushMock = vi.fn();
const paramsMock = vi.fn();
const apiGetMock = vi.fn();
const apiPatchMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  useParams: () => paramsMock()
}));

vi.mock("../../../../lib/api", () => ({
  api: {
    get: (...args: unknown[]) => apiGetMock(...args),
    patch: (...args: unknown[]) => apiPatchMock(...args),
    post: (...args: unknown[]) => apiPatchMock(...args)
  }
}));

const noteResponse = {
  id: 10,
  title: "Note Title",
  content: "Pour your heart out...",
  category: { name: "Random Thoughts", color_hex: "#EF9C66" },
  created_at: "2024-07-21T20:39:00Z",
  updated_at: "2024-07-21T20:39:00Z"
};

const categoriesResponse = [
  { name: "Random Thoughts", color_hex: "#EF9C66" },
  { name: "School", color_hex: "#FCDC94" }
];

describe("/notes/[id] page", () => {
  beforeEach(() => {
    apiGetMock.mockReset();
    apiPatchMock.mockReset();
    pushMock.mockReset();
    paramsMock.mockReset();
  });

  it("loads note and categories", async () => {
    apiGetMock
      .mockResolvedValueOnce(categoriesResponse)
      .mockResolvedValueOnce(noteResponse);

    paramsMock.mockReturnValue({ id: "10" });
    render(<NoteEditorPage />);

    expect(await screen.findByText(/Last Edited:/)).toBeInTheDocument();
    expect(screen.getByDisplayValue("Note Title")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Pour your heart out...")).toBeInTheDocument();
  });

  it("handles draft route without creating note until change", async () => {
    apiGetMock.mockResolvedValueOnce(categoriesResponse);
    apiPatchMock.mockResolvedValueOnce({
      ...noteResponse,
      id: 11,
      title: "Edited",
      updated_at: "2024-07-22T10:00:00Z"
    });

    paramsMock.mockReturnValue({ id: "new" });
    render(<NoteEditorPage />);

    const titleInput = await screen.findByDisplayValue("Note Title");
    fireEvent.change(titleInput, { target: { value: "Edited" } });

    await waitFor(() => {
      expect(apiPatchMock).toHaveBeenCalledWith("/notes", {
        title: "Edited",
        content: "Pour your heart out...",
        category_name: "Random Thoughts"
      });
    });
  });

  it("opens dropdown and selects category", async () => {
    apiGetMock
      .mockResolvedValueOnce(categoriesResponse)
      .mockResolvedValueOnce(noteResponse);

    paramsMock.mockReturnValue({ id: "10" });
    render(<NoteEditorPage />);

    const trigger = await screen.findByText("Random Thoughts");
    fireEvent.click(trigger);

    expect(screen.getByText("School")).toBeInTheDocument();
    fireEvent.click(screen.getByText("School"));

    expect(screen.queryByText("School")).not.toBeNull();
  });

  it("autosaves after debounce", async () => {
    apiGetMock
      .mockResolvedValueOnce(categoriesResponse)
      .mockResolvedValueOnce(noteResponse);
    apiPatchMock.mockResolvedValueOnce({
      ...noteResponse,
      title: "Updated",
      updated_at: "2024-07-22T10:00:00Z"
    });

    paramsMock.mockReturnValue({ id: "10" });
    render(<NoteEditorPage />);

    const titleInput = await screen.findByDisplayValue("Note Title");
    vi.useFakeTimers();
    fireEvent.change(titleInput, { target: { value: "Updated" } });

    await vi.advanceTimersByTimeAsync(600);
    await vi.runOnlyPendingTimersAsync();

    expect(apiPatchMock).toHaveBeenCalledWith("/notes/10", {
      title: "Updated",
      content: "Pour your heart out...",
      category_name: "Random Thoughts"
    });

    vi.useRealTimers();
  });

  it("flushes save on close", async () => {
    apiGetMock
      .mockResolvedValueOnce(categoriesResponse)
      .mockResolvedValueOnce(noteResponse);
    apiPatchMock.mockResolvedValueOnce({
      ...noteResponse,
      title: "Updated",
      updated_at: "2024-07-22T10:00:00Z"
    });

    paramsMock.mockReturnValue({ id: "10" });
    render(<NoteEditorPage />);

    const titleInput = await screen.findByDisplayValue("Note Title");
    fireEvent.change(titleInput, { target: { value: "Updated" } });

    const closeButton = await screen.findByRole("button", { name: /close/i });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(apiPatchMock).toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalledWith("/notes");
    });
  });
});
