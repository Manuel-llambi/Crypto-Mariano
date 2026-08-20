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
}

/**
 * The module the student is standing on, and the control that opens it.
 *
 * The wording swaps with the record: someone who has opened nothing is offered
 * «Comenzar», not «Reanudar» — the second would claim a history the record
 * denies, on the most prominent control of the screen.
 *
 * Either way it is an inert button: there is no lesson viewer in this
 * repository yet, and a link into a 404 would be worse than a control that
 * admits it does nothing. It becomes an anchor the day the viewer exists.
 */
export function ContinueCard({
  copy,
  module,
  estimatedMinutes,
  attachmentCount,
  started,
}: ContinueCardProps) {
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

        <button className={styles.cta} type="button">
          {started ? copy.ctaLabel : copy.startCtaLabel}
          <PanelIcon name="arrow" className={styles.ctaIcon} />
        </button>
      </div>
    </section>
  );
}
