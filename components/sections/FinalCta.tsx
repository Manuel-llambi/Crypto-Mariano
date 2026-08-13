import { accessUrl } from "@/lib/access-url";
import type { FinalCtaContent } from "@/lib/content/schemas";

import styles from "./FinalCta.module.css";

interface FinalCtaProps {
  finalCta: FinalCtaContent;
}

/** The same constant destination the hero uses, so 6.6 holds by construction. */
const ENROL_HREF = accessUrl("signup");

/** The closing block, repeating the enrolment control of the hero (6.1). */
export function FinalCta({ finalCta }: FinalCtaProps) {
  return (
    <section className={styles.section}>
      <h2 className={styles.headline}>{finalCta.headline}</h2>
      <p className={styles.body}>{finalCta.body}</p>

      {/* A plain anchor: no handler, no script navigation (6.3). */}
      <a className={styles.cta} href={ENROL_HREF}>
        {finalCta.ctaLabel}
      </a>
    </section>
  );
}
