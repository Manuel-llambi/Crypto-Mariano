import type { Metric } from "@/lib/content/schemas";

import styles from "./MetricCard.module.css";

interface MetricCardProps {
  metric: Metric;
}

/**
 * One headline figure.
 *
 * The value is printed exactly as the content file declares it — «5000+» keeps
 * its plus sign and is never reformatted as a number, because the figure is a
 * claim written by an editor, not a computed quantity.
 */
export function MetricCard({ metric }: MetricCardProps) {
  return (
    <div className={styles.card} data-testid="metric">
      <p className={styles.value}>{metric.value}</p>
      <p className={styles.label}>{metric.label}</p>
    </div>
  );
}
