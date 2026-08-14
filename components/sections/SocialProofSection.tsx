import { DecorativeIcon } from "@/components/ui/DecorativeIcon";
import { MetricCard } from "@/components/ui/MetricCard";
import type { SocialProof } from "@/lib/content/schemas";
import type { SectionId } from "@/lib/nav/sections";

import styles from "./SocialProofSection.module.css";

interface SocialProofSectionProps {
  socialProof: SocialProof;
}

const SECTION: SectionId = "confianza";

/**
 * Trust seals and headline figures, rendered exactly as received (2.4).
 *
 * Nothing here vouches for the values. The three seals are design placeholders
 * and neither figure has a source yet; both are open questions that block
 * launch, and this component is deliberately not the place that resolves them.
 */
export function SocialProofSection({ socialProof }: SocialProofSectionProps) {
  return (
    <section id={SECTION} className={styles.section}>
      <h2 className={styles.title}>{socialProof.title}</h2>
      <p className={styles.description}>{socialProof.description}</p>

      <ul className={styles.seals}>
        {socialProof.seals.map((seal) => (
          <li key={seal.name} className={styles.seal} data-testid="seal">
            <DecorativeIcon name={seal.icon} />
            <span className={styles.sealName}>{seal.name}</span>
            <span className={styles.sealDetail}>{seal.detail}</span>
          </li>
        ))}
      </ul>

      <div className={styles.metrics}>
        {socialProof.metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>
    </section>
  );
}
