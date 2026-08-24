import { PanelIcon } from "@/components/ui/PanelIcon";
import type { PanelContent } from "@/lib/content/schemas";
import type { CurrentModule } from "@/lib/panel/derive";

import styles from "./ContinueCard.module.css";

interface ContinueCardProps {
  copy: PanelContent["continueCard"];
  module: CurrentModule;
  estimatedMinutes: number;
  attachmentCount: number;
  /** Whether there is anything to go back to. From `derivePanel`. */
  started: boolean;
  /**
   * Where the control opens, or null when there is nothing to open.
   *
   * Resolved by the page through `currentLessonHref`, which answers only when
   * the lesson the record points at lives inside the module this card names.
   * Null is not an error: a module with no lessons yet has nothing to offer.
   */
  href: string | null;
}

/**
 * The module the student is standing on, and the control that opens it.
 *
 * The wording swaps with the record: someone who has opened nothing is offered
 * «Comenzar», not «Reanudar» — the second would claim a history the record
 * denies, on the most prominent control of the screen.
 *
 * The control has two shapes and the address decides which. With one it is an
 * anchor into the lesson viewer, so it works with no JavaScript at all, opens
 * in a new tab on a middle click and shows its destination in the status bar —
 * everything a `<button>` would have thrown away. With none it stays the inert
 * button it has always been, because a link into a 404 is worse than a control
 * that admits it does nothing. The same rule `PanelSidebar` applies to a nav
 * entry whose screen does not exist yet.
 */
export function ContinueCard({
  copy,
  module,
  estimatedMinutes,
  attachmentCount,
  started,
  href,
}: ContinueCardProps) {
  const label = started ? copy.ctaLabel : copy.startCtaLabel;

  return (
    <section className={styles.card} aria-labelledby="panel-continue-title">
      <p className={styles.eyebrow}>
        <span className={styles.dot} aria-hidden="true" />
        {started ? copy.eyebrow : copy.startEyebrow}
      </p>

      <h2 className={styles.title} id="panel-continue-title">
        {module.title}
      </h2>

      {module.description !== null && <p className={styles.description}>{module.description}</p>}

      <div className={styles.footer}>
        <p className={styles.meta}>
          <span>
            {copy.durationLabel}: {estimatedMinutes} min
          </span>
          <span className={styles.separator} aria-hidden="true">
            |
          </span>
          <span className={styles.attachments}>
            <PanelIcon name="clip" className={styles.metaIcon} />
            {attachmentCount} {copy.attachmentsLabel}
          </span>
        </p>

        {href === null ? (
          <button className={styles.cta} type="button">
            {label}
            <PanelIcon name="arrow" className={styles.ctaIcon} />
          </button>
        ) : (
          <a className={styles.cta} href={href}>
            {label}
            <PanelIcon name="arrow" className={styles.ctaIcon} />
          </a>
        )}
      </div>
    </section>
  );
}
