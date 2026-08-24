import type { LessonEntry, LessonRecord } from "@/lib/content/schemas";
import type { DerivedModule } from "@/lib/program/derive";
import { lessonHref } from "@/lib/routes";

/**
 * Where the student stands on one lesson.
 *
 * Not to be confused with the module's `status`, which says whether the module
 * is published, nor with `ModuleState`, which is the same idea one level up.
 * `current` and `upcoming` are both unwatched; what separates them is whether
 * this is the lesson the record points at.
 */
export type LessonState = "passed" | "current" | "upcoming" | "locked";

export interface OutlineLesson {
  /** `LEC-01`, derived from the position inside the module. */
  code: string;
  title: string;
  /** `MM:SS`, straight from the content file. */
  duration: string;
  state: LessonState;
  /**
   * Where it opens, or null when it is shut.
   *
   * Null rather than an address into a redirection: the tree renders those as
   * plain text, the same way `PanelSidebar` renders a nav entry whose screen
   * does not exist yet. A link that bounces is worse than a label that admits
   * it does not lead anywhere.
   */
  href: string | null;
}

export interface OutlineModule {
  /** `EXP-00`, already derived by `deriveProgram`. */
  code: string;
  title: string;
  lessons: OutlineLesson[];
  passedCount: number;
  lessonCount: number;
  /** Whether the student is standing inside it. The tree opens this one. */
  isCurrent: boolean;
  locked: boolean;
}

export interface CourseOutline {
  modules: OutlineModule[];
  /** Across the whole course, not the module. */
  passedCount: number;
  lessonCount: number;
  /** Whole percent, floored — a course is not finished until it is. */
  percent: number;
}

/** One lesson located in the syllabus, with everything the screen prints. */
export interface LocatedLesson {
  moduleCode: string;
  moduleTitle: string;
  moduleIndex: number;
  code: string;
  /** One-based, as «Lección 3 de 4» says it. */
  position: number;
  lessonCount: number;
  state: LessonState;
  entry: LessonEntry;
}

export interface LessonLink {
  title: string;
  href: string;
}

/**
 * Formats a one-based position as the visible lesson code `LEC-NN`.
 *
 * One-based where `EXP-NN` is zero-based, and deliberately: the mockup prints
 * `LEC-03` beside «Lección 3 de 4», so a zero-based code would have the two
 * halves of the same sentence disagree on which lesson this is.
 */
function lessonCode(position: number): string {
  return `LEC-${String(position).padStart(2, "0")}`;
}

/** The lessons hanging off module `index`, or none when it has none. */
function lessonsAt(moduleLessons: LessonEntry[][], index: number): LessonEntry[] {
  return moduleLessons[index] ?? [];
}

/**
 * Whether the student may open module `index`.
 *
 * The same gate `derivePanel` applies to the dashboard: everything at or before
 * the position is open, everything after it is shut. Inside an open module every
 * lesson opens — someone allowed into a module is allowed to look ahead in it.
 */
function isLocked(index: number, record: LessonRecord): boolean {
  return index > record.moduleIndex;
}

function stateOf(moduleIndex: number, lessonIndex: number, record: LessonRecord): LessonState {
  if (isLocked(moduleIndex, record)) return "locked";
  if (moduleIndex < record.moduleIndex) return "passed";
  if (lessonIndex < record.lessonIndex) return "passed";
  return lessonIndex === record.lessonIndex ? "current" : "upcoming";
}

/**
 * Builds the course tree the sidebar draws.
 *
 * Every code, every count and every percentage below follows from the record's
 * two indices and the length of the lists — nothing here is declared. That is
 * what keeps this screen, the dashboard and the landing showing one syllabus:
 * insert a module and all three renumber.
 */
export function deriveOutline(
  modules: DerivedModule[],
  moduleLessons: LessonEntry[][],
  record: LessonRecord,
): CourseOutline {
  const outline: OutlineModule[] = modules.map((module, moduleIndex) => {
    const entries = lessonsAt(moduleLessons, moduleIndex);
    const locked = isLocked(moduleIndex, record);

    const lessons: OutlineLesson[] = entries.map((entry, lessonIndex) => {
      const code = lessonCode(lessonIndex + 1);
      const state = stateOf(moduleIndex, lessonIndex, record);

      return {
        code,
        title: entry.title,
        duration: entry.duration,
        state,
        href: state === "locked" ? null : lessonHref(module.code, code),
      };
    });

    return {
      code: module.code,
      title: module.title,
      lessons,
      passedCount: lessons.filter((entry) => entry.state === "passed").length,
      lessonCount: lessons.length,
      isCurrent: moduleIndex === record.moduleIndex,
      locked,
    };
  });

  const lessonCount = outline.reduce((sum, module) => sum + module.lessonCount, 0);
  const passedCount = outline.reduce((sum, module) => sum + module.passedCount, 0);

  return {
    modules: outline,
    passedCount,
    lessonCount,
    // Guarded because a syllabus with no lessons at all would divide by zero.
    percent: lessonCount === 0 ? 0 : Math.floor((passedCount / lessonCount) * 100),
  };
}

/**
 * Resolves the two address segments to a lesson, or null when they name none.
 *
 * Case-insensitive on both, because the address carries them lowercased and the
 * screen prints them uppercased: matching on the exact spelling would make a
 * link the screen itself renders fail to resolve.
 */
export function findLesson(
  modules: DerivedModule[],
  moduleLessons: LessonEntry[][],
  record: LessonRecord,
  moduleParam: string,
  lessonParam: string,
): LocatedLesson | null {
  const wantedModule = moduleParam.toUpperCase();
  const wantedLesson = lessonParam.toUpperCase();

  const moduleIndex = modules.findIndex((module) => module.code === wantedModule);
  if (moduleIndex === -1) return null;

  const module = modules[moduleIndex];
  if (module === undefined) return null;

  const entries = lessonsAt(moduleLessons, moduleIndex);
  const lessonIndex = entries.findIndex(
    (_entry, index) => lessonCode(index + 1) === wantedLesson,
  );
  if (lessonIndex === -1) return null;

  const entry = entries[lessonIndex];
  if (entry === undefined) return null;

  return {
    moduleCode: module.code,
    moduleTitle: module.title,
    moduleIndex,
    code: wantedLesson,
    position: lessonIndex + 1,
    lessonCount: entries.length,
    state: stateOf(moduleIndex, lessonIndex, record),
    entry,
  };
}

/**
 * The lesson before and after, crossing the module boundary.
 *
 * The last lesson of a module leads into the first of the next one, so the
 * course reads as one sequence rather than as seven that each dead-end. A
 * neighbour inside a module the student has not reached is not offered: the
 * outline already refuses to link it, and the header must not disagree.
 */
export function neighbours(
  outline: CourseOutline,
  moduleCode: string,
  lessonCode: string,
): { previous: LessonLink | null; next: LessonLink | null } {
  const flat = outline.modules.flatMap((module) => module.lessons);
  const at = flat.findIndex(
    (entry) =>
      entry.code === lessonCode &&
      outline.modules.some(
        (module) => module.code === moduleCode && module.lessons.includes(entry),
      ),
  );

  if (at === -1) return { previous: null, next: null };

  const linkTo = (entry: OutlineLesson | undefined): LessonLink | null =>
    entry === undefined || entry.href === null ? null : { title: entry.title, href: entry.href };

  return {
    previous: linkTo(flat[at - 1]),
    next: linkTo(flat[at + 1]),
  };
}

/**
 * Where the dashboard's «Comenzar» opens, or null when nothing opens.
 *
 * The dashboard names a module — read from `content/panel.ts` — and this tree
 * carries the position — read from `content/lesson.ts`. Two files, two records,
 * and nothing forces them to agree. So the module code is an argument and not
 * an assumption: the address comes back only when the lesson the record points
 * at actually lives inside the module the card is naming.
 *
 * Null is a real answer and the caller must draw it. A module with no lessons
 * yet, a position in some other module, a code the syllabus does not have —
 * all three are silence, the same silence `OutlineLesson.href` uses for a
 * lesson that is shut. A control that admits it leads nowhere beats a link
 * into a 404.
 */
export function currentLessonHref(outline: CourseOutline, moduleCode: string): string | null {
  const module = outline.modules.find((entry) => entry.code === moduleCode);
  if (module === undefined) return null;

  return module.lessons.find((entry) => entry.state === "current")?.href ?? null;
}
