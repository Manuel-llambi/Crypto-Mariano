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
   *
   * Ignored when `submitAction` is given; the two are meant to be exclusive and
   * no screen passes both. No screen passes either one any more — all four post
   * — but the branches are kept for a step that turns out to be a dead end.
   */
  submitHref?: string;
  /**
   * What the control posts to. Every screen passes one.
   *
   * Present means a real `<form>` around the fields and a
   * `<button type="submit">`. This is the shape that lets the browser submit on
   * its own, with no script, which is what keeps both signing in and signing up
   * reachable when JavaScript is not available (5.3 of the login spec, 6.1 and
   * 6.3 of the sign-up one).
   */
  submitAction?: (formData: FormData) => Promise<void>;
  /**
   * What a rejected attempt says, when there was one (2.1).
   *
   * Absent means no node at all, not an empty one: with no failed attempt there
   * is nothing to report (2.5).
   */
  error?: string;
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
 * All four post now: `/acceso` since the login spec of 2026-08-17, and the three
 * sign-up steps since the spec of 2026-08-19, which retired 6.7 of the landing
 * altogether. So all four take the `submitAction` branch.
 *
 * The rule was never «no form». It is that a form with *no* action submits by
 * GET and puts whatever was typed into the query string, and from there into
 * browser history, server logs and the referrer of the next request. Every form
 * here has an action and posts to the server, which is also what keeps these
 * screens working with no script at all.
 */
export function AccessScreen({
  siteName,
  title,
  subtitle,
  protocol,
  submitLabel,
  submitHref,
  submitAction,
  error,
  children,
}: AccessScreenProps) {
  /*
   * Three branches, resolved by precedence rather than by a discriminated union
   * of props. All four screens pass `submitAction` today and none passes both,
   * so a union would force four call sites to be retyped to settle a conflict
   * nobody produces. The other two branches are what a future step that ends
   * the road, or merely links onward, would use.
   */
  const control =
    submitHref === undefined ? (
      <button className={styles.submit} type="button">
        {submitLabel}
      </button>
    ) : (
      <a className={styles.submit} href={submitHref}>
        {submitLabel}
      </a>
    );
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

            {/*
              Below the subtitle and before the fields, so it is read before
              anyone types again. No `role="alert"` and no live region: the
              message is already in the document when the page loads, brought by
              a full server round trip, so there is no change to announce.
            */}
            {error === undefined ? null : <p className={styles.error}>{error}</p>}
          </div>

          {submitAction === undefined ? (
            <div className={styles.form}>
              {children}
              {control}
            </div>
          ) : (
            <form className={styles.form} action={submitAction}>
              {children}

              <button className={styles.submit} type="submit">
                {submitLabel}
              </button>
            </form>
          )}

          <p className={styles.protocol}>{protocol}</p>
        </div>
      </main>
    </>
  );
}
