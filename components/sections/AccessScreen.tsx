import type { ReactNode } from "react";

import { AccessTopBar } from "@/components/sections/AccessTopBar";

import styles from "./AccessScreen.module.css";

interface AccessScreenProps {
  siteName: string;
  title: string;
  subtitle: string;
  /** The technical note under the rule at the foot of the card. */
  protocol: string;
  submitLabel: string;
  /**
   * Where the control leads, when it leads anywhere.
   *
   * Absent means an inert `<button type="button">`: the screen is the end of
   * the road and nothing here submits. Present means a plain anchor to the next
   * step, which is navigation the browser performs on its own — no script, no
   * form, nothing that could carry a field value into the URL.
   */
  submitHref?: string;
  /** The fields, in the order they are read. */
  children: ReactNode;
}

/**
 * The card every transactional screen of this design is made of.
 *
 * Four screens share it — sign in, and the three steps of signing up — and they
 * differ only in their copy and their fields. Repeating the markup four times
 * would mean four chances for them to drift apart.
 *
 * None of them authenticates, sends a code or opens a session: 6.7 forbids all
 * three. There is no `<form>` anywhere, and that absence is the point — a form
 * with no action submits by GET, which would put whatever was typed into the
 * query string, and from there into browser history, server logs and the
 * referrer of the next request.
 */
export function AccessScreen({
  siteName,
  title,
  subtitle,
  protocol,
  submitLabel,
  submitHref,
  children,
}: AccessScreenProps) {
  return (
    <>
      <AccessTopBar siteName={siteName} />

      <main className={styles.main}>
        {/* The dotted field of the design. Decoration, so it is hidden. */}
        <div aria-hidden="true" className={styles.grid} />

        <div className={styles.card}>
          <div className={styles.intro}>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.subtitle}>{subtitle}</p>
          </div>

          <div className={styles.form}>
            {children}

            {submitHref === undefined ? (
              <button className={styles.submit} type="button">
                {submitLabel}
              </button>
            ) : (
              <a className={styles.submit} href={submitHref}>
                {submitLabel}
              </a>
            )}
          </div>

          <p className={styles.protocol}>{protocol}</p>
        </div>
      </main>
    </>
  );
}
