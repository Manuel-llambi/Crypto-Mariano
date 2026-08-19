/** How long to wait before deciding the instance is not going to answer. */
const TIMEOUT_MS = 5_000;

/**
 * Fails loudly when the local Supabase instance is not answering (7.1).
 *
 * Without it, a stopped Docker makes every end-to-end case die on an expired
 * `expect` that points at the access screen or at the dashboard guard —
 * healthy code — instead of at the instance. Replacing that symptom is the
 * whole value of this check; it does not make the run any faster, because
 * Playwright starts its web server before its global setup.
 *
 * `GET /auth/v1/health` needs neither `apikey` nor `Authorization` — verified
 * against the running instance — and sending one would hide a 401 behind a
 * message about the instance being down.
 *
 * The timeout matters: a hung Docker is neither down nor healthy, and without
 * one the check would wait forever.
 *
 * In English, like every other message written for whoever develops this
 * repository. The tuteo rule governs interface copy, and this is not that.
 */
export async function assertSupabaseIsUp(baseUrl: string): Promise<void> {
  const endpoint = `${baseUrl}/auth/v1/health`;

  let response: Response;

  try {
    response = await fetch(endpoint, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch (cause) {
    throw new Error(
      `The local Supabase instance is not answering at ${baseUrl}. ` +
        `Start it with \`supabase start\` and seed it with \`supabase db reset\`.`,
      { cause },
    );
  }

  if (!response.ok) {
    throw new Error(
      `The local Supabase instance answered ${response.status} at ${baseUrl}. ` +
        `Its containers are up but authentication is not healthy; ` +
        `try \`supabase stop\` followed by \`supabase start\`.`,
    );
  }
}
