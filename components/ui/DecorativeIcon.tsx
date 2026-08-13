import styles from "./DecorativeIcon.module.css";

interface DecorativeIconProps {
  /** Which glyph to draw. Styling only — never read out, never rendered as text. */
  name: string;
  className?: string;
}

/**
 * A purely decorative glyph, hidden from assistive technology (9.3).
 *
 * The visible label next to it already carries the meaning, so exposing this
 * would make a screen reader announce the same thing twice. It renders no text
 * and takes no alternative text on purpose: `name` reaches CSS through the
 * `data-icon` attribute and never reaches the accessibility tree.
 */
export function DecorativeIcon({ name, className }: DecorativeIconProps) {
  return (
    <span
      aria-hidden="true"
      data-icon={name}
      className={[styles.icon, className].filter(Boolean).join(" ")}
    />
  );
}
