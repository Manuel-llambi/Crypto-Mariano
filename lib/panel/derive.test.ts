import { describe, expect, it } from "vitest";

import { derivePanel } from "./derive";
import { deriveProgram } from "@/lib/program/derive";
import type { PanelRecord } from "@/lib/content/schemas";

/** Four modules, so «before», «at» and «after» the current one all exist. */
const program = deriveProgram({
  description: "Un temario",
  modules: [
    { status: "available", title: "Fundamentos", summary: "Resumen del primero", videoMinutes: 35 },
    { status: "available", title: "Bitcoin", videoMinutes: 45 },
    { status: "coming-soon", title: "Ethereum", teaser: "Adelanto del tercero" },
    { status: "coming-soon", title: "Monero", teaser: "Adelanto del cuarto" },
  ],
});

const record: PanelRecord = {
  currentModuleIndex: 2,
  currentModulePercent: 40,
  overallPercent: 35,
  hoursSpent: 12.5,
  estimatedMinutes: 45,
  attachmentCount: 3,
};

describe("the state of each module", () => {
  it("passes everything before the current one, and locks everything after", () => {
    const { modules } = derivePanel(program.modules, record);

    expect(modules.map((module) => module.state)).toEqual([
      "passed",
      "passed",
      "in-progress",
      "locked",
    ]);
  });

  it("keeps the code and the title of the syllabus", () => {
    const { modules } = derivePanel(program.modules, record);

    expect(modules.map((module) => module.code)).toEqual([
      "EXP-00",
      "EXP-01",
      "EXP-02",
      "EXP-03",
    ]);
    expect(modules[3]!.title).toBe("Monero");
  });

  /**
   * The prerequisite is the previous module's code, derived rather than
   * declared — the same rule as 3.1. A content file that spelled out
   * «Requiere EXP-02» would go stale the moment a module is inserted.
   */
  it("names the previous module as the prerequisite of a locked one", () => {
    const { modules } = derivePanel(program.modules, record);

    expect(modules[3]!.requiresCode).toBe("EXP-02");
  });

  it("gives no prerequisite to a module that is not locked", () => {
    const { modules } = derivePanel(program.modules, record);

    expect(modules.slice(0, 3).map((module) => module.requiresCode)).toEqual([null, null, null]);
  });

  it("locks nothing when the student sits on the last module", () => {
    const { modules } = derivePanel(program.modules, { ...record, currentModuleIndex: 3 });

    expect(modules.map((module) => module.state)).toEqual([
      "passed",
      "passed",
      "passed",
      "in-progress",
    ]);
  });

  it("passes nothing when the student sits on the first", () => {
    const { modules } = derivePanel(program.modules, { ...record, currentModuleIndex: 0 });

    expect(modules.map((module) => module.state)).toEqual([
      "in-progress",
      "locked",
      "locked",
      "locked",
    ]);
  });

  /**
   * Standing on a module is not the same as having opened it.
   *
   * A brand new student sits on the first module with nothing done, and calling
   * that «en curso» over an empty bar would state something the record denies.
   * The zero share is what separates the two.
   */
  it("marks the current module as available when none of it is done", () => {
    const { modules } = derivePanel(program.modules, {
      ...record,
      currentModuleIndex: 0,
      currentModulePercent: 0,
    });

    expect(modules.map((module) => module.state)).toEqual([
      "available",
      "locked",
      "locked",
      "locked",
    ]);
  });
});

/**
 * The one flag the copy branches on.
 *
 * The screen swaps «Reanudar» for «Comenzar», and the greeting with it, so the
 * rule lives here once instead of being re-derived in the page and in two
 * components.
 */
describe("whether the student has started", () => {
  it("is false on the first module with nothing done", () => {
    const derived = derivePanel(program.modules, {
      ...record,
      currentModuleIndex: 0,
      currentModulePercent: 0,
    });

    expect(derived.started).toBe(false);
  });

  it("is true as soon as part of the first module is done", () => {
    const derived = derivePanel(program.modules, {
      ...record,
      currentModuleIndex: 0,
      currentModulePercent: 1,
    });

    expect(derived.started).toBe(true);
  });

  // Past the first module there is a passed module behind, whatever the share.
  it("is true past the first module even with nothing done in it", () => {
    const derived = derivePanel(program.modules, { ...record, currentModulePercent: 0 });

    expect(derived.started).toBe(true);
  });
});

describe("the counters", () => {
  it("counts the passed modules and the total", () => {
    const derived = derivePanel(program.modules, record);

    expect(derived.passedCount).toBe(2);
    expect(derived.moduleCount).toBe(4);
  });
});

describe("the module in progress", () => {
  it("is the one the record points at", () => {
    const { current } = derivePanel(program.modules, record);

    expect(current.code).toBe("EXP-02");
    expect(current.title).toBe("Ethereum");
  });

  it("describes an announced module with its teaser", () => {
    const { current } = derivePanel(program.modules, record);

    expect(current.description).toBe("Adelanto del tercero");
  });

  it("describes a published module with its summary", () => {
    const { current } = derivePanel(program.modules, { ...record, currentModuleIndex: 0 });

    expect(current.description).toBe("Resumen del primero");
  });

  it("leaves the description empty when the module declares none", () => {
    const { current } = derivePanel(program.modules, { ...record, currentModuleIndex: 1 });

    expect(current.description).toBeNull();
  });
});

/**
 * An index past the end is an editing mistake in a content file, and content
 * mistakes stop the build naming the problem (2.3). Silently clamping it would
 * ship a dashboard pointing at a module that is not there.
 */
describe("an index outside the syllabus", () => {
  it("throws naming the index and the length", () => {
    expect(() => derivePanel(program.modules, { ...record, currentModuleIndex: 4 })).toThrow(
      /currentModuleIndex/,
    );
  });

  it("throws on an empty syllabus", () => {
    expect(() => derivePanel([], record)).toThrow(/currentModuleIndex/);
  });
});
