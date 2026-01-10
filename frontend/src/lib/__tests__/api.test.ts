import { beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "../api";
import { clearTokens, storeTokens } from "../auth";

type MockResponse = {
  ok: boolean;
  status: number;
  json?: () => Promise<unknown>;
  text?: () => Promise<string>;
};

const createResponse = (options: MockResponse): Response =>
  options as unknown as Response;

describe("api helper", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8000/api";
    clearTokens();
    vi.restoreAllMocks();
  });

  it("attaches Authorization header when access token exists", async () => {
    storeTokens("access-token", "refresh-token");

    const fetchMock = vi.fn().mockResolvedValue(
      createResponse({
        ok: true,
        status: 200,
        json: async () => ({ ok: true })
      })
    );
    global.fetch = fetchMock as typeof fetch;

    await api.get("/notes/summary");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/api/notes/summary",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer access-token"
        })
      })
    );
  });

  it("refreshes token on 401 and retries once", async () => {
    storeTokens("expired-token", "refresh-token");

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        createResponse({
          ok: false,
          status: 401,
          text: async () => "Unauthorized"
        })
      )
      .mockResolvedValueOnce(
        createResponse({
          ok: true,
          status: 200,
          json: async () => ({ access: "new-token" })
        })
      )
      .mockResolvedValueOnce(
        createResponse({
          ok: true,
          status: 200,
          json: async () => ({ ok: true })
        })
      );
    global.fetch = fetchMock as typeof fetch;

    await api.get("/notes/summary");

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "http://localhost:8000/api/auth/refresh",
      expect.objectContaining({
        method: "POST"
      })
    );

    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "http://localhost:8000/api/notes/summary",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer new-token"
        })
      })
    );
  });

  it("redirects to login on 401 without refresh token", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createResponse({
        ok: false,
        status: 401,
        text: async () => "Unauthorized"
      })
    );
    global.fetch = fetchMock as typeof fetch;

    await expect(api.get("/notes/summary")).rejects.toThrow("Unauthorized");
    expect(window.location.href).toBe("/login");
  });
});
