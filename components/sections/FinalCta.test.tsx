// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { FinalCta } from "./FinalCta";

afterEach(cleanup);

const finalCta = {
  headline: "Empieza tu formación en investigación de criptoactivos",
  body: "Accede al temario completo y a las actualizaciones de cada módulo.",
  ctaLabel: "Inscríbete",
};

function enrolControl() {
  return screen.getByRole("link", { name: finalCta.ctaLabel });
}

describe("the enrolment control opens the signup flow (6.1)", () => {
  it("points at a destination carrying intent=signup", () => {
    render(<FinalCta finalCta={finalCta} />);

    const href = enrolControl().getAttribute("href")!;
    expect(new URL(href).searchParams.get("intent")).toBe("signup");
  });

  it("takes its wording from the content", () => {
    render(<FinalCta finalCta={finalCta} />);

    expect(enrolControl().textContent).toBe(finalCta.ctaLabel);
  });
});

describe("the control is a plain link (6.3)", () => {
  it("is an anchor with an href and not a button", () => {
    const { container } = render(<FinalCta finalCta={finalCta} />);

    expect(enrolControl().tagName).toBe("A");
    expect(container.querySelector("button")).toBeNull();
  });

  it("declares no click handler on the element", () => {
    render(<FinalCta finalCta={finalCta} />);

    expect(enrolControl().hasAttribute("onclick")).toBe(false);
  });
});

describe("the closing copy", () => {
  it("renders the headline as a second level heading", () => {
    render(<FinalCta finalCta={finalCta} />);

    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(finalCta.headline);
  });

  it("renders the body text", () => {
    render(<FinalCta finalCta={finalCta} />);

    expect(screen.getByText(finalCta.body)).not.toBeNull();
  });
});

describe("both enrolment controls agree (6.6)", () => {
  it("reaches the same destination the hero does", async () => {
    const { Hero } = await import("./Hero");

    render(<FinalCta finalCta={finalCta} />);
    const closing = enrolControl().getAttribute("href");
    cleanup();

    render(
      <Hero
        hero={{
          eyebrow: "e",
          headline: "h",
          subheadline: "s",
          ctaLabel: finalCta.ctaLabel,
          imageAlt: "a",
        }}
      />,
    );
    expect(enrolControl().getAttribute("href")).toBe(closing);
  });
});
