import type { ReactNode } from "react";

import styles from "./Badge.module.css";

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

/**
 * The outlined label of the mockup: section eyebrows and module status.
 *
 * The outline is `--gold-line`, which 9.4 allows as decoration; the text inside
 * is `--gold-text`, the corrected gold that reaches 4.5:1.
 */
export function Badge({ children, className }: BadgeProps) {
  return <span className={[styles.badge, className].filter(Boolean).join(" ")}>{children}</span>;
}
