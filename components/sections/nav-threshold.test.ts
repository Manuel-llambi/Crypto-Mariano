import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * The one width at which the navigation changes shape.
 *
 * Above it the links sit inline in the bar; below it they live in `NavPanel`
 * and the bar shows a disclosure instead. 7.2 asks that exactly one of the two
 * be on screen and in the accessibility tree at any width, and that property is
 * carried by four `@media` blocks spread across two stylesheets, all of which
 * have to agree on the same number.
 *
 * CSS offers no way to name it. A custom property cannot be read inside a media
 * query, so the number is typed out four times, and four copies of a number is
 * the definition of something that drifts. Get one wrong and there is a band of
 * widths showing both navigations at once, or neither — and neither failure
 * shows up in a test that renders the markup, because the markup is identical
 * either way. Only the stylesheet knows.
 */

const THRESHOLD = "1152px";

const SHARERS = [
  "./TopNavBar.module.css",
  "../ui/NavPanel.module.css",
] as const;

/** Every width a media query in this stylesheet keys on. */
function breakpointsOf(path: string): string[] {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  return [...source.matchAll(/@media\s*\(min-width:\s*([^)]+)\)/g)].map((match) =>
    match[1]!.trim(),
  );
}

describe("7.2 — the two navigations swap at one width", () => {
  it("is used by both stylesheets", () => {
    for (const path of SHARERS) {
      expect(breakpointsOf(path)).toContain(THRESHOLD);
    }
  });

  it("is the only wide-screen breakpoint either of them keys on", () => {
    // 640px is a separate, narrower decision — where the site name stops
    // wrapping and the sign-in link appears — so it is allowed through. What
    // must not exist is a *second* wide threshold, which is what a half-finished
    // change to this number looks like.
    for (const path of SHARERS) {
      const wide = breakpointsOf(path).filter(
        (width) => Number.parseInt(width, 10) > 640,
      );
      expect(new Set(wide)).toEqual(new Set([THRESHOLD]));
    }
  });

  it("leaves the bar more room than it needs", () => {
    // Measured, not chosen: brand 114 + list 627 + access 236 + two 32px gaps
    // + 48px of padding is 1089px of content. The threshold has to clear that
    // with something to spare, or the bar arrives already overlapping.
    const required = 114 + 627 + 236 + 32 * 2 + 24 * 2;

    expect(Number.parseInt(THRESHOLD, 10)).toBeGreaterThan(required);
  });
});
