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
   * no screen passes both.
   */
  submitHref?: string;
  /**
   * What the control posts to, on the one screen that posts (5.3).
   *
   * Present means a real `<form>` around the fields and a
   * `<button type="submit">`. This is the shape that lets the browser submit on
   * its own, with no script, which is what keeps signing in reachable when
   * JavaScript is not available.
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
 * The three screens of `/registro` neither send a code, verify one nor create
 * an account: that half of 6.7 still holds, and they carry no `<form>` at all.
 * `/acceso` does authenticate since the login spec of 2026-08-17, and it is the
 * one screen that gets a form — safe because the form has an action and posts
 * to the server. A form with *no* action is what submits by GET and puts
 * whatever was typed into the query string, and from there into browser
 * history, server logs and the referrer of the next request.
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
   * of props. Of the four screens sharing this card, three pass `submitHref`,
   * one passes neither, and none passes both — a union would force all four to
   * be retyped to settle a conflict nobody produces.
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
