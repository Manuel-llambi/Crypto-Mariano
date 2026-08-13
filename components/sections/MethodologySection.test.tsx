// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { MethodologySection } from "./MethodologySection";

afterEach(cleanup);

const methodology = [
  { title: "Grado institucional", description: "Plan de estudios en consulta con fiscales." },
  { title: "Basado en evidencia", description: "Informes admisibles en tribunales." },
];

describe("the two blocks (2.4)", () => {
  it("renders both blocks received", () => {
    render(<MethodologySection methodology={methodology} />);

    for (const block of methodology) {
      expect(screen.getByText(block.title)).not.toBeNull();
      expect(screen.getByText(block.description)).not.toBeNull();
    }
  });

  it("renders exactly as many blocks as received", () => {
    const { container } = render(<MethodologySection methodology={methodology} />);

    expect(container.querySelectorAll("article")).toHaveLength(2);
  });

  it("keeps the order received", () => {
    render(<MethodologySection methodology={methodology} />);

    const titles = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(titles).toEqual(methodology.map((block) => block.title));
  });
});

describe("heading structure (9.2)", () => {
  it("uses one level two heading and one level three per block", () => {
    render(<MethodologySection methodology={methodology} />);

    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(1);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(2);
  });
});

describe("the section as an anchor destination (1.2)", () => {
  it("carries the metodologia identifier", () => {
    const { container } = render(<MethodologySection methodology={methodology} />);

    expect(container.querySelector("section")?.id).toBe("metodologia");
  });
});
