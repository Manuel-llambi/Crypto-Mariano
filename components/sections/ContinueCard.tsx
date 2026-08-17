import { PanelIcon } from "@/components/ui/PanelIcon";
import type { PanelContent } from "@/lib/content/schemas";
import type { CurrentModule } from "@/lib/panel/derive";

import styles from "./ContinueCard.module.css";

interface ContinueCardProps {
  copy: PanelContent["continueCard"];
  module: CurrentModule;
  estimatedMinutes: number;
  attachmentCount: number;
}

/**
 * The module the student left open, and the control that goes back to it.
 *
 * «Reanudar» is an inert button: there is no lesson viewer in this repository
 * yet, and a link into a 404 would be worse than a control that admits it does
 * nothing. It becomes an anchor the day the viewer exists.
 */
export function ContinueCard({
  copy,
  module,
  estimatedMinutes,
  attachmentCount,
}: ContinueCardProps) {
  return (
    <section className={styles.card} aria-labelledby="panel-continue-title">
      <p className={styles.eyebrow}>
        <span className={styles.dot} aria-hidden="true" />
        {copy.eyebrow}
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

        <button className={styles.cta} type="button">
          {copy.ctaLabel}
          <PanelIcon name="arrow" className={styles.ctaIcon} />
        </button>
      </div>
    </section>
  );
}
