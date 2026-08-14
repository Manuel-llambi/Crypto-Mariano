import { Badge } from "@/components/ui/Badge";
import type { FinalCtaContent } from "@/lib/content/schemas";
import { SIGNUP_HREF } from "@/lib/routes";

import styles from "./FinalCta.module.css";

interface FinalCtaProps {
  finalCta: FinalCtaContent;
}

/** The same constant destination the other two controls use (6.1, 6.6). */
const ENROL_HREF = SIGNUP_HREF;

/** The closing block: the third and last enrolment control of the page. */
export function FinalCta({ finalCta }: FinalCtaProps) {
  return (
    <section className={styles.section}>
      <Badge className={styles.eyebrow}>{finalCta.eyebrow}</Badge>

      <h2 className={styles.headline}>{finalCta.headline}</h2>
      <p className={styles.body}>{finalCta.body}</p>

      {/* A plain anchor: no handler, no script navigation (6.3). */}
      <a className={styles.cta} href={ENROL_HREF}>
        {finalCta.ctaLabel}
      </a>

      <p className={styles.footnote}>{finalCta.footnote}</p>
    </section>
  );
}
