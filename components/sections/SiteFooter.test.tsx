// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { SiteFooter } from "./SiteFooter";
import type { Footer } from "@/lib/content/schemas";

afterEach(cleanup);

const footer: Footer = {
  description: "Descripción del pie.",
  links: [
    { label: "Programa", href: "#programa" },
    { label: "FAQ", href: "#faq" },
  ],
  newsletter: { label: "Newsletter", href: "https://cryptocrime.academy/newsletter" },
  legal: "© 2026 Crypto Crime Academy",
};

const source = readFileSync(resolve(process.cwd(), "components/sections/SiteFooter.tsx"), "utf8");

describe("the footer repeats the anchor links (1.6)", () => {
  it("renders one link per item, with the href received", () => {
    render(<SiteFooter footer={footer} siteName="Crypto Crime Academy" />);

    for (const link of footer.links) {
      expect(screen.getByRole("link", { name: link.label }).getAttribute("href")).toBe(link.href);
    }
  });

  it("writes no anchor of its own in the source", () => {
    expect(source).not.toContain('href="#');
  });
});

describe("the newsletter is a link, not a form", () => {
  it("renders an anchor pointing at the configured address", () => {
    render(<SiteFooter footer={footer} siteName="Crypto Crime Academy" />);

    const link = screen.getByRole("link", { name: footer.newsletter.label });
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe(footer.newsletter.href);
  });

  it("collects nothing: no form and no input", () => {
    const { container } = render(<SiteFooter footer={footer} siteName="Crypto Crime Academy" />);

    expect(container.querySelector("form")).toBeNull();
    expect(container.querySelector("input")).toBeNull();
  });
});

describe("the rest of the footer copy", () => {
  it("shows the site name, the description and the legal line", () => {
    render(<SiteFooter footer={footer} siteName="Crypto Crime Academy" />);

    expect(screen.getByText("Crypto Crime Academy")).not.toBeNull();
    expect(screen.getByText(footer.description)).not.toBeNull();
    expect(screen.getByText(footer.legal)).not.toBeNull();
  });

  it("renders a contentinfo landmark", () => {
    render(<SiteFooter footer={footer} siteName="Crypto Crime Academy" />);

    expect(screen.getByRole("contentinfo")).not.toBeNull();
  });

  it("emits no heading, so it cannot break the page hierarchy (9.2)", () => {
    render(<SiteFooter footer={footer} siteName="Crypto Crime Academy" />);

    expect(screen.queryAllByRole("heading")).toHaveLength(0);
  });
});
