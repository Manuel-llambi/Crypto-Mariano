import { expect, test } from "@playwright/test";

import { SEEDED_EMAIL, SEEDED_PASSWORD } from "./seeded-account";

/**
 * The three cases of `docs/specs/2026-08-17-login-supabase/E2E-test-cases-plan.md`.
 *
 * They cover the stretches of that spec no suite in `e2e/` looks at today: that
 * the session survives navigation, that a malformed attempt is refused, and
 * that the screen does not believe the address bar.
 *
 * This is a separate file from `e2e/acceso.spec.ts` on purpose. That one keeps
 * material from the landing spec — axe at two widths, the keyboard walk, 44 by
 * 44, the narrow screen, `noindex` — that a three-case plan cannot reproduce,
 * so generating over it would wipe it. The two live side by side.
 *
 * Like the rest of the suite, these run against the local Supabase instance:
 * it has to be up (`supabase start`) and seeded (`supabase db reset`).
 */

const WIDE = { width: 1280, height: 900 };

/** The address the site actually links to, not a bare `/acceso`. */
const LOGIN = "/acceso?intent=login";

/**
 * A password nothing else on the page contains, so finding it in the address
 * can only mean the form leaked it.
 */
const SENTINEL_PASSWORD = "centinela-cf01-contrasena-sin-correo";

const ERROR_MESSAGE = "No pudimos verificar tus credenciales. Revisa el correo y la contraseña.";

/**
 * The error message is located by its CSS-module class and not by its text.
 *
 * There is no accessible role to hang it on — it is a plain `<p>` with no live
 * region, deliberately, because the message is already in the document when the
 * page loads. A text query would also be the wrong tool for CF-02: an empty
 * paragraph passes a null text lookup while still breaking 2.5. The class hashes
 * at build time but keeps `error` as a substring, which is the same anchor
 * `components/sections/AccessScreen.test.tsx` uses.
 */
const ERROR_NODE = "[class*='error']";

/**
 * CP-01 — 3.2: the session still holds on the requests that follow the sign-in.
 *
 * Not a duplicate of `CP-01` in `e2e/acceso.spec.ts`: that one asserts the
 * request in which the session is *opened*, this one the requests after it. Nor
 * of `e2e/panel.spec.ts`, which enters with an injected `storageState` and so
 * never walks the form at all.
 *
 * No `storageState` here: Playwright's default cookie-less context is the
 * precondition.
 */
test.describe("CP-01 — the session outlives leaving the dashboard and coming back", () => {
  test("CP-01 still serves /panel after a detour through the landing", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto(LOGIN);

    await page.locator('input[type="email"]').fill(SEEDED_EMAIL);
    await page.locator('input[type="password"]').fill(SEEDED_PASSWORD);
    await page.locator('button[type="submit"]').click();

    // Waited on a pattern pointing at the destination, never on a glob that
    // already matches the address the attempt started from.
    await page.waitForURL(/\/panel/);

    // 1.1 — the bare address. Exact equality on `search` forbids any extra
    // parameter; a `not.toContain` passes on an empty string too.
    expect(new URL(page.url()).pathname).toBe("/panel");
    expect(new URL(page.url()).search).toBe("");

    // 3.1 — the session was persisted in cookies, which is what the second
    // request below has to travel on.
    const cookies = await page.context().cookies();
    expect(cookies.filter((cookie) => cookie.name.startsWith("sb-")).length).toBeGreaterThan(0);

    // Out of the dashboard through a public route, then back in by typing the
    // address: no in-app link is involved, so nothing but the cookie can carry
    // the identity.
    await page.goto("/");
    await page.goto("/panel");

    // 3.2 — the assertion the whole case exists for: the second request was not
    // redirected to the access screen.
    expect(new URL(page.url()).pathname).toBe("/panel");

    // Without this a blank panel would pass the address assertion above.
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // No credential was asked for again. A count of zero rather than a wait
    // that has to expire.
    await expect(page.locator('input[type="password"]')).toHaveCount(0);
  });
});

/**
 * CF-01 — 1.4: an empty email is refused like any other failed attempt.
 *
 * `CF-01` of `e2e/acceso.spec.ts` sends a *valid* email with the wrong
 * password, which is the other path — the one that does reach Supabase. This
 * one is refused by `CredentialsSchema` before a client is even built.
 *
 * What this case cannot assert, and it is worth writing down: «without
 * consulting Supabase» is not observable from a browser, since 2.2 requires the
 * two refusals to be indistinguishable. That half is closed by
 * `app/acceso/actions.test.ts` counting `createClient` at zero. Asserted here
 * is what is observable: the refusal, its address, and that nothing typed rides
 * along.
 *
 * The empty email does reach the server: `components/ui/Field.tsx` renders the
 * input with no `required`, and `type="email"` constraint validation only
 * applies to a non-empty value.
 */
test.describe("CF-01 — submitting with the email field left empty", () => {
  test("CF-01 returns to the access screen with the shared message and no session", async ({
    page,
  }) => {
    await page.setViewportSize(WIDE);
    await page.goto(LOGIN);

    // The email field is left untouched on purpose; only the password is typed.
    await page.locator('input[type="password"]').fill(SENTINEL_PASSWORD);
    await page.locator('button[type="submit"]').click();

    // Waited on the marker and not on `**/acceso**`: the form posts to the URL
    // it is already on, so that glob resolves before the redirect ever happens
    // and the case would read the address of the attempt instead of its answer.
    await page.waitForURL(/error=credenciales/);

    // 2.3 — exact equality is what forbids a parameter of more; a «contains»
    // passes by accident.
    expect(new URL(page.url()).pathname).toBe("/acceso");
    expect(new URL(page.url()).search).toBe("?intent=login&error=credenciales");

    // 2.3, restated legibly: nothing typed came back in the address.
    expect(page.url()).not.toContain(SENTINEL_PASSWORD);

    // 2.1 — the message is on screen, and it is the same one someone who
    // mistypes a password sees: 1.4 earns no message of its own. The text is a
    // literal here on purpose; that it is the one declared in content is
    // asserted by `app/acceso/page.test.tsx`, by reference.
    await expect(page.locator(ERROR_NODE)).toBeVisible();
    await expect(page.getByText(ERROR_MESSAGE)).toBeVisible();

    // A refused attempt opens no session.
    const cookies = await page.context().cookies();
    expect(cookies.filter((cookie) => cookie.name.startsWith("sb-"))).toEqual([]);
  });
});

/**
 * CF-02 — 2.5: an `error` typed into the address produces no message.
 *
 * The starting state is an invalid address: someone arrived with a parameter
 * the system never emits. The expected behaviour is to degrade into the clean
 * screen. A screen that believed the address bar would turn the URL into a
 * generator of error messages for third parties.
 *
 * The instance is not needed for the behaviour itself, but the suite requires
 * it through `globalSetup`.
 */
test.describe("CF-02 — an error parameter the system never emits", () => {
  test("CF-02 shows the clean screen for an unknown value and for an empty one", async ({
    page,
  }) => {
    await page.setViewportSize(WIDE);

    /*
     * Both addresses in the same run, as the plan states them: one value the
     * system never produces, and the parameter present but empty. No third
     * sub-case with the parameter repeated — that arrives as an array and is
     * already covered in `app/acceso/page.test.tsx`, where `searchParams` can
     * be built by hand.
     */
    for (const address of ["/acceso?intent=login&error=otra-cosa", "/acceso?intent=login&error="]) {
      await page.goto(address);

      // 2.5 — asserted against the element, not against its text: an
      // unconditional `<p>{error}</p>` would leave an empty node that a text
      // lookup reports as absent while the criterion is broken.
      await expect(page.locator(ERROR_NODE)).toHaveCount(0);

      // The positive anchor. Without it a page that rendered nothing at all
      // would pass the negative assertion with no implementation behind it.
      // Taken by its heading role, not by a literal.
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

      // And the screen is usable, not degraded into nothing.
      await expect(page.locator('input[type="password"]')).toBeVisible();
    }
  });
});
