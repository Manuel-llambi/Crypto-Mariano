import type { Metadata } from "next";

import { AccessScreen } from "@/components/sections/AccessScreen";
import { Field } from "@/components/ui/Field";
import { FieldAction } from "@/components/ui/FieldAction";
import { access, site } from "@/lib/content";
import { SIGNUP_ACCOUNT_HREF, SIGNUP_HREF } from "@/lib/routes";

/** A shell that verifies nothing has no business in a search result. */
export const metadata: Metadata = {
  title: `${access.signup.code.title} — ${site.name}`,
  robots: { index: false, follow: false },
};

/**
 * Step 2 of signing up: the code that arrived by e-mail (UI only).
 *
 * Nothing is verified here. The control advances to the account screen whatever
 * is typed — or with nothing typed at all — because verification is exactly the
 * kind of thing 6.7 puts out of scope. When a backend exists, this control
 * stops being an anchor and the check happens on the server; the screen is
 * built so that is the only change.
 *
 * The field is `text`, not `number`: a verification code is a string of digits,
 * and `number` would bring a spinner, silent locale grouping and the loss of a
 * leading zero. `inputMode` is what gets the numeric keypad on a phone.
 */
export default function RegistroCodigoPage() {
  const { code } = access.signup;

  return (
    <AccessScreen
      siteName={site.name}
      title={code.title}
      subtitle={code.subtitle}
      protocol={code.protocol}
      submitLabel={code.submitLabel}
      submitHref={SIGNUP_ACCOUNT_HREF}
    >
      <Field
        id="code"
        name="code"
        type="text"
        label={code.codeLabel}
        autoComplete="one-time-code"
        inputMode="numeric"
        action={<FieldAction href={SIGNUP_HREF}>{code.resendLabel}</FieldAction>}
      />
    </AccessScreen>
  );
}
