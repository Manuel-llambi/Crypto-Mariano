import { describe, expect, it } from "vitest";

import { resolveOgImage } from "./og-image";

describe("resolveOgImage (10.3)", () => {
  it("returns the path when the file is in the repository", () => {
    expect(resolveOgImage("/og.png")).toBe("/og.png");
  });

  it("throws when the file is not in the repository", () => {
    expect(() => resolveOgImage("/no-existe.png")).toThrow();
  });

  it("names the file it looked for and where", () => {
    let message = "";
    try {
      resolveOgImage("/no-existe.png");
    } catch (error) {
      message = (error as Error).message;
    }

    expect(message).toContain("no-existe.png");
    expect(message).toContain("public");
  });

  it("cites the criterion, so the failure explains itself", () => {
    let message = "";
    try {
      resolveOgImage("/no-existe.png");
    } catch (error) {
      message = (error as Error).message;
    }

    expect(message).toContain("10.3");
  });

  it("rejects a path that escapes the public directory", () => {
    expect(() => resolveOgImage("/../package.json")).toThrow();
  });

  it("rejects a directory where an image is expected", () => {
    expect(() => resolveOgImage("/")).toThrow();
  });
});
