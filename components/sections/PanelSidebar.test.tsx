// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { PanelSidebar } from "./PanelSidebar";
import { LOGIN_HREF, PANEL_HREF } from "@/lib/routes";

afterEach(cleanup);

const source = readFileSync(resolve(process.cwd(), "components/sections/PanelSidebar.tsx"), "utf8");

const student = { name: "Mariano", statusLabel: "Estado del investigador", statusValue: "Activo" };

const nav = [
  { id: "courses", icon: "book", label: "Mis cursos" },
  { id: "resources", icon: "document", label: "Recursos" },
  { id: "support", icon: "support", label: "Soporte" },
];

function renderSidebar(currentId = "courses") {
  return render(
    <PanelSidebar
      student={student}
      nav={nav}
      settingsLabel="Ajustes"
      logoutLabel="Cerrar sesión"
      currentId={currentId}
    />,
  );
}

describe("the student summary", () => {
  it("shows the name and the state, both from the data", () => {
    renderSidebar();

    expect(screen.getByText("Mariano")).not.toBeNull();
    expect(screen.getByText("Estado del investigador: Activo")).not.toBeNull();
  });
});

describe("the destinations", () => {
  it("renders one entry per item received", () => {
    renderSidebar();

    for (const item of nav) {
      expect(screen.getByText(item.label)).not.toBeNull();
    }
  });

  /**
   * The three screens that do not exist yet are the point of this test.
   *
   * They render without an `href`, which makes them plain text rather than
   * links — the alternative is a nav full of anchors into a 404, which is the
   * mistake `forgotHref` still makes on the access screen.
   */
  it("gives an address only to the destinations that exist", () => {
    const { container } = renderSidebar();

    const hrefs = [...container.querySelectorAll("nav a")].map((a) => a.getAttribute("href"));

    expect(hrefs).toEqual([PANEL_HREF, null, null]);
  });

  it("marks the screen being shown as the current page", () => {
    renderSidebar("resources");

    const current = screen.getByText("Recursos");
    expect(current.getAttribute("aria-current")).toBe("page");
    expect(screen.getByText("Mis cursos").getAttribute("aria-current")).toBeNull();
  });

  it("names the navigation region, so it is not one of several unlabelled ones", () => {
    const { container } = renderSidebar();

    expect(container.querySelector("nav")!.getAttribute("aria-label")).not.toBeNull();
  });
});

describe("the two entries at the foot", () => {
  // The only real destination of the sidebar: signing out goes back to the door.
  it("sends «Cerrar sesión» back to the access screen", () => {
    renderSidebar();

    expect(screen.getByRole("link", { name: "Cerrar sesión" }).getAttribute("href")).toBe(
      LOGIN_HREF,
    );
  });

  it("leaves «Ajustes» without an address, because that screen does not exist", () => {
    renderSidebar();

    expect(screen.queryByRole("link", { name: "Ajustes" })).toBeNull();
    expect(screen.getByText("Ajustes")).not.toBeNull();
  });
});

// 8.1 — the panel ships no JavaScript of its own.
it("wires no handler", () => {
  const code = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

  expect(code).not.toContain("use client");
  expect(code).not.toContain("useState");
  expect(code).not.toContain("useEffect");
  expect(code).not.toContain("onClick");
  expect(code).not.toContain("addEventListener");
});
