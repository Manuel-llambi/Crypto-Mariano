import type { Metadata } from "next";

import { AccessScreen } from "@/components/sections/AccessScreen";
import { Field } from "@/components/ui/Field";
import { FieldAction } from "@/components/ui/FieldAction";
import { access, site } from "@/lib/content";

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
 * takes no `href`, which is what makes `AccessScreen` render it as an inert
 * button — the detail that matters, because this is the one screen of the four
 * that holds a password.
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
