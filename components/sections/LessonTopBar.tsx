import { PANEL_HREF } from "@/lib/routes";

import styles from "./LessonTopBar.module.css";

interface LessonTopBarProps {
  siteName: string;
  moduleCode: string;
  lessonTitle: string;
  panelLabel: string;
}

/**
 * The bar of the lesson viewer: where you are, and the way out.
 *
 * Not `PanelTopBar`. That one carries the site name and two inert controls,
 * because the dashboard is one screen and needs no trail; this one is the trail
 * — brand, module, lesson — and its only control is real. Sharing a component
 * between the two would mean a prop deciding which half of it exists.
 *
 * The breadcrumb is a list rather than three spans: it is a trail, and a screen
 * reader is entitled to hear how many steps it has.
 */
export function LessonTopBar({
  siteName,
  moduleCode,
  lessonTitle,
  panelLabel,
}: LessonTopBarProps) {
  return (
    <header className={styles.header}>
      <nav className={styles.trail} aria-label="Ubicación">
        <ol className={styles.crumbs}>
          <li className={styles.brand}>{siteName}</li>
          <li className={styles.code}>{moduleCode}</li>
          <li className={styles.lesson} aria-current="page">
            {lessonTitle}
          </li>
        </ol>
      </nav>

      <a className={styles.exit} href={PANEL_HREF}>
        {panelLabel}
      </a>
    </header>
  );
}
