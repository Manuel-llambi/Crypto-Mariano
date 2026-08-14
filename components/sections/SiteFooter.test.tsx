// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { SiteFooter } from "./SiteFooter";
import type { Footer } from "@/lib/content/schemas";

afterEach(cleanup);

const footer: Footer = {
  description: "Descripción del pie.",
  columns: [
    {
      title: "Protocolo",
      links: [
        { label: "Privacidad", href: "/privacidad" },
        { label: "Términos", href: "/terminos" },
      ],
    },
    {
      title: "Nodos",
      links: [
        { label: "Acreditaciones", href: "/acreditaciones" },
        { label: "Newsletter", href: "https://cryptocrime.academy/newsletter" },
      ],
    },
  ],
  address: {
    title: "Sede central",
    line: "Sede: Madrid, España / Virtual Global Node",
    emailLabel: "E-mail:",
    email: "contacto@cryptocrime.academy",
  },
  legal: "© 2026 CCA_UNITS. Todos los derechos reservados.",
  notes: ["Transmisión: AES_256_SECURED", "Lex Forensica v.1.2"],
};

const source = readFileSync(resolve(process.cwd(), "components/sections/SiteFooter.tsx"), "utf8");

function renderFooter() {
  return render(<SiteFooter footer={footer} siteName="Crypto Crime Academy" />);
}

describe("the headed link columns", () => {
  it("renders one navigation region per column, named by its heading", () => {
    renderFooter();

    for (const column of footer.columns) {
      expect(screen.getByRole("navigation", { name: column.title })).not.toBeNull();
    }
  });

  it("renders every link with the destination it received", () => {
    renderFooter();

    for (const column of footer.columns) {
      const region = within(screen.getByRole("navigation", { name: column.title }));
      for (const link of column.links) {
        expect(region.getByRole("link", { name: link.label }).getAttribute("href")).toBe(link.href);
      }
    }
  });

  /**
   * The replica leaves every one of these as `href="#"`. A link that goes
   * nowhere is worse than no link, so this pins that none ships that way.
   */
  it("ships no placeholder destination", () => {
    const { container } = renderFooter();

    for (const link of container.querySelectorAll("a")) {
      expect(link.getAttribute("href")).not.toBe("#");
      expect(link.getAttribute("href")).not.toBe("");
    }
  });

  it("writes no destination of its own in the source", () => {
    expect(source).not.toContain('href="/');
    expect(source).not.toContain('href="#');
  });
});

describe("the address block", () => {
  it("renders the address as an address element", () => {
    const { container } = renderFooter();

    expect(container.querySelector("address")?.textContent).toBe(footer.address.line);
  });

  it("makes the e-mail a mailto link", () => {
    renderFooter();

    const email = screen.getByRole("link", { name: footer.address.email });
    expect(email.getAttribute("href")).toBe(`mailto:${footer.address.email}`);
  });

  it("keeps the label that names the address", () => {
    renderFooter();

    expect(screen.getByText(footer.address.emailLabel)).not.toBeNull();
  });
});

describe("the bottom rule", () => {
  it("renders the legal line and both technical notes", () => {
    renderFooter();

    expect(screen.getByText(footer.legal)).not.toBeNull();
    for (const note of footer.notes) {
      expect(screen.getByText(note)).not.toBeNull();
    }
  });

  it("hides the decorative tick from assistive technology (9.3)", () => {
    const { container } = renderFooter();

    const tick = container.querySelector("[aria-hidden='true']");
    expect(tick).not.toBeNull();
    expect(tick!.textContent).toBe("");
  });
});

describe("the footer collects nothing", () => {
  it("renders no form and no input", () => {
    const { container } = renderFooter();

    expect(container.querySelector("form")).toBeNull();
    expect(container.querySelector("input")).toBeNull();
  });
});

describe("structure", () => {
  it("renders a contentinfo landmark with the site name", () => {
    renderFooter();

    const region = within(screen.getByRole("contentinfo"));
    expect(region.getByText("Crypto Crime Academy")).not.toBeNull();
    expect(region.getByText(footer.description)).not.toBeNull();
  });

  // 9.2 — level two, so the 404 page does not skip from its h1 to a level three.
  it("emits no heading above level two", () => {
    renderFooter();

    expect(screen.queryAllByRole("heading", { level: 1 })).toHaveLength(0);
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(3);
    expect(screen.queryAllByRole("heading", { level: 3 })).toHaveLength(0);
  });

  it("carries no section anchor, which the header owns", () => {
    const { container } = renderFooter();

    expect(container.querySelector('a[href^="#"]')).toBeNull();
  });
});
