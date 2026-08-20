import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AccessScreen } from "@/components/sections/AccessScreen";
import { Field } from "@/components/ui/Field";
import { FieldAction } from "@/components/ui/FieldAction";
import { access, site } from "@/lib/content";
import { readPendingEmail } from "@/lib/signup/pending-email";
import { SIGNUP_CODE_ERROR_CODE, SIGNUP_EXPIRED_HREF, SIGNUP_HREF } from "@/lib/routes";

import { verifyCode } from "./actions";

/** A step in the middle of a flow has no business in a search result. */
export const metadata: Metadata = {
  title: `${access.signup.code.title} — ${site.name}`,
  robots: { index: false, follow: false },
};

interface RegistroCodigoPageProps {
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
 * Step 2 of signing up: the code that arrived by e-mail.
 *
 * Nothing is checked here — the screen collects the code and the Server Action
 * hands it to Supabase, which is the only thing that can say whether it is
 * right (2.4). The `<form>` is what lets the browser submit on its own, with no
 * script (6.1, 6.3).
 *
 * The field is `text`, not `number`: a verification code is a string of digits,
 * and `number` would bring a spinner, silent locale grouping and the loss of a
 * leading zero. `inputMode` is what gets the numeric keypad on a phone.
 */
export default async function RegistroCodigoPage({ searchParams }: RegistroCodigoPageProps) {
  /*
   * The guard, before any markup is emitted (4.3).
   *
   * It lives here and not in the action because a request that merely *arrives*
   * at this screen with no pending address has nothing to show: the code the
   * visitor might type could not be checked against anything. They go back to
   * step 1 with the message that says to ask for a new one — the same place and
   * the same shape as the guard of `app/panel/layout.tsx`.
   */
  const pendingEmail = await readPendingEmail();

  if (pendingEmail === undefined) {
    redirect(SIGNUP_EXPIRED_HREF);
  }

  const { code } = access.signup;
  const { error } = await searchParams;

  /*
   * The comparison is exact. A different value, an empty one, or a repeated
   * parameter — which arrives as an array and so fails a comparison against a
   * string — all mean nobody had a failed attempt, and a screen that believed
   * the address bar would turn the URL into a generator of error messages.
   */
  const errorMessage = error === SIGNUP_CODE_ERROR_CODE ? code.errorMessage : undefined;

  return (
    <AccessScreen
      siteName={site.name}
      title={code.title}
      subtitle={code.subtitle}
      protocol={code.protocol}
      submitLabel={code.submitLabel}
      submitAction={verifyCode}
      error={errorMessage}
    >
      <Field
        id="code"
        name="code"
        type="text"
        label={code.codeLabel}
        autoComplete="one-time-code"
        inputMode="numeric"
        /*
         * 4.5 — asking for another code is going back to step 1, which already
         * knows how to send one. Resending without leaving this screen is out
         * of scope, so there is no fourth action behind this.
         */
        action={<FieldAction href={SIGNUP_HREF}>{code.resendLabel}</FieldAction>}
      />
    </AccessScreen>
  );
}
