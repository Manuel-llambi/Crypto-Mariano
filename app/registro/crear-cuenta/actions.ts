"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import {
  PANEL_HREF,
  SIGNUP_ACCOUNT_ERROR_HREF,
  SIGNUP_ACCOUNT_WEAK_HREF,
} from "@/lib/routes";

/**
 * The only rule this action imposes: there is something here (3.3).
 *
 * It does not restate the instance's password policy. A minimum length here
 * would produce a second refusal for the same outcome, and one that goes stale
 * the day `minimum_password_length` changes in `supabase/config.toml`. Same
 * decision `CredentialsSchema` took in the login spec.
 */
const PasswordSchema = z.strictObject({ password: z.string().min(1) });

/**
 * What Supabase calls a password its policy will not accept.
 *
 * Verified against the instance rather than guessed: a five character password
 * against `minimum_password_length = 6` comes back 422 with
 * `error_code: "weak_password"` and «Password should be at least 6 characters.»
 */
const WEAK_PASSWORD = "weak_password";

/**
 * Sets the password of the account the session identifies (3.1).
 *
 * It reads exactly one field, and that is the security argument of the whole
 * screen (3.5): the account is never named by the submission, so an address
 * posted here cannot redirect the write to somebody else's account — not
 * because a check rejects it, but because no code reads it. That is why the
 * echo on the screen carries no `name` and why this function does not care.
 *
 * There is no branch for an account that already existed (3.4). `updateUser`
 * replaces whatever password was there, which is exactly the contract of any
 * recovery by e-mail: whoever controls the mailbox can set the password.
 */
export async function setPassword(formData: FormData): Promise<never> {
  /*
   * One explicit read rather than `Object.fromEntries(formData)`. The read-only
   * echo above the field is not submitted, but if it ever were, a strict schema
   * would fail the step over a surplus field that has nothing to do with the
   * password.
   */
  const request = PasswordSchema.safeParse({ password: formData.get("password") });

  /*
   * `safeParse` and not `parse`, so this redirect stays outside every `try`.
   *
   * Generic and not weak: nothing was judged, so nothing can be named. Calling
   * an empty field «too weak» would be this action inventing a verdict that
   * only the instance gets to reach.
   */
  if (!request.success) {
    redirect(SIGNUP_ACCOUNT_ERROR_HREF);
  }

  const supabase = await createClient();

  let failure: "weak" | "generic" | undefined;

  /*
   * The `try` wraps the network call and nothing else.
   *
   * Next's `redirect` signals by throwing an exception of its own. Inside a
   * `try`, the handler below would swallow it and the navigation would simply
   * not happen.
   */
  try {
    const { error } = await supabase.auth.updateUser({ password: request.data.password });

    if (error !== null) {
      failure = error.code === WEAK_PASSWORD ? "weak" : "generic";
    }
  } catch {
    // An instance that does not answer has passed no judgement on the password.
    failure = "generic";
  }

  if (failure !== undefined) {
    redirect(failure === "weak" ? SIGNUP_ACCOUNT_WEAK_HREF : SIGNUP_ACCOUNT_ERROR_HREF);
  }

  // 3.6 — the password travelled in the body and appears in no destination.
  redirect(PANEL_HREF);
}
