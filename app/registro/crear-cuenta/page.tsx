import type { Metadata } from "next";

import { AccessScreen } from "@/components/sections/AccessScreen";
import { Field } from "@/components/ui/Field";
import { access, site } from "@/lib/content";

/** A shell that creates nothing has no business in a search result. */
export const metadata: Metadata = {
  title: `${access.signup.account.title} — ${site.name}`,
  robots: { index: false, follow: false },
};

/**
 * Step 3 of signing up: the account itself (UI only).
 *
 * The same two fields as the access screen, with the copy of creating rather
 * than entering. It is the end of the flow as far as this repository goes, so
 * the control takes no `href` and stays an inert button — the same reasoning as
 * on `/acceso`, and for the same reason: this screen holds a password, and a
 * `<form>` with no action would submit by GET and put it in the URL.
 *
 * `new-password` rather than `current-password` is what tells a password
 * manager to offer to generate one instead of filling an existing one.
 *
 * The address is asked again because nothing carries state between these
 * screens. Once a backend exists it arrives from step 1 and this field becomes
 * a prefilled, read-only echo of it.
 */
export default function CrearCuentaPage() {
  const { account } = access.signup;

  return (
    <AccessScreen
      siteName={site.name}
      title={account.title}
      subtitle={account.subtitle}
      protocol={account.protocol}
      submitLabel={account.submitLabel}
    >
      <Field id="email" name="email" type="email" label={account.emailLabel} autoComplete="email" />

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
