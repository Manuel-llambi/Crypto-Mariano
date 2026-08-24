import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { contrastRatio } from "@/lib/color/contrast";
import {
  COLOR_TOKENS,
  DARK_SURFACES,
  DECORATION_EXEMPT_ON,
  DECORATION_TOKENS,
  LIGHT_SURFACES,
  REJECTED_AS_TEXT,
  TEXT_PAIRS,
  TOKENS,
  UI_PAIRS,
} from "./tokens";

const css = readFileSync(new URL("./tokens.css", import.meta.url), "utf8");

/** The declarations of the `:root` block, as a name → value record. */
function declaredInCss(): Record<string, string> {
  const root = /:root\s*\{([^}]*)\}/.exec(css);
  if (root === null) {
    throw new Error("styles/tokens.css declares no :root block");
  }

  const declared: Record<string, string> = {};
  for (const line of root[1]!.split(";")) {
    const match = /^\s*(--[\w-]+)\s*:\s*(.+?)\s*$/.exec(line);
    if (match !== null) {
      declared[match[1]!] = match[2]!;
    }
  }
  return declared;
}

describe("tokens.css derives from the tokens module", () => {
  // One source of truth: the stylesheet cannot drift from the tested values.
  it("declares exactly the tokens the module defines", () => {
    expect(Object.keys(declaredInCss()).sort()).toEqual(Object.keys(TOKENS).sort());
  });

  it("declares the same value for every token", () => {
    expect(declaredInCss()).toEqual(TOKENS);
  });
});

describe("9.4 — contrast of the text pairs", () => {
  for (const [foreground, surface] of TEXT_PAIRS) {
    it(`${foreground} reaches 4.5:1 on ${surface}`, () => {
      const ratio = contrastRatio(COLOR_TOKENS[foreground], COLOR_TOKENS[surface]);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  }
});

describe("9.4 — contrast of the interface pairs", () => {
  for (const [foreground, surface] of UI_PAIRS) {
    it(`${foreground} reaches 3:1 on ${surface}`, () => {
      const ratio = contrastRatio(COLOR_TOKENS[foreground], COLOR_TOKENS[surface]);
      expect(ratio).toBeGreaterThanOrEqual(3);
    });
  }
});

describe("9.4 — the two rejected colours cannot come back as text", () => {
  // design.md corrected #98773e and #76777e; this is the regression guard.
  // #98773e is still a token — `--color-tertiary` — so the guard has to be about
  // the *role*, not the value: what it may never be is a text foreground.
  it("keeps them out of every text pair", () => {
    const foregrounds = TEXT_PAIRS.map(([foreground]) =>
      COLOR_TOKENS[foreground].toLowerCase(),
    );
    for (const rejected of REJECTED_AS_TEXT) {
      expect(foregrounds).not.toContain(rejected);
    }
  });

  it("states why they were rejected: neither reaches 4.5:1", () => {
    for (const rejected of REJECTED_AS_TEXT) {
      for (const surface of LIGHT_SURFACES) {
        expect(contrastRatio(rejected, COLOR_TOKENS[surface])).toBeLessThan(4.5);
      }
    }
  });
});

describe("the pairing model holds", () => {
  /**
   * Enumerated pairs buy precision and cost coverage: a colour whose pairs
   * nobody wrote is a colour nobody measures, and it fails nothing. This is the
   * test that turns that silence into a red run.
   */
  it("assigns every colour token a role", () => {
    const paired = new Set<string>();
    for (const [foreground, surface] of [...TEXT_PAIRS, ...UI_PAIRS]) {
      paired.add(foreground);
      paired.add(surface);
    }
    for (const token of DECORATION_TOKENS) {
      paired.add(token);
    }
    expect([...paired].sort()).toEqual(Object.keys(COLOR_TOKENS).sort());
  });

  it("gives every surface something legible on it", () => {
    for (const surface of [...LIGHT_SURFACES, ...DARK_SURFACES]) {
      const readable = TEXT_PAIRS.filter(([, paired]) => paired === surface);
      expect(readable.length).toBeGreaterThan(0);
    }
  });

  it("never lets a token be both a decoration and a foreground", () => {
    const foregrounds = TEXT_PAIRS.map(([foreground]) => foreground);
    const elements = UI_PAIRS.map(([foreground]) => foreground);
    for (const token of DECORATION_TOKENS) {
      expect(foregrounds).not.toContain(token);
      expect(elements).not.toContain(token);
    }
  });

  // Decoration is exempt from 9.4, so the exemption must be a deliberate act:
  // the test states what it costs, rather than letting it pass unnoticed.
  it("records that the decoration tokens would not reach 3:1", () => {
    for (const token of DECORATION_TOKENS) {
      for (const surface of DECORATION_EXEMPT_ON) {
        expect(contrastRatio(COLOR_TOKENS[token], COLOR_TOKENS[surface])).toBeLessThan(3);
      }
    }
  });
});
