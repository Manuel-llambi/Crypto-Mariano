import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { contrastRatio } from "@/lib/color/contrast";
import {
  BACKGROUND_TOKENS,
  COLOR_TOKENS,
  DECORATION_TOKENS,
  REJECTED_AS_TEXT,
  TEXT_TOKENS,
  TOKENS,
  UI_TOKENS,
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

describe("9.4 — contrast of the text tokens", () => {
  for (const token of TEXT_TOKENS) {
    for (const background of BACKGROUND_TOKENS) {
      it(`${token} reaches 4.5:1 on ${background}`, () => {
        const ratio = contrastRatio(COLOR_TOKENS[token], COLOR_TOKENS[background]);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
});

describe("9.4 — contrast of the interface tokens", () => {
  for (const token of UI_TOKENS) {
    for (const background of BACKGROUND_TOKENS) {
      it(`${token} reaches 3:1 on ${background}`, () => {
        const ratio = contrastRatio(COLOR_TOKENS[token], COLOR_TOKENS[background]);
        expect(ratio).toBeGreaterThanOrEqual(3);
      });
    }
  }
});

describe("9.4 — the two rejected colours cannot come back as text", () => {
  // design.md corrected #98773e and #76777e; this is the regression guard.
  it("keeps them out of the text tokens", () => {
    const textValues = TEXT_TOKENS.map((token) => COLOR_TOKENS[token].toLowerCase());
    for (const rejected of REJECTED_AS_TEXT) {
      expect(textValues).not.toContain(rejected);
    }
  });

  it("keeps them out of every text declaration of the stylesheet", () => {
    const declared = declaredInCss();
    for (const token of TEXT_TOKENS) {
      for (const rejected of REJECTED_AS_TEXT) {
        expect(declared[token]?.toLowerCase()).not.toBe(rejected);
      }
    }
  });

  it("states why they were rejected: neither reaches 4.5:1", () => {
    for (const rejected of REJECTED_AS_TEXT) {
      for (const background of BACKGROUND_TOKENS) {
        expect(contrastRatio(rejected, COLOR_TOKENS[background])).toBeLessThan(4.5);
      }
    }
  });
});

describe("the token set is closed", () => {
  it("classifies every colour token", () => {
    const classified = [
      ...TEXT_TOKENS,
      ...UI_TOKENS,
      ...BACKGROUND_TOKENS,
      ...DECORATION_TOKENS,
    ].sort();
    expect(classified).toEqual(Object.keys(COLOR_TOKENS).sort());
  });

  it("classifies each colour token exactly once", () => {
    const classified = [...TEXT_TOKENS, ...UI_TOKENS, ...BACKGROUND_TOKENS, ...DECORATION_TOKENS];
    expect(new Set(classified).size).toBe(classified.length);
  });

  // Decoration is exempt from 9.4, so the exemption must be a deliberate act:
  // the test states what it costs, rather than letting it pass unnoticed.
  it("records that the decoration tokens would not reach 3:1", () => {
    for (const token of DECORATION_TOKENS) {
      for (const background of BACKGROUND_TOKENS) {
        expect(contrastRatio(COLOR_TOKENS[token], COLOR_TOKENS[background])).toBeLessThan(3);
      }
    }
  });
});
