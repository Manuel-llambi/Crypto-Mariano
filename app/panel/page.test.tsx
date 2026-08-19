// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import PanelPage, { metadata } from "./page";
import { metadata as layoutMetadata } from "./layout";
import { panel, program } from "@/lib/content";

afterEach(cleanup);

const source = readFileSync(resolve(process.cwd(), "app/panel/page.tsx"), "utf8");

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
    expect(screen.getByText(panel.welcome.body)).not.toBeNull();
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
});

/**
 * The panel screen itself does nothing — the guard is in its layout.
 *
 * Every control on it is an inert button. It shows a course nobody can open,
 * because there is no lesson viewer in this repository yet, and a link into a
 * 404 would be worse than a control that admits it does nothing.
 */
describe("the screen is inert", () => {
  it("renders no form", () => {
    const { container } = render(<PanelPage />);

    expect(container.querySelector("form")).toBeNull();
  });

  it("gives every control type button, never submit", () => {
    const { container } = render(<PanelPage />);

    for (const button of container.querySelectorAll("button")) {
      expect(button.getAttribute("type")).toBe("button");
    }
  });

  it("links nowhere from the content column", () => {
    const { container } = render(<PanelPage />);

    expect(container.querySelectorAll("a[href]")).toHaveLength(0);
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
