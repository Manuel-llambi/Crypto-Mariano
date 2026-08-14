import { NavPanel } from "@/components/ui/NavPanel";
import type { NavItem } from "@/lib/nav/sections";
import { LOGIN_HREF, SIGNUP_HREF } from "@/lib/routes";

import styles from "./TopNavBar.module.css";

interface TopNavBarProps {
  items: NavItem[];
  siteName: string;
  enrollLabel: string;
  loginLabel: string;
  /**
   * Prefix for the anchors, empty on the landing itself.
   *
   * A bare `#programa` resolves against the current URL, so on any other route
   * — the 404 page — it would point at a section of a page that is not there.
   * The 404 passes `/` to send the visitor home and then to the section.
   */
  anchorPrefix?: string;
}

/**
 * The fixed header: navigation plus the two access controls.
 *
 * There is no notion of an active section here, on purpose (1.6). No scroll
 * listener, no observer, no state — the highlight lives entirely in `:hover`
 * and `:focus-visible` in the stylesheet. A scroll spy would also mean a client
 * component, and this one renders on the server and ships no JavaScript.
 *
 * Every `href` comes from `items`, whose type only admits a section that exists
 * (1.5). Sticky positioning is declared in the stylesheet and verified in a real
 * window in T24.
 */
export function TopNavBar({
  items,
  siteName,
  enrollLabel,
  loginLabel,
  anchorPrefix = "",
}: TopNavBarProps) {
  return (
    <header className={styles.header}>
      <span className={styles.name}>{siteName}</span>

      <nav className={styles.nav} aria-label="Secciones del sitio">
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.href}>
              <a className={styles.link} href={`${anchorPrefix}${item.href}`}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.access}>
        {/* 6.1, 6.2, 6.3 — plain anchors carrying their intent. Both flows
            now live in this app: `/acceso` for an existing account, `/registro`
            for a new one. */}
        <a className={styles.login} href={LOGIN_HREF}>
          {loginLabel}
        </a>
        <a className={styles.enrol} href={SIGNUP_HREF}>
          {enrollLabel}
        </a>

        {/* 7.2 — below 1024px the links move in here; the site name and the
            enrolment control above stay visible either way. */}
        <NavPanel items={items} anchorPrefix={anchorPrefix} />
      </div>
    </header>
  );
}
