import { describe, expect, it } from "vitest";
import { formatMonth } from "./month";

describe("formatMonth", () => {
  // 2.6 — the label is the uppercase Spanish month, a space and the four-digit year.
  it("renders the month name in uppercase followed by the year", () => {
    expect(formatMonth("2026-07")).toBe("JULIO 2026");
  });

  // 2.6 — all twelve months have a Spanish label; January, July and December
  // are asserted to catch an off-by-one in the lookup table.
  it("labels every month in Spanish", () => {
    expect(formatMonth("2026-01")).toBe("ENERO 2026");
    expect(formatMonth("2026-02")).toBe("FEBRERO 2026");
    expect(formatMonth("2026-03")).toBe("MARZO 2026");
    expect(formatMonth("2026-04")).toBe("ABRIL 2026");
    expect(formatMonth("2026-05")).toBe("MAYO 2026");
    expect(formatMonth("2026-06")).toBe("JUNIO 2026");
    expect(formatMonth("2026-07")).toBe("JULIO 2026");
    expect(formatMonth("2026-08")).toBe("AGOSTO 2026");
    expect(formatMonth("2026-09")).toBe("SEPTIEMBRE 2026");
    expect(formatMonth("2026-10")).toBe("OCTUBRE 2026");
    expect(formatMonth("2026-11")).toBe("NOVIEMBRE 2026");
    expect(formatMonth("2026-12")).toBe("DICIEMBRE 2026");
  });

  // 2.6 — the result must not depend on the machine's time zone or locale.
  // "2026-01" parsed as a Date is midnight UTC, which rolls back to December in
  // negative offsets: that is the case a Date-based implementation gets wrong.
  it("does not depend on the ambient time zone", () => {
    const original = process.env.TZ;
    try {
      process.env.TZ = "Pacific/Kiritimati"; // UTC+14
      expect(formatMonth("2026-01")).toBe("ENERO 2026");
      process.env.TZ = "Pacific/Midway"; // UTC-11
      expect(formatMonth("2026-01")).toBe("ENERO 2026");
      expect(formatMonth("2026-12")).toBe("DICIEMBRE 2026");
    } finally {
      process.env.TZ = original;
    }
  });

  // The year is taken verbatim from the stored date, never from the clock.
  it("takes the year from the stored date", () => {
    expect(formatMonth("1999-03")).toBe("MARZO 1999");
  });
});
