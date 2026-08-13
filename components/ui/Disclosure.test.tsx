// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import { Disclosure } from "./Disclosure";

afterEach(cleanup);

describe("with content (4.3, 5.1)", () => {
  it("renders a native details with the summary as its control", () => {
    const { container } = render(<Disclosure summary="¿Cuánto dura?">Lo que haga falta.</Disclosure>);

    const details = container.querySelector("details");
    expect(details).not.toBeNull();
    expect(details!.querySelector("summary")?.textContent).toBe("¿Cuánto dura?");
    expect(details!.textContent).toContain("Lo que haga falta.");
  });

  it("starts closed: it never emits the open attribute", () => {
    const { container } = render(<Disclosure summary="Enunciado">Contenido</Disclosure>);

    expect(container.querySelector("details")!.hasAttribute("open")).toBe(false);
  });

  // 4.5, 5.2 — grouping with `name` would close the others on open.
  it("never emits the name attribute", () => {
    const { container } = render(<Disclosure summary="Enunciado">Contenido</Disclosure>);

    expect(container.querySelector("details")!.hasAttribute("name")).toBe(false);
  });

  it("accepts a node as summary, not only a string", () => {
    render(
      <Disclosure summary={<span data-testid="titulo">Título compuesto</span>}>Contenido</Disclosure>,
    );

    expect(screen.getByTestId("titulo").closest("summary")).not.toBeNull();
  });

  it("puts the className on the details", () => {
    const { container } = render(
      <Disclosure summary="Enunciado" className="fila">
        Contenido
      </Disclosure>,
    );

    expect(container.querySelector("details")!.className).toContain("fila");
  });
});

describe("without content (4.4)", () => {
  it("renders no details and no disclosure control", () => {
    const { container } = render(<Disclosure summary="Introducción a las criptomonedas" />);

    expect(container.querySelector("details")).toBeNull();
    expect(container.querySelector("summary")).toBeNull();
  });

  it("still renders the heading", () => {
    render(<Disclosure summary="Introducción a las criptomonedas" />);

    expect(screen.getByText("Introducción a las criptomonedas")).not.toBeNull();
  });

  it("treats null, false and blank text as no content", () => {
    for (const empty of [null, false, "", "   "]) {
      const { container } = render(<Disclosure summary="Enunciado">{empty}</Disclosure>);
      expect(container.querySelector("details")).toBeNull();
      cleanup();
    }
  });

  it("keeps the className when there is no details to put it on", () => {
    const { container } = render(<Disclosure summary="Enunciado" className="fila" />);

    expect(container.querySelector(".fila")).not.toBeNull();
  });
});

// 8.1 — the disclosure works with no JavaScript of ours.
describe("no JavaScript of its own (8.1)", () => {
  it("produces the whole control as static markup, with no hydration", () => {
    const markup = renderToStaticMarkup(
      <Disclosure summary="Enunciado">Contenido</Disclosure>,
    );

    expect(markup).toContain("<details");
    expect(markup).toContain("<summary");
    expect(markup).toContain("Contenido");
    expect(markup).not.toContain("open=");
  });

  it("is not a client component: it declares no use client directive", async () => {
    const { readFileSync } = await import("node:fs");
    const { resolve } = await import("node:path");
    // Under jsdom `import.meta.url` is an http URL, so the path is resolved
    // from the project root instead.
    const source = readFileSync(resolve(process.cwd(), "components/ui/Disclosure.tsx"), "utf8");

    expect(source).not.toContain("use client");
    expect(source).not.toContain("useState");
    expect(source).not.toContain("onClick");
    expect(source).not.toContain("onToggle");
  });
});
