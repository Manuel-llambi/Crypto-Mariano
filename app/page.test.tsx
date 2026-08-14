// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import HomePage from "./page";
import { SECTION_IDS } from "@/lib/nav/sections";

afterEach(cleanup);

/** Renders the real page, with the real content of the repository. */
function renderPage() {
  return render(<HomePage />);
}

describe("the ten blocks, in order (1.1)", () => {
  it("renders header, hero, the six sections, the closing block and the footer", () => {
    const { container } = renderPage();

    expect(container.querySelector("header")).not.toBeNull();
    expect(container.querySelector("footer")).not.toBeNull();
    // Hero and the closing block have no anchor id, so the count is six named
    // sections plus those two.
    expect(container.querySelectorAll("section")).toHaveLength(SECTION_IDS.length + 2);
  });

  it("places the navigable sections in the declared document order", () => {
    const { container } = renderPage();

    const ids = [...container.querySelectorAll("section[id]")].map((section) => section.id);
    expect(ids).toEqual([...SECTION_IDS]);
  });

  it("opens with the header and closes with the footer", () => {
    const { container } = renderPage();

    const landmarks = [...container.querySelectorAll("header, section, footer")];
    expect(landmarks.at(0)!.tagName).toBe("HEADER");
    expect(landmarks.at(-1)!.tagName).toBe("FOOTER");
  });

  it("puts the hero before every navigable section", () => {
    const { container } = renderPage();

    const sections = [...container.querySelectorAll("section")];
    const firstNamed = sections.findIndex((section) => section.id !== "");
    expect(firstNamed).toBe(1);
  });
});

describe("every section is a unique anchor destination (1.2)", () => {
  it("renders exactly one element per section identifier", () => {
    const { container } = renderPage();

    for (const id of SECTION_IDS) {
      expect(container.querySelectorAll(`#${id}`)).toHaveLength(1);
    }
  });

  it("renders no section identifier that is not declared", () => {
    const { container } = renderPage();

    const ids = [...container.querySelectorAll("section[id]")].map((section) => section.id);
    for (const id of ids) {
      expect(SECTION_IDS).toContain(id);
    }
  });
});

// 1.5 — this is the test that turns a broken anchor into an automatic failure.
describe("no anchor points at nothing (1.5)", () => {
  it("resolves every fragment link to an element of the page", () => {
    const { container } = renderPage();

    const fragments = [...container.querySelectorAll('a[href^="#"]')].map((link) =>
      link.getAttribute("href")!.slice(1),
    );

    expect(fragments.length).toBeGreaterThan(0);
    for (const fragment of fragments) {
      expect(container.querySelector(`#${fragment}`)).not.toBeNull();
    }
  });

  /**
   * The header owns in-page navigation; the footer links pages and an address.
   * This used to require anchors in both, which the finished design moved away
   * from — so it now states where they live and where they must not.
   */
  it("puts the section anchors in the header and not in the footer", () => {
    const { container } = renderPage();

    expect(container.querySelectorAll('header a[href^="#"]').length).toBeGreaterThan(0);
    expect(container.querySelectorAll('footer a[href^="#"]')).toHaveLength(0);
  });
});

describe("the page is fed by the validated content (2.2)", () => {
  it("renders the real syllabus, with its derived codes", () => {
    const { container } = renderPage();

    const codes = [...container.querySelectorAll("[data-testid='module-code']")].map(
      (code) => code.textContent,
    );
    expect(codes.length).toBeGreaterThan(0);
    expect(codes).toEqual(codes.map((_, index) => `EXP-${String(index).padStart(2, "0")}`));
  });
});
