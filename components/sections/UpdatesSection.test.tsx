// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { UpdatesSection } from "./UpdatesSection";

afterEach(cleanup);

const updates = [
  {
    date: "2026-07",
    title: "Revisión de análisis de blockchain",
    description: "Metodologías de análisis heurístico actualizadas.",
  },
  {
    date: "2026-04",
    title: "Actualización del protocolo de incautación",
    description: "Marcos legales revisados para órdenes de incautación.",
  },
  {
    date: "2025-11",
    title: "Nuevo módulo de trazado en cadena",
    description: "Trazado de fondos a través de mezcladores.",
  },
];

describe("the displayed label is derived from the stored date (2.6)", () => {
  it("renders the Spanish month and year of each ISO date", () => {
    render(<UpdatesSection updates={updates} />);

    expect(screen.getByText("JULIO 2026")).not.toBeNull();
    expect(screen.getByText("ABRIL 2026")).not.toBeNull();
    expect(screen.getByText("NOVIEMBRE 2025")).not.toBeNull();
  });

  it("never prints the raw ISO date", () => {
    const { container } = render(<UpdatesSection updates={updates} />);

    for (const update of updates) {
      expect(container.textContent).not.toContain(update.date);
    }
  });

  it("marks up the label as a machine readable date", () => {
    const { container } = render(<UpdatesSection updates={[updates[0]!]} />);

    // The visible text is derived; the ISO value stays in the markup for any
    // reader that wants the real date rather than the Spanish label.
    expect(container.querySelector("time")?.getAttribute("dateTime")).toBe("2026-07");
  });
});

describe("the section renders what it is given, untouched", () => {
  it("renders every update received", () => {
    render(<UpdatesSection updates={updates} />);

    for (const update of updates) {
      expect(screen.getByText(update.title)).not.toBeNull();
      expect(screen.getByText(update.description)).not.toBeNull();
    }
  });

  it("keeps the order it receives, without reordering or dropping any", () => {
    // Ordering is not this component's job: `lib/content/index.ts` sorts newest
    // first (2.7) and `lib/content/index.test.ts` proves it. What matters here
    // is that the section does not quietly rearrange that result.
    const { container } = render(<UpdatesSection updates={updates} />);

    const titles = [...container.querySelectorAll("article h3")].map(
      (heading) => heading.textContent,
    );
    expect(titles).toEqual(updates.map((update) => update.title));
  });

  it("renders a single update without complaint", () => {
    const { container } = render(<UpdatesSection updates={[updates[2]!]} />);

    expect(container.querySelectorAll("article")).toHaveLength(1);
    expect(screen.getByText("NOVIEMBRE 2025")).not.toBeNull();
  });
});

describe("the section as an anchor destination (1.2)", () => {
  it("carries the actualizaciones identifier", () => {
    const { container } = render(<UpdatesSection updates={updates} />);

    expect(container.querySelector("section")?.id).toBe("actualizaciones");
  });
});
