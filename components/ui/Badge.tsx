import type { ReactNode } from "react";

import styles from "./Badge.module.css";

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

/**
 * The outlined label of the mockup: section eyebrows and module status.
 *
 * The outline is `--color-tertiary`, which 9.4 allows at 3:1 as an interface
 * element; the text inside is `--color-on-tertiary`, the corrected gold that
 * reaches 4.5:1.
 */
export function Badge({ children, className }: BadgeProps) {
  return <span className={[styles.badge, className].filter(Boolean).join(" ")}>{children}</span>;
}
