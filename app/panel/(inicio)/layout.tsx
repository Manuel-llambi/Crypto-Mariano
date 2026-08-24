import type { ReactNode } from "react";

import { PanelSidebar } from "@/components/sections/PanelSidebar";
import { PanelTopBar } from "@/components/sections/PanelTopBar";
import { panel, site } from "@/lib/content";

import styles from "./layout.module.css";

/**
 * The chrome of the dashboard: the top bar and the section sidebar.
 *
 * A route group and not a plain folder, so the address stays `/panel` while the
 * frame stops reaching further down. The lesson viewer sits outside this group
 * and wears its own — same guard above, different furniture.
 *
 * No session check here: that belongs to `app/panel/layout.tsx`, one level up,
 * where every screen below inherits it.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
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
