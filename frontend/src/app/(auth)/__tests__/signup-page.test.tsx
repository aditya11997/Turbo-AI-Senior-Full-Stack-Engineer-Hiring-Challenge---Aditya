import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import SignupPage from "../signup/page";

vi.mock("../../../components/auth/SignupForm", () => ({
  default: () => <div>SignupForm</div>
}));

describe("Signup page", () => {
  it("renders form and title", () => {
    render(<SignupPage />);

    expect(screen.getByText("Yay, New Friend!")).toBeInTheDocument();
    expect(screen.getByText("SignupForm")).toBeInTheDocument();
  });
});
