import type { Footer } from "@/lib/content/schemas";

import styles from "./SiteFooter.module.css";

interface SiteFooterProps {
  footer: Footer;
  siteName: string;
}

/**
 * The closing block of the document.
 *
 * Its destinations are pages and an address, not sections — the header owns the
 * in-page navigation. That is why this component no longer takes `anchorPrefix`:
 * there is no fragment here to resolve against the current route.
 *
 * Its column headings are level two, not three. The 404 page has no sections
 * between its first level heading and this footer, so level three would skip a
 * level there (9.2).
 */
export function SiteFooter({ footer, siteName }: SiteFooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div className={styles.brand}>
          <span className={styles.name}>{siteName}</span>
          <p className={styles.description}>{footer.description}</p>
        </div>

        {footer.columns.map((column) => (
          <nav key={column.title} className={styles.column} aria-label={column.title}>
            <h2 className={styles.columnTitle}>{column.title}</h2>
            <ul className={styles.list}>
              {column.links.map((link) => (
                <li key={link.href}>
                  <a className={styles.link} href={link.href}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className={styles.column}>
          <h2 className={styles.columnTitle}>{footer.address.title}</h2>
          {/* `not-italic` in the design; an address is still the right element. */}
          <address className={styles.address}>{footer.address.line}</address>
          <p className={styles.emailLabel}>{footer.address.emailLabel}</p>
          <a className={styles.email} href={`mailto:${footer.address.email}`}>
            {footer.address.email}
          </a>
        </div>
      </div>

      <div className={styles.bottom}>
        <p className={styles.legal}>{footer.legal}</p>
        <div className={styles.notes}>
          <span>{footer.notes[0]}</span>
          {/* The brass tick between the two notes. Decoration, so it is hidden. */}
          <span aria-hidden="true" className={styles.tick} />
          <span>{footer.notes[1]}</span>
        </div>
      </div>
    </footer>
  );
}
