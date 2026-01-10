import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import PasswordField from "../PasswordField";

describe("PasswordField", () => {
  it("toggles visibility", () => {
    const handleChange = vi.fn();

    render(
      <PasswordField
        label="Password"
        name="password"
        value="secret"
        onChange={handleChange}
        placeholder="Password"
      />
    );

    const input = screen.getByPlaceholderText("Password") as HTMLInputElement;
    expect(input.type).toBe("password");

    const toggle = screen.getByLabelText(/show password/i);
    fireEvent.click(toggle);

    expect(input.type).toBe("text");
  });
});
