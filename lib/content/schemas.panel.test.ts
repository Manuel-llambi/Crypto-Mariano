import { describe, expect, it } from "vitest";
import { z } from "zod";

import { PanelSchema } from "./schemas";
import { panel as rawPanel } from "@/content/panel";

/** Collects every `unrecognized_keys` key reported by a failed parse. */
function unrecognizedKeys(error: z.ZodError): string[] {
  return error.issues.flatMap((issue) => (issue.code === "unrecognized_keys" ? issue.keys : []));
}

/** A structurally valid panel, used as the base every case deviates from. */
const valid = {
  title: "Panel del alumno",
  student: { name: "Mariano", statusLabel: "Estado del investigador", statusValue: "Activo" },
  nav: [
    { id: "courses", icon: "book", label: "Mis cursos" },
    { id: "resources", icon: "document", label: "Recursos" },
  ],
  settingsLabel: "Ajustes",
  logoutLabel: "Cerrar sesión",
  welcome: {
    eyebrow: "Curso",
    greeting: "Bienvenido",
    body: "Tu expediente está activo.",
    startBody: "Tu expediente está listo.",
  },
  continueCard: {
    eyebrow: "Continuar aprendizaje",
    startEyebrow: "Comenzar aprendizaje",
    durationLabel: "Duración est.",
    attachmentsLabel: "Archivos adjuntos",
    ctaLabel: "Reanudar",
    startCtaLabel: "Comenzar",
  },
  progressCard: {
    title: "Progreso del expediente",
    completedLabel: "Completado",
    modulesLabel: "Módulos aprobados",
    hoursLabel: "Horas invertidas",
    hoursSuffix: "h",
  },
  modules: {
    filterLabel: "Filtrar",
    passedBadge: "Completado",
    passedLabel: "Aprobado",
    currentBadge: "En curso",
    availableBadge: "Disponible",
    availableLabel: "Sin comenzar",
    lockedBadge: "Bloqueado",
    lockedPrefix: "Requiere",
  },
  record: {
    currentModuleIndex: 2,
    currentModulePercent: 40,
    overallPercent: 35,
    hoursSpent: 12.5,
    estimatedMinutes: 45,
    attachmentCount: 3,
  },
};

describe("PanelSchema", () => {
  it("accepts the shape the screen is built from", () => {
    expect(PanelSchema.safeParse(valid).success).toBe(true);
  });

  /**
   * The same rule as 3.4, applied to the student record: module codes are
   * derived from the position in the syllabus, so a file that spells one out
   * has invented a second source of truth.
   */
  it("rejects a record that names a module code", () => {
    const result = PanelSchema.safeParse({
      ...valid,
      record: { ...valid.record, currentModuleCode: "EXP-02" },
    });

    expect(result.success).toBe(false);
    expect(unrecognizedKeys(result.error!)).toContain("currentModuleCode");
  });

  it("rejects a nav item that declares its own address", () => {
    const result = PanelSchema.safeParse({
      ...valid,
      nav: [{ ...valid.nav[0], href: "/recursos" }],
    });

    expect(result.success).toBe(false);
    expect(unrecognizedKeys(result.error!)).toContain("href");
  });

  it("rejects a percentage outside 0 to 100", () => {
    for (const key of ["currentModulePercent", "overallPercent"] as const) {
      expect(PanelSchema.safeParse({ ...valid, record: { ...valid.record, [key]: 101 } }).success)
        .toBe(false);
      expect(PanelSchema.safeParse({ ...valid, record: { ...valid.record, [key]: -1 } }).success)
        .toBe(false);
    }
  });

  it("rejects a negative module index", () => {
    const result = PanelSchema.safeParse({
      ...valid,
      record: { ...valid.record, currentModuleIndex: -1 },
    });

    expect(result.success).toBe(false);
  });

  /**
   * The screen picks its copy from the record, so both branches have to exist.
   * Dropping the «sin empezar» half would leave a new student reading
   * «Reanudar» over a course they never opened.
   */
  it("needs the copy of both branches, started and not", () => {
    const { startCtaLabel: _dropped, ...withoutStart } = valid.continueCard;

    expect(PanelSchema.safeParse({ ...valid, continueCard: withoutStart }).success).toBe(false);
  });

  it("rejects a blank label", () => {
    const result = PanelSchema.safeParse({ ...valid, settingsLabel: "   " });

    expect(result.success).toBe(false);
  });

  it("needs at least one navigation destination", () => {
    expect(PanelSchema.safeParse({ ...valid, nav: [] }).success).toBe(false);
  });
});

/**
 * The real file, not a fixture.
 *
 * `lib/content` parses it at import time, so this only restates that the
 * shipped copy is the shape the screen expects — the same guarantee the other
 * content files get.
 */
describe("content/panel.ts", () => {
  it("satisfies the schema", () => {
    const result = PanelSchema.safeParse(rawPanel);

    expect(result.error?.issues ?? []).toEqual([]);
    expect(result.success).toBe(true);
  });

  // The register closed on 2026-08-13: tuteo, never voseo.
  it("addresses the student as «tú», not «vos»", () => {
    const copy = JSON.stringify(rawPanel);

    for (const voseo of ["Continuá", "Seguí", "Ingresá", "tenés", "podés"]) {
      expect(copy).not.toContain(voseo);
    }
  });
});
