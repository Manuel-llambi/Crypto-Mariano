// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Hero } from "./Hero";

afterEach(cleanup);

const hero = {
  eyebrow: "Investigación forense de criptoactivos",
  headline: "Excelencia en investigación de criptoactivos",
  subheadline: "Un curso para equipos que siguen el rastro del dinero en cadena.",
  ctaLabel: "Inscríbete",
  imageAlt: "Panel de análisis forense de transacciones en cadena",
};

function enrolControl() {
  return screen.getByRole("link", { name: hero.ctaLabel });
}

describe("the enrolment control opens the signup flow (6.1)", () => {
  it("points at a destination carrying intent=signup", () => {
    render(<Hero hero={hero} />);

    const href = enrolControl().getAttribute("href")!;
    expect(new URL(href).searchParams.get("intent")).toBe("signup");
  });

  it("takes its wording from the content", () => {
    render(<Hero hero={hero} />);

    expect(enrolControl().textContent).toBe(hero.ctaLabel);
  });
});

describe("the control is a plain link (6.3)", () => {
  it("is an anchor with an href and not a button", () => {
    const { container } = render(<Hero hero={hero} />);

    expect(enrolControl().tagName).toBe("A");
    expect(container.querySelector("button")).toBeNull();
  });

  it("declares no click handler on the element", () => {
    render(<Hero hero={hero} />);

    // A React synthetic handler would not show up as an attribute, so this
    // asserts the observable half of 6.3: nothing is wired to intercept the
    // click, and the href alone is what navigates.
    expect(enrolControl().hasAttribute("onclick")).toBe(false);
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
