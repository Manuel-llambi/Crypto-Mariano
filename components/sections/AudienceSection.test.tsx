// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AudienceSection } from "./AudienceSection";

afterEach(cleanup);

const audience = [
  { icon: "shield", title: "Fuerzas del orden", description: "Oficiales y agentes." },
  { icon: "scale", title: "Profesionales legales", description: "Fiscales y abogados." },
  { icon: "clipboard-check", title: "Equipos de cumplimiento", description: "Oficiales ALD/KYC." },
  { icon: "magnifier", title: "Investigadores", description: "Analistas forenses." },
];

describe("the four profiles (2.4)", () => {
  it("renders every profile received", () => {
    render(<AudienceSection audience={audience} />);

    for (const profile of audience) {
      expect(screen.getByText(profile.title)).not.toBeNull();
      expect(screen.getByText(profile.description)).not.toBeNull();
    }
  });

  it("renders exactly as many cards as profiles", () => {
    const { container } = render(<AudienceSection audience={audience} />);

    expect(container.querySelectorAll("article")).toHaveLength(4);
  });

  it("keeps the order received", () => {
    render(<AudienceSection audience={audience} />);

    const titles = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(titles).toEqual(audience.map((profile) => profile.title));
  });
});

// 9.3 — the glyph carries no information the title does not already give.
describe("decorative icons are hidden from assistive technology (9.3)", () => {
  it("marks every icon aria-hidden", () => {
    const { container } = render(<AudienceSection audience={audience} />);

    const icons = container.querySelectorAll("[data-icon]");
    expect(icons).toHaveLength(4);
    for (const icon of icons) {
      expect(icon.getAttribute("aria-hidden")).toBe("true");
    }
  });

  it("gives the icons no alternative text", () => {
    const { container } = render(<AudienceSection audience={audience} />);

    for (const icon of container.querySelectorAll("[data-icon]")) {
      expect(icon.getAttribute("alt")).toBeNull();
      expect(icon.getAttribute("aria-label")).toBeNull();
      expect(icon.textContent).toBe("");
    }
  });

  it("does not leak the icon slug into the accessible text", () => {
    render(<AudienceSection audience={audience} />);

    expect(screen.queryByText("shield")).toBeNull();
  });
});

describe("heading structure (9.2)", () => {
  it("titles the section with a level two heading and the cards with level three", () => {
    render(<AudienceSection audience={audience} />);

    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(1);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(4);
    expect(screen.queryAllByRole("heading", { level: 1 })).toHaveLength(0);
  });
});

describe("the section as an anchor destination (1.2)", () => {
  it("carries the audiencia identifier", () => {
    const { container } = render(<AudienceSection audience={audience} />);

    expect(container.querySelector("section")?.id).toBe("audiencia");
  });
});
