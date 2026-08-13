// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { NavPanel } from "./NavPanel";
import type { NavItem } from "@/lib/nav/sections";

afterEach(cleanup);

const items: NavItem[] = [
  { label: "Audiencia", href: "#audiencia" },
  { label: "Programa", href: "#programa" },
  { label: "FAQ", href: "#faq" },
];

const source = readFileSync(resolve(process.cwd(), "components/ui/NavPanel.tsx"), "utf8");

/**
 * The source with its comments removed.
 *
 * Asserting on raw text would make a prose comment that merely *mentions*
 * `history` fail a check about what the code does. The assertions below are
 * about behaviour, so they read the code only.
 */
const code = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
const stylesheet = readFileSync(
  resolve(process.cwd(), "components/ui/NavPanel.module.css"),
  "utf8",
);

describe("the panel groups the anchor links (7.2)", () => {
  it("renders one link per item, with the href received", () => {
    render(<NavPanel items={items} />);

    for (const item of items) {
      expect(screen.getByRole("link", { name: item.label }).getAttribute("href")).toBe(item.href);
    }
  });

  it("starts closed", () => {
    const { container } = render(<NavPanel items={items} />);

    expect(container.querySelector("details")!.hasAttribute("open")).toBe(false);
  });

  it("carries no name attribute, so it never fights another disclosure", () => {
    const { container } = render(<NavPanel items={items} />);

    expect(container.querySelector("details")!.hasAttribute("name")).toBe(false);
  });

  it("hides itself on wide screens, where the header shows the links inline", () => {
    expect(stylesheet).toMatch(/min-width:\s*1024px/);
  });
});

// 8.4 — opening must not depend on our JavaScript.
describe("opening needs no JavaScript (8.4)", () => {
  it("is native details with summary as its control", () => {
    const { container } = render(<NavPanel items={items} />);

    const details = container.querySelector("details");
    expect(details).not.toBeNull();
    expect(details!.querySelector("summary")).not.toBeNull();
  });

  it("puts every link inside the details", () => {
    const { container } = render(<NavPanel items={items} />);

    const details = container.querySelector("details")!;
    expect(details.querySelectorAll("a")).toHaveLength(items.length);
  });
});

// 7.3 — activating a link closes the panel.
describe("activating a link closes the panel (7.3)", () => {
  it("removes the open attribute when an anchor link is activated", () => {
    const { container } = render(<NavPanel items={items} />);
    const details = container.querySelector("details")!;
    details.setAttribute("open", "");

    fireEvent.click(screen.getByRole("link", { name: "Programa" }));

    expect(details.hasAttribute("open")).toBe(false);
  });

  it("leaves the panel alone when the click lands outside a link", () => {
    const { container } = render(<NavPanel items={items} />);
    const details = container.querySelector("details")!;
    details.setAttribute("open", "");

    fireEvent.click(container.querySelector("nav")!);

    expect(details.hasAttribute("open")).toBe(true);
  });
});

// 8.5 — the effect closes the panel and does nothing else.
describe("the client effect is the only degradation (8.5)", () => {
  it("is declared a client component, deliberately", () => {
    expect(source).toContain("use client");
  });

  it("takes on no other responsibility", () => {
    expect(code).not.toContain("preventDefault");
    expect(code).not.toContain("scrollIntoView");
    expect(code).not.toContain("history");
    expect(code).not.toContain("location");
    expect(code).not.toContain("fetch");
  });

  it("keeps no state of its own: the details owns whether it is open", () => {
    expect(code).not.toContain("useState");
  });

  it("removes the listener it added, so nothing outlives the panel", () => {
    expect(code).toContain("removeEventListener");
  });
});
