import { Badge } from "@/components/ui/Badge";
import type { Update } from "@/lib/content/schemas";
import { formatMonth } from "@/lib/format/month";
import type { SectionId } from "@/lib/nav/sections";

import styles from "./UpdatesSection.module.css";

interface UpdatesSectionProps {
  updates: Update[];
}

const SECTION: SectionId = "actualizaciones";

/**
 * The dated curriculum updates.
 *
 * Presentation only: the entries arrive newest first from
 * `lib/content/index.ts`, which owns the ordering rule of 2.7. Sorting again
 * here would put the same rule in two places, so the section renders the list
 * exactly as it receives it.
 */
export function UpdatesSection({ updates }: UpdatesSectionProps) {
  return (
    <section id={SECTION} className={styles.section}>
      <div className={styles.intro}>
        <Badge>Actualizaciones del programa</Badge>
        <h2 className={styles.title}>Actualizaciones del temario</h2>
      </div>

      <div className={styles.list}>
        {updates.map((update) => (
          <article key={update.date + update.title} className={styles.entry}>
            {/* The label is derived; the ISO value stays in the markup (2.6). */}
            <time className={styles.month} dateTime={update.date}>
              {formatMonth(update.date)}
            </time>
            <h3 className={styles.entryTitle}>{update.title}</h3>
            <p className={styles.description}>{update.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
