import type { Metadata } from "next";

import { AccessScreen } from "@/components/sections/AccessScreen";
import { Field } from "@/components/ui/Field";
import { access, site } from "@/lib/content";
import { SIGNUP_CODE_HREF } from "@/lib/routes";

/** A shell that collects nothing has no business in a search result. */
export const metadata: Metadata = {
  title: `${access.signup.email.title} — ${site.name}`,
  robots: { index: false, follow: false },
};

/**
 * Step 1 of signing up: the address the code will be sent to (UI only).
 *
 * One field, because the screen has one question. Nothing here sends anything
 * — 6.7 forbids it — so the control is a plain anchor to the next step and the
 * address typed above is simply left behind. That is honest about what this is:
 * a shell of the flow, not the flow.
 *
 * An anchor rather than a form is also what keeps 8.3 true: the browser
 * navigates on its own, with no script involved.
 */
export default function RegistroPage() {
  const { email } = access.signup;

  return (
    <AccessScreen
      siteName={site.name}
      title={email.title}
      subtitle={email.subtitle}
      protocol={email.protocol}
      submitLabel={email.submitLabel}
      submitHref={SIGNUP_CODE_HREF}
    >
      <Field id="email" name="email" type="email" label={email.emailLabel} autoComplete="email" />
    </AccessScreen>
  );
}
