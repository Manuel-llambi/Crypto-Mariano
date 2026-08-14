// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Hero } from "./Hero";

afterEach(cleanup);

const hero = {
  eyebrow: "Lex Forensica",
  headline: "Excelencia en investigación de criptoactivos",
  subheadline: "Un curso para equipos que siguen el rastro del dinero en cadena.",
  ctaLabel: "Explorar curso",
  imageAlt: "Panel de análisis forense de transacciones en cadena",
};

function heroControl() {
  return screen.getByRole("link", { name: hero.ctaLabel });
}

/**
 * The hero invites the visitor into the page, not out of it.
 *
 * In the finished design this button reads «Explorar curso» and jumps to the
 * syllabus. It is **not** one of the three enrolment controls of 6.6 — those are
 * the header, the syllabus and the closing block — and this suite used to assert
 * the opposite.
 */
describe("the hero control leads to the syllabus", () => {
  it("points at the programa section", () => {
    render(<Hero hero={hero} />);

    expect(heroControl().getAttribute("href")).toBe("#programa");
  });

  it("does not carry an enrolment intent", () => {
    render(<Hero hero={hero} />);

    expect(heroControl().getAttribute("href")).not.toContain("intent=");
  });

  it("takes its wording from the content", () => {
    render(<Hero hero={hero} />);

    expect(heroControl().textContent).toBe(hero.ctaLabel);
  });
});

describe("the control is a plain link (6.3)", () => {
  it("is an anchor with an href and not a button", () => {
    const { container } = render(<Hero hero={hero} />);

    expect(heroControl().tagName).toBe("A");
    expect(container.querySelector("button")).toBeNull();
  });

  it("declares no click handler on the element", () => {
    render(<Hero hero={hero} />);

    // A React synthetic handler would not show up as an attribute, so this
    // asserts the observable half of 6.3: nothing is wired to intercept the
    // click, and the href alone is what navigates.
    expect(heroControl().hasAttribute("onclick")).toBe(false);
  });
});

describe("the hero copy", () => {
  it("renders the headline as the only first level heading", () => {
    render(<Hero hero={hero} />);

    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]!.textContent).toBe(hero.headline);
  });

  it("renders the eyebrow and the subheadline", () => {
    render(<Hero hero={hero} />);

    expect(screen.getByText(hero.eyebrow)).not.toBeNull();
    expect(screen.getByText(hero.subheadline)).not.toBeNull();
  });
});

describe("the visual panel holds its space", () => {
  it("declares an explicit width and height", () => {
    render(<Hero hero={hero} />);

    // Reserved space is what keeps the layout from jumping when the panel has
    // nothing to paint yet.
    const panel = screen.getByRole("img", { name: hero.imageAlt });
    expect(panel.style.width).not.toBe("");
    expect(panel.style.height).not.toBe("");
  });

  it("names itself for assistive technology instead of staying silent", () => {
    render(<Hero hero={hero} />);

    expect(screen.getByRole("img", { name: hero.imageAlt })).not.toBeNull();
  });
});
