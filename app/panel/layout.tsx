import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { PanelSidebar } from "@/components/sections/PanelSidebar";
import { PanelTopBar } from "@/components/sections/PanelTopBar";
import { panel, site } from "@/lib/content";
import { LOGIN_HREF } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";

import styles from "./layout.module.css";

/**
 * Not indexable.
 *
 * The dashboard is guarded now, but the flow around it is unfinished — signing
 * up is still a mock-up and the data on screen is still versioned content — so
 * it has no business in a search result yet.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * The chrome every panel screen shares: the guard, the top bar and the sidebar.
 *
 * A layout rather than markup inside the page because the panel is more than
 * one screen in the design — the course viewer, the lesson viewer, settings —
 * and all of them keep this frame while only the right column changes. That is
 * also why the guard lives here: every screen added below `/panel` inherits it
 * without anyone having to remember (4.4).
 */
export default async function PanelLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();

  /*
   * `getUser()` and not `getSession()`: the second reads the cookie and takes
   * its word for it, and on the server a cookie is input from the visitor. This
   * one validates against the authentication server (3.3).
   */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Before any markup is emitted (4.3).
  if (!user) {
    redirect(LOGIN_HREF);
  }

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
