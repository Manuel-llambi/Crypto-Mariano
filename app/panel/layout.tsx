import type { Metadata } from "next";
import type { ReactNode } from "react";

import { PanelSidebar } from "@/components/sections/PanelSidebar";
import { PanelTopBar } from "@/components/sections/PanelTopBar";
import { panel, site } from "@/lib/content";

import styles from "./layout.module.css";

/**
 * Not indexable, for the same reason the four transactional screens are not.
 *
 * This is a student dashboard that no student has to sign in to reach, because
 * nothing here authenticates (6.7). Until it does, it has no business in a
 * search result.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * The chrome every panel screen shares: the top bar and the sidebar.
 *
 * A layout rather than markup inside the page because the panel is more than
 * one screen in the design — the course viewer, the lesson viewer, settings —
 * and all of them keep this frame while only the right column changes.
 */
export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <PanelTopBar siteName={site.name} />

      <div className={styles.body}>
        <PanelSidebar
          student={panel.student}
          nav={panel.nav}
          settingsLabel={panel.settingsLabel}
          logoutLabel={panel.logoutLabel}
          currentId="courses"
        />

        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
