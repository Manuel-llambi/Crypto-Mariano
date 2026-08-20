import type { PanelRecord } from "@/lib/content/schemas";
import type { DerivedModule } from "@/lib/program/derive";

/**
 * Where the student stands on one module.
 *
 * Not to be confused with the module's own `status`, which says whether the
 * module is published or announced. That is a property of the course; this is a
 * property of the student.
 *
 * `available` and `in-progress` are both the module the student is standing on;
 * what separates them is whether any of it is done. A brand new account sits on
 * the first module having opened nothing, and calling that «en curso» over an
 * empty bar would state something the record denies.
 */
export type ModuleState = "passed" | "in-progress" | "available" | "locked";

export interface PanelModule {
  /** From the syllabus, already derived from its position (3.1). */
  code: string;
  title: string;
  state: ModuleState;
  /**
   * The code that unlocks it — the previous module's — or null when nothing
   * blocks it. Derived rather than declared, so inserting a module renumbers
   * every prerequisite along with every code.
   */
  requiresCode: string | null;
}

export interface CurrentModule {
  code: string;
  title: string;
  /** Its summary or its teaser, whichever the module carries. */
  description: string | null;
}

export interface DerivedPanel {
  modules: PanelModule[];
  /** Everything before the current position. */
  passedCount: number;
  moduleCount: number;
  current: CurrentModule;
  /**
   * Whether the student has any progress at all.
   *
   * The screen branches its copy on it — «Comenzar» against «Reanudar», and the
   * greeting with them — so the rule is decided once here instead of being
   * re-derived in the page and in two components.
   */
  started: boolean;
}

/** A module's own copy, whichever of the two branches it is. */
function descriptionOf(module: DerivedModule): string | null {
  return module.status === "available" ? (module.summary ?? null) : module.teaser;
}

/**
 * Places the student inside the syllabus.
 *
 * The record declares a position and nothing else: every state, every
 * prerequisite and every counter below follows from it. That is what keeps the
 * dashboard and the landing showing one syllabus — insert a module and both
 * renumber, because neither spells a code out.
 */
export function derivePanel(modules: DerivedModule[], record: PanelRecord): DerivedPanel {
  const { currentModuleIndex, currentModulePercent } = record;
  const current = modules[currentModuleIndex];

  if (current === undefined) {
    throw new Error(
      `Invalid content in content/panel.ts:\n  - record.currentModuleIndex: ${currentModuleIndex} is outside the syllabus, which has ${modules.length} module(s)`,
    );
  }

  // A module behind means progress even at a zero share of the current one.
  const started = currentModuleIndex > 0 || currentModulePercent > 0;

  const currentState: ModuleState = currentModulePercent > 0 ? "in-progress" : "available";

  const placed: PanelModule[] = modules.map((module, index) => {
    const state: ModuleState =
      index < currentModuleIndex ? "passed" : index === currentModuleIndex ? currentState : "locked";

    return {
      code: module.code,
      title: module.title,
      state,
      requiresCode: state === "locked" ? (modules[index - 1]?.code ?? null) : null,
    };
  });

  return {
    modules: placed,
    passedCount: currentModuleIndex,
    moduleCount: modules.length,
    current: {
      code: current.code,
      title: current.title,
      description: descriptionOf(current),
    },
    started,
  };
}
