/**
 * The local mailbox, and the address the sign-up suite signs up with.
 *
 * Static literals with no `.env` behind them, exactly like `e2e/seeded-account.ts`
 * and for the same reason: Playwright reads no `.env` of its own and cannot
 * dynamically import TypeScript, so a value resolved at runtime never arrives.
 *
 * The container is named `supabase_inbucket_…` by inheritance from the CLI but
 * runs **Mailpit** (`public.ecr.aws/supabase/mailpit`), which matters because
 * the API for listing messages changed between the two. Verified against the
 * running instance, not inferred from the container name.
 */
export const MAILBOX_URL = "http://127.0.0.1:55324";

/**
 * The address the sign-up cases use, and it is **not** the seeded account.
 *
 * `supabase/seed.sql` plants `alumno@crypto-crime.test`, and step 3 of signing
 * up sets a password on whatever account is in session. Signing up as the
 * seeded account would therefore overwrite its password, and
 * `e2e/acceso.spec.ts`, `e2e/panel.spec.ts` and `e2e/auth.setup.ts` would start
 * failing with «invalid credentials» over credentials that are correct — a
 * silent side effect that reads like a defect in the code.
 *
 * It is fixed rather than randomised, which is what 9.6 asks for: the second
 * run finds the account the first one created and, by 3.4, does exactly the
 * same thing to it. No `supabase db reset` between runs.
 */
export const SIGNUP_ADDRESS = "inscripcion-e2e@crypto-crime.test";

/**
 * A password no run has used before, for the account to be given.
 *
 * It has to be fresh, and that is not a stylistic choice. Supabase refuses to
 * set a password identical to the current one — 422 `same_password`, observed
 * against the instance — so a fixed literal works exactly once: the second case
 * of the same run, and every later run, would be refused for a reason that has
 * nothing to do with the flow being tested.
 *
 * Requirement 9.6 asks the suite to be repeatable with no `supabase db reset`
 * between runs, and with that refusal in place a constant password cannot
 * deliver it. Varying the password can, and it costs nothing: 3.4 says step 3
 * replaces whatever password was there, so each run simply replaces the last
 * one's.
 *
 * The address stays fixed; only this varies. Comfortably longer than
 * `minimum_password_length` in `supabase/config.toml`, without restating the
 * number.
 *
 * @param label distinguishes two passwords set within the same millisecond by
 * different cases, which the timestamp alone would not.
 */
export function freshPassword(label: string): string {
  return `alta-${label}-${Date.now()}`;
}

/**
 * Waits out the minimum interval between two e-mails to the same address.
 *
 * `[auth.email] max_frequency = "1s"` in `supabase/config.toml`, which arrives
 * in the container as `GOTRUE_SMTP_MAX_FREQUENCY`. Two requests for the same
 * address inside that second come back 429 `over_email_send_rate_limit` with
 * «For security purposes, you can only request this after 0 seconds» — the
 * remaining wait rounded down, which is why it reads as zero and looks like
 * nonsense.
 *
 * This is **not** `auth.rate_limit.email_sent`, which is a different knob and
 * does not bite here: three sends in a row were verified to go through. This
 * one does bite, because the suite runs with one worker and its cases fire back
 * to back at the same address.
 *
 * Waiting rather than retrying, on purpose: a retry would also swallow a
 * genuine refusal, and the whole value of the redirect assertions is that a
 * refusal is visible.
 */
export async function respectSendFrequency(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 1_200));
}

/** How long to wait for a message that Supabase has just been asked to send. */
const TIMEOUT_MS = 10_000;

/** How often to ask again while waiting. */
const INTERVAL_MS = 250;

/** The six digits Supabase puts in the mail, per `otp_length` in `config.toml`. */
const CODE_PATTERN = /\b(\d{6})\b/;

interface MailpitSummary {
  ID: string;
  Created: string;
}

interface MailpitMessage {
  Text?: string;
  HTML?: string;
}

/**
 * The code from the **most recent** message sent to an address (9.3).
 *
 * The most recent and not the first, and that is the whole subtlety: 9.6 asks
 * the suite to be repeatable without preparing the database, so by the second
 * run the mailbox already holds the code from the first. Reading the oldest
 * would verify a code that was already consumed and the case would fail on a
 * flow that works.
 *
 * Mailpit's search returns newest first, so the first hit is the one wanted.
 * The polling is because the send is asynchronous: the Server Action returns as
 * soon as Supabase accepts the request, and the message reaches the mailbox a
 * moment later.
 *
 * The code is never spelled in the suite or in configuration — it is read from
 * the mailbox during the run, which is what makes the case exercise the real
 * mail rather than a value someone agreed on in advance.
 */
export async function readLatestCode(address: string): Promise<string> {
  const query = encodeURIComponent(`to:${address}`);
  const deadline = Date.now() + TIMEOUT_MS;

  let seen = 0;

  while (Date.now() < deadline) {
    const response = await fetch(`${MAILBOX_URL}/api/v1/search?query=${query}&limit=1`);

    if (response.ok) {
      const { messages } = (await response.json()) as { messages?: MailpitSummary[] };
      const latest = messages?.[0];
      seen = messages?.length ?? 0;

      if (latest !== undefined) {
        const detail = await fetch(`${MAILBOX_URL}/api/v1/message/${latest.ID}`);

        if (detail.ok) {
          const body = (await detail.json()) as MailpitMessage;
          // The plain text part first: the HTML one wraps the digits in markup
          // and a stray tag between them would break the match.
          const match = CODE_PATTERN.exec(`${body.Text ?? ""}\n${body.HTML ?? ""}`);

          if (match !== null) {
            return match[1]!;
          }
        }
      }
    }

    await new Promise((resolve) => setTimeout(resolve, INTERVAL_MS));
  }

  throw new Error(
    `No verification code reached ${address} at ${MAILBOX_URL} within ${TIMEOUT_MS}ms ` +
      `(${seen} message(s) found for that address). ` +
      `If messages are arriving but carry a link instead of a code, ` +
      `the templates in supabase/config.toml are not being resolved.`,
  );
}
