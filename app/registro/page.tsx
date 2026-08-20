import type { Metadata } from "next";

import { AccessScreen } from "@/components/sections/AccessScreen";
import { Field } from "@/components/ui/Field";
import { access, site } from "@/lib/content";
import { SIGNUP_ERROR_CODE, SIGNUP_EXPIRED_CODE } from "@/lib/routes";

import { requestCode } from "./actions";

/**
 * Not indexable.
 *
 * The step works for real now, but the flow it belongs to is not meant to be
 * published while the rest of the product is unfinished.
 */
export const metadata: Metadata = {
  title: `${access.signup.email.title} — ${site.name}`,
  robots: { index: false, follow: false },
};

interface RegistroPageProps {
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
 * Step 1 of signing up: the address the code will be sent to.
 *
 * One field, because the screen has one question. The control posts to a Server
 * Action that asks Supabase for a code and holds the address in an `httpOnly`
 * cookie — never in the URL, which reaches history, logs and the referrer of
 * the next request (1.5).
 *
 * The `<form>` is what lets the browser submit on its own, with no script (6.1,
 * 6.3), and it is safe because it has an action: a form with *none* submits by
 * GET and would put the address in the query string.
 */
export default async function RegistroPage({ searchParams }: RegistroPageProps) {
  const { email } = access.signup;
  const { error } = await searchParams;

  /*
   * Two markers land here, and they do not say the same thing.
   *
   * `correo` is a refusal of this step (1.2, 1.4). `vencido` is not a refusal
   * at all: whoever sees it reached step 2 with no pending address and has to
   * ask for a new code, which is what 4.3 requires the message to say.
   *
   * The comparison is exact. A different value, an empty one, or a repeated
   * parameter — which arrives as an array and so fails a comparison against a
   * string — all mean nobody had a failed attempt, and a screen that believed
   * the address bar would turn the URL into a generator of error messages.
   */
  const errorMessage =
    error === SIGNUP_ERROR_CODE
      ? email.errorMessage
      : error === SIGNUP_EXPIRED_CODE
        ? email.expiredMessage
        : undefined;

  return (
    <AccessScreen
      siteName={site.name}
      title={email.title}
      subtitle={email.subtitle}
      protocol={email.protocol}
      submitLabel={email.submitLabel}
      submitAction={requestCode}
      error={errorMessage}
    >
      <Field id="email" name="email" type="email" label={email.emailLabel} autoComplete="email" />
    </AccessScreen>
  );
}
