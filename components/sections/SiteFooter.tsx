import type { Footer } from "@/lib/content/schemas";

import styles from "./SiteFooter.module.css";

interface SiteFooterProps {
  footer: Footer;
  siteName: string;
}

/**
 * The closing block: the same anchors as the header, plus the one outbound link.
 *
 * The newsletter is a link and not a form on purpose — subscribing happens
 * elsewhere, and a form here would mean collecting an address on a page whose
 * whole contract is that it never talks to the network (2.1).
 *
 * It emits no heading, so it cannot introduce a level jump in the page (9.2).
 */
export function SiteFooter({ footer, siteName }: SiteFooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.brand}>
        <span className={styles.name}>{siteName}</span>
        <p className={styles.description}>{footer.description}</p>
      </div>

      <nav className={styles.nav} aria-label="Secciones del sitio, pie de página">
        <ul className={styles.list}>
          {footer.links.map((link) => (
            <li key={link.href}>
              <a className={styles.link} href={link.href}>
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a className={styles.link} href={footer.newsletter.href}>
              {footer.newsletter.label}
            </a>
          </li>
        </ul>
      </nav>

      <p className={styles.legal}>{footer.legal}</p>
    </footer>
  );
}
