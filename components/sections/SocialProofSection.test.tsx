// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { SocialProofSection } from "./SocialProofSection";

afterEach(cleanup);

const socialProof = {
  title: "Confianza institucional",
  description: "Descripción de la sección.",
  seals: [
    { icon: "seal-doj", name: "Sello uno", detail: "Detalle uno." },
    { icon: "seal-interpol", name: "Sello dos", detail: "Detalle dos." },
    { icon: "seal-banks", name: "Sello tres", detail: "Detalle tres." },
  ],
  metrics: [
    { value: "5000+", label: "investigadores" },
    { value: "120+", label: "agencias" },
  ],
};

describe("three seals and two metrics (2.4)", () => {
  it("renders the three seals received", () => {
    const { container } = render(<SocialProofSection socialProof={socialProof} />);

    expect(container.querySelectorAll("[data-testid='seal']")).toHaveLength(3);
    for (const seal of socialProof.seals) {
      expect(screen.getByText(seal.name)).not.toBeNull();
    }
  });

  it("renders the two metrics received", () => {
    const { container } = render(<SocialProofSection socialProof={socialProof} />);

    expect(container.querySelectorAll("[data-testid='metric']")).toHaveLength(2);
    for (const metric of socialProof.metrics) {
      expect(screen.getByText(metric.value)).not.toBeNull();
      expect(screen.getByText(metric.label)).not.toBeNull();
    }
  });

  it("renders the values exactly as received, without reformatting", () => {
    render(<SocialProofSection socialProof={socialProof} />);

    expect(screen.getByText("5000+").textContent).toBe("5000+");
    expect(screen.getByText("120+").textContent).toBe("120+");
  });

  it("keeps the order received", () => {
    const { container } = render(<SocialProofSection socialProof={socialProof} />);

    const names = [...container.querySelectorAll("[data-testid='seal']")].map(
      (seal) => seal.textContent,
    );
    expect(names).toEqual(socialProof.seals.map((seal) => `${seal.name}${seal.detail}`));
  });

  it("shows the title and the description received", () => {
    render(<SocialProofSection socialProof={socialProof} />);

    expect(screen.getByText(socialProof.title)).not.toBeNull();
    expect(screen.getByText(socialProof.description)).not.toBeNull();
  });
});

// 9.3 — the seal glyphs are placeholders and carry nothing the name does not.
describe("decorative seal icons are hidden from assistive technology (9.3)", () => {
  it("marks every seal icon aria-hidden", () => {
    const { container } = render(<SocialProofSection socialProof={socialProof} />);

    const icons = container.querySelectorAll("[data-icon]");
    expect(icons).toHaveLength(3);
    for (const icon of icons) {
      expect(icon.getAttribute("aria-hidden")).toBe("true");
      expect(icon.getAttribute("aria-label")).toBeNull();
      expect(icon.textContent).toBe("");
    }
  });
});

describe("heading structure (9.2)", () => {
  it("uses a single level two heading and no level one", () => {
    render(<SocialProofSection socialProof={socialProof} />);

    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(1);
    expect(screen.queryAllByRole("heading", { level: 1 })).toHaveLength(0);
  });
});

describe("the section as an anchor destination (1.2)", () => {
  it("carries the confianza identifier", () => {
    const { container } = render(<SocialProofSection socialProof={socialProof} />);

    expect(container.querySelector("section")?.id).toBe("confianza");
  });
});
