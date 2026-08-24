import { PanelIcon } from "@/components/ui/PanelIcon";
import type { LessonScreenContent } from "@/lib/content/schemas";
import type { LessonLink, LessonState } from "@/lib/lesson/outline";

import styles from "./LessonHeader.module.css";

interface LessonHeaderProps {
  copy: LessonScreenContent["header"];
  states: LessonScreenContent["states"];
  moduleCode: string;
  title: string;
  /** One-based, as «Lección 3 de 4» reads it. */
  position: number;
  lessonCount: number;
  duration: string;
  /** ISO date from the content file. */
  updatedOn: string;
  state: LessonState;
  previous: LessonLink | null;
  next: LessonLink | null;
}

const STATE_CLASS: Record<LessonState, string | undefined> = {
  passed: styles.badgePassed,
  current: styles.badgeCurrent,
  upcoming: undefined,
  locked: styles.badgeLocked,
};

/**
 * The card under the player: which lesson this is, and the way to its
 * neighbours.
 *
 * The two neighbours come from `neighbours()`, which crosses module boundaries
 * and refuses anything the student has not reached. When it refuses, the
 * control is rendered as plain text rather than as a disabled button: a
 * `<button disabled>` is a control that exists and is switched off, and this is
 * the absence of a control — there is no previous lesson to go to.
 *
 * The title is the `<h1>` of the screen. The lesson is what the page is about;
 * the module and the site name are context, and they live in the trail above.
 */
export function LessonHeader({
  copy,
  states,
  moduleCode,
  title,
  position,
  lessonCount,
  duration,
  updatedOn,
  state,
  previous,
  next,
}: LessonHeaderProps) {
  const badgeClass = [styles.badge, STATE_CLASS[state]].filter(Boolean).join(" ");

  return (
    <header className={styles.header}>
      <div className={styles.top}>
        <p className={styles.meta}>
          <span className={styles.code}>{moduleCode}</span>
          <span className={styles.separator} aria-hidden="true">
            ·
          </span>
          <span className={styles.position}>
            {copy.positionLabel} {position} {copy.positionJoiner} {lessonCount}
          </span>
          <span className={badgeClass}>{states[state]}</span>
        </p>

        <p className={styles.steps}>
          {previous === null ? (
            <span className={`${styles.step} ${styles.stepAbsent}`}>
              <PanelIcon name="chevron" className={styles.stepIconBack} />
              {copy.previousLabel}
            </span>
          ) : (
            <a className={styles.step} href={previous.href}>
              <PanelIcon name="chevron" className={styles.stepIconBack} />
              {copy.previousLabel}
            </a>
          )}

          {next === null ? (
            <span className={`${styles.step} ${styles.stepNext} ${styles.stepAbsent}`}>
              {copy.nextLabel}
              <PanelIcon name="chevron" className={styles.stepIconNext} />
            </span>
          ) : (
            <a className={`${styles.step} ${styles.stepNext}`} href={next.href}>
              {copy.nextLabel}
              <PanelIcon name="chevron" className={styles.stepIconNext} />
            </a>
          )}
        </p>
      </div>

      <h1 className={styles.title}>{title}</h1>

      <p className={styles.footnote}>
        <span className={styles.duration}>{duration}</span>
        <span className={styles.separator} aria-hidden="true">
          ·
        </span>
        <span>
          {copy.updatedLabel} <time dateTime={updatedOn}>{updatedOn}</time>
        </span>
      </p>
    </header>
  );
}
