import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import LoginPage from "../login/page";

const pushMock = vi.fn();
const apiPostMock = vi.fn();
const storeTokensMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock })
}));

vi.mock("../../../lib/api", () => ({
  api: {
    post: (...args: unknown[]) => apiPostMock(...args)
  }
}));

vi.mock("../../../lib/auth", () => ({
  storeTokens: (...args: unknown[]) => storeTokensMock(...args)
}));

describe("Login page", () => {
  it("renders login title", () => {
    render(<LoginPage />);

    expect(screen.getByText("Yay, You're Back!")).toBeInTheDocument();
  });

  it("toggles password visibility", () => {
    render(<LoginPage />);

    const passwordInput = screen.getByPlaceholderText("Password");
    const toggle = screen.getByRole("button", {
      name: /toggle password visibility/i
    });

    expect(passwordInput).toHaveAttribute("type", "password");
    fireEvent.click(toggle);
    expect(passwordInput).toHaveAttribute("type", "text");
  });

  it("submits and redirects on success", async () => {
    apiPostMock.mockResolvedValueOnce({
      tokens: { access: "access", refresh: "refresh" }
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "me@example.com" }
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "secret" }
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(apiPostMock).toHaveBeenCalledWith("/auth/login", {
        email: "me@example.com",
        password: "secret"
      });
      expect(storeTokensMock).toHaveBeenCalledWith("access", "refresh");
      expect(pushMock).toHaveBeenCalledWith("/notes");
    });
  });

  it("shows error on failure", async () => {
    apiPostMock.mockRejectedValueOnce(new Error("Bad creds"));

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "me@example.com" }
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "secret" }
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(await screen.findByText("Bad creds")).toBeInTheDocument();
  });
});
