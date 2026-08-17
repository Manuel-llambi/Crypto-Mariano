import type { CSSProperties } from "react";

import { PanelIcon } from "@/components/ui/PanelIcon";
import type { PanelContent } from "@/lib/content/schemas";
import type { PanelModule } from "@/lib/panel/derive";

import styles from "./ModuleGrid.module.css";

interface ModuleGridProps {
  copy: PanelContent["modules"];
  modules: PanelModule[];
  /** How far into the module in progress the student is, 0 to 100. */
  currentPercent: number;
}

/** The class of the card, and the badge, for each of the three states. */
const CARD_CLASS = {
  passed: styles.cardPassed,
  "in-progress": styles.cardCurrent,
  locked: styles.cardLocked,
} as const;

const BADGE_CLASS = {
  passed: styles.badgePassed,
  "in-progress": styles.badgeCurrent,
  locked: styles.badgeLocked,
} as const;

/**
 * The seven modules of the syllabus, each showing where the student stands.
 *
 * The three shapes differ in their footer: a passed module states that it is
 * passed, the one in progress shows a bar, a locked one names the module that
 * unlocks it. Never colour alone (9.4) — every state is also written out.
 */
export function ModuleGrid({ copy, modules, currentPercent }: ModuleGridProps) {
  const bar = { "--percent": `${currentPercent}%` } as CSSProperties;

  const badgeLabel = {
    passed: copy.passedBadge,
    "in-progress": copy.currentBadge,
    locked: copy.lockedBadge,
  } as const;

  return (
    <ul className={styles.grid}>
      {modules.map((module) => (
        <li className={`${styles.card} ${CARD_CLASS[module.state]}`} key={module.code}>
          <p className={styles.head}>
            <span className={styles.code}>{module.code}</span>
            <span className={`${styles.badge} ${BADGE_CLASS[module.state]}`}>
              {badgeLabel[module.state]}
            </span>
          </p>

          <h3 className={styles.title}>{module.title}</h3>

          {module.state === "passed" && (
            <p className={styles.footnote}>
              <PanelIcon name="check" className={styles.checkIcon} />
              {copy.passedLabel}
            </p>
          )}

          {/* The bar is decoration: the badge above says «en curso» in words. */}
          {module.state === "in-progress" && (
            <p className={styles.bar} style={bar} aria-hidden="true">
              <span className={styles.barFill} />
            </p>
          )}

          {module.state === "locked" && (
            <p className={styles.footnoteMuted}>
              <PanelIcon name="lock" className={styles.lockIcon} />
              {copy.lockedPrefix} {module.requiresCode}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
