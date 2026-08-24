import { describe, expect, it } from "vitest";

import { lesson, program } from "@/lib/content";
import type { LessonEntry, LessonRecord } from "@/lib/content/schemas";
import {
  currentLessonHref,
  deriveOutline,
  findLesson,
  neighbours,
} from "@/lib/lesson/outline";
import { deriveProgram } from "@/lib/program/derive";
import { lessonHref } from "@/lib/routes";

/**
 * A syllabus small enough to reason about.
 *
 * Built through `deriveProgram` rather than by hand, so the codes under test
 * are the ones the app derives and not a second spelling of the same rule.
 */
const modules = deriveProgram({
  description: "fixture",
  modules: [
    { status: "available", title: "Primero", videoMinutes: 10 },
    { status: "available", title: "Segundo", videoMinutes: 10 },
    { status: "coming-soon", title: "Tercero", teaser: "pronto" },
  ],
}).modules;

function entry(title: string): LessonEntry {
  return {
    title,
    duration: "05:00",
    summary: "resumen",
    keyPoints: ["punto"],
    updatedOn: "2026-08-21",
  };
}

/** Two lessons, two lessons, none — the shape `content/lesson.ts` has. */
const moduleLessons: LessonEntry[][] = [
  [entry("Uno"), entry("Dos")],
  [entry("Tres"), entry("Cuatro")],
  [],
];

/** Standing on the second lesson of the second module: one of each state. */
const midway: LessonRecord = {
  moduleIndex: 1,
  lessonIndex: 1,
  playedPercent: 40,
  elapsed: "02:00",
};

/** A brand new account, which is what the shipped record describes. */
const fresh: LessonRecord = {
  moduleIndex: 0,
  lessonIndex: 0,
  playedPercent: 0,
  elapsed: "00:00",
};

describe("deriveOutline places the student", () => {
  it("marks everything before the position passed and the position itself current", () => {
    const outline = deriveOutline(modules, moduleLessons, midway);

    const states = outline.modules.map((module) => module.lessons.map((row) => row.state));

    expect(states).toEqual([
      ["passed", "passed"],
      ["passed", "current"],
      [],
    ]);
  });

  it("leaves everything after the position unwatched, and locks the next module", () => {
    const outline = deriveOutline(modules, moduleLessons, fresh);

    expect(outline.modules[0]!.lessons.map((row) => row.state)).toEqual(["current", "upcoming"]);
    expect(outline.modules[1]!.locked).toBe(true);
    expect(outline.modules[1]!.lessons.every((row) => row.state === "locked")).toBe(true);
  });

  it("opens the module the student stands in, and only that one", () => {
    const outline = deriveOutline(modules, moduleLessons, midway);

    expect(outline.modules.map((module) => module.isCurrent)).toEqual([false, true, false]);
  });
});

describe("nothing on the screen is declared", () => {
  it("counts the lessons rather than reading a count", () => {
    const outline = deriveOutline(modules, moduleLessons, midway);

    expect(outline.lessonCount).toBe(4);
    expect(outline.passedCount).toBe(3);
    expect(outline.modules[0]!.passedCount).toBe(2);
  });

  it("floors the percentage, because a course is not finished until it is", () => {
    // 3 of 4 is 75; the interesting case is the one that does not divide.
    const outline = deriveOutline(modules, [[entry("a"), entry("b"), entry("c")], [], []], {
      ...fresh,
      lessonIndex: 1,
    });

    expect(outline.percent).toBe(33);
  });

  it("does not divide by zero when no module has lessons yet", () => {
    const outline = deriveOutline(modules, [[], [], []], fresh);

    expect(outline.percent).toBe(0);
  });

  it("derives LEC-NN from the position, one-based like the sentence beside it", () => {
    const outline = deriveOutline(modules, moduleLessons, midway);

    expect(outline.modules[0]!.lessons.map((row) => row.code)).toEqual(["LEC-01", "LEC-02"]);
  });
});

describe("a shut lesson gets no address", () => {
  it("refuses to link anything inside a module the student has not reached", () => {
    const outline = deriveOutline(modules, moduleLessons, fresh);

    expect(outline.modules[1]!.lessons.every((row) => row.href === null)).toBe(true);
  });

  it("links every lesson of an open module, including the ones ahead of the position", () => {
    const outline = deriveOutline(modules, moduleLessons, fresh);

    expect(outline.modules[0]!.lessons.map((row) => row.href)).toEqual([
      lessonHref("EXP-00", "LEC-01"),
      lessonHref("EXP-00", "LEC-02"),
    ]);
  });
});

describe("findLesson resolves the address", () => {
  it("matches the lowercased segments the links carry", () => {
    const located = findLesson(modules, moduleLessons, midway, "exp-01", "lec-02");

    expect(located?.entry.title).toBe("Cuatro");
    expect(located?.moduleCode).toBe("EXP-01");
    expect(located?.code).toBe("LEC-02");
  });

  it("matches an uppercased address too, so a hand-typed one lands", () => {
    expect(findLesson(modules, moduleLessons, midway, "EXP-01", "LEC-02")?.position).toBe(2);
  });

  it("reports the position and the count the header prints", () => {
    const located = findLesson(modules, moduleLessons, midway, "exp-00", "lec-01");

    expect(located?.position).toBe(1);
    expect(located?.lessonCount).toBe(2);
    expect(located?.state).toBe("passed");
  });

  for (const [reason, moduleParam, lessonParam] of [
    ["a module the syllabus does not have", "exp-99", "lec-01"],
    ["a lesson the module does not have", "exp-00", "lec-09"],
    ["a module that has no lessons at all", "exp-02", "lec-01"],
    ["nonsense in either segment", "modulo", "leccion"],
  ] as const) {
    it(`returns null for ${reason}`, () => {
      expect(findLesson(modules, moduleLessons, midway, moduleParam, lessonParam)).toBeNull();
    });
  }
});

describe("neighbours read the course as one sequence", () => {
  it("crosses the module boundary rather than dead-ending", () => {
    const outline = deriveOutline(modules, moduleLessons, midway);
    const { next } = neighbours(outline, "EXP-00", "LEC-02");

    expect(next).toEqual({ title: "Tres", href: lessonHref("EXP-01", "LEC-01") });
  });

  it("offers nothing before the first lesson of the course", () => {
    const outline = deriveOutline(modules, moduleLessons, midway);

    expect(neighbours(outline, "EXP-00", "LEC-01").previous).toBeNull();
  });

  it("offers nothing after the last lesson of the course", () => {
    const outline = deriveOutline(modules, moduleLessons, midway);

    expect(neighbours(outline, "EXP-01", "LEC-02").next).toBeNull();
  });

  /**
   * The header must not disagree with the tree.
   *
   * The outline refuses to link a lesson the student has not reached; a «next»
   * that linked it anyway would be a way around the gate the tree draws.
   */
  it("refuses a neighbour the outline itself will not link", () => {
    const outline = deriveOutline(modules, moduleLessons, fresh);

    expect(neighbours(outline, "EXP-00", "LEC-02").next).toBeNull();
  });
});

/**
 * The point of reading `content/program.ts`: one syllabus, three screens.
 *
 * A second list of titles living in `content/lesson.ts` would drift the first
 * time somebody edited one of the two.
 */
describe("against the shipped content", () => {
  const outline = deriveOutline(program.modules, lesson.moduleLessons, lesson.record);

  it("draws every module of the syllabus, with the syllabus's own codes", () => {
    expect(outline.modules.map((module) => module.code)).toEqual(
      program.modules.map((module) => module.code),
    );
  });

  it("hangs a lesson list on each module without changing how many there are", () => {
    expect(outline.modules).toHaveLength(program.modules.length);
  });

  it("resolves the address of the lesson the record points at", () => {
    const first = outline.modules[lesson.record.moduleIndex]!;
    const row = first.lessons[lesson.record.lessonIndex]!;

    expect(row.state).toBe("current");
    expect(row.href).toBe(lessonHref(first.code, row.code));
  });
});

/**
 * The address behind «Comenzar» on the dashboard.
 *
 * The card names a module and the record points at a lesson, and those are two
 * different files. Every case below is about the seam between them: the address
 * is only offered when the two agree.
 */
describe("currentLessonHref opens where the student stands", () => {
  it("returns the lesson the record points at, inside the module it names", () => {
    const outline = deriveOutline(modules, moduleLessons, midway);
    const module = modules[midway.moduleIndex]!;

    expect(currentLessonHref(outline, module.code)).toBe(lessonHref(module.code, "LEC-02"));
  });

  /**
   * The guard that matters. `content/panel.ts` and `content/lesson.ts` each
   * declare a position, and nothing forces them to agree; if they drift, the
   * card would name one module and open a lesson of another. Silence is the
   * correct answer to that, not a link somewhere else.
   */
  it("refuses to answer for a module the student is not standing in", () => {
    const outline = deriveOutline(modules, moduleLessons, midway);

    expect(currentLessonHref(outline, modules[0]!.code)).toBeNull();
    expect(currentLessonHref(outline, modules[2]!.code)).toBeNull();
  });

  it("returns null for a module with no lessons hanging off it yet", () => {
    const outline = deriveOutline(modules, moduleLessons, { ...fresh, moduleIndex: 2 });

    expect(currentLessonHref(outline, modules[2]!.code)).toBeNull();
  });

  it("returns null for a code the syllabus does not have", () => {
    const outline = deriveOutline(modules, moduleLessons, fresh);

    expect(currentLessonHref(outline, "EXP-99")).toBeNull();
  });

  it("resolves the first lesson of the first module for a brand new account", () => {
    const outline = deriveOutline(program.modules, lesson.moduleLessons, lesson.record);
    const module = program.modules[lesson.record.moduleIndex]!;

    expect(currentLessonHref(outline, module.code)).toBe(lessonHref(module.code, "LEC-01"));
  });
});
