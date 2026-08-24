import type { CSSProperties } from "react";

import { PanelIcon, type PanelIconName } from "@/components/ui/PanelIcon";
import type { LessonScreenContent } from "@/lib/content/schemas";
import type { CourseOutline, LessonState } from "@/lib/lesson/outline";

import styles from "./LessonOutline.module.css";

interface LessonOutlineProps {
  copy: LessonScreenContent["outline"];
  states: LessonScreenContent["states"];
  outline: CourseOutline;
  /** The lesson on screen, which is not always the one the record points at. */
  moduleCode: string;
  lessonCode: string;
}

/**
 * The glyph of each state.
 *
 * Indexed by `LessonState`, so adding a state to the union leaves this
 * incomplete and `tsc` names it. Decorative in every case (9.3): the state is
 * also written out for assistive technology, never signalled by the icon or by
 * colour alone.
 */
const STATE_ICON: Record<LessonState, PanelIconName> = {
  passed: "check",
  current: "play",
  upcoming: "circle",
  locked: "lock",
};

const STATE_CLASS: Record<LessonState, string | undefined> = {
  passed: styles.rowPassed,
  current: styles.rowCurrent,
  upcoming: undefined,
  locked: styles.rowLocked,
};

/**
 * The syllabus down the left of the lesson viewer.
 *
 * Native `<details>` and nothing else, like `Disclosure`: no state, no handler,
 * no client directive. That is what keeps the screen working with JavaScript
 * disabled (8.1) and `NavPanel` the only client component of the site. The
 * module the student stands in is `open` in the served HTML, so the tree
 * arrives already unfolded on the right module rather than being unfolded by a
 * script after paint.
 *
 * It is not `Disclosure` itself because the two summaries have nothing in
 * common: that one shows a line of text, this one a code, a title, a counter
 * and a chevron. Sharing them would mean a prop deciding which half exists.
 *
 * A module with no lessons gets no control at all — a chevron that opens onto
 * nothing is worse than a plain heading, and it is the same rule `Disclosure`
 * applies when its children are blank.
 */
export function LessonOutline({
  copy,
  states,
  outline,
  moduleCode,
  lessonCode,
}: LessonOutlineProps) {
  const bar = { "--percent": `${outline.percent}%` } as CSSProperties;

  return (
    <nav className={styles.outline} aria-label={copy.ariaLabel}>
      <section className={styles.progress}>
        <p className={styles.progressLabel}>{copy.progressLabel}</p>

        <div className={styles.figures}>
          {/* Decoration: the figure it draws is spelled out beside it. */}
          <div className={styles.ring} style={bar} aria-hidden="true" />
          <p className={styles.percent}>
            <span className={styles.percentValue}>{outline.percent}%</span>
            <span className={styles.percentDetail}>
              {outline.passedCount}/{outline.lessonCount} {copy.lessonsSuffix}
            </span>
          </p>
        </div>

        <p className={styles.bar} style={bar} aria-hidden="true">
          <span className={styles.barFill} />
        </p>
      </section>

      <ul className={styles.modules}>
        {outline.modules.map((module) => {
          const head = (
            <>
              <span className={styles.moduleCode}>{module.code}</span>
              <span className={styles.moduleTitle}>{module.title}</span>
              {module.lessonCount > 0 ? (
                <span className={styles.moduleCount}>
                  {module.passedCount}/{module.lessonCount} {copy.completedSuffix}
                </span>
              ) : (
                module.locked && <span className={styles.moduleCount}>{states.locked}</span>
              )}
            </>
          );

          return (
            <li className={styles.module} key={module.code}>
              {module.lessonCount === 0 ? (
                <div className={styles.moduleHeading}>{head}</div>
              ) : (
                <details className={styles.disclosure} open={module.isCurrent}>
                  <summary className={styles.summary}>
                    {head}
                    <PanelIcon name="chevron" className={styles.chevron} />
                  </summary>

                  <ul className={styles.lessons}>
                    {module.lessons.map((entry) => {
                      const active = module.code === moduleCode && entry.code === lessonCode;
                      const className = [
                        styles.row,
                        STATE_CLASS[entry.state],
                        active ? styles.rowActive : undefined,
                      ]
                        .filter(Boolean)
                        .join(" ");

                      const body = (
                        <>
                          <PanelIcon name={STATE_ICON[entry.state]} className={styles.rowIcon} />
                          <span className={styles.rowTitle}>{entry.title}</span>
                          <span className={styles.rowDuration}>{entry.duration}</span>
                          {/* Never colour alone (9.4): the state is also words. */}
                          <span className={styles.rowState}>{states[entry.state]}</span>
                        </>
                      );

                      return (
                        <li key={entry.code}>
                          {entry.href === null ? (
                            <span className={className}>{body}</span>
                          ) : (
                            <a
                              className={className}
                              href={entry.href}
                              aria-current={active ? "page" : undefined}
                            >
                              {body}
                            </a>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </details>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
