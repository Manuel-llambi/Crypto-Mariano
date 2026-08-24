import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LessonHeader } from "@/components/sections/LessonHeader";
import { LessonNotes } from "@/components/sections/LessonNotes";
import { LessonOutline } from "@/components/sections/LessonOutline";
import { LessonPlayer } from "@/components/sections/LessonPlayer";
import { LessonTopBar } from "@/components/sections/LessonTopBar";
import { lesson, program, site } from "@/lib/content";
import { deriveOutline, findLesson, neighbours } from "@/lib/lesson/outline";
import { LESSON_VIEW_PARAM, lessonView } from "@/lib/routes";

import styles from "./page.module.css";

interface LessonPageProps {
  /*
   * Declared wide and narrowed after the await, like `/acceso` does.
   *
   * `tsconfig.json` includes `.next/types/**`, where Next generates the check
   * that a route's props match the ones it passes; a shape narrowed by hand can
   * clash there even when `tsc --noEmit` passes before those types exist.
   */
  params: Promise<Record<string, string | string[] | undefined>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** The two segments of the address, or null when either is missing or repeated. */
function segments(
  raw: Record<string, string | string[] | undefined>,
): { modulo: string; leccion: string } | null {
  const { modulo, leccion } = raw;

  if (typeof modulo !== "string" || typeof leccion !== "string") return null;

  return { modulo, leccion };
}

/** The lesson the address names, or null when it names none. */
function locate(raw: Record<string, string | string[] | undefined>) {
  const parts = segments(raw);
  if (parts === null) return null;

  return findLesson(
    program.modules,
    lesson.moduleLessons,
    lesson.record,
    parts.modulo,
    parts.leccion,
  );
}

/**
 * The title names the lesson, not the screen.
 *
 * `robots` is not repeated here: `app/panel/layout.tsx` declares it once for
 * everything below `/panel`, and a second copy would be a second thing to
 * remember the day the rule changes.
 */
export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const located = locate(await params);

  // The 404 is the page's decision, not this one's; a title is still needed.
  if (located === null) return { title: `${lesson.title} — ${site.name}` };

  return { title: `${located.entry.title} — ${site.name}` };
}

/**
 * The lesson viewer (UI only).
 *
 * Three columns over one syllabus: the tree on the left is the same seven
 * modules the landing and the dashboard show, read from `content/program.ts`,
 * with the lessons of `content/lesson.ts` hung off them by position. Nothing on
 * this screen declares a code, a count or a percentage — every one of them
 * follows from two indices in the record, which is what keeps the three screens
 * showing one course.
 *
 * The route is guarded, and not here: the session check lives in
 * `app/panel/layout.tsx`, so this screen is protected because of where it sits.
 * It is outside the `(inicio)` route group on purpose, which is what lets it
 * inherit that guard without inheriting the dashboard's chrome.
 *
 * No client component and no script: the tree is `<details>`, the rail tabs are
 * links, and the player is a picture. `NavPanel` stays the only client
 * component of the site (8.1).
 */
export default async function LessonPage({ params, searchParams }: LessonPageProps) {
  const located = locate(await params);

  /*
   * An address that names no lesson is a 404, and that includes a lesson inside
   * a module the syllabus does not have. What it does not include is a locked
   * lesson: that one exists, and the screen shows it as locked rather than
   * pretending the address is wrong.
   */
  if (located === null) {
    notFound();
  }

  const view = lessonView((await searchParams)[LESSON_VIEW_PARAM]);

  const outline = deriveOutline(program.modules, lesson.moduleLessons, lesson.record);
  const { previous, next } = neighbours(outline, located.moduleCode, located.code);

  return (
    <div className={styles.shell}>
      <LessonTopBar
        siteName={site.name}
        moduleCode={located.moduleCode}
        lessonTitle={located.entry.title}
        panelLabel={lesson.panelLabel}
      />

      <div className={styles.body}>
        <LessonOutline
          copy={lesson.outline}
          states={lesson.states}
          outline={outline}
          moduleCode={located.moduleCode}
          lessonCode={located.code}
        />

        <main className={styles.main}>
          <LessonPlayer
            copy={lesson.player}
            moduleCode={located.moduleCode}
            lessonCode={located.code}
            duration={located.entry.duration}
            elapsed={lesson.record.elapsed}
            playedPercent={lesson.record.playedPercent}
          />

          <LessonHeader
            copy={lesson.header}
            states={lesson.states}
            moduleCode={located.moduleCode}
            title={located.entry.title}
            position={located.position}
            lessonCount={located.lessonCount}
            duration={located.entry.duration}
            updatedOn={located.entry.updatedOn}
            state={located.state}
            previous={previous}
            next={next}
          />
        </main>

        <LessonNotes
          copy={lesson.notes}
          entry={located.entry}
          moduleCode={located.moduleCode}
          lessonCode={located.code}
          view={view}
        />
      </div>
    </div>
  );
}
