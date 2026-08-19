// Imported first, and the order is load-bearing: it puts `.env` into this
// process before the module below validates what it finds there.
import "./playwright.load-env";

import { supabaseEnv } from "./lib/supabase/env";
import { assertSupabaseIsUp } from "./lib/supabase/health";

/**
 * Aborts the end-to-end suite when the local Supabase instance is down (7.1).
 *
 * It lives outside `e2e/` on purpose: `tsconfig.json` excludes that directory,
 * so a setup file in there would never be typechecked.
 *
 * The address comes from `lib/supabase/env` rather than a loose
 * `process.env.SUPABASE_URL`: an address read and validated in two places
 * eventually disagrees with itself.
 *
 * It runs *after* the web server, not before: Playwright pushes its plugin
 * setup tasks ahead of `globalSetups`, and the web server is one of those
 * plugins. So this does not save the build; it only replaces the diagnosis.
 */
export default async function globalSetup(): Promise<void> {
  await assertSupabaseIsUp(supabaseEnv.url);
}
