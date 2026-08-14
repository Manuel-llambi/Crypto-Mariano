// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AccessScreen } from "./AccessScreen";

afterEach(cleanup);

const source = readFileSync(resolve(process.cwd(), "components/sections/AccessScreen.tsx"), "utf8");

function renderScreen(submitHref?: string) {
  return render(
    <AccessScreen
      siteName="Crypto Crime Academy"
      title="Un título"
      subtitle="Un subtítulo"
      protocol="Protocolo: PRUEBA"
      submitLabel="Continuar"
      submitHref={submitHref}
    >
      <input aria-label="Un campo" />
    </AccessScreen>,
  );
}

/**
 * The two shapes of the control, and the reason they are two.
 *
 * A screen that advances gets an anchor, which the browser follows on its own.
 * A screen that is the end of the road gets a button that does nothing. What
 * neither of them gets is a `<form>`: one with no action submits by GET and
 * puts every field into the query string, which is how a password reaches
 * browser history, server logs and the referrer of the next request.
 */
describe("the submit control", () => {
  it("is an anchor to the next step when the screen advances", () => {
    renderScreen("/registro/codigo");

    const control = screen.getByRole("link", { name: "Continuar" });
    expect(control.tagName).toBe("A");
    expect(control.getAttribute("href")).toBe("/registro/codigo");
  });

  it("is an inert button when the screen leads nowhere", () => {
    renderScreen();

    const control = screen.getByRole("button", { name: "Continuar" });
    expect(control.getAttribute("type")).toBe("button");
    expect(screen.queryByRole("link", { name: "Continuar" })).toBeNull();
  });

  it("renders no form in either shape (6.7)", () => {
    const withHref = renderScreen("/registro/codigo");
    expect(withHref.container.querySelector("form")).toBeNull();
    cleanup();

    const withoutHref = renderScreen();
    expect(withoutHref.container.querySelector("form")).toBeNull();
  });
});

describe("the card", () => {
  it("presents the title as the only first level heading", () => {
    renderScreen();

    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]!.textContent).toBe("Un título");
  });

  it("shows the subtitle and the protocol note", () => {
    renderScreen();

    expect(screen.getByText("Un subtítulo")).not.toBeNull();
    expect(screen.getByText("Protocolo: PRUEBA")).not.toBeNull();
  });

  it("renders the fields it is given", () => {
    renderScreen();

    expect(screen.getByLabelText("Un campo")).not.toBeNull();
  });

  it("suppresses navigation: the bar carries the brand and no links", () => {
    const { container } = renderScreen();

    expect(container.querySelector("header")).not.toBeNull();
    expect(container.querySelectorAll("header a")).toHaveLength(0);
    expect(container.querySelector("nav")).toBeNull();
  });

  it("hides the decorative grid from assistive technology (9.3)", () => {
    const { container } = renderScreen();

    const decoration = container.querySelector("main > [aria-hidden='true']");
    expect(decoration).not.toBeNull();
    expect(decoration!.textContent).toBe("");
  });
});

// 8.1 — the four screens that share this card ship no JavaScript of their own.
it("wires no handler and opens no session", () => {
  const code = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

  expect(code).not.toContain("use client");
  expect(code).not.toContain("onSubmit");
  expect(code).not.toContain("onClick");
  expect(code).not.toContain("useState");
  expect(code).not.toContain("fetch");
  expect(code).not.toContain("cookies");
});
