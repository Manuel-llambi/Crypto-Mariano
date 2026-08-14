// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import CrearCuentaPage, { metadata } from "./page";
import { access } from "@/lib/content";

afterEach(cleanup);

const source = readFileSync(resolve(process.cwd(), "app/registro/crear-cuenta/page.tsx"), "utf8");
const { account } = access.signup;

describe("the fields are properly labelled", () => {
  for (const [name, type] of [
    ["emailLabel", "email"],
    ["passwordLabel", "password"],
  ] as const) {
    it(`associates the ${type} field with its label`, () => {
      render(<CrearCuentaPage />);

      const field = screen.getByLabelText(account[name]);

      expect(field.tagName).toBe("INPUT");
      expect(field.getAttribute("type")).toBe(type);
    });
  }

  /**
   * `new-password`, not `current-password`: this is what tells a password
   * manager to offer to generate one rather than fill an account that does not
   * exist yet.
   */
  it("tells the password manager the account is a new one", () => {
    render(<CrearCuentaPage />);

    expect(screen.getByLabelText(account.emailLabel).getAttribute("autocomplete")).toBe("email");
    expect(screen.getByLabelText(account.passwordLabel).getAttribute("autocomplete")).toBe(
      "new-password",
    );
  });

  it("uses no placeholder in place of a label", () => {
    const { container } = render(<CrearCuentaPage />);

    for (const input of container.querySelectorAll("input")) {
      expect(input.getAttribute("placeholder")).toBeNull();
      expect(input.id).not.toBe("");
    }
  });
});

/**
 * 6.7 — the screen creates nothing, and the control is inert.
 *
 * This is the second screen of the four that holds a password, so it takes the
 * same shape as `/acceso`: no `<form>`, and a `type="button"` control. A form
 * with no action submits by GET and would put the password in the URL, from
 * where it reaches browser history, server logs and referrer headers.
 */
describe("the screen is inert (6.7)", () => {
  it("renders no form at all", () => {
    const { container } = render(<CrearCuentaPage />);

    expect(container.querySelector("form")).toBeNull();
  });

  it("gives the control type button, never submit, and no destination", () => {
    render(<CrearCuentaPage />);

    const control = screen.getByRole("button", { name: account.submitLabel });

    expect(control.getAttribute("type")).toBe("button");
    expect(screen.queryByRole("link", { name: account.submitLabel })).toBeNull();
  });

  it("wires no handler and creates no account", () => {
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
    render(<CrearCuentaPage />);

    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]!.textContent).toBe(account.title);
  });

  it("shows the subtitle and the protocol note", () => {
    render(<CrearCuentaPage />);

    expect(screen.getByText(account.subtitle)).not.toBeNull();
    expect(screen.getByText(account.protocol)).not.toBeNull();
  });
});

describe("metadata", () => {
  it("asks search engines not to index the screen", () => {
    const robots = metadata.robots as { index?: boolean; follow?: boolean };

    expect(robots.index).toBe(false);
    expect(robots.follow).toBe(false);
  });
});
