import type { Metadata } from "next";

import { AccessTopBar } from "@/components/sections/AccessTopBar";
import { Field } from "@/components/ui/Field";
import { access, site } from "@/lib/content";

import styles from "./page.module.css";

/**
 * Not indexable.
 *
 * An access screen that does not authenticate has no business in a search
 * result, and this one is a shell: it collects nothing and goes nowhere.
 */
export const metadata: Metadata = {
  title: `${access.login.title} — ${site.name}`,
  robots: { index: false, follow: false },
};

/**
 * The access screen for someone who already has an account (UI only).
 *
 * Nothing here authenticates, sends a code or opens a session: 6.7 forbids all
 * three and this screen honours it by doing nothing at all. The submit control
 * is a `<button type="button">`, which is the detail that matters — a `<form>`
 * with no action submits by GET, and would put the password in the URL, from
 * where it reaches browser history, server logs and referrer headers.
 *
 * The separate e-mail-and-code screen is the sign-up path and is a different
 * design; this one is reached from «Iniciar sesión».
 */
export default function AccesoPage() {
  const { login } = access;

  return (
    <>
      <AccessTopBar siteName={site.name} />

      <main className={styles.main}>
        {/* The dotted field of the design. Decoration, so it is hidden. */}
        <div aria-hidden="true" className={styles.grid} />

        <div className={styles.card}>
          <div className={styles.intro}>
            <h1 className={styles.title}>{login.title}</h1>
            <p className={styles.subtitle}>{login.subtitle}</p>
          </div>

          <div className={styles.form}>
            <Field
              id="email"
              name="email"
              type="email"
              label={login.emailLabel}
              autoComplete="email"
            />

            <Field
              id="password"
              name="password"
              type="password"
              label={login.passwordLabel}
              autoComplete="current-password"
              action={
                <a className={styles.forgot} href={login.forgotHref}>
                  {login.forgotLabel}
                </a>
              }
            />

            {/* Inert on purpose — see the note above. */}
            <button className={styles.submit} type="button">
              {login.submitLabel}
            </button>
          </div>

          <p className={styles.protocol}>{login.protocol}</p>
        </div>
      </main>
    </>
  );
}
