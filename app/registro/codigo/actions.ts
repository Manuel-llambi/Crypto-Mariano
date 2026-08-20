"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { clearPendingEmail, readPendingEmail } from "@/lib/signup/pending-email";
import { createClient } from "@/lib/supabase/server";
import {
  SIGNUP_ACCOUNT_HREF,
  SIGNUP_CODE_ERROR_HREF,
  SIGNUP_EXPIRED_HREF,
} from "@/lib/routes";

/**
 * What is worth asking Supabase about (2.3).
 *
 * Only the shape of the field, never its content: whether a code is the right
 * one is Supabase's decision alone (2.4), and a format rule here would be this
 * repository guessing at a policy it does not own.
 */
const VerifySchema = z.strictObject({ code: z.string().min(1) });

/**
 * Verifies the code, which is where the session is born.
 *
 * The address comes from the `httpOnly` cookie step 1 wrote and never from the
 * submission: it is the only address that code is worth anything for, and
 * reading it from the form would let anyone verify a code against an address of
 * their choosing.
 *
 * Nothing here compares, stores or logs the code (2.4). On success Supabase
 * issues the session and the client of `lib/supabase/server` writes it into the
 * cookies of this request, with no help from this function.
 */
export async function verifyCode(formData: FormData): Promise<never> {
  /*
   * The pending address is checked before the field, and the order matters.
   *
   * With no address there is nothing to verify whatever was typed, so «ask for
   * a new code» is the only advice that helps. Refusing the field first would
   * be true and useless — it would tell someone their code was bad when the
   * real problem is that it can no longer be checked at all (4.3).
   */
  const email = await readPendingEmail();

  if (email === undefined) {
    redirect(SIGNUP_EXPIRED_HREF);
  }

  /*
   * One explicit read rather than `Object.fromEntries(formData)`: with a strict
   * schema, a surplus field would fail the step for a reason that has nothing
   * to do with the code.
   */
  const request = VerifySchema.safeParse({ code: formData.get("code") });

  // `safeParse` and not `parse`: the failure is a value, so this redirect stays
  // outside every `try`/`catch`, which is the rule the network call below sets.
  if (!request.success) {
    redirect(SIGNUP_CODE_ERROR_HREF);
  }

  const supabase = await createClient();

  let rejected = false;

  /*
   * The `try` wraps the network call and nothing else.
   *
   * Next's `redirect` signals by throwing an exception of its own. Inside a
   * `try`, the handler below would swallow it and the navigation would simply
   * not happen.
   */
  try {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: request.data.code,
      type: "email",
    });

    rejected = error !== null;
  } catch {
    // An instance that does not answer is a refusal like any other (2.2).
    rejected = true;
  }

  /*
   * One destination for wrong, expired and already used — and the pending
   * address is left alone. Clearing it here would send the next attempt down
   * the expiry path, so a single mistyped digit would cost the visitor the code
   * they already have in their mailbox.
   */
  if (rejected) {
    redirect(SIGNUP_CODE_ERROR_HREF);
  }

  // 4.2 — the session identifies the visitor from here on, so the address has
  // no further use and no reason to linger in a cookie.
  await clearPendingEmail();

  redirect(SIGNUP_ACCOUNT_HREF);
}
