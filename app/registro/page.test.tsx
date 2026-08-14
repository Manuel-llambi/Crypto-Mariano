// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import RegistroPage, { metadata } from "./page";
import { access } from "@/lib/content";
import { SIGNUP_CODE_HREF } from "@/lib/routes";

afterEach(cleanup);

const source = readFileSync(resolve(process.cwd(), "app/registro/page.tsx"), "utf8");
const { email } = access.signup;

describe("the screen asks for one thing", () => {
  it("associates the e-mail field with its label", () => {
    render(<RegistroPage />);

    const field = screen.getByLabelText(email.emailLabel);

    expect(field.tagName).toBe("INPUT");
    expect(field.getAttribute("type")).toBe("email");
    expect(field.getAttribute("autocomplete")).toBe("email");
  });

  /** The step exists to collect an address. A second field would be a second question. */
  it("collects the address and nothing else", () => {
    const { container } = render(<RegistroPage />);

    const inputs = [...container.querySelectorAll("input")];
    expect(inputs).toHaveLength(1);
    expect(container.querySelector('input[type="password"]')).toBeNull();
  });

  it("uses no placeholder in place of a label", () => {
    const { container } = render(<RegistroPage />);

    for (const input of container.querySelectorAll("input")) {
      expect(input.getAttribute("placeholder")).toBeNull();
      expect(input.id).not.toBe("");
    }
  });
});

/**
 * The control advances to the code step, and it does it as a link.
 *
 * Nothing is sent here — 6.7 — so the address typed above is left behind on
 * purpose. What matters is that the navigation is the browser's, not a
 * script's (6.3, 8.3), and that the field value never reaches the URL.
 */
describe("the control advances to the code step", () => {
  it("points at the verification screen", () => {
    render(<RegistroPage />);

    const control = screen.getByRole("link", { name: email.submitLabel });

    expect(control.getAttribute("href")).toBe(SIGNUP_CODE_HREF);
    expect(control.getAttribute("href")).toBe("/registro/codigo");
  });

  it("renders no form and no button that could submit one", () => {
    const { container } = render(<RegistroPage />);

    expect(container.querySelector("form")).toBeNull();
    expect(container.querySelector("button")).toBeNull();
  });

  it("wires no handler and sends no code", () => {
    const code = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

    expect(code).not.toContain("use client");
    expect(code).not.toContain("onSubmit");
    expect(code).not.toContain("onClick");
    expect(code).not.toContain("useState");
    expect(code).not.toContain("fetch");
    expect(code).not.toContain("cookies");
  });
});

describe("the rest of the screen", () => {
  it("presents the title as the only first level heading", () => {
    render(<RegistroPage />);

    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]!.textContent).toBe(email.title);
  });

  it("shows the subtitle and the protocol note", () => {
    render(<RegistroPage />);

    expect(screen.getByText(email.subtitle)).not.toBeNull();
    expect(screen.getByText(email.protocol)).not.toBeNull();
  });
});

// A shell that collects nothing has no business in a search result.
describe("metadata", () => {
  it("asks search engines not to index the screen", () => {
    const robots = metadata.robots as { index?: boolean; follow?: boolean };

    expect(robots.index).toBe(false);
    expect(robots.follow).toBe(false);
  });
});
