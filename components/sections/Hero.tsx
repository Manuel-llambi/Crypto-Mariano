import { accessUrl } from "@/lib/access-url";
import type { HeroContent } from "@/lib/content/schemas";

import styles from "./Hero.module.css";

interface HeroProps {
  hero: HeroContent;
}

/**
 * The destination is resolved once, at module scope, so it is a constant string
 * in the build output — there is no runtime work behind the link (6.3).
 */
const ENROL_HREF = accessUrl("signup");

/**
 * Reserved space for the hero visual, in pixels.
 *
 * Declared inline rather than in the stylesheet because the point is to hold the
 * box before anything paints into it; the panel keeps its footprint even with
 * nothing to show.
 */
const PANEL = { width: 480, height: 480 };

/**
 * The opening block: the first level heading of the page and the first
 * enrolment control (6.1).
 */
export function Hero({ hero }: HeroProps) {
  return (
    <section className={styles.section}>
      <div className={styles.copy}>
        <p className={styles.eyebrow}>{hero.eyebrow}</p>
        <h1 className={styles.headline}>{hero.headline}</h1>
        <p className={styles.subheadline}>{hero.subheadline}</p>

        {/* A plain anchor: no handler, no script navigation (6.3). */}
        <a className={styles.cta} href={ENROL_HREF}>
          {hero.ctaLabel}
        </a>
      </div>

      <div
        className={styles.panel}
        role="img"
        aria-label={hero.imageAlt}
        style={{ width: PANEL.width, height: PANEL.height }}
      />
    </section>
  );
}
