import { PanelIcon } from "@/components/ui/PanelIcon";

import styles from "./PanelTopBar.module.css";

interface PanelTopBarProps {
  siteName: string;
}

/**
 * The bar across the top of the dashboard: the brand, notifications, profile.
 *
 * Its own component rather than markup in the layout because the panel has more
 * screens coming (the course viewer, settings) and every one of them repeats
 * exactly this bar.
 *
 * Both controls are inert buttons. There is no notification list and no profile
 * screen yet, and a link into a 404 is worse than a control that does nothing —
 * the whole panel is a mock and these two are honest about it.
 */
export function PanelTopBar({ siteName }: PanelTopBarProps) {
  return (
    <header className={styles.header}>
      <span className={styles.name}>{siteName}</span>

      <div className={styles.actions}>
        <button className={styles.action} type="button" aria-label="Notificaciones">
          <PanelIcon name="bell" className={styles.icon} />
        </button>
        <button className={styles.action} type="button" aria-label="Perfil">
          <PanelIcon name="user" className={styles.icon} />
        </button>
      </div>
    </header>
  );
}
