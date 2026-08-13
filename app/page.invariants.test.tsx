// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import HomePage from "./page";

afterEach(cleanup);

/**
 * Structural properties of the finished page.
 *
 * None of these can be guaranteed by a section on its own: they only exist once
 * everything is composed, which is why they are asserted here and not in the
 * component tests.
 */

/** The enrolment controls, identified by where they go rather than by position. */
function enrolmentControls(container: HTMLElement): HTMLAnchorElement[] {
  return [...container.querySelectorAll<HTMLAnchorElement>('a[href*="intent=signup"]')];
}

/** Every heading of the document, in order, as its level. */
function headingLevels(container: HTMLElement): number[] {
  return [...container.querySelectorAll("h1, h2, h3, h4, h5, h6")].map((heading) =>
    Number(heading.tagName.slice(1)),
  );
}

describe("the three enrolment controls say the same thing (6.6)", () => {
  it("renders exactly three of them", () => {
    const { container } = render(<HomePage />);

    expect(enrolmentControls(container)).toHaveLength(3);
  });

  it("gives all three the same wording", () => {
    const { container } = render(<HomePage />);

    const labels = enrolmentControls(container).map((control) => control.textContent);
    expect(new Set(labels).size).toBe(1);
  });

  it("gives them a wording at all", () => {
    const { container } = render(<HomePage />);

    for (const control of enrolmentControls(container)) {
      expect(control.textContent?.trim()).not.toBe("");
    }
  });

  it("sends all three to the same destination", () => {
    const { container } = render(<HomePage />);

    const destinations = enrolmentControls(container).map((control) => control.getAttribute("href"));
    expect(new Set(destinations).size).toBe(1);
  });
});

describe("heading hierarchy (9.2)", () => {
  it("presents exactly one first level heading", () => {
    const { container } = render(<HomePage />);

    expect(container.querySelectorAll("h1")).toHaveLength(1);
  });

  it("opens the document with that first level heading", () => {
    const { container } = render(<HomePage />);

    expect(headingLevels(container).at(0)).toBe(1);
  });

  it("never skips a level going down", () => {
    const { container } = render(<HomePage />);
    const levels = headingLevels(container);

    for (const [index, level] of levels.entries()) {
      if (index === 0) {
        continue;
      }
      // Going back up any number of levels is fine; going down more than one
      // step at a time leaves a gap in the outline.
      expect(level).toBeLessThanOrEqual(levels[index - 1]! + 1);
    }
  });

  it("has enough headings for the check to mean something", () => {
    const { container } = render(<HomePage />);

    expect(headingLevels(container).length).toBeGreaterThan(5);
  });
});
