import { describe, expect, it } from "vitest";
import { formatDuration } from "./duration";

describe("formatDuration", () => {
  // 3.6 — duration is expressed in hours and minutes.
  it("expresses hours and minutes when both parts are present", () => {
    expect(formatDuration(80)).toBe("1 h 20 min");
    expect(formatDuration(155)).toBe("2 h 35 min");
  });

  // 3.6 — below one hour the hour part is omitted.
  it("omits the hour part below one hour", () => {
    expect(formatDuration(45)).toBe("45 min");
    expect(formatDuration(1)).toBe("1 min");
  });

  // 3.6 — on exact hours the minute part is omitted, with no zero suffix.
  it("omits the minute part on exact hours", () => {
    expect(formatDuration(60)).toBe("1 h");
    expect(formatDuration(120)).toBe("2 h");
  });
});
