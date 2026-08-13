import { describe, expect, it } from "vitest";

import { contrastRatio } from "./contrast";

describe("contrastRatio", () => {
  // The two anchors of the WCAG formula: no contrast, and the most there is.
  it("is 1 between a colour and itself", () => {
    expect(contrastRatio("#16213c", "#16213c")).toBeCloseTo(1, 5);
  });

  it("is 21 between black and white", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
  });

  it("does not depend on the order of the pair", () => {
    expect(contrastRatio("#7d6234", "#ffffff")).toBeCloseTo(
      contrastRatio("#ffffff", "#7d6234"),
      10,
    );
  });

  // Anchored on a value design.md states, so a broken formula cannot pass.
  it("reproduces the ratio design.md measured for the navy", () => {
    expect(contrastRatio("#16213c", "#ffffff")).toBeCloseTo(15.95, 2);
  });

  it("reproduces the ratio design.md measured for the original gold", () => {
    expect(contrastRatio("#98773e", "#ffffff")).toBeCloseTo(4.16, 2);
  });

  it("reproduces the ratio design.md measured for the original grey", () => {
    expect(contrastRatio("#76777e", "#ffffff")).toBeCloseTo(4.46, 2);
  });

  it("accepts a three digit hex", () => {
    expect(contrastRatio("#fff", "#000")).toBeCloseTo(21, 5);
  });

  it("rejects a value that is not a hex colour", () => {
    expect(() => contrastRatio("navy", "#ffffff")).toThrow();
    expect(() => contrastRatio("#12345", "#ffffff")).toThrow();
  });
});
