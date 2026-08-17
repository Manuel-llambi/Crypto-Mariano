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
  lockedBadge: "Bloqueado",
  lockedPrefix: "Requiere",
};

const modules: PanelModule[] = [
  { code: "EXP-00", title: "Fundamentos", state: "passed", requiresCode: null },
  { code: "EXP-01", title: "Bitcoin", state: "in-progress", requiresCode: null },
  { code: "EXP-02", title: "Ethereum", state: "locked", requiresCode: "EXP-01" },
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
