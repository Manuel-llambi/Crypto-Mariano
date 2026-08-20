// Imported first, and the order is load-bearing: it puts `.env` into this
// process before the module below validates what it finds there.
import "./playwright.load-env";

import { MAILBOX_URL } from "./e2e/mailbox";
import { assertMailboxIsUp } from "./lib/mailbox/health";
import { supabaseEnv } from "./lib/supabase/env";
import { assertSupabaseIsUp } from "./lib/supabase/health";

/**
 * Aborts the end-to-end suite when the local environment is not ready (7.1, 9.4).
 *
 * The two checks live outside `e2e/` on purpose: `tsconfig.json` excludes that
 * directory, so a setup file in there would never be typechecked. `MAILBOX_URL`
 * does come from `e2e/`, and importing it pulls that one module into what `tsc`
 * checks even though the directory is excluded — `exclude` governs which files
 * are roots, not what is followed from a root. That is a bonus, not a problem.
 *
 * The Supabase address comes from `lib/supabase/env` rather than a loose
 * `process.env.SUPABASE_URL`: an address read and validated in two places
 * eventually disagrees with itself. The mailbox address is a literal because
 * nothing outside the tests knows about it.
 *
 * Supabase first, because a stopped Docker takes both down and the instance is
 * the more useful thing to be told about. Only if it is up does a silent
 * mailbox mean something specific.
 *
 * It runs *after* the web server, not before: Playwright pushes its plugin
 * setup tasks ahead of `globalSetups`, and the web server is one of those
 * plugins. So this does not save the build; it only replaces the diagnosis.
 */
export default async function globalSetup(): Promise<void> {
  await assertSupabaseIsUp(supabaseEnv.url);
  await assertMailboxIsUp(MAILBOX_URL);
}
