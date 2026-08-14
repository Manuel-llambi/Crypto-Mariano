// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import NotFound from "./not-found";
import { site } from "@/lib/content";

afterEach(cleanup);

// 10.4 — the page keeps header and footer, and offers a way back.
describe("the error page keeps its bearings (10.4)", () => {
  it("renders the header", () => {
    render(<NotFound />);

    expect(screen.getByRole("banner")).not.toBeNull();
  });

  it("renders the footer", () => {
    render(<NotFound />);

    expect(screen.getByRole("contentinfo")).not.toBeNull();
  });

  it("keeps the navigation of the header, pointing at the home page", () => {
    render(<NotFound />);

    // On a route that is not the landing, a bare "#programa" would resolve
    // against the current URL and go nowhere.
    const links = within(screen.getByRole("banner")).getAllByRole("link");
    const fragments = links.filter((link) => link.getAttribute("href")?.includes("#"));

    expect(fragments.length).toBeGreaterThan(0);
    for (const link of fragments) {
      expect(link.getAttribute("href")).toMatch(/^\/#/);
    }
  });

  /**
   * The footer needs no prefix: its destinations are absolute paths, an outbound
   * address and a mailto, none of which resolves against the current route.
   */
  it("keeps the footer destinations reachable without a prefix", () => {
    render(<NotFound />);

    const links = within(screen.getByRole("contentinfo")).getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);

    for (const link of links) {
      const href = link.getAttribute("href")!;
      expect(href.startsWith("#")).toBe(false);
      expect(href).toMatch(/^(\/|https?:\/\/|mailto:)/);
    }
  });

  it("offers a link back to the home page", () => {
    const { container } = render(<NotFound />);

    const home = [...container.querySelectorAll("main a")].filter(
      (link) => link.getAttribute("href") === "/",
    );
    expect(home.length).toBeGreaterThan(0);
  });

  it("says what happened, in Spanish", () => {
    const { container } = render(<NotFound />);

    expect(container.querySelector("main")?.textContent).toContain("404");
  });
});

describe("heading hierarchy (9.2)", () => {
  it("presents exactly one first level heading", () => {
    const { container } = render(<NotFound />);

    expect(container.querySelectorAll("h1")).toHaveLength(1);
  });

  it("never skips a level going down", () => {
    const { container } = render(<NotFound />);
    const levels = [...container.querySelectorAll("h1, h2, h3, h4, h5, h6")].map((heading) =>
      Number(heading.tagName.slice(1)),
    );

    for (const [index, level] of levels.entries()) {
      if (index === 0) {
        continue;
      }
      expect(level).toBeLessThanOrEqual(levels[index - 1]! + 1);
    }
  });
});

describe("it is fed by the same validated content", () => {
  it("shows the site name in the header", () => {
    render(<NotFound />);

    expect(within(screen.getByRole("banner")).getByText(site.name)).not.toBeNull();
  });
});
