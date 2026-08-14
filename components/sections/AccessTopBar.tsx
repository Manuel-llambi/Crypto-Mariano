import styles from "./AccessTopBar.module.css";

interface AccessTopBarProps {
  siteName: string;
}

/**
 * The bar of a transactional screen: the brand and nothing else.
 *
 * Navigation is suppressed on purpose. Someone signing in has one task, and the
 * six section links of the landing would only offer ways to abandon it.
 *
 * It is a component rather than markup inside the page because the other
 * transactional screens of this design — e-mail verification, verification code
 * — repeat exactly this bar.
 */
export function AccessTopBar({ siteName }: AccessTopBarProps) {
  return (
    <header className={styles.header}>
      <span className={styles.name}>{siteName}</span>
    </header>
  );
}
