"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { LOGIN_ERROR_HREF, PANEL_HREF } from "@/lib/routes";

/**
 * What is worth asking Supabase about (1.4).
 *
 * It does not restate Supabase's password policy: whether a password is good
 * enough is Supabase's call (1.3), and a length rule here would only produce a
 * second refusal for the same outcome. All this rules out is an attempt that
 * cannot succeed — no address, a malformed one, or no password at all.
 */
const CredentialsSchema = z.strictObject({
  email: z.email(),
  password: z.string().min(1),
});

/**
 * Verifies the credentials and takes the visitor somewhere, always.
 *
 * The `"use server"` at the top is not decoration: without it this is an
 * ordinary function and the `<form action={signIn}>` of the access screen has
 * nothing to post to.
 *
 * Nothing here compares a password. Whether the credentials are good is
 * Supabase's decision (1.3), and the session it opens is written into the
 * cookies of this request by the client of `lib/supabase/server` (3.1).
 *
 * Every refusal ends at the same address — a wrong password, an account that
 * was never created, the instance being down — so the screen never tells a
 * stranger which addresses are registered (2.2).
 */
export async function signIn(formData: FormData): Promise<never> {
  /*
   * Two explicit reads rather than `Object.fromEntries(formData)`.
   *
   * `z.strictObject` rejects a surplus key, so the day the form grows a field —
   * an intent, a token — signing in would start failing for a reason that has
   * nothing to do with the credentials. A missing field arrives as `null` and
   * the schema refuses it by type instead of by format; the destination is the
   * same either way.
   */
  const credentials = CredentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  // `safeParse` and not `parse`: the failure is a value, so this redirect stays
  // outside every `try`/`catch`, which is the rule the network call below sets.
  // It is also the same destination as a wrong password — one refusal, one
  // message, nothing for a stranger to read into.
  if (!credentials.success) {
    redirect(LOGIN_ERROR_HREF);
  }

  const { email, password } = credentials.data;

  const supabase = await createClient();

  let rejected = false;

  /*
   * The `try` wraps the network call and nothing else.
   *
   * Next's `redirect` signals by throwing an exception of its own. Inside a
   * `try`, the handler below would swallow it and the navigation would simply
   * not happen — the visitor would be left staring at a screen that did not
   * react. Both redirects are therefore outside.
   */
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    rejected = error !== null;
  } catch {
    // An instance that does not answer is a refusal like any other. Telling it
    // apart on screen would be telling the visitor something 2.2 forbids.
    rejected = true;
  }

  if (rejected) {
    redirect(LOGIN_ERROR_HREF);
  }

  redirect(PANEL_HREF);
}
