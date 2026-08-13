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

  it("keeps the navigation of the footer equally reachable", () => {
    render(<NotFound />);

    const links = within(screen.getByRole("contentinfo")).getAllByRole("link");
    const fragments = links.filter((link) => link.getAttribute("href")?.includes("#"));

    expect(fragments.length).toBeGreaterThan(0);
    for (const link of fragments) {
      expect(link.getAttribute("href")).toMatch(/^\/#/);
    }
  });

  it("leaves the outbound newsletter link absolute, not prefixed", () => {
    render(<NotFound />);

    const newsletter = within(screen.getByRole("contentinfo")).getByRole("link", {
      name: "Newsletter",
    });
    expect(newsletter.getAttribute("href")).toMatch(/^https?:\/\//);
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
