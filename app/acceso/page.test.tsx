// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import AccesoPage, { metadata } from "./page";
import { access } from "@/lib/content";

afterEach(cleanup);

const source = readFileSync(resolve(process.cwd(), "app/acceso/page.tsx"), "utf8");

describe("the fields are properly labelled", () => {
  for (const [name, type] of [
    ["emailLabel", "email"],
    ["passwordLabel", "password"],
  ] as const) {
    it(`associates the ${type} field with its label`, () => {
      render(<AccesoPage />);

      const label = access.login[name];
      const field = screen.getByLabelText(label);

      expect(field.tagName).toBe("INPUT");
      expect(field.getAttribute("type")).toBe(type);
    });
  }

  /**
   * A placeholder is not a label: it disappears the moment someone types, and
   * assistive technology does not announce it as the field's name.
   */
  it("uses no placeholder in place of a label", () => {
    const { container } = render(<AccesoPage />);

    for (const input of container.querySelectorAll("input")) {
      expect(input.getAttribute("placeholder")).toBeNull();
      expect(input.id).not.toBe("");
    }
  });

  it("tells the password manager which field is which", () => {
    render(<AccesoPage />);

    expect(screen.getByLabelText(access.login.emailLabel).getAttribute("autocomplete")).toBe(
      "email",
    );
    expect(screen.getByLabelText(access.login.passwordLabel).getAttribute("autocomplete")).toBe(
      "current-password",
    );
  });
});

/**
 * 6.7 — the screen authenticates nothing, and the submit control is inert.
 *
 * The detail that matters is the absence of a `<form>`: one with no action
 * submits by GET, which would put the password in the URL and from there into
 * browser history, server logs and referrer headers.
 */
describe("the screen is inert (6.7)", () => {
  it("renders no form at all", () => {
    const { container } = render(<AccesoPage />);

    expect(container.querySelector("form")).toBeNull();
  });

  it("gives the submit control type button, never submit", () => {
    render(<AccesoPage />);

    const control = screen.getByRole("button", { name: access.login.submitLabel });
    expect(control.getAttribute("type")).toBe("button");
  });

  it("wires no handler and opens no session", () => {
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
    render(<AccesoPage />);

    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]!.textContent).toBe(access.login.title);
  });

  it("offers the forgotten password link with a real destination", () => {
    render(<AccesoPage />);

    const link = screen.getByRole("link", { name: access.login.forgotLabel });
    expect(link.getAttribute("href")).toBe(access.login.forgotHref);
    expect(link.getAttribute("href")).not.toBe("#");
  });

  it("shows the subtitle and the protocol note", () => {
    render(<AccesoPage />);

    expect(screen.getByText(access.login.subtitle)).not.toBeNull();
    expect(screen.getByText(access.login.protocol)).not.toBeNull();
  });

  it("suppresses navigation: the bar carries the brand and no links", () => {
    const { container } = render(<AccesoPage />);

    expect(container.querySelector("header")).not.toBeNull();
    expect(container.querySelectorAll("header a")).toHaveLength(0);
    expect(container.querySelector("nav")).toBeNull();
  });

  it("hides the decorative grid from assistive technology (9.3)", () => {
    const { container } = render(<AccesoPage />);

    const decoration = container.querySelector("main > [aria-hidden='true']");
    expect(decoration).not.toBeNull();
    expect(decoration!.textContent).toBe("");
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
