import { Badge } from "@/components/ui/Badge";
import { ProfileCard } from "@/components/ui/ProfileCard";
import type { AudienceProfile } from "@/lib/content/schemas";
import type { SectionId } from "@/lib/nav/sections";

import styles from "./AudienceSection.module.css";

interface AudienceSectionProps {
  audience: AudienceProfile[];
}

const SECTION: SectionId = "audiencia";

/**
 * Who the course is for: four profiles, straight from content (2.4).
 *
 * The count is not enforced here — `AudienceSchema` already rejects a list that
 * is not exactly four, at import time. Checking again would put the same rule
 * in two places and let them disagree.
 */
export function AudienceSection({ audience }: AudienceSectionProps) {
  return (
    <section id={SECTION} className={styles.section}>
      <div className={styles.intro}>
        <Badge>Audiencia</Badge>
        <h2 className={styles.title}>Diseñado para profesionales</h2>
      </div>

      <div className={styles.cards}>
        {audience.map((profile) => (
          <ProfileCard key={profile.title} profile={profile} />
        ))}
      </div>
    </section>
  );
}
