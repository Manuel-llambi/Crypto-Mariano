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
 * Reserved space for the hero visual, in pixels.
 *
 * Declared inline rather than in the stylesheet because the point is to hold the
 * box before anything paints into it; the panel keeps its footprint even with
 * nothing to show.
 */
const PANEL = { width: 480, height: 480 };

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
        style={{ width: PANEL.width, height: PANEL.height }}
      />
    </section>
  );
}
