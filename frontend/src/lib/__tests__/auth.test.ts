import { afterEach, describe, expect, it } from "vitest";

import { clearTokens, getAccessToken, getRefreshToken, storeTokens } from "../auth";

describe("auth helpers", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("stores and reads tokens", () => {
    storeTokens("access-token", "refresh-token");

    expect(getAccessToken()).toBe("access-token");
    expect(getRefreshToken()).toBe("refresh-token");
  });

  it("clears tokens", () => {
    storeTokens("access-token", "refresh-token");
    clearTokens();

    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  it("handles missing window safely", () => {
    const originalWindow = globalThis.window;
    // @ts-expect-error test-only override
    delete globalThis.window;

    storeTokens("access-token", "refresh-token");
    clearTokens();
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();

    globalThis.window = originalWindow;
  });
});
