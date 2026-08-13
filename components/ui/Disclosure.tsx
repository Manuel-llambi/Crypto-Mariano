import { Children, type ReactNode } from "react";

import styles from "./Disclosure.module.css";

interface DisclosureProps {
  summary: ReactNode;
  /** Absent or blank means no disclosure control at all (4.4). */
  children?: ReactNode;
  className?: string;
}

/** Blank text is no content: an empty summary would give the visitor nothing. */
function hasContent(children: ReactNode): boolean {
  return Children.toArray(children).some(
    (child) => typeof child !== "string" || child.trim() !== "",
  );
}

function classes(...names: (string | undefined)[]): string {
  return names.filter(Boolean).join(" ");
}

/**
 * The only disclosure of the site, used by the syllabus (4.3) and the FAQ (5.1).
 *
 * It is native `<details>` and nothing else: no state, no handlers, no client
 * directive. That is what makes it work with JavaScript disabled (8.1), and the
 * absence of `name` is what lets several sit open at once (4.5, 5.2).
 */
export function Disclosure({ summary, children, className }: DisclosureProps) {
  if (!hasContent(children)) {
    return <div className={classes(styles.heading, className)}>{summary}</div>;
  }

  return (
    <details className={classes(styles.disclosure, className)}>
      <summary className={styles.summary}>{summary}</summary>
      <div className={styles.content}>{children}</div>
    </details>
  );
}
