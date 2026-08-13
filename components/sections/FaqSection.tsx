import { Badge } from "@/components/ui/Badge";
import { Disclosure } from "@/components/ui/Disclosure";
import type { FaqEntry } from "@/lib/content/schemas";
import type { SectionId } from "@/lib/nav/sections";

import styles from "./FaqSection.module.css";

interface FaqSectionProps {
  faq: FaqEntry[];
}

const SECTION: SectionId = "faq";

/**
 * The questions, each one a disclosure closed by default (5.1).
 *
 * Nothing here keeps track of which one is open: `Disclosure` emits no `name`,
 * so every `<details>` owns its own state and opening one leaves the rest
 * exactly as they were (5.2).
 */
export function FaqSection({ faq }: FaqSectionProps) {
  return (
    <section id={SECTION} className={styles.section}>
      <div className={styles.intro}>
        <Badge>Consultas</Badge>
        <h2 className={styles.title}>Preguntas frecuentes</h2>
      </div>

      <div className={styles.list}>
        {faq.map((entry) => (
          <Disclosure key={entry.question} className={styles.entry} summary={entry.question}>
            {entry.answer}
          </Disclosure>
        ))}
      </div>
    </section>
  );
}
