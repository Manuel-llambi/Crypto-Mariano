import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { SEEDED_EMAIL, SEEDED_PASSWORD } from "./seeded-account";

/**
 * The access screen, in a real browser, against the local Supabase instance.
 *
 * It authenticates for real: the credentials are checked, a session is opened
 * in cookies, and the dashboard is guarded. The instance has to be up
 * (`supabase start`) and seeded (`supabase db reset`).
 *
 * The numbers in the accessibility and layout blocks belong to the landing spec
 * `2026-08-12-landing-publica`; the CP/CF cases belong to
 * `2026-08-17-login-supabase`.
 */

const WIDE = { width: 1280, height: 900 };
const NARROW = { width: 375, height: 720 };
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

/** The address the site actually links to, not a bare `/acceso`. */
const LOGIN = "/acceso?intent=login";
const LOGIN_ERROR = "/acceso?intent=login&error=credenciales";

/** A password that is not the seeded one, distinctive enough to search for. */
const WRONG_PASSWORD = "centinela-contrasena-equivocada";

const ERROR_MESSAGE = "No pudimos verificar tus credenciales. Revisa el correo y la contraseña.";

test.describe("the screen renders", () => {
  test("shows the card with both fields and the control", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto(LOGIN);

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("fits a narrow screen without horizontal scrolling (7.8)", async ({ page }) => {
    await page.setViewportSize(NARROW);
    await page.goto(LOGIN);

    const overflow = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));

    expect(overflow.scroll).toBeLessThanOrEqual(overflow.client);
  });
});

/**
 * CP-01 — the seeded credentials open a session and reach the dashboard.
 *
 * Entered through `LOGIN`, the address the site links to, so the run exercises
 * what a visitor actually clicks.
 */
test.describe("CP-01 — signing in with the seeded account", () => {
  test("CP-01 lands on a dashboard that rendered, with a session in cookies", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto(LOGIN);

    await page.locator('input[type="email"]').fill(SEEDED_EMAIL);
    await page.locator('input[type="password"]').fill(SEEDED_PASSWORD);
    await page.locator('button[type="submit"]').click();

    await page.waitForURL("**/panel**");

    // 1.1 — the bare address. Exact equality on `search` is what forbids any
    // extra parameter; a `not.toContain` passes on an empty string too.
    expect(new URL(page.url()).pathname).toBe("/panel");
    expect(new URL(page.url()).search).toBe("");

    // 3.2 — the request that follows the sign-in is served without asking again.
    // Asserting the heading, not only the URL: a guard that always redirected
    // would leave the address at `/acceso`, and a blank panel would slip past a
    // URL-only check.
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // 1.1 and 3.1 — the other half of the criterion: a session was opened, and
    // it persists in the browser.
    const cookies = await page.context().cookies();
    const session = cookies.filter((cookie) => cookie.name.startsWith("sb-"));
    expect(session.length).toBeGreaterThan(0);

    // 3.4 — and page scripts cannot read any of it.
    expect(session.every((cookie) => cookie.httpOnly)).toBe(true);
  });
});

/**
 * CF-01 — credentials the instance refuses.
 *
 * This is the only place in the project where 1.5 can be closed: in jsdom
 * `window.location.search` stays empty whether or not there is an
 * implementation, so no unit test can tell the two apart.
 */
test.describe("CF-01 — signing in with a password that is not the seeded one", () => {
  test("CF-01 returns to the access screen with the message, and no session", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto(LOGIN);

    await page.locator('input[type="email"]').fill(SEEDED_EMAIL);
    await page.locator('input[type="password"]').fill(WRONG_PASSWORD);
    await page.locator('button[type="submit"]').click();

    // Waited on the marker and not on `**/acceso**`: the form posts to the URL
    // it is already on, so that glob matches before the redirect ever happens
    // and the case would read the address of the attempt instead of its answer.
    await page.waitForURL(/error=credenciales/);

    // 1.2 and 1.5 — exact equality is what carries the criterion; the two
    // `not.toContain` below are the legible restatement of it.
    expect(new URL(page.url()).pathname).toBe("/acceso");
    expect(new URL(page.url()).search).toBe("?intent=login&error=credenciales");
    expect(page.url()).not.toContain(WRONG_PASSWORD);
    expect(page.url()).not.toContain(SEEDED_EMAIL);

    // 2.1 — the message is on screen. The text is a literal here on purpose;
    // that it is the one declared in content is asserted by
    // `app/acceso/page.test.tsx`, against the content by reference.
    await expect(page.getByText(ERROR_MESSAGE)).toBeVisible();

    // 1.2 — refused means no session at all.
    const cookies = await page.context().cookies();
    expect(cookies.filter((cookie) => cookie.name.startsWith("sb-"))).toEqual([]);
  });

  /*
   * Enter inside a field, inverted.
   *
   * Under the mock-up this asserted that Enter did *not* navigate. Under the
   * real design it must: that is HTML's implicit submission, and it depends on
   * there being a `<button type="submit">`. Same thing defended — Enter doing
   * nothing improper — with the expected outcome the other way round, and it
   * extends 1.5 to the keyboard path. No ID: those belong to the three planned
   * cases.
   */
  test("submits on Enter inside the password field, still carrying nothing", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto(LOGIN);

    await page.locator('input[type="email"]').fill(SEEDED_EMAIL);
    await page.locator('input[type="password"]').fill(WRONG_PASSWORD);
    await page.locator('input[type="password"]').press("Enter");

    // Waited on the marker and not on `**/acceso**`: the form posts to the URL
    // it is already on, so that glob matches before the redirect ever happens
    // and the case would read the address of the attempt instead of its answer.
    await page.waitForURL(/error=credenciales/);

    expect(new URL(page.url()).pathname).toBe("/acceso");
    expect(new URL(page.url()).search).toBe("?intent=login&error=credenciales");
    expect(page.url()).not.toContain(WRONG_PASSWORD);
  });
});

/**
 * CF-02 — the dashboard is not open to whoever knows the address.
 *
 * Playwright gives each test a fresh context with no cookies, which is exactly
 * the precondition; the case does not depend on running after CP-01.
 */
test.describe("CF-02 — asking for the dashboard with no session", () => {
  test("CF-02 is redirected to the access screen", async ({ page }) => {
    await page.goto("/panel");

    // The glob is safe here: the request starts at `/panel`, so it cannot match
    // before the guard has sent the visitor away.
    await page.waitForURL("**/acceso**");

    // 4.1
    expect(new URL(page.url()).pathname).toBe("/acceso");
    expect(new URL(page.url()).search).toBe("?intent=login");
  });
});

// 9.5, 9.6 — the same bar the landing is held to, now including the error state:
// the message is a new visual node and its colour is worth seeing in situ.
test.describe("accessibility", () => {
  for (const address of [LOGIN, LOGIN_ERROR]) {
    for (const viewport of [
      { name: "1280", size: WIDE },
      { name: "375", size: NARROW },
    ]) {
      test(`reports no violation at ${viewport.name}px on ${address}`, async ({ page }) => {
        await page.setViewportSize(viewport.size);
        await page.goto(address);

        const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();

        expect(violations.map((violation) => ({ id: violation.id, help: violation.help }))).toEqual(
          [],
        );
      });
    }
  }

  test("reaches every control by keyboard, with a visible ring", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto(LOGIN);

    const withoutRing: string[] = [];

    for (let index = 0; index < 4; index += 1) {
      await page.keyboard.press("Tab");

      const state = await page.evaluate(() => {
        const element = document.activeElement as HTMLElement | null;
        if (element === null || element === document.body) {
          return null;
        }
        const style = getComputedStyle(element);
        return {
          tag: element.tagName,
          width: Number.parseFloat(style.outlineWidth),
          visible: element.matches(":focus-visible"),
        };
      });

      if (state === null) {
        break;
      }
      if (!state.visible || state.width < 2) {
        withoutRing.push(state.tag);
      }
    }

    expect(withoutRing).toEqual([]);
  });

  test("gives every control at least 44 by 44 pixels (7.6)", async ({ page }) => {
    await page.setViewportSize(NARROW);
    await page.goto(LOGIN);

    /*
     * Hidden inputs are excluded, and only those.
     *
     * A form posting to a Server Action carries React's own
     * `<input type="hidden" name="$ACTION_ID_…">`, which has no box and is not
     * a target anyone can hit. Narrowing by `type="hidden"` rather than by size
     * is what keeps a genuinely undersized control from slipping through.
     */
    const small = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>("a[href], button, input")]
        .filter((element) => !element.matches('input[type="hidden"]'))
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return { tag: element.tagName, w: rect.width, h: rect.height };
        })
        .filter((box) => box.w < 43.5 || box.h < 43.5),
    );

    expect(small).toEqual([]);
  });
});

test.describe("the screen stays out of search results", () => {
  test("declares noindex", async ({ page }) => {
    await page.goto(LOGIN);

    const robots = await page.locator('meta[name="robots"]').getAttribute("content");
    expect(robots).toContain("noindex");
  });
});
