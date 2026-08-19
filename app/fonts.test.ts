import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { TYPOGRAPHY_TOKENS } from "@/styles/tokens";

const layout = readFileSync(new URL("./layout.tsx", import.meta.url), "utf8");

/** Every `path:` inside the `src` arrays, in declaration order. */
function declaredSources(): string[] {
  return [...layout.matchAll(/path:\s*"([^"]+)"/g)].map((match) => match[1]!);
}

/**
 * The typefaces have to reach the page through `next/font/local`.
 *
 * Not a style preference. The three families fall back to `system-ui` and
 * `Georgia`, whose metrics differ from the real faces, so every block of text
 * reflows the moment the fonts land — `font-display: swap` avoids invisible
 * text, it does nothing about the shift. The fix is a fallback `@font-face`
 * carrying `size-adjust` and the ascent/descent overrides, and computing those
 * needs `unitsPerEm`, `ascent` and `descent` from inside the font file.
 *
 * `@fontsource` ships neither the overrides nor the metrics to derive them —
 * its `metadata.json` stops at family, subsets and licence. `next/font/local`
 * reads the file itself at build time and emits the adjusted fallback, which is
 * why the loading moved here and the packages went away. It also preloads the
 * files, which a stylesheet `@font-face` cannot: the browser only discovers
 * those after it has parsed the CSS.
 *
 * None of this is observable from the rendered DOM, and no assertion in this
 * repository measures layout shift. So the guard is the source file.
 */
describe("the typefaces load through next/font", () => {
  it("declares every family with next/font/local", () => {
    expect(layout).toContain("next/font/local");
  });

  it("no longer imports the stylesheet packages that shipped no metrics", () => {
    expect(layout).not.toContain("@fontsource");
  });

  it("points at font files that are actually in the repository", () => {
    const sources = declaredSources();
    expect(sources).toHaveLength(6);

    for (const src of sources) {
      const resolved = fileURLToPath(new URL(src, import.meta.url));
      expect(existsSync(resolved), `${src} is declared but missing`).toBe(true);
    }
  });

  it("keeps the metric-adjusted fallback enabled", () => {
    // `adjustFontFallback: false` is the one flag that switches off the whole
    // reason this indirection exists, and it would leave every other assertion
    // here green.
    expect(layout).not.toMatch(/adjustFontFallback:\s*false/);
  });
});

/**
 * The tokens are the second half of the same guard.
 *
 * `next/font` hands back a CSS variable that already resolves to the real face
 * followed by its adjusted fallback. Naming the family literally in the token —
 * `'IBM Plex Sans', system-ui` — loads the same letters and silently skips the
 * adjusted fallback, which is exactly the state this change moved away from.
 */
describe("the typography tokens consume those faces", () => {
  it("routes every family through a next/font variable", () => {
    for (const [name, value] of Object.entries(TYPOGRAPHY_TOKENS)) {
      expect(value, `${name} must reference a next/font variable`).toMatch(
        /var\(--font-[\w-]+-face\)/,
      );
    }
  });

  it("names no family directly", () => {
    const values = Object.values(TYPOGRAPHY_TOKENS).join(" ");
    expect(values).not.toContain("IBM Plex");
    expect(values).not.toContain("Source Serif");
  });
});
