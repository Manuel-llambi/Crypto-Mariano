"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { setPendingEmail } from "@/lib/signup/pending-email";
import { createClient } from "@/lib/supabase/server";
import { SIGNUP_CODE_HREF, SIGNUP_ERROR_HREF } from "@/lib/routes";

/**
 * What is worth asking Supabase about (1.2).
 *
 * Only an attempt that cannot succeed is ruled out here — no address, or one
 * that is not an address. Everything else is Supabase's call, the same
 * discipline `CredentialsSchema` set in the login spec.
 */
const RequestSchema = z.strictObject({ email: z.email() });

/**
 * Asks Supabase to send a code, and takes the visitor somewhere, always.
 *
 * The `"use server"` at the top is not decoration: without it this is an
 * ordinary function and `<form action={requestCode}>` has nothing to post to.
 * It is also what keeps step 1 working with no script at all (6.1).
 *
 * Every refusal ends at the same address — a malformed e-mail, a send Supabase
 * rejected, an instance that is not there — and so does every success,
 * regardless of whether the address already had an account (1.3). That is what
 * stops the screen from answering which addresses are registered.
 */
export async function requestCode(formData: FormData): Promise<never> {
  /*
   * One explicit read rather than `Object.fromEntries(formData)`.
   *
   * `z.strictObject` rejects a surplus key, so the day the form grows a field —
   * an intent, a token — signing up would start failing for a reason that has
   * nothing to do with the address.
   */
  const request = RequestSchema.safeParse({ email: formData.get("email") });

  // `safeParse` and not `parse`: the failure is a value, so this redirect stays
  // outside every `try`/`catch`, which is the rule the network call below sets.
  if (!request.success) {
    redirect(SIGNUP_ERROR_HREF);
  }

  const { email } = request.data;

  const supabase = await createClient();

  let rejected = false;

  /*
   * The `try` wraps the network call and nothing else.
   *
   * Next's `redirect` signals by throwing an exception of its own. Inside a
   * `try`, the handler below would swallow it and the navigation would simply
   * not happen — the visitor would be left staring at a screen that did not
   * react.
   */
  try {
    /*
     * `shouldCreateUser: true` is half of 1.3. Without it an address with no
     * account is refused and one with an account succeeds, and the difference
     * between the two answers is a list of who is registered.
     */
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    rejected = error !== null;
  } catch {
    // An instance that does not answer is a refusal like any other (1.4).
    rejected = true;
  }

  if (rejected) {
    redirect(SIGNUP_ERROR_HREF);
  }

  // Only now, with a code actually on its way: the address is what step 2 will
  // verify against, and holding it for a send that failed would be a lie.
  await setPendingEmail(email);

  redirect(SIGNUP_CODE_HREF);
}
