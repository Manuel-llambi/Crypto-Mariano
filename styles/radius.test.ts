import { globSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * One radius, enforced instead of asserted.
 *
 * `DESIGN_SYSTEM.md` §3 and §6 both say the app has a single radius and that it
 * applies to «botones, inputs, cards, badges». For a long time that was simply
 * untrue: nine bordered boxes declared no radius at all and rendered square,
 * and §4.3 went as far as describing the badges' 4px corners — corners that did
 * not exist. Nobody had lied; the document was surveyed by eye, and by eye a
 * 4px corner on a 1px hairline is invisible.
 *
 * That is the whole argument for this file. A claim in a document decays
 * silently, and the more confidently it is written the longer it survives. The
 * same claim as a test fails the moment it stops being true.
 *
 * It reads the stylesheets rather than the rendered page for the reason
 * `app/page.surfaces.test.ts` does: under jsdom a CSS module resolves to class
 * names and carries no declarations.
 */

const ROOT = new URL("../", import.meta.url);

/** Every CSS module of the app, as `[path, source]`. */
function stylesheets(): [string, string][] {
  return globSync("{components,app}/**/*.module.css", { cwd: fileURLToPath(ROOT) })
    .sort()
    .map((path) => [path, readFileSync(new URL(path, ROOT), "utf8")]);
}

/**
 * A rule that draws a box: `border` shorthand with a width above zero.
 *
 * `border: 0` is excluded because it is the opposite declaration — it is how a
 * `<hr>` clears the edges the browser gives it before drawing a single one with
 * `border-block-start`. `.rule` on the panel does exactly that, and a radius on
 * a one-pixel line means nothing. Directional borders are excluded for the same
 * reason: an edge is not a shape.
 */
function boxedRules(source: string): { selector: string; body: string }[] {
  const boxed: { selector: string; body: string }[] = [];
  for (const match of source.matchAll(/(\.[\w-]+)[^{}]*\{([^}]*)\}/g)) {
    const body = match[2]!;
    if (/border:\s*[1-9]/.test(body)) {
      boxed.push({ selector: match[1]!, body });
    }
  }
  return boxed;
}

describe("§6 — every box the design draws has the one radius", () => {
  it("finds boxes to check, so an empty pass cannot look like a green one", () => {
    const boxes = stylesheets().flatMap(([, source]) => boxedRules(source));

    expect(boxes.length).toBeGreaterThan(8);
  });

  for (const [path, source] of stylesheets()) {
    for (const { selector, body } of boxedRules(source)) {
      it(`${path} ${selector} declares it`, () => {
        expect(body).toMatch(/border-radius:/);
      });

      it(`${path} ${selector} takes it from the token`, () => {
        // A literal here is how the scale nobody decided on starts: one box at
        // 6px because it looked better that afternoon, and the «radio único» of
        // §3 quietly becomes a range.
        expect(body).toMatch(/border-radius:\s*var\(--radius\)/);
      });
    }
  }
});
