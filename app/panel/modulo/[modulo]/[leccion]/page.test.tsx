// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

/*
 * `notFound()` throws a sentinel Next catches upstream; outside a Next request
 * there is nobody to catch it. The double throws something this file can name,
 * so a case can assert the 404 was reached instead of asserting on the shape of
 * an internal error.
 */
const { notFound } = vi.hoisted(() => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("next/navigation", () => ({ notFound }));

import LessonPage, { generateMetadata } from "./page";
import { lesson, program, site } from "@/lib/content";
import type { LessonEntry } from "@/lib/content/schemas";
import { deriveOutline, findLesson } from "@/lib/lesson/outline";
import { LESSON_VIEWS, lessonHref } from "@/lib/routes";

afterEach(cleanup);

const FILES = [
  "app/panel/modulo/[modulo]/[leccion]/page.tsx",
  "components/sections/LessonOutline.tsx",
  "components/sections/LessonPlayer.tsx",
  "components/sections/LessonHeader.tsx",
  "components/sections/LessonNotes.tsx",
] as const;

/**
 * The lesson the shipped record points at, read through the same derivation the
 * screen uses.
 *
 * Hard-coding `exp-00/lec-01` here would pin the assertions to today's record;
 * moving either index in `content/lesson.ts` would then break this file for a
 * reason that has nothing to do with the screen.
 */
const outline = deriveOutline(program.modules, lesson.moduleLessons, lesson.record);
const currentModule = outline.modules[lesson.record.moduleIndex]!;
const currentLesson = currentModule.lessons[lesson.record.lessonIndex]!;

/**
 * The first lesson anywhere in the course satisfying `carries`.
 *
 * Searched rather than named, because the optional blocks are not spread evenly
 * — today no single lesson of the first module has both a note and a tool list,
 * and pinning an index here would break the day somebody rewrites one.
 */
function firstLessonWith(carries: (entry: LessonEntry) => boolean) {
  for (const [moduleIndex, entries] of lesson.moduleLessons.entries()) {
    const lessonIndex = entries.findIndex(carries);

    if (lessonIndex !== -1) {
      return {
        modulo: outline.modules[moduleIndex]!.code.toLowerCase(),
        leccion: outline.modules[moduleIndex]!.lessons[lessonIndex]!.code.toLowerCase(),
        entry: entries[lessonIndex]!,
      };
    }
  }

  throw new Error("no lesson in content/lesson.ts carries the block under test");
}

async function renderPage(
  modulo: string,
  leccion: string,
  searchParams: Record<string, string> = {},
) {
  return render(
    await LessonPage({
      params: Promise.resolve({ modulo, leccion }),
      searchParams: Promise.resolve(searchParams),
    }),
  );
}

/** The current lesson, lowercased the way the links in the tree carry it. */
async function renderCurrent(searchParams: Record<string, string> = {}) {
  return renderPage(
    currentModule.code.toLowerCase(),
    currentLesson.code.toLowerCase(),
    searchParams,
  );
}

describe("the screen names the lesson", () => {
  it("makes the lesson title the only first level heading", async () => {
    await renderCurrent();

    const headings = screen.getAllByRole("heading", { level: 1 });

    expect(headings).toHaveLength(1);
    expect(headings[0]!.textContent).toBe(currentLesson.title);
  });

  it("puts the module and the lesson in the trail, with the way back to the panel", async () => {
    await renderCurrent();

    const trail = screen.getByRole("navigation", { name: "Ubicación" });

    expect(within(trail).getByText(currentModule.code)).not.toBeNull();
    expect(within(trail).getByText(currentLesson.title)).not.toBeNull();
    expect(screen.getByRole("link", { name: lesson.panelLabel }).getAttribute("href")).toBe(
      "/panel",
    );
  });

  it("states the position and the count rather than a code from the content file", async () => {
    await renderCurrent();

    const { positionLabel, positionJoiner } = lesson.header;
    const located = findLesson(
      program.modules,
      lesson.moduleLessons,
      lesson.record,
      currentModule.code,
      currentLesson.code,
    )!;

    expect(
      screen.getByText(
        `${positionLabel} ${located.position} ${positionJoiner} ${located.lessonCount}`,
      ),
    ).not.toBeNull();
  });

  it("titles the document with the lesson, not with the screen", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({
        modulo: currentModule.code.toLowerCase(),
        leccion: currentLesson.code.toLowerCase(),
      }),
      searchParams: Promise.resolve({}),
    });

    expect(metadata.title).toBe(`${currentLesson.title} — ${site.name}`);
  });
});

/**
 * The point of reading `content/program.ts`: one syllabus, three screens.
 */
describe("the tree is the syllabus", () => {
  it("draws every module of the course, with the codes the syllabus derives", async () => {
    await renderCurrent();

    const tree = screen.getByRole("navigation", { name: lesson.outline.ariaLabel });

    for (const module of program.modules) {
      expect(within(tree).getByText(module.code)).not.toBeNull();
      expect(within(tree).getAllByText(module.title).length).toBeGreaterThan(0);
    }
  });

  it("arrives with the student's module already open, needing no script to unfold", async () => {
    const { container } = await renderCurrent();

    const open = [...container.querySelectorAll("details")].filter((node) =>
      node.hasAttribute("open"),
    );

    expect(open).toHaveLength(1);
    expect(open[0]!.textContent).toContain(currentModule.title);
  });

  it("links the lessons it is willing to open, and only those", async () => {
    const { container } = await renderCurrent();

    const tree = screen.getByRole("navigation", { name: lesson.outline.ariaLabel });
    const hrefs = [...tree.querySelectorAll("a")].map((node) => node.getAttribute("href"));
    const openable = outline.modules
      .flatMap((module) => module.lessons)
      .filter((row) => row.href !== null)
      .map((row) => row.href);

    expect(hrefs).toEqual(openable);
    expect(container.querySelector(`a[href="${lessonHref("EXP-06", "LEC-01")}"]`)).toBeNull();
  });

  it("marks the lesson on screen as the current page", async () => {
    await renderCurrent();

    const current = screen.getByRole("link", { current: "page" });

    expect(current.textContent).toContain(currentLesson.title);
    expect(current.getAttribute("href")).toBe(
      lessonHref(currentModule.code, currentLesson.code),
    );
  });

  /** 9.4 — the state is never the icon or the colour alone. */
  it("writes out the state of every lesson it draws", async () => {
    await renderCurrent();

    const tree = screen.getByRole("navigation", { name: lesson.outline.ariaLabel });
    const drawn = outline.modules.flatMap((module) => module.lessons);

    for (const state of new Set(drawn.map((row) => row.state))) {
      expect(within(tree).getAllByText(lesson.states[state]).length).toBeGreaterThan(0);
    }
  });
});

describe("the pager reads the course as one sequence", () => {
  it("offers no previous lesson at the very start of the course", async () => {
    await renderPage("exp-00", "lec-01");

    expect(screen.queryByRole("link", { name: lesson.header.previousLabel })).toBeNull();
    // The label is still on screen — as text, not as a control.
    expect(screen.getByText(lesson.header.previousLabel)).not.toBeNull();
  });

  it("links the next lesson when the student may open it", async () => {
    await renderPage("exp-00", "lec-01");

    const next = screen.getByRole("link", { name: lesson.header.nextLabel });

    expect(next.getAttribute("href")).toBe(lessonHref("EXP-00", "LEC-02"));
  });
});

describe("the right rail is two addresses, not two states", () => {
  it("shows the lesson's own copy under the content view by default", async () => {
    await renderCurrent();

    const entry = lesson.moduleLessons[lesson.record.moduleIndex]![lesson.record.lessonIndex]!;

    expect(screen.getByText(entry.summary)).not.toBeNull();
    for (const point of entry.keyPoints) {
      expect(screen.getByText(point)).not.toBeNull();
    }
  });

  it("shows the instructor's remark for a lesson that carries one", async () => {
    const { modulo, leccion, entry } = firstLessonWith(
      (candidate) => candidate.instructorNote !== undefined,
    );

    await renderPage(modulo, leccion);

    expect(screen.getByText(lesson.notes.noteTitle)).not.toBeNull();
    expect(screen.getByText(entry.instructorNote!.text)).not.toBeNull();
    expect(screen.getByText(entry.instructorNote!.author)).not.toBeNull();
  });

  it("lists the tools for a lesson that names any", async () => {
    const { modulo, leccion, entry } = firstLessonWith(
      (candidate) => candidate.tools !== undefined,
    );

    await renderPage(modulo, leccion);

    expect(screen.getByText(lesson.notes.toolsTitle)).not.toBeNull();
    for (const tool of entry.tools!) {
      expect(screen.getByText(tool)).not.toBeNull();
    }
  });

  it("omits the tool list when the lesson names none", async () => {
    const { modulo, leccion } = firstLessonWith((candidate) => candidate.tools === undefined);

    await renderPage(modulo, leccion);

    expect(screen.queryByText(lesson.notes.toolsTitle)).toBeNull();
    expect(screen.getByText(lesson.notes.keyPointsTitle)).not.toBeNull();
  });

  it("omits the instructor note when the lesson has none", async () => {
    await renderCurrent();

    expect(screen.queryByText(lesson.notes.noteTitle)).toBeNull();
    expect(screen.getByText(lesson.notes.descriptionTitle)).not.toBeNull();
  });

  it("swaps the rail on the query parameter, and admits the shelf is empty", async () => {
    await renderCurrent({ vista: LESSON_VIEWS.resources });

    const entry = lesson.moduleLessons[lesson.record.moduleIndex]![lesson.record.lessonIndex]!;

    expect(screen.getByText(lesson.notes.filesEmpty)).not.toBeNull();
    expect(screen.queryByText(entry.summary)).toBeNull();
  });

  it("shows the content view for a parameter nobody recognises", async () => {
    await renderCurrent({ vista: "cualquiera" });

    const entry = lesson.moduleLessons[lesson.record.moduleIndex]![lesson.record.lessonIndex]!;

    expect(screen.getByText(entry.summary)).not.toBeNull();
  });

  it("marks the showing tab selected, and the other one not", async () => {
    await renderCurrent({ vista: LESSON_VIEWS.resources });

    const tabs = screen.getAllByRole("tab");

    expect(tabs.map((tab) => tab.getAttribute("aria-selected"))).toEqual(["false", "true"]);
    expect(tabs[0]!.getAttribute("href")).toBe(
      lessonHref(currentModule.code, currentLesson.code),
    );
  });
});

describe("an address that names no lesson is a 404", () => {
  for (const [reason, modulo, leccion] of [
    ["a module the syllabus does not have", "exp-99", "lec-01"],
    ["a lesson the module does not have", "exp-00", "lec-09"],
    ["a module with no lessons published", "exp-06", "lec-01"],
  ] as const) {
    it(`refuses ${reason}`, async () => {
      await expect(renderPage(modulo, leccion)).rejects.toThrow("NEXT_NOT_FOUND");
      expect(notFound).toHaveBeenCalled();
    });
  }

  /**
   * A locked lesson is not a 404.
   *
   * It exists; the student simply may not open it. The tree refuses to link it,
   * which is a different statement from «this address is wrong».
   */
  it("still resolves a locked lesson rather than pretending it does not exist", async () => {
    const locked = outline.modules.find((module) => module.locked && module.lessonCount > 0);

    // The shipped syllabus publishes lessons for the first two modules only, so
    // this case is real today; the guard keeps it honest if that ever changes.
    if (locked === undefined) return;

    await renderPage(locked.code.toLowerCase(), locked.lessons[0]!.code.toLowerCase());

    expect(screen.getAllByRole("heading", { level: 1 })[0]!.textContent).toBe(
      locked.lessons[0]!.title,
    );
  });
});

// 8.1 — `NavPanel` stays the only client component of the site.
describe("the screen ships no JavaScript of its own", () => {
  for (const path of FILES) {
    it(path, () => {
      const source = readFileSync(resolve(process.cwd(), path), "utf8");
      const code = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

      expect(code).not.toContain("use client");
      expect(code).not.toContain("useState");
      expect(code).not.toContain("useEffect");
      expect(code).not.toContain("onClick");
      expect(code).not.toContain("addEventListener");
      expect(code).not.toContain("IntersectionObserver");
    });
  }
});
