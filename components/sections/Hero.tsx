import type { HeroContent } from "@/lib/content/schemas";
import type { Anchor } from "@/lib/nav/sections";

import styles from "./Hero.module.css";

interface HeroProps {
  hero: HeroContent;
}

/**
 * The hero invites the visitor **into the page**, not out of it.
 *
 * In the finished design this button reads «Explorar curso» and jumps to the
 * syllabus. It is not one of the three enrolment controls of 6.6 — those are the
 * header, the syllabus and the closing block. Typing the destination as `Anchor`
 * keeps it a section that exists (1.5).
 */
const EXPLORE_HREF: Anchor = "#programa";

/**
 * Minimum height of the hero visual on a narrow screen, in pixels.
 *
 * Only a floor. From 768px up the panel stops being a box of its own and fills
 * the column, so the stylesheet governs and this no longer applies — but it
 * still holds the space before anything is painted into it.
 */
const PANEL_MIN_HEIGHT = 320;

/** The opening block: the first level heading of the page. */
export function Hero({ hero }: HeroProps) {
  return (
    <section className={styles.section}>
      <div className={styles.copy}>
        <p className={styles.eyebrow}>{hero.eyebrow}</p>
        <h1 className={styles.headline}>{hero.headline}</h1>

        {/* The gold rule beside the standfirst is from the design. */}
        <p className={styles.subheadline}>{hero.subheadline}</p>

        {/* A plain anchor: no handler, no script navigation (6.3). */}
        <a className={styles.cta} href={EXPLORE_HREF}>
          {hero.ctaLabel}
        </a>
      </div>

      <div
        className={styles.panel}
        role="img"
        aria-label={hero.imageAlt}
        style={{ minHeight: PANEL_MIN_HEIGHT }}
      />
    </section>
  );
}
