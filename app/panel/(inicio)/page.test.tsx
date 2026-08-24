// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import PanelPage, { metadata } from "./page";
import { metadata as layoutMetadata } from "../layout";
import { lesson as lessonContent, panel, program } from "@/lib/content";
import { currentLessonHref, deriveOutline } from "@/lib/lesson/outline";
import { derivePanel } from "@/lib/panel/derive";
import { LESSON_BASE } from "@/lib/routes";

afterEach(cleanup);

const source = readFileSync(resolve(process.cwd(), "app/panel/(inicio)/page.tsx"), "utf8");

/**
 * The branch the shipped record takes.
 *
 * Read through `derivePanel` rather than re-deciding it here, so bumping
 * `currentModuleIndex` in the content file moves the assertions with it instead
 * of leaving a second copy of the rule to go stale.
 */
const { started } = derivePanel(program.modules, panel.record);

describe("the welcome header", () => {
  it("greets the student by name, as the only first level heading", () => {
    render(<PanelPage />);

    const headings = screen.getAllByRole("heading", { level: 1 });

    expect(headings).toHaveLength(1);
    expect(headings[0]!.textContent).toContain(panel.student.name);
  });

  it("shows the eyebrow and the body from the content file", () => {
    render(<PanelPage />);

    expect(screen.getByText(panel.welcome.eyebrow)).not.toBeNull();
    expect(screen.getByText(started ? panel.welcome.body : panel.welcome.startBody)).not.toBeNull();
  });

  /**
   * Both halves of the copy exist, so the wrong one must not be on screen at
   * the same time as the right one.
   */
  it("shows one greeting only, never both", () => {
    render(<PanelPage />);

    expect(screen.queryByText(started ? panel.welcome.startBody : panel.welcome.body)).toBeNull();
  });
});

/**
 * The point of reusing `content/program.ts`: one syllabus.
 *
 * The dashboard shows the same modules as the landing, with the same derived
 * codes. A second list of titles living in `content/panel.ts` would drift the
 * first time somebody edits one of the two.
 */
describe("the syllabus is the landing's syllabus", () => {
  it("shows every module of the program, and no others", () => {
    const { container } = render(<PanelPage />);

    expect(container.querySelectorAll("li")).toHaveLength(program.moduleCount);

    // The module in progress appears twice on purpose: in the grid and in the
    // card that resumes it, exactly as the mockup shows it.
    for (const module of program.modules) {
      expect(screen.getAllByText(module.title).length).toBeGreaterThanOrEqual(1);
    }
  });

  it("uses the codes derived from the syllabus, never a code declared by hand", () => {
    render(<PanelPage />);

    for (const module of program.modules) {
      expect(screen.getByText(module.code)).not.toBeNull();
    }

    // 3.4 — no `EXP-` string anywhere in the record the screen reads.
    expect(JSON.stringify(panel)).not.toContain("EXP-");
  });
});

describe("the progress figures", () => {
  it("prints the share the record declares", () => {
    render(<PanelPage />);

    expect(screen.getByText(`${panel.record.overallPercent}%`)).not.toBeNull();
  });

  it("counts the passed modules against the length of the syllabus", () => {
    render(<PanelPage />);

    const expected = `${panel.record.currentModuleIndex} / ${program.moduleCount}`;
    expect(screen.getByText(expected)).not.toBeNull();
  });
});

describe("the card that resumes the course", () => {
  it("shows the module the record points at", () => {
    render(<PanelPage />);

    const current = program.modules[panel.record.currentModuleIndex]!;

    // Level 2 is the card; the grid repeats the same title at level 3.
    expect(screen.getByRole("heading", { level: 2, name: current.title })).not.toBeNull();
  });

  /**
   * «Reanudar» over a course nobody opened is a claim the record contradicts.
   * The card reads the same flag as the greeting, so the two never disagree.
   */
  it("offers to start what has not been started, and to resume what has", () => {
    render(<PanelPage />);

    const { eyebrow, startEyebrow, ctaLabel, startCtaLabel } = panel.continueCard;

    expect(screen.getByText(started ? eyebrow : startEyebrow)).not.toBeNull();
    expect(screen.getByRole("link", { name: started ? ctaLabel : startCtaLabel })).not.toBeNull();
    expect(screen.queryByText(started ? startEyebrow : eyebrow)).toBeNull();
  });

  /**
   * The control opens the viewer rather than admitting it does nothing.
   *
   * The address is not spelled here: it is read back through the same outline
   * the viewer builds, so moving the record in either content file moves this
   * assertion with it instead of leaving a second copy of the address to rot.
   */
  it("opens the lesson the record points at, and does it as a link", () => {
    render(<PanelPage />);

    const outline = deriveOutline(program.modules, lessonContent.moduleLessons, lessonContent.record);
    const expected = currentLessonHref(outline, derivePanel(program.modules, panel.record).current.code);

    expect(expected).not.toBeNull();

    const cta = screen.getByRole("link", {
      name: started ? panel.continueCard.ctaLabel : panel.continueCard.startCtaLabel,
    });

    expect(cta.getAttribute("href")).toBe(expected);
  });
});

/**
 * One control leads somewhere; everything else on the screen still does not.
 *
 * The card opens the lesson viewer, which exists since 2026-08-21. The filter
 * does not, because there is nothing to filter yet, and the module cards do
 * not either — the tree inside the viewer is what navigates the syllabus. A
 * link into a 404 would be worse than a control that admits it does nothing.
 */
describe("the screen offers one destination only", () => {
  it("renders no form", () => {
    const { container } = render(<PanelPage />);

    expect(container.querySelector("form")).toBeNull();
  });

  it("gives every remaining control type button, never submit", () => {
    const { container } = render(<PanelPage />);

    for (const button of container.querySelectorAll("button")) {
      expect(button.getAttribute("type")).toBe("button");
    }
  });

  it("links from the card and from nowhere else", () => {
    const { container } = render(<PanelPage />);

    const links = container.querySelectorAll("a[href]");

    expect(links).toHaveLength(1);
    expect(links[0]!.getAttribute("href")).toContain(LESSON_BASE);
  });
});

describe("the screen stays out of search results", () => {
  it("declares noindex on the layout that wraps it", () => {
    expect(layoutMetadata.robots).toEqual({ index: false, follow: false });
  });

  it("titles the document from the content file", () => {
    expect(metadata.title).toContain(panel.title);
  });
});

// 8.1 — `NavPanel` stays the only client component of the site.
it("ships no JavaScript of its own", () => {
  const code = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

  expect(code).not.toContain("use client");
  expect(code).not.toContain("useState");
  expect(code).not.toContain("useEffect");
  expect(code).not.toContain("onClick");
  expect(code).not.toContain("addEventListener");
  expect(code).not.toContain("IntersectionObserver");
});
