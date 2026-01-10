import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import TextField from "../TextField";

describe("TextField", () => {
  it("calls onChange with input value", () => {
    const handleChange = vi.fn();

    render(
      <TextField
        label="Email"
        name="email"
        value=""
        onChange={handleChange}
        placeholder="Email"
      />
    );

    const input = screen.getByPlaceholderText("Email");
    fireEvent.change(input, { target: { value: "test@example.com" } });

    expect(handleChange).toHaveBeenCalledWith("test@example.com");
  });
});
