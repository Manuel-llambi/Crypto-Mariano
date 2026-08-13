import { describe, expect, it } from "vitest";
import { deriveProgram, type ModuleInput } from "./derive";

const available = (title: string, videoMinutes: number, summary?: string): ModuleInput =>
  summary === undefined
    ? { status: "available", title, videoMinutes }
    : { status: "available", title, videoMinutes, summary };

const comingSoon = (title: string, teaser: string): ModuleInput => ({
  status: "coming-soon",
  title,
  teaser,
});

describe("deriveProgram", () => {
  // 3.1 — the file code is derived from the index, two digits.
  it("derives EXP-NN codes from the module position", () => {
    const modules = Array.from({ length: 11 }, (_, index) =>
      available(`Módulo ${index}`, 10),
    );

    const { modules: derived } = deriveProgram({ description: "d", modules });

    expect(derived[0]?.code).toBe("EXP-00");
    expect(derived[1]?.code).toBe("EXP-01");
    expect(derived[9]?.code).toBe("EXP-09");
    expect(derived[10]?.code).toBe("EXP-10");
  });

  // 3.2 — moduleCount equals the length of the module list.
  it("derives moduleCount from the list length", () => {
    expect(deriveProgram({ description: "d", modules: [available("a", 10)] }).moduleCount).toBe(1);
    expect(
      deriveProgram({
        description: "d",
        modules: [available("a", 10), comingSoon("b", "t"), available("c", 10)],
      }).moduleCount,
    ).toBe(3);
  });

  // 3.3 — totalMinutes sums available modules and excludes coming-soon ones.
  it("sums only the minutes of available modules", () => {
    const { totalMinutes } = deriveProgram({
      description: "d",
      modules: [
        available("a", 30),
        comingSoon("b", "t"),
        available("c", 45),
        comingSoon("d", "t"),
      ],
    });

    expect(totalMinutes).toBe(75);
  });

  // 3.5 — with every module coming-soon the total is zero and there is no label.
  it("returns a null duration label when no module is available", () => {
    const program = deriveProgram({
      description: "d",
      modules: [comingSoon("a", "t"), comingSoon("b", "t")],
    });

    expect(program.totalMinutes).toBe(0);
    expect(program.durationLabel).toBeNull();
  });

  // 3.6 — with available minutes the label is the hours-and-minutes string.
  it("formats the duration label in hours and minutes", () => {
    expect(
      deriveProgram({
        description: "d",
        modules: [available("a", 50), available("b", 30)],
      }).durationLabel,
    ).toBe("1 h 20 min");
  });

  // 3.6 — edge case: exactly sixty minutes.
  it("formats exactly sixty minutes without a minute part", () => {
    expect(
      deriveProgram({
        description: "d",
        modules: [available("a", 25), available("b", 35)],
      }).durationLabel,
    ).toBe("1 h");
  });

  // 4.8 — the returned array keeps the declaration order.
  it("keeps the declaration order of the modules", () => {
    const { modules } = deriveProgram({
      description: "d",
      modules: [
        comingSoon("Zeta", "t"),
        available("Alfa", 10),
        comingSoon("Beta", "t"),
        available("Gamma", 10),
      ],
    });

    expect(modules.map((module) => module.title)).toEqual(["Zeta", "Alfa", "Beta", "Gamma"]);
    expect(modules.map((module) => module.code)).toEqual([
      "EXP-00",
      "EXP-01",
      "EXP-02",
      "EXP-03",
    ]);
  });

  // The description passes through untouched.
  it("passes the description through", () => {
    expect(
      deriveProgram({ description: "Temario del curso", modules: [available("a", 10)] })
        .description,
    ).toBe("Temario del curso");
  });

  // Branch-specific fields survive the derivation.
  it("keeps the branch fields of each module", () => {
    const { modules } = deriveProgram({
      description: "d",
      modules: [available("a", 10, "resumen"), available("b", 20), comingSoon("c", "adelanto")],
    });

    expect(modules[0]).toMatchObject({ status: "available", summary: "resumen", videoMinutes: 10 });
    expect(modules[2]).toMatchObject({ status: "coming-soon", teaser: "adelanto" });

    const withoutSummary = modules[1];
    expect(withoutSummary?.status).toBe("available");
    if (withoutSummary?.status !== "available") throw new Error("expected an available module");
    expect(withoutSummary.summary).toBeUndefined();
  });
});
