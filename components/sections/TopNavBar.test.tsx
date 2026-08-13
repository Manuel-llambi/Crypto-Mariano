// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { TopNavBar } from "./TopNavBar";
import type { NavItem } from "@/lib/nav/sections";

afterEach(cleanup);

const items: NavItem[] = [
  { label: "Audiencia", href: "#audiencia" },
  { label: "Programa", href: "#programa" },
  { label: "FAQ", href: "#faq" },
];

function renderNav(overrides: Partial<Parameters<typeof TopNavBar>[0]> = {}) {
  return render(
    <TopNavBar
      items={items}
      siteName="Crypto Crime Academy"
      enrollLabel="Inscríbete"
      loginLabel="Iniciar sesión"
      {...overrides}
    />,
  );
}

const source = readFileSync(resolve(process.cwd(), "components/sections/TopNavBar.tsx"), "utf8");
const stylesheet = readFileSync(
  resolve(process.cwd(), "components/sections/TopNavBar.module.css"),
  "utf8",
);

describe("navigation links come from the data (1.5)", () => {
  it("renders one link per item, with the href received", () => {
    renderNav();

    for (const item of items) {
      expect(screen.getByRole("link", { name: item.label }).getAttribute("href")).toBe(item.href);
    }
  });

  it("renders whatever items it is given, not a hardcoded list", () => {
    renderNav({ items: [{ label: "Confianza", href: "#confianza" }] });

    expect(screen.getByRole("link", { name: "Confianza" }).getAttribute("href")).toBe("#confianza");
    expect(screen.queryByRole("link", { name: "Programa" })).toBeNull();
  });

  it("writes no anchor of its own in the source", () => {
    expect(source).not.toContain('href="#');
  });

  it("shows the site name", () => {
    renderNav();

    expect(screen.getByText("Crypto Crime Academy")).not.toBeNull();
  });
});

// 6.2, 6.3 — both controls are ordinary hyperlinks carrying their intent.
describe("the two access controls (6.2, 6.3)", () => {
  it("points the login control at intent=login", () => {
    renderNav();

    const href = screen.getByRole("link", { name: "Iniciar sesión" }).getAttribute("href");
    expect(href).toContain("intent=login");
  });

  it("points the enrolment control at intent=signup", () => {
    renderNav();

    const href = screen.getByRole("link", { name: "Inscríbete" }).getAttribute("href");
    expect(href).toContain("intent=signup");
  });

  it("implements both as anchors, not buttons", () => {
    renderNav();

    for (const name of ["Iniciar sesión", "Inscríbete"]) {
      const control = screen.getByRole("link", { name });
      expect(control.tagName).toBe("A");
      expect(control.hasAttribute("href")).toBe(true);
    }
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("navigates with no script at all", () => {
    expect(source).not.toContain("onClick");
    expect(source).not.toContain("router");
    expect(source).not.toContain("use client");
  });
});

// 1.6 — highlight is hover and focus only; nothing tracks the scroll position.
describe("no active-section state (1.6)", () => {
  it("marks no item as current in the markup", () => {
    const { container } = render(
      <TopNavBar
        items={items}
        siteName="Crypto Crime Academy"
        enrollLabel="Inscríbete"
        loginLabel="Iniciar sesión"
      />,
    );

    expect(container.querySelector("[aria-current]")).toBeNull();
    expect(container.querySelector("[data-active]")).toBeNull();
  });

  it("observes nothing: no scroll listener, no observer, no state", () => {
    expect(source).not.toContain("IntersectionObserver");
    expect(source).not.toContain("addEventListener");
    expect(source).not.toContain("useState");
    expect(source).not.toContain("useEffect");
  });

  it("highlights through hover and focus-visible only", () => {
    expect(stylesheet).toContain(":hover");
    expect(stylesheet).toContain(":focus-visible");
  });
});

// 1.4 — declared here, verified in a real window in T24.
describe("the header sticks to the top (1.4)", () => {
  it("declares position sticky anchored to the top edge", () => {
    expect(stylesheet).toMatch(/position:\s*sticky/);
    expect(stylesheet).toMatch(/top:\s*0/);
  });

  it("renders a banner landmark", () => {
    renderNav();

    expect(screen.getByRole("banner")).not.toBeNull();
  });
});
