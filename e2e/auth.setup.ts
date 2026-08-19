import { expect, test as setup } from "@playwright/test";

import { SEEDED_EMAIL, SEEDED_PASSWORD } from "./seeded-account";
import { STORAGE_STATE } from "./storage-state";

/**
 * Signs in once per run and saves the session.
 *
 * A `beforeEach` filling the form in every case would be shorter, and it is the
 * wrong trade here: `supabase/config.toml` declares `sign_in_sign_ups = 30`,
 * thirty sign-ins per five minutes per IP, and on a local instance every
 * request comes from the same one. The dashboard suite alone would spend eleven
 * of those per run instead of one, and two runs inside the same window would
 * cross the limit. The cost of crossing it is not slowness but diagnosis:
 * GoTrue answers 429, `signIn` cannot tell that from a wrong password, and the
 * symptom becomes «invalid credentials» on credentials that are correct.
 */
setup("authenticate", async ({ page }) => {
  await page.goto("/acceso?intent=login");

  await page.locator('input[type="email"]').fill(SEEDED_EMAIL);
  await page.locator('input[type="password"]').fill(SEEDED_PASSWORD);
  await page.locator('button[type="submit"]').click();

  await page.waitForURL("**/panel**");

  /*
   * Checked before saving, and this guard earns its place: a state file saved
   * empty would send all eleven dashboard cases into a redirect, pointing at
   * the guard when the real cause is a database that was never seeded.
   */
  const cookies = await page.context().cookies();
  const session = cookies.filter((cookie) => cookie.name.startsWith("sb-"));

  expect(
    session.length,
    `No session cookie after signing in as ${SEEDED_EMAIL}. ` +
      `Seed the database with \`supabase db reset\`, which applies supabase/seed.sql.`,
  ).toBeGreaterThan(0);

  await page.context().storageState({ path: STORAGE_STATE });
});
