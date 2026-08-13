import { formatDuration } from "@/lib/format/duration";

/** A published module: it always declares its video length (4.7). */
export interface AvailableModuleInput {
  status: "available";
  title: string;
  /** Revealed by the disclosure control when present (4.3 / 4.4). */
  summary?: string;
  videoMinutes: number;
}

/** An announced module: permanently visible teaser, never a duration (4.2, 4.6). */
export interface ComingSoonModuleInput {
  status: "coming-soon";
  title: string;
  teaser: string;
}

export type ModuleInput = AvailableModuleInput | ComingSoonModuleInput;

export interface ProgramInput {
  description: string;
  modules: ModuleInput[];
}

export type DerivedModule = ModuleInput & {
  /** "EXP-00", derived from the position in the syllabus (3.1). */
  code: string;
};

export interface DerivedProgram {
  description: string;
  modules: DerivedModule[];
  /** modules.length (3.2) */
  moduleCount: number;
  /** Sum of the available modules only (3.3) */
  totalMinutes: number;
  /** null when totalMinutes is zero, so the section omits the figure (3.5) */
  durationLabel: string | null;
}

/** Formats a zero-based position as the visible file code `EXP-NN` (3.1). */
function moduleCode(index: number): string {
  return `EXP-${String(index).padStart(2, "0")}`;
}

/**
 * Turns the raw module list into the program the page shows.
 *
 * This is the only calculation in the project: content files never declare a
 * code, a module count or a duration — `.strict()` rejects them (3.4).
 */
export function deriveProgram(input: ProgramInput): DerivedProgram {
  const modules: DerivedModule[] = input.modules.map((module, index) => ({
    ...module,
    code: moduleCode(index),
  }));

  const totalMinutes = modules.reduce(
    (sum, module) => (module.status === "available" ? sum + module.videoMinutes : sum),
    0,
  );

  return {
    description: input.description,
    modules,
    moduleCount: modules.length,
    totalMinutes,
    durationLabel: totalMinutes === 0 ? null : formatDuration(totalMinutes),
  };
}
