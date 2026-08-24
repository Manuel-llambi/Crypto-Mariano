import type { CSSProperties } from "react";

import { PanelIcon } from "@/components/ui/PanelIcon";
import type { LessonScreenContent } from "@/lib/content/schemas";

import styles from "./LessonPlayer.module.css";

interface LessonPlayerProps {
  copy: LessonScreenContent["player"];
  moduleCode: string;
  lessonCode: string;
  /** `MM:SS`, from the lesson. */
  duration: string;
  /** `MM:SS`, from the record. */
  elapsed: string;
  /** How far the scrubber sits along, 0 to 100. */
  playedPercent: number;
}

/**
 * The frame the lesson will play in.
 *
 * There is no video file in this repository and no player library, so nothing
 * here plays: the surface is a placeholder and the strip along the bottom is a
 * drawing of a control bar. That is stated rather than hidden — the poster
 * carries `[REVISAR]` in its own copy.
 *
 * Only the play control is a `<button>`. The strip is `aria-hidden`, because a
 * row of named buttons that do nothing is worse than an inert picture: it
 * promises a transport to anyone who cannot see that no video ever loads. The
 * elapsed figure is inside that hidden strip for the same reason — it measures
 * a file that does not exist.
 *
 * No `<video>` element either. An empty one would ask the browser for a source,
 * fail, and expose real controls wired to nothing.
 */
export function LessonPlayer({
  copy,
  moduleCode,
  lessonCode,
  duration,
  elapsed,
  playedPercent,
}: LessonPlayerProps) {
  const scrubber = { "--percent": `${playedPercent}%` } as CSSProperties;

  return (
    <div className={styles.player}>
      <div className={styles.poster} role="img" aria-label={copy.posterAlt}>
        <p className={styles.stamp}>
          {moduleCode} · {lessonCode}
        </p>

        <button className={styles.play} type="button">
          <PanelIcon name="play" className={styles.playIcon} />
          <span className={styles.playLabel}>{copy.playLabel}</span>
        </button>
      </div>

      <div className={styles.controls} aria-hidden="true">
        <p className={styles.scrubber} style={scrubber}>
          <span className={styles.scrubberFill} />
        </p>

        <div className={styles.transport}>
          <PanelIcon name="play" className={styles.controlIcon} />
          <PanelIcon name="skip" className={styles.controlIcon} />
          <p className={styles.time}>
            {elapsed} / {duration}
          </p>
          <span className={styles.spacer} />
          <PanelIcon name="volume" className={styles.controlIcon} />
          <PanelIcon name="settings" className={styles.controlIcon} />
          <PanelIcon name="expand" className={styles.controlIcon} />
        </div>
      </div>
    </div>
  );
}
