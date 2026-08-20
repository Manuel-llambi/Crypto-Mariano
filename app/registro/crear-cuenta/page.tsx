import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AccessScreen } from "@/components/sections/AccessScreen";
import { Field } from "@/components/ui/Field";
import { access, site } from "@/lib/content";
import { SIGNUP_ACCOUNT_ERROR_CODES, SIGNUP_HREF } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";

import { setPassword } from "./actions";

/** A step in the middle of a flow has no business in a search result. */
export const metadata: Metadata = {
  title: `${access.signup.account.title} — ${site.name}`,
  robots: { index: false, follow: false },
};

interface CrearCuentaPageProps {
  /*
   * Declared wide and narrowed after the await.
   *
   * `tsconfig.json` includes `.next/types/**`, where Next generates the check
   * that a route's props match the ones it passes; a shape narrowed by hand can
   * clash there even when `tsc --noEmit` passes before those types exist.
   */
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Step 3 of signing up: the password of the account the session identifies.
 *
 * The control posts to a Server Action that calls `updateUser`. Nothing on this
 * screen names the account — that is 3.5, and it is why the address above the
 * password field is an echo rather than a field.
 *
 * `new-password` rather than `current-password` is what tells a password
 * manager to offer to generate one instead of filling an account that does not
 * have a password yet.
 */
export default async function CrearCuentaPage({ searchParams }: CrearCuentaPageProps) {
  const supabase = await createClient();

  /*
   * The guard, before any markup is emitted (4.4).
   *
   * `getUser()` and not `getSession()`: the second reads the cookie and takes
   * its word for it, and on the server a cookie is input from the visitor. This
   * one validates against the authentication server — the same form as the
   * guard of `app/panel/layout.tsx`.
   *
   * The same call also supplies the echo below, so showing the address costs no
   * extra round trip.
   */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(SIGNUP_HREF);
  }

  const { account } = access.signup;
  const { error } = await searchParams;

  /*
   * Two reasons, and unlike steps 1 and 2 this screen names them (3.2). By now
   * the visitor has proved the mailbox is theirs, so there is nothing to hide,
   * and a vague message would leave them guessing what to change.
   *
   * The comparison is exact. Any other value — including a repeated parameter,
   * which arrives as an array — means nobody had a failed attempt.
   */
  const errorMessage =
    error === SIGNUP_ACCOUNT_ERROR_CODES.weak
      ? account.errorMessages.weak
      : error === SIGNUP_ACCOUNT_ERROR_CODES.generic
        ? account.errorMessages.generic
        : undefined;

  return (
    <AccessScreen
      siteName={site.name}
      title={account.title}
      subtitle={account.subtitle}
      protocol={account.protocol}
      submitLabel={account.submitLabel}
      submitAction={setPassword}
      error={errorMessage}
    >
      {/*
        An echo, not a field (3.5).

        It has no `name`, so the browser leaves it out of the submission
        entirely — the account being written to is the one the session
        identifies, and there is no way for a posted address to redirect that
        write. It is kept because without it the screen would be asking for a
        password without saying who for, and it is `readOnly` rather than
        editable because a field you can change and the server ignores is a lie
        about what the screen does.

        `readOnly` and never `disabled`: a disabled control is skipped by
        keyboard navigation and often goes unannounced by a screen reader, which
        would defeat the only purpose it has.
      */}
      <Field
        id="email"
        type="email"
        label={account.emailLabel}
        value={user.email}
        readOnly
        autoComplete="email"
      />

      <Field
        id="password"
        name="password"
        type="password"
        label={account.passwordLabel}
        autoComplete="new-password"
      />
    </AccessScreen>
  );
}
