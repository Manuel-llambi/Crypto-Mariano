import type { AudienceProfile } from "@/lib/content/schemas";

import { DecorativeIcon } from "./DecorativeIcon";
import styles from "./ProfileCard.module.css";

interface ProfileCardProps {
  profile: AudienceProfile;
}

/** One audience profile: glyph, title and description. */
export function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <article className={styles.card}>
      <DecorativeIcon name={profile.icon} />
      <h3 className={styles.title}>{profile.title}</h3>
      <p className={styles.description}>{profile.description}</p>
    </article>
  );
}
