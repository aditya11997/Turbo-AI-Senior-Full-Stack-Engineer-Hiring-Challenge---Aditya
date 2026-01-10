import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import React from "react";
import { afterEach, vi } from "vitest";

(globalThis as typeof globalThis & { React?: typeof React }).React = React;

afterEach(() => {
  cleanup();
});

vi.mock("next/font/google", () => {
  const mockFont = () => ({
    className: "mock-font",
    variable: "mock-font-variable",
  });

  return {
    Inter: mockFont,
    Inria_Serif: mockFont,
  };
});

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: { src: string; alt?: string }) =>
    React.createElement("img", {
      src: props.src,
      alt: props.alt ?? ""
    })
}));

Object.defineProperty(window, "location", {
  value: { href: "" },
  writable: true
});
