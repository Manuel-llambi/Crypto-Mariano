// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { FinalCta } from "./FinalCta";

afterEach(cleanup);

const finalCta = {
  eyebrow: "SESSION_INITIALIZE_REQUEST",
  headline: "Empieza tu formación en investigación de criptoactivos",
  body: "Accede al temario completo y a las actualizaciones de cada módulo.",
  ctaLabel: "Inscríbete",
  footnote: "Seguridad de datos: entorno certificado AES-256",
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

describe("the closing copy", () => {
  it("renders the eyebrow label", () => {
    render(<FinalCta finalCta={finalCta} />);

    expect(screen.getByText(finalCta.eyebrow)).not.toBeNull();
  });

  it("renders the reassurance footnote", () => {
    render(<FinalCta finalCta={finalCta} />);

    expect(screen.getByText(finalCta.footnote)).not.toBeNull();
  });
});

/**
 * 6.6 — the closing control agrees with the syllabus one.
 *
 * The comparison used to be against the hero, which was wrong: in the finished
 * design the hero says «Explorar curso» and jumps to `#programa`. The three
 * controls that must agree are the header, the syllabus and this one.
 */
describe("the enrolment controls agree (6.6)", () => {
  it("reaches the same destination the syllabus control does", async () => {
    const { ProgramSection } = await import("./ProgramSection");
    const { deriveProgram } = await import("@/lib/program/derive");

    render(<FinalCta finalCta={finalCta} />);
    const closing = enrolControl().getAttribute("href");
    cleanup();

    render(
      <ProgramSection
        enrollLabel={finalCta.ctaLabel}
        program={deriveProgram({
          description: "d",
          modules: [{ status: "available", title: "m", videoMinutes: 10 }],
        })}
      />,
    );
    expect(enrolControl().getAttribute("href")).toBe(closing);
  });
});
