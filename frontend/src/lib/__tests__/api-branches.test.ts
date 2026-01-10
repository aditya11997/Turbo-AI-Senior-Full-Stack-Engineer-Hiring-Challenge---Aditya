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

describe("api helper branches", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8000/api";
    clearTokens();
    vi.restoreAllMocks();
  });

  it("throws error on non-OK response", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createResponse({
        ok: false,
        status: 500,
        text: async () => "Boom"
      })
    );
    global.fetch = fetchMock as typeof fetch;

    await expect(api.get("/notes/summary")).rejects.toThrow("Boom");
  });

  it("returns undefined on 204", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createResponse({
        ok: true,
        status: 204,
        text: async () => ""
      })
    );
    global.fetch = fetchMock as typeof fetch;

    const result = await api.delete("/notes/1");
    expect(result).toBeUndefined();
  });

  it("redirects on refresh failure", async () => {
    storeTokens("expired", "refresh");

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
          ok: false,
          status: 400,
          text: async () => "Bad refresh"
        })
      );
    global.fetch = fetchMock as typeof fetch;

    await expect(api.get("/notes/summary")).rejects.toThrow("Unauthorized");
    expect(window.location.href).toBe("/login");
  });
});
