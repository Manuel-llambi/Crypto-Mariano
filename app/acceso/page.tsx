import type { Metadata } from "next";

import { AccessScreen } from "@/components/sections/AccessScreen";
import { Field } from "@/components/ui/Field";
import { FieldAction } from "@/components/ui/FieldAction";
import { access, site } from "@/lib/content";
import { PANEL_HREF } from "@/lib/routes";

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
 * three, and the control below checks no credential — it walks to the dashboard
 * whatever was typed, exactly as the intermediate steps of `/registro` do.
 *
 * That control is an anchor, and on the one screen of the five that holds a
 * password it has to be. What must never appear here is a `<form>`: one with no
 * action submits by GET and puts every field into the query string, and from
 * there the password reaches browser history, server logs and the referrer of
 * the next request. An anchor serialises nothing, so the destination stays a
 * bare `/panel`. `e2e/acceso.spec.ts` is what holds that line.
 *
 * Signing up is a separate flow of three screens under `/registro`; this one is
 * reached from «Iniciar sesión».
 */
export default function AccesoPage() {
  const { login } = access;

  return (
    <AccessScreen
      siteName={site.name}
      title={login.title}
      subtitle={login.subtitle}
      protocol={login.protocol}
      submitLabel={login.submitLabel}
      submitHref={PANEL_HREF}
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
