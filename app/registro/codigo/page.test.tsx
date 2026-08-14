// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import RegistroCodigoPage, { metadata } from "./page";
import { access } from "@/lib/content";
import { SIGNUP_ACCOUNT_HREF, SIGNUP_HREF } from "@/lib/routes";

afterEach(cleanup);

const source = readFileSync(resolve(process.cwd(), "app/registro/codigo/page.tsx"), "utf8");
const { code } = access.signup;

describe("the code field", () => {
  it("is associated with its label", () => {
    render(<RegistroCodigoPage />);

    const field = screen.getByLabelText(code.codeLabel);

    expect(field.tagName).toBe("INPUT");
    expect(field.getAttribute("autocomplete")).toBe("one-time-code");
  });

  /**
   * `text`, not `number`. A verification code is a string of digits: `number`
   * brings a spinner, locale grouping and the silent loss of a leading zero.
   * `inputMode` is what gets the numeric keypad without any of that.
   */
  it("is text with a numeric keypad, never a number input", () => {
    render(<RegistroCodigoPage />);

    const field = screen.getByLabelText(code.codeLabel);

    expect(field.getAttribute("type")).toBe("text");
    expect(field.getAttribute("inputmode")).toBe("numeric");
  });

  it("asks for the code and nothing else", () => {
    const { container } = render(<RegistroCodigoPage />);

    expect([...container.querySelectorAll("input")]).toHaveLength(1);
    expect(container.querySelector('input[type="password"]')).toBeNull();
  });
});

describe("the two ways out", () => {
  it("advances to the account screen (the CTA)", () => {
    render(<RegistroCodigoPage />);

    const control = screen.getByRole("link", { name: code.submitLabel });

    expect(control.getAttribute("href")).toBe(SIGNUP_ACCOUNT_HREF);
    expect(control.getAttribute("href")).toBe("/registro/crear-cuenta");
  });

  it("offers a way back to ask for another code", () => {
    render(<RegistroCodigoPage />);

    const resend = screen.getByRole("link", { name: code.resendLabel });

    expect(resend.getAttribute("href")).toBe(SIGNUP_HREF);
    expect(resend.getAttribute("href")).not.toBe("#");
  });
});

/**
 * Nothing is verified here, and the tests say so out loud.
 *
 * The control advances whatever was typed, including nothing at all: checking
 * a code is server work, and 6.7 puts it out of scope for this repository.
 */
describe("the screen verifies nothing (6.7)", () => {
  it("renders no form and no button", () => {
    const { container } = render(<RegistroCodigoPage />);

    expect(container.querySelector("form")).toBeNull();
    expect(container.querySelector("button")).toBeNull();
  });

  it("wires no handler and checks no code", () => {
    const stripped = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

    expect(stripped).not.toContain("use client");
    expect(stripped).not.toContain("onSubmit");
    expect(stripped).not.toContain("onClick");
    expect(stripped).not.toContain("useState");
    expect(stripped).not.toContain("fetch");
    expect(stripped).not.toContain("cookies");
  });
});

describe("the rest of the screen", () => {
  it("presents the title as the only first level heading", () => {
    render(<RegistroCodigoPage />);

    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]!.textContent).toBe(code.title);
  });

  it("shows the subtitle and the protocol note", () => {
    render(<RegistroCodigoPage />);

    expect(screen.getByText(code.subtitle)).not.toBeNull();
    expect(screen.getByText(code.protocol)).not.toBeNull();
  });
});

describe("metadata", () => {
  it("asks search engines not to index the screen", () => {
    const robots = metadata.robots as { index?: boolean; follow?: boolean };

    expect(robots.index).toBe(false);
    expect(robots.follow).toBe(false);
  });
});
