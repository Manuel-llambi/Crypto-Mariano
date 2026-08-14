// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ProgramSection } from "./ProgramSection";
import { deriveProgram, type ProgramInput } from "@/lib/program/derive";

afterEach(cleanup);

/** Builds the derived program the section receives, from a raw module list. */
function derived(modules: ProgramInput["modules"], description = "Descripción del programa") {
  return deriveProgram({ description, modules });
}

const available = { status: "available", title: "Introducción", videoMinutes: 35 } as const;
const withSummary = {
  status: "available",
  title: "Bitcoin y UTXO",
  summary: "Lo que se ve al desplegar.",
  videoMinutes: 45,
} as const;
const comingSoon = {
  status: "coming-soon",
  title: "Ethereum y EVM",
  teaser: "Adelanto del módulo.",
} as const;

describe("coming-soon modules (4.1, 4.2)", () => {
  it("shows the status label and the teaser permanently", () => {
    render(<ProgramSection enrollLabel="Inscríbete" program={derived([comingSoon])} />);

    expect(screen.getByText("Próximamente")).not.toBeNull();
    expect(screen.getByText("Adelanto del módulo.")).not.toBeNull();
  });

  it("renders no details and no disclosure control", () => {
    const { container } = render(<ProgramSection enrollLabel="Inscríbete" program={derived([comingSoon])} />);

    expect(container.querySelector("details")).toBeNull();
    expect(container.querySelector("summary")).toBeNull();
  });

  it("does not label an available module as coming soon", () => {
    render(<ProgramSection enrollLabel="Inscríbete" program={derived([available])} />);

    expect(screen.queryByText("Próximamente")).toBeNull();
  });
});

describe("available modules (4.3, 4.4)", () => {
  it("renders a closed details when the module has a summary", () => {
    const { container } = render(<ProgramSection enrollLabel="Inscríbete" program={derived([withSummary])} />);

    const details = container.querySelector("details");
    expect(details).not.toBeNull();
    expect(details!.hasAttribute("open")).toBe(false);
    expect(within(details!).getByText("Lo que se ve al desplegar.")).not.toBeNull();
  });

  it("renders no control when the module has no summary", () => {
    const { container } = render(<ProgramSection enrollLabel="Inscríbete" program={derived([available])} />);

    expect(container.querySelector("details")).toBeNull();
    expect(screen.getByText("Introducción")).not.toBeNull();
  });
});

// 4.5 — opening one must not close another, so no details may share a name.
describe("independent disclosures (4.5)", () => {
  it("gives no details a name attribute", () => {
    const { container } = render(
      <ProgramSection
        enrollLabel="Inscríbete"
        program={derived([
          withSummary,
          { ...withSummary, title: "Trazabilidad", summary: "Otro resumen." },
        ])}
      />,
    );

    const all = [...container.querySelectorAll("details")];
    expect(all).toHaveLength(2);
    expect(all.some((details) => details.hasAttribute("name"))).toBe(false);
  });
});

describe("order and codes (4.8)", () => {
  it("renders the modules in the order received", () => {
    render(<ProgramSection enrollLabel="Inscríbete" program={derived([available, comingSoon, withSummary])} />);

    const titles = screen
      .getAllByTestId("module-title")
      .map((element) => element.textContent);
    expect(titles).toEqual(["Introducción", "Ethereum y EVM", "Bitcoin y UTXO"]);
  });

  it("shows the derived code of each module without recomputing it", () => {
    render(<ProgramSection enrollLabel="Inscríbete" program={derived([available, comingSoon, withSummary])} />);

    const codes = screen.getAllByTestId("module-code").map((element) => element.textContent);
    expect(codes).toEqual(["EXP-00", "EXP-01", "EXP-02"]);
  });
});

describe("headline figures (3.5)", () => {
  it("announces the module count", () => {
    render(<ProgramSection enrollLabel="Inscríbete" program={derived([available, comingSoon])} />);

    expect(screen.getByTestId("module-count").textContent).toContain("2");
  });

  it("announces the duration when there is one", () => {
    render(<ProgramSection enrollLabel="Inscríbete" program={derived([available, withSummary])} />);

    expect(screen.getByTestId("duration")!.textContent).toContain("1 h 20 min");
  });

  it("announces no duration at all when every module is coming soon", () => {
    render(<ProgramSection enrollLabel="Inscríbete" program={derived([comingSoon])} />);

    expect(screen.queryByTestId("duration")).toBeNull();
    expect(screen.queryByText(/0\s*min/)).toBeNull();
  });
});

describe("the section as an anchor destination (1.2)", () => {
  it("carries the programa identifier", () => {
    const { container } = render(<ProgramSection enrollLabel="Inscríbete" program={derived([available])} />);

    expect(container.querySelector("section")?.id).toBe("programa");
  });

  it("shows the description it received", () => {
    render(<ProgramSection enrollLabel="Inscríbete" program={derived([available], "Qué cubre el curso.")} />);

    expect(screen.getByText("Qué cubre el curso.")).not.toBeNull();
  });
});
