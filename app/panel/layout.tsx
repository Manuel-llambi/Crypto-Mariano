import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { LOGIN_HREF } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";

/**
 * Not indexable.
 *
 * The dashboard is guarded, and signing up reaches it for real since the spec
 * of 2026-08-19. The data on screen is still versioned content and there is
 * still no way to sign out, so it has no business in a search result yet.
 *
 * Declared here rather than beside each screen so everything below `/panel`
 * inherits it — the lesson viewer included.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * The guard, and only the guard.
 *
 * It used to carry the dashboard's chrome as well, on the assumption that every
 * panel screen would wear the same frame. The lesson viewer proved that wrong:
 * its top bar names the lesson and its left column is the syllabus, not the
 * four sections of the dashboard. So the chrome moved down into
 * `(inicio)/layout.tsx` — a route group, which means `/panel` is still `/panel`
 * — and what stays here is the one thing every screen below genuinely shares.
 *
 * Keeping the check at this level is the point: a screen added under `/panel`
 * is guarded because of where it lives, not because someone remembered (4.4).
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

  return <>{children}</>;
}
