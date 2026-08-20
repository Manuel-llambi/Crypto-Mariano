import type { Metadata } from "next";

import { AccessScreen } from "@/components/sections/AccessScreen";
import { Field } from "@/components/ui/Field";
import { FieldAction } from "@/components/ui/FieldAction";
import { access, site } from "@/lib/content";
import { LOGIN_ERROR_CODE } from "@/lib/routes";

import { signIn } from "./actions";

/**
 * Not indexable.
 *
 * Signing up works for real too since the spec of 2026-08-19, so the flow is
 * complete end to end. What is still missing is everything around it — there is
 * no way to sign out and no password recovery of its own — so none of these
 * screens is meant to be published yet.
 */
export const metadata: Metadata = {
  title: `${access.login.title} — ${site.name}`,
  robots: { index: false, follow: false },
};

interface AccesoPageProps {
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
 * The access screen for someone who already has an account.
 *
 * The control posts to a Server Action that verifies the credentials against
 * the local Supabase instance and opens a session in cookies. The `<form>` is
 * what makes that work with no script of any kind, and it is safe because it
 * has an action: a form with none submits by GET and would put the password in
 * the query string, and from there into browser history, server logs and the
 * referrer of the next request.
 *
 * Signing up is a separate flow of three screens under `/registro`, which
 * create the account for real; this one is reached from «Iniciar sesión».
 */
export default async function AccesoPage({ searchParams }: AccesoPageProps) {
  const { login } = access;
  const { error } = await searchParams;

  /*
   * The message shows if and only if the value is exactly the marker the action
   * emits. A different value, an empty one, or a repeated parameter — which
   * arrives as an array and so fails a comparison against a string — all mean
   * nobody had a failed attempt (2.5).
   */
  const errorMessage = error === LOGIN_ERROR_CODE ? login.errorMessage : undefined;

  return (
    <AccessScreen
      siteName={site.name}
      title={login.title}
      subtitle={login.subtitle}
      protocol={login.protocol}
      submitLabel={login.submitLabel}
      submitAction={signIn}
      error={errorMessage}
    >
      <Field id="email" name="email" type="email" label={login.emailLabel} autoComplete="email" />

      <Field
        id="password"
        name="password"
        type="password"
        label={login.passwordLabel}
        autoComplete="current-password"
        action={<FieldAction href={login.forgotHref}>{login.forgotLabel}</FieldAction>}
      />
    </AccessScreen>
  );
}
