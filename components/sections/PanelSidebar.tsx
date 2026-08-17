import { PanelIcon, type PanelIconName } from "@/components/ui/PanelIcon";
import type { PanelContent } from "@/lib/content/schemas";
import { LOGIN_HREF, PANEL_HREF } from "@/lib/routes";

import styles from "./PanelSidebar.module.css";

interface PanelSidebarProps {
  student: PanelContent["student"];
  nav: PanelContent["nav"];
  settingsLabel: string;
  logoutLabel: string;
  /** Which `nav` id is the screen being shown. */
  currentId: string;
}

/**
 * Where each destination leads, resolved from the id the content declares.
 *
 * The content file names destinations, it does not address them: addresses are
 * routes and routes live in `lib/routes.ts`. An id with no entry here is a
 * screen that does not exist yet, and it renders without an `href` — an anchor
 * with no destination rather than a link into a 404, which is the mistake
 * `forgotHref` still makes on the access screen.
 */
const HREFS: Record<string, string | undefined> = {
  courses: PANEL_HREF,
};

export function PanelSidebar({
  student,
  nav,
  settingsLabel,
  logoutLabel,
  currentId,
}: PanelSidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.student}>
        <span className={styles.avatar}>
          <PanelIcon name="avatar" className={styles.avatarIcon} />
        </span>
        <span className={styles.identity}>
          <span className={styles.name}>{student.name}</span>
          <span className={styles.status}>
            {student.statusLabel}: {student.statusValue}
          </span>
        </span>
      </div>

      <nav className={styles.nav} aria-label="Secciones del panel">
        {nav.map((item) => {
          const isCurrent = item.id === currentId;

          return (
            <a
              key={item.id}
              className={isCurrent ? `${styles.item} ${styles.itemCurrent}` : styles.item}
              href={HREFS[item.id]}
              aria-current={isCurrent ? "page" : undefined}
            >
              <PanelIcon name={item.icon as PanelIconName} className={styles.icon} />
              {item.label}
            </a>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <a className={styles.minorItem}>
          <PanelIcon name="settings" className={styles.minorIcon} />
          {settingsLabel}
        </a>
        <a className={styles.minorItem} href={LOGIN_HREF}>
          <PanelIcon name="logout" className={styles.minorIcon} />
          {logoutLabel}
        </a>
      </div>
    </aside>
  );
}
