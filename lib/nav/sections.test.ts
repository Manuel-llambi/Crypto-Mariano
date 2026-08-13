import { describe, expect, it } from "vitest";
import { SECTION_IDS, type Anchor, type SectionId } from "./sections";

describe("SECTION_IDS", () => {
  // 1.2 — one unique, stable identifier per navigable section.
  it("has no repeated identifier", () => {
    expect(new Set(SECTION_IDS).size).toBe(SECTION_IDS.length);
  });

  it("lists every navigable section of the page", () => {
    expect([...SECTION_IDS]).toEqual([
      "audiencia",
      "metodologia",
      "actualizaciones",
      "programa",
      "confianza",
      "faq",
    ]);
  });

  it("uses identifiers that are valid fragment targets", () => {
    for (const id of SECTION_IDS) {
      expect(id).toMatch(/^[a-z][a-z0-9-]*$/);
    }
  });
});

describe("Anchor", () => {
  // 1.5 — a misspelled anchor is a type error, not a broken link in production.
  it("only accepts a fragment pointing at an existing section", () => {
    const valid: Anchor = "#programa";
    expect(valid).toBe("#programa");

    // @ts-expect-error "testimonios" is not a SectionId: this is the bug 1.5 forbids.
    const broken: Anchor = "#testimonios";
    expect(broken).toBe("#testimonios");

    // @ts-expect-error a SectionId without the leading "#" is not an Anchor either.
    const missingHash: Anchor = "programa";
    expect(missingHash).toBe("programa");
  });

  it("derives SectionId from the tuple, not from a hand-written union", () => {
    const id: SectionId = "confianza";
    expect(SECTION_IDS).toContain(id);

    // @ts-expect-error the tuple is the single source of truth for the type.
    const unknownId: SectionId = "contacto";
    expect(unknownId).toBe("contacto");
  });
});
