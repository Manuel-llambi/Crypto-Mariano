import { describe, expect, expectTypeOf, it } from "vitest";
import { z } from "zod";
import { ModuleSchema, ProgramSchema } from "./schemas";
import type { ProgramInput } from "@/lib/program/derive";

/** Collects every `unrecognized_keys` key reported by a failed parse. */
function unrecognizedKeys(error: z.ZodError): string[] {
  return error.issues.flatMap((issue) =>
    issue.code === "unrecognized_keys" ? issue.keys : [],
  );
}

const availableModule = { status: "available", title: "Rastreo de fondos", videoMinutes: 42 };
const comingSoonModule = { status: "coming-soon", title: "Mixers", teaser: "Adelanto" };

describe("ModuleSchema", () => {
  // 4.1 — the two states are mutually exclusive by construction of the type.
  it("rejects a status outside the two allowed values", () => {
    expect(ModuleSchema.safeParse({ ...availableModule, status: "draft" }).success).toBe(false);
    expect(ModuleSchema.safeParse({ status: "available", title: "t", videoMinutes: 1 }).success).toBe(
      true,
    );
    expect(ModuleSchema.safeParse(comingSoonModule).success).toBe(true);
  });

  // 4.6 — a coming-soon module may declare neither minutes nor summary, and the
  // error names the surplus field.
  it("rejects a coming-soon module that declares videoMinutes or summary", () => {
    const withMinutes = ModuleSchema.safeParse({ ...comingSoonModule, videoMinutes: 30 });
    expect(withMinutes.success).toBe(false);
    expect(unrecognizedKeys(withMinutes.error!)).toContain("videoMinutes");

    const withSummary = ModuleSchema.safeParse({ ...comingSoonModule, summary: "Resumen" });
    expect(withSummary.success).toBe(false);
    expect(unrecognizedKeys(withSummary.error!)).toContain("summary");
  });

  // 4.7 — an available module without minutes is rejected.
  it("rejects an available module without videoMinutes", () => {
    expect(ModuleSchema.safeParse({ status: "available", title: "Rastreo" }).success).toBe(false);
  });

  it("rejects video minutes that are not a positive integer", () => {
    expect(ModuleSchema.safeParse({ ...availableModule, videoMinutes: 0 }).success).toBe(false);
    expect(ModuleSchema.safeParse({ ...availableModule, videoMinutes: -5 }).success).toBe(false);
    expect(ModuleSchema.safeParse({ ...availableModule, videoMinutes: 12.5 }).success).toBe(false);
  });

  // 3.4 — a module that declares its own code is rejected, not silently ignored.
  it("rejects a module that declares its own code", () => {
    const result = ModuleSchema.safeParse({ ...availableModule, code: "EXP-00" });
    expect(result.success).toBe(false);
    expect(unrecognizedKeys(result.error!)).toContain("code");
  });

  // 4.2 — a coming-soon module always carries its teaser.
  it("rejects a coming-soon module without a teaser", () => {
    expect(ModuleSchema.safeParse({ status: "coming-soon", title: "Mixers" }).success).toBe(false);
  });

  // 2.8 — empty or whitespace-only text is rejected.
  it("rejects blank titles and blank summaries", () => {
    expect(ModuleSchema.safeParse({ ...availableModule, title: "   " }).success).toBe(false);
    expect(ModuleSchema.safeParse({ ...availableModule, title: "" }).success).toBe(false);
    expect(ModuleSchema.safeParse({ ...availableModule, summary: "  " }).success).toBe(false);
    expect(ModuleSchema.safeParse({ ...comingSoonModule, teaser: " " }).success).toBe(false);
  });

  // Enables the 4.3 and 4.4 branches downstream in T11.
  it("accepts an available module with and without a summary", () => {
    expect(ModuleSchema.safeParse(availableModule).success).toBe(true);
    expect(ModuleSchema.safeParse({ ...availableModule, summary: "Resumen" }).success).toBe(true);
  });
});

describe("ProgramSchema", () => {
  // 2.5 — at least one module.
  it("rejects a program with zero modules", () => {
    expect(ProgramSchema.safeParse({ description: "Temario", modules: [] }).success).toBe(false);
  });

  // 3.4 — the content file may not declare derived values.
  it("rejects a program that declares moduleCount or duration", () => {
    const withCount = ProgramSchema.safeParse({
      description: "Temario",
      modules: [availableModule],
      moduleCount: 1,
    });
    expect(withCount.success).toBe(false);
    expect(unrecognizedKeys(withCount.error!)).toContain("moduleCount");

    const withDuration = ProgramSchema.safeParse({
      description: "Temario",
      modules: [availableModule],
      duration: "1 h",
    });
    expect(withDuration.success).toBe(false);
    expect(unrecognizedKeys(withDuration.error!)).toContain("duration");
  });

  // 2.8 — the description is text like any other.
  it("rejects a blank description", () => {
    expect(ProgramSchema.safeParse({ description: "  ", modules: [availableModule] }).success).toBe(
      false,
    );
  });

  it("accepts a program with a mixed module list", () => {
    expect(
      ProgramSchema.safeParse({
        description: "Temario",
        modules: [availableModule, comingSoonModule],
      }).success,
    ).toBe(true);
  });

  // The schema output is exactly what deriveProgram consumes.
  it("produces the input type of deriveProgram", () => {
    expectTypeOf<z.infer<typeof ProgramSchema>>().toEqualTypeOf<ProgramInput>();
  });
});
