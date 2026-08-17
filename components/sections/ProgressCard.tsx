import type { CSSProperties } from "react";

import type { PanelContent } from "@/lib/content/schemas";

import styles from "./ProgressCard.module.css";

interface ProgressCardProps {
  copy: PanelContent["progressCard"];
  /** Share of the whole course, 0 to 100. */
  overallPercent: number;
  passedCount: number;
  moduleCount: number;
  hoursSpent: number;
}

/**
 * The ring and the two figures beside the course.
 *
 * The ring is a `conic-gradient` fed by a custom property written into the
 * `style` attribute, so the arc arrives already drawn in the served HTML. No
 * canvas, no measuring, no script — 8.1 holds and `NavPanel` stays the only
 * client component of the site.
 *
 * The arc itself is decoration: the figure it represents is spelled out in the
 * middle of it, so assistive technology reads «35% completado» either way.
 */
export function ProgressCard({
  copy,
  overallPercent,
  passedCount,
  moduleCount,
  hoursSpent,
}: ProgressCardProps) {
  const ring = { "--percent": `${overallPercent}%` } as CSSProperties;

  return (
    <section className={styles.card} aria-labelledby="panel-progress-title">
      <h2 className={styles.title} id="panel-progress-title">
        {copy.title}
      </h2>

      <div className={styles.ring} style={ring}>
        <div className={styles.hole}>
          <span className={styles.percent}>{overallPercent}%</span>
          <span className={styles.percentLabel}>{copy.completedLabel}</span>
        </div>
      </div>

      <dl className={styles.figures}>
        <div className={styles.figure}>
          <dt className={styles.figureLabel}>{copy.modulesLabel}</dt>
          <dd className={styles.figureValue}>
            {passedCount} / {moduleCount}
          </dd>
        </div>
        <div className={styles.figure}>
          <dt className={styles.figureLabel}>{copy.hoursLabel}</dt>
          <dd className={styles.figureValue}>
            {hoursSpent} {copy.hoursSuffix}
          </dd>
        </div>
      </dl>
    </section>
  );
}
