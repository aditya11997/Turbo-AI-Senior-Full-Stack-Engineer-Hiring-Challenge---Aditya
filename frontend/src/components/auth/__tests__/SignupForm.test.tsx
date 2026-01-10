import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import SignupForm from "../SignupForm";

const pushMock = vi.fn();
const registerUserMock = vi.fn();
const storeTokensMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock })
}));

vi.mock("../../../lib/api", () => ({
  registerUser: (...args: unknown[]) => registerUserMock(...args)
}));

vi.mock("../../../lib/auth", () => ({
  storeTokens: (...args: unknown[]) => storeTokensMock(...args)
}));

describe("SignupForm", () => {
  beforeEach(() => {
    registerUserMock.mockReset();
    storeTokensMock.mockReset();
    pushMock.mockReset();
  });

  it("submits and stores tokens", async () => {
    registerUserMock.mockResolvedValueOnce({
      tokens: { access: "access", refresh: "refresh" },
      ui: { landing_route: "/notes" }
    });

    render(<SignupForm />);

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" }
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" }
    });

    fireEvent.submit(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(registerUserMock).toHaveBeenCalledWith(
        "test@example.com",
        "password123"
      );
      expect(storeTokensMock).toHaveBeenCalledWith("access", "refresh");
      expect(pushMock).toHaveBeenCalledWith("/notes");
    });
  });

  it("shows error on failure", async () => {
    registerUserMock.mockRejectedValueOnce(new Error("Bad"));

    render(<SignupForm />);

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" }
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" }
    });

    fireEvent.submit(screen.getByRole("button", { name: /sign up/i }));

    expect(await screen.findByText("Bad")).toBeInTheDocument();
  });
});
