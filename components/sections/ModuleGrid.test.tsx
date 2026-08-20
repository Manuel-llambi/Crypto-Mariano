// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ModuleGrid } from "./ModuleGrid";
import type { PanelModule } from "@/lib/panel/derive";

afterEach(cleanup);

const source = readFileSync(resolve(process.cwd(), "components/sections/ModuleGrid.tsx"), "utf8");

const copy = {
  filterLabel: "Filtrar",
  passedBadge: "Completado",
  passedLabel: "Aprobado",
  currentBadge: "En curso",
  availableBadge: "Disponible",
  availableLabel: "Sin comenzar",
  lockedBadge: "Bloqueado",
  lockedPrefix: "Requiere",
};

const modules: PanelModule[] = [
  { code: "EXP-00", title: "Fundamentos", state: "passed", requiresCode: null },
  { code: "EXP-01", title: "Bitcoin", state: "in-progress", requiresCode: null },
  { code: "EXP-02", title: "Ethereum", state: "locked", requiresCode: "EXP-01" },
];

/** A student who has not opened anything: the first module open, the rest shut. */
const untouched: PanelModule[] = [
  { code: "EXP-00", title: "Fundamentos", state: "available", requiresCode: null },
  { code: "EXP-01", title: "Bitcoin", state: "locked", requiresCode: "EXP-00" },
];

function renderGrid() {
  return render(<ModuleGrid copy={copy} modules={modules} currentPercent={40} />);
}

describe("the grid", () => {
  it("renders one item per module, as a list", () => {
    const { container } = renderGrid();

    expect(container.querySelectorAll("li")).toHaveLength(3);
  });

  it("shows the code and the title of each module", () => {
    renderGrid();

    for (const module of modules) {
      expect(screen.getByText(module.code)).not.toBeNull();
      expect(screen.getByText(module.title)).not.toBeNull();
    }
  });
});

/**
 * 9.4 — state is never carried by colour alone.
 *
 * Every card writes its state out: the badge names it, and the footer says
 * «Aprobado» or «Requiere EXP-NN». Someone who cannot tell the dashed border
 * from the solid one still reads which module is locked.
 */
describe("each state is written out, not only painted", () => {
  it("labels the passed module and states that it is approved", () => {
    renderGrid();

    expect(screen.getByText(copy.passedBadge)).not.toBeNull();
    expect(screen.getByText(copy.passedLabel)).not.toBeNull();
  });

  it("labels the module in progress", () => {
    renderGrid();

    expect(screen.getByText(copy.currentBadge)).not.toBeNull();
  });

  it("names the module that unlocks a locked one", () => {
    renderGrid();

    expect(screen.getByText(copy.lockedBadge)).not.toBeNull();
    expect(screen.getByText("Requiere EXP-01")).not.toBeNull();
  });

  it("labels the module the student may open but has not, and says so", () => {
    render(<ModuleGrid copy={copy} modules={untouched} currentPercent={0} />);

    expect(screen.getByText(copy.availableBadge)).not.toBeNull();
    expect(screen.getByText(copy.availableLabel)).not.toBeNull();
  });
});

/**
 * A bar at 0% reads as a module barely begun, which is a different claim from a
 * module never opened. The available card states the second one in words and
 * draws no bar at all.
 */
describe("a module that has not been opened", () => {
  it("draws no progress bar", () => {
    const { container } = render(
      <ModuleGrid copy={copy} modules={untouched} currentPercent={0} />,
    );

    expect(container.querySelector("[style*='--percent']")).toBeNull();
  });

  it("does not call itself «en curso»", () => {
    render(<ModuleGrid copy={copy} modules={untouched} currentPercent={0} />);

    expect(screen.queryByText(copy.currentBadge)).toBeNull();
  });
});

describe("the progress bar of the module in progress", () => {
  it("carries the share as a custom property, already resolved in the markup", () => {
    const { container } = renderGrid();

    const bar = container.querySelector("[aria-hidden='true'][style]") as HTMLElement | null;

    expect(bar).not.toBeNull();
    expect(bar!.style.getPropertyValue("--percent")).toBe("40%");
  });

  // It repeats the badge, so announcing it would say «en curso» twice (9.3).
  it("is hidden from assistive technology", () => {
    const { container } = renderGrid();

    expect(container.querySelector("[style*='--percent']")!.getAttribute("aria-hidden")).toBe(
      "true",
    );
  });
});

// 8.1
it("wires no handler", () => {
  const code = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

  expect(code).not.toContain("use client");
  expect(code).not.toContain("useState");
  expect(code).not.toContain("useEffect");
  expect(code).not.toContain("onClick");
  expect(code).not.toContain("addEventListener");
});
