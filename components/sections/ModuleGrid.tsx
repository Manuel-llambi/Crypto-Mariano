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

/**
 * The class of the card, and the badge, for each state.
 *
 * Indexed by `ModuleState`, so adding a state to the union leaves these
 * incomplete and `tsc` says which one — the case cannot fall through to a
 * silent default.
 */
const CARD_CLASS = {
  passed: styles.cardPassed,
  "in-progress": styles.cardCurrent,
  available: styles.cardAvailable,
  locked: styles.cardLocked,
} as const;

const BADGE_CLASS = {
  passed: styles.badgePassed,
  "in-progress": styles.badgeCurrent,
  available: styles.badgeAvailable,
  locked: styles.badgeLocked,
} as const;

/**
 * The seven modules of the syllabus, each showing where the student stands.
 *
 * The four shapes differ in their footer: a passed module states that it is
 * passed, the one in progress shows a bar, one that is open but untouched says
 * so, and a locked one names the module that unlocks it. Never colour alone
 * (9.4) — every state is also written out.
 */
export function ModuleGrid({ copy, modules, currentPercent }: ModuleGridProps) {
  const bar = { "--percent": `${currentPercent}%` } as CSSProperties;

  const badgeLabel = {
    passed: copy.passedBadge,
    "in-progress": copy.currentBadge,
    available: copy.availableBadge,
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

          {/* No bar here on purpose: one at 0% would read as barely begun. */}
          {module.state === "available" && (
            <p className={styles.footnote}>
              <PanelIcon name="arrow" className={styles.availableIcon} />
              {copy.availableLabel}
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
