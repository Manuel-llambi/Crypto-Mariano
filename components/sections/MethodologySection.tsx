import { Badge } from "@/components/ui/Badge";
import { DecorativeIcon } from "@/components/ui/DecorativeIcon";
import type { MethodologyBlock } from "@/lib/content/schemas";
import type { SectionId } from "@/lib/nav/sections";

import styles from "./MethodologySection.module.css";

interface MethodologySectionProps {
  methodology: MethodologyBlock[];
}

const SECTION: SectionId = "metodologia";

/** What makes the course forensic-grade: two blocks, as received (2.4). */
export function MethodologySection({ methodology }: MethodologySectionProps) {
  return (
    <section id={SECTION} className={styles.section}>
      <div className={styles.intro}>
        <Badge>Metodología</Badge>
        <h2 className={styles.title}>Rigor forense</h2>
      </div>

      <div className={styles.blocks}>
        {methodology.map((block) => (
          <article key={block.title} className={styles.block}>
            <DecorativeIcon name={block.icon} className={styles.icon} />
            <h3 className={styles.blockTitle}>{block.title}</h3>
            <p className={styles.description}>{block.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
