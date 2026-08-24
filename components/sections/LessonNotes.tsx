import type { LessonEntry, LessonScreenContent } from "@/lib/content/schemas";
import { LESSON_VIEWS, type LessonView, lessonViewHref } from "@/lib/routes";

import styles from "./LessonNotes.module.css";

interface LessonNotesProps {
  copy: LessonScreenContent["notes"];
  entry: LessonEntry;
  moduleCode: string;
  lessonCode: string;
  view: LessonView;
}

/**
 * The right rail: what the lesson says, and what it hands you.
 *
 * The two views are two addresses, not two states. The tabs are anchors
 * carrying `?vista=`, the page reads it, and this component renders one of the
 * two — so switching rails costs a navigation and needs no script (8.1),
 * keeping `NavPanel` the only client component of the site.
 *
 * They are marked up as a tab list all the same, because that is what they are
 * to anyone listening: `role="tab"` on the anchors and `aria-selected` on the
 * one showing. What is deliberately absent is `aria-controls` — it points at a
 * panel that has to exist in the same document, and here the other panel is on
 * the other end of a link.
 *
 * The resources view admits it is empty rather than inventing files. Nothing is
 * published yet, and a rail showing three plausible attachment names to an
 * audience that weighs evidence for a living is worse than a rail saying so.
 */
export function LessonNotes({ copy, entry, moduleCode, lessonCode, view }: LessonNotesProps) {
  const isContent = view === LESSON_VIEWS.content;

  const tabs = [
    { view: LESSON_VIEWS.content, label: copy.contentView },
    { view: LESSON_VIEWS.resources, label: copy.resourcesView },
  ] as const;

  return (
    <aside className={styles.notes}>
      <div className={styles.tabs} role="tablist">
        {tabs.map((tab) => {
          const selected = tab.view === view;

          return (
            <a
              className={[styles.tab, selected ? styles.tabCurrent : undefined]
                .filter(Boolean)
                .join(" ")}
              href={lessonViewHref(moduleCode, lessonCode, tab.view)}
              key={tab.view}
              role="tab"
              aria-selected={selected}
            >
              {tab.label}
            </a>
          );
        })}
      </div>

      {isContent ? (
        <div className={styles.panel}>
          <section className={styles.block}>
            <h2 className={styles.blockTitle}>{copy.descriptionTitle}</h2>
            <p className={styles.description}>{entry.summary}</p>
          </section>

          <section className={styles.block}>
            <h2 className={styles.blockTitle}>{copy.keyPointsTitle}</h2>
            {/* An ordered list: the numbers down the margin are its own ordinals
                drawn by CSS, so nothing is written twice. */}
            <ol className={styles.points}>
              {entry.keyPoints.map((point) => (
                <li className={styles.point} key={point}>
                  {point}
                </li>
              ))}
            </ol>
          </section>

          {entry.instructorNote !== undefined && (
            <section className={styles.block}>
              <h2 className={styles.blockTitle}>{copy.noteTitle}</h2>
              <figure className={styles.note}>
                <blockquote className={styles.noteText}>{entry.instructorNote.text}</blockquote>
                <figcaption className={styles.noteAuthor}>
                  {entry.instructorNote.author}
                </figcaption>
              </figure>
            </section>
          )}

          {entry.tools !== undefined && (
            <section className={styles.block}>
              <h2 className={styles.blockTitle}>{copy.toolsTitle}</h2>
              <ul className={styles.tools}>
                {entry.tools.map((tool) => (
                  <li className={styles.tool} key={tool}>
                    {tool}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      ) : (
        <div className={styles.panel}>
          <section className={styles.block}>
            <h2 className={styles.blockTitle}>{copy.filesTitle}</h2>
            <p className={styles.empty}>{copy.filesEmpty}</p>
          </section>
        </div>
      )}
    </aside>
  );
}
