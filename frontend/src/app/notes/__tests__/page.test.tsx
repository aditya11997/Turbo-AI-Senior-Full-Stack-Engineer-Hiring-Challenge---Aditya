import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import NotesPage from "../page";

const pushMock = vi.fn();
const apiGetMock = vi.fn();
const apiPostMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock })
}));

vi.mock("../../../lib/api", () => ({
  api: {
    get: (...args: unknown[]) => apiGetMock(...args),
    post: (...args: unknown[]) => apiPostMock(...args)
  }
}));

describe("/notes page", () => {
  beforeEach(() => {
    apiGetMock.mockReset();
    apiPostMock.mockReset();
    pushMock.mockReset();
  });

  it("renders categories and empty state", async () => {
    apiGetMock.mockResolvedValueOnce({
      has_notes: false,
      total_notes: 0,
      default_category: "Random Thoughts",
      categories: [
        { name: "Random Thoughts", color_hex: "#EF9C66", count: 0 },
        { name: "School", color_hex: "#FCDC94", count: 0 },
        { name: "Personal", color_hex: "#78ABA8", count: 0 }
      ]
    });
    apiGetMock.mockResolvedValueOnce([]);

    render(<NotesPage />);

    expect(await screen.findByText("All Categories")).toBeInTheDocument();
    expect(screen.getByText("Random Thoughts")).toBeInTheDocument();
    expect(screen.getByText("School")).toBeInTheDocument();
    expect(screen.getByText("Personal")).toBeInTheDocument();
    expect(
      screen.getByText("I'm just here waiting for your charming notes...")
    ).toBeInTheDocument();
  });

  it("routes to /notes/new when New Note clicked", async () => {
    apiGetMock.mockResolvedValueOnce({
      has_notes: false,
      total_notes: 0,
      default_category: "Random Thoughts",
      categories: []
    });
    apiGetMock.mockResolvedValueOnce([]);

    render(<NotesPage />);

    const button = await screen.findByRole("button", { name: /new note/i });
    fireEvent.click(button);

    expect(pushMock).toHaveBeenCalledWith("/notes/new");
  });

  it("renders note cards when notes exist", async () => {
    apiGetMock.mockResolvedValueOnce({
      has_notes: true,
      total_notes: 1,
      default_category: "Random Thoughts",
      categories: [
        { name: "Random Thoughts", color_hex: "#EF9C66", count: 1 }
      ]
    });
    apiGetMock.mockResolvedValueOnce([
      {
        id: 1,
        title: "A real note",
        content: "Some content",
        category: { name: "Random Thoughts", color_hex: "#EF9C66" },
        created_at: "2024-07-16T10:00:00Z",
        updated_at: "2024-07-16T10:00:00Z"
      }
    ]);

    render(<NotesPage />);

    expect(await screen.findByText("A real note")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /a real note/i }));
    expect(pushMock).toHaveBeenCalledWith("/notes/1");
  });

  it("formats dates as today and yesterday", async () => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    apiGetMock.mockResolvedValueOnce({
      has_notes: true,
      total_notes: 2,
      default_category: "Random Thoughts",
      categories: [
        { name: "Random Thoughts", color_hex: "#EF9C66", count: 1 },
        { name: "School", color_hex: "#FCDC94", count: 1 }
      ]
    });
    apiGetMock.mockResolvedValueOnce([
      {
        id: 1,
        title: "Today note",
        content: "Body",
        category: { name: "Random Thoughts", color_hex: "#EF9C66" },
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      },
      {
        id: 2,
        title: "Yesterday note",
        content: "Body",
        category: { name: "School", color_hex: "#FCDC94" },
        created_at: yesterday.toISOString(),
        updated_at: yesterday.toISOString()
      }
    ]);

    render(<NotesPage />);

    expect(await screen.findByText("today")).toBeInTheDocument();
    expect(screen.getByText("yesterday")).toBeInTheDocument();
  });
});
