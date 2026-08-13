// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { FaqSection } from "./FaqSection";

afterEach(cleanup);

const faq = [
  { question: "¿Se requieren conocimientos técnicos previos?", answer: "No hacen falta." },
  { question: "¿Recibo una certificación al finalizar?", answer: "Sí, al completar el curso." },
  { question: "¿Está disponible para compra individual?", answer: "Todavía no." },
];

describe("every question is a closed disclosure (5.1)", () => {
  it("renders one details per question", () => {
    const { container } = render(<FaqSection faq={faq} />);

    expect(container.querySelectorAll("details")).toHaveLength(3);
  });

  it("starts every one closed", () => {
    const { container } = render(<FaqSection faq={faq} />);

    for (const details of container.querySelectorAll("details")) {
      expect(details.hasAttribute("open")).toBe(false);
    }
  });

  it("puts the question in the summary and the answer inside", () => {
    const { container } = render(<FaqSection faq={[faq[0]!]} />);

    const details = container.querySelector("details")!;
    expect(details.querySelector("summary")!.textContent).toBe(
      "¿Se requieren conocimientos técnicos previos?",
    );
    expect(within(details).getByText("No hacen falta.")).not.toBeNull();
  });
});

// 5.2 — opening one must leave the others as they were.
describe("the questions are independent (5.2)", () => {
  it("gives no details a name attribute", () => {
    const { container } = render(<FaqSection faq={faq} />);

    const all = [...container.querySelectorAll("details")];
    expect(all.some((details) => details.hasAttribute("name"))).toBe(false);
  });

  it("leaves an already open question open when another is opened", () => {
    const { container } = render(<FaqSection faq={faq} />);
    const [first, second] = [...container.querySelectorAll("details")];

    // Native <details> keeps its own state; without `name` there is nothing
    // that could close the first one.
    first!.setAttribute("open", "");
    second!.setAttribute("open", "");

    expect(first!.hasAttribute("open")).toBe(true);
    expect(second!.hasAttribute("open")).toBe(true);
  });
});

describe("completeness and order", () => {
  it("renders every question received, in order", () => {
    const { container } = render(<FaqSection faq={faq} />);

    const questions = [...container.querySelectorAll("summary")].map(
      (summary) => summary.textContent,
    );
    expect(questions).toEqual(faq.map((entry) => entry.question));
  });

  it("renders every answer received", () => {
    render(<FaqSection faq={faq} />);

    for (const entry of faq) {
      expect(screen.getByText(entry.answer)).not.toBeNull();
    }
  });
});

describe("the section as an anchor destination (1.2)", () => {
  it("carries the faq identifier", () => {
    const { container } = render(<FaqSection faq={faq} />);

    expect(container.querySelector("section")?.id).toBe("faq");
  });
});
