/** How long to wait before deciding the mailbox is not going to answer. */
const TIMEOUT_MS = 5_000;

/**
 * Fails loudly when the local mailbox is not answering (9.4).
 *
 * The twin of `lib/supabase/health.ts`, and it exists for the same reason one
 * layer over: the sign-up suite reads the verification code out of this mailbox,
 * so without it every one of those cases dies on an expired `expect` pointing at
 * the code screen — healthy code, wrong diagnosis. Naming the mailbox is what
 * separates this from «Supabase is down», which would send whoever reads it to
 * the wrong container.
 *
 * The container is called `supabase_inbucket_…` for historical reasons and runs
 * Mailpit; `/api/v1/info` is Mailpit's, and asking for it rather than for `/`
 * ties the check to the API the helper actually depends on. The root path is
 * served by a static file server and would answer 200 with the API broken.
 *
 * The timeout matters: a hung Docker is neither down nor healthy, and without
 * one the check would wait forever.
 *
 * It lives in `lib/` and not in `e2e/` for the same reason its twin does:
 * `tsconfig.json` excludes `e2e/`, so a module with logic in there would never
 * be typechecked and could not be exercised by vitest.
 *
 * In English, like every other message written for whoever develops this
 * repository. The tuteo rule governs interface copy, and this is not that.
 */
export async function assertMailboxIsUp(baseUrl: string): Promise<void> {
  const endpoint = `${baseUrl}/api/v1/info`;

  let response: Response;

  try {
    response = await fetch(endpoint, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch (cause) {
    throw new Error(
      `The local mailbox is not answering at ${baseUrl}. ` +
        `It ships with the Supabase instance: start it with \`supabase start\`. ` +
        `The sign-up suite reads the verification code from there and cannot run without it.`,
      { cause },
    );
  }

  if (!response.ok) {
    throw new Error(
      `The local mailbox answered ${response.status} at ${baseUrl}. ` +
        `Its container is up but the API is not healthy; ` +
        `try \`supabase stop\` followed by \`supabase start\`.`,
    );
  }
}
