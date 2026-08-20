import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { SIGNUP_ADDRESS, freshPassword, readLatestCode, respectSendFrequency } from "./mailbox";

/**
 * Signing up, in a real browser, against the local Supabase instance.
 *
 * This file used to describe three mock-ups: it walked the steps by anchor and
 * asserted that creating an account «leads nowhere». None of that is true any
 * more, so all of it was replaced (9.5). What survived is the second half —
 * overflow, accessibility, target size and `noindex` — which never described the
 * mock-up and still holds.
 *
 * The instance has to be up (`supabase start`) and its mailbox with it. The run
 * does **not** prepare the database (9.6): the address is fixed, so the second
 * run finds the account the first one created and, by 3.4, sets its password
 * again.
 *
 * Two of Supabase's limits are worth knowing before blaming the code. Sending
 * twice to the same address inside a second is refused (`max_frequency = "1s"`),
 * which is why `requestCode` waits; and 30 sign-ins per five minutes is refused
 * disguised as «invalid credentials», which is what an intermittent failure on
 * a third consecutive run usually is.
 */

const WIDE = { width: 1280, height: 900 };
const NARROW = { width: 375, height: 720 };
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const SIGNUP = "/registro?intent=signup";

/**
 * Step 1, for real: types the address and comes back with the code.
 *
 * The code is read from the mailbox during the run (9.3) and is nowhere in this
 * file or in any configuration — which is what makes these cases exercise the
 * mail Supabase actually sends rather than a number agreed on in advance.
 */
async function requestCode(page: Page): Promise<string> {
  // Two sends to the same address inside a second come back 429, and the action
  // turns any refusal into `?error=correo` — a rate limit indistinguishable, on
  // screen, from a malformed address. Waiting is what keeps that from being
  // mistaken for a defect.
  await respectSendFrequency();

  await page.goto(SIGNUP);
  await page.locator('input[type="email"]').fill(SIGNUP_ADDRESS);
  await page.locator('button[type="submit"]').click();

  await page.waitForURL("**/registro/codigo");

  return readLatestCode(SIGNUP_ADDRESS);
}

/** Step 2: types a code and submits it. */
async function submitCode(page: Page, code: string): Promise<void> {
  await page.locator('input[inputmode="numeric"]').fill(code);
  await page.locator('button[type="submit"]').click();
}

/**
 * CP-01 — the happy path, all the way through and back in again.
 *
 * The sign-in at the end is what closes 5.1, and 5.2 with it: an address that
 * had never been confirmed could not sign in at all, so a successful one proves
 * no extra confirmation step was needed.
 */
test("CP-01 — signs up end to end and then signs in with what it created", async ({
  page,
  context,
}) => {
  await page.setViewportSize(WIDE);

  const code = await requestCode(page);
  await submitCode(page, code);

  await page.waitForURL("**/registro/crear-cuenta");

  /*
   * A password this account has never had.
   *
   * Supabase refuses one identical to the current password (422
   * `same_password`), so a constant here would work on the first run and be
   * refused on every later one — and 9.6 asks for a suite that repeats without
   * preparing the database. 3.4 is what makes varying it free: step 3 replaces
   * whatever was there.
   */
  const password = freshPassword("cp01");

  // 3.5 — the address is shown, and it is an echo: no `name`, so it is not part
  // of what the browser sends.
  const echo = page.locator('input[type="email"]');
  await expect(echo).toHaveValue(SIGNUP_ADDRESS);
  await expect(echo).toHaveAttribute("readonly", /.*/);
  expect(await echo.getAttribute("name")).toBeNull();

  await page.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();

  await page.waitForURL("**/panel**");

  expect(new URL(page.url()).pathname).toBe("/panel");
  // 3.6 — the password travelled in the body and reached no address bar.
  expect(page.url()).not.toContain(password);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  /*
   * 5.1 — the credentials are real ones, so they work from a cold start.
   *
   * Clearing the cookies is what makes this a sign-in rather than a page that
   * was already open: without it the dashboard would let the existing session
   * through and prove nothing about the password just set.
   */
  await context.clearCookies();

  await page.goto("/acceso?intent=login");
  await page.locator('input[type="email"]').fill(SIGNUP_ADDRESS);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();

  await page.waitForURL("**/panel**");

  expect(new URL(page.url()).pathname).toBe("/panel");
  expect(new URL(page.url()).search).toBe("");
});

/**
 * CF-01 — a code that is not the right one.
 *
 * The destination is asserted whole rather than by pattern: 2.5 is about what
 * is *not* in it, and «contains /registro/codigo» would pass with the code and
 * the address appended.
 */
test("CF-01 — a wrong code is refused without leaking anything", async ({ page }) => {
  await page.setViewportSize(WIDE);

  await requestCode(page);
  await submitCode(page, "000000");

  // Waiting on the marker and not on the path: the page is already at
  // `/registro/codigo` when the form is submitted, so a path glob matches
  // straight away and the assertions below would run against the URL from
  // before the round trip.
  await page.waitForURL(/error=codigo/);

  expect(new URL(page.url()).pathname).toBe("/registro/codigo");
  expect(new URL(page.url()).search).toBe("?error=codigo");
  expect(page.url()).not.toContain(SIGNUP_ADDRESS);
  expect(page.url()).not.toContain("000000");

  // The message is in the HTML the server emitted (6.2). The text being the one
  // declared in content is asserted by reference in the jsdom suite.
  await expect(
    page.getByText("El código no es válido o ya caducó. Revísalo o pide uno nuevo."),
  ).toBeVisible();
});

/**
 * CF-02 — a step asked for without its precondition.
 *
 * Both halves matter and they land differently on purpose: step 3 has nothing
 * to say to a visitor with no session (4.4), while step 2 sends them back with
 * a message telling them to ask for a new code (4.3).
 */
test.describe("CF-02 — a step without its precondition", () => {
  test("the account step with no session goes back to step 1 (4.4)", async ({ page }) => {
    await page.setViewportSize(WIDE);

    await page.goto("/registro/crear-cuenta");

    expect(new URL(page.url()).pathname).toBe("/registro");
    // No password field: the guard ran before any markup was emitted.
    await expect(page.locator('input[type="password"]')).toHaveCount(0);
  });

  test("the code step with no pending address says to ask again (4.3)", async ({ page }) => {
    await page.setViewportSize(WIDE);

    await page.goto("/registro/codigo");

    expect(new URL(page.url()).pathname).toBe("/registro");
    expect(new URL(page.url()).search).toBe("?intent=signup&error=vencido");

    await expect(
      page.getByText("Tu solicitud caducó. Pide un código nuevo con tu email institucional."),
    ).toBeVisible();
  });
});

/**
 * The bar the landing and `/acceso` are held to, applied to the three screens.
 *
 * These four never described the mock-up, so they were kept. What changed is
 * how the screens are reached: two of them now redirect without their
 * precondition, so walking the flow first is the only way to be measuring the
 * screen named rather than `/registro` three times over.
 */
const SCREENS = [
  {
    name: "e-mail",
    path: SIGNUP,
    async reach(page: Page) {
      await page.goto(SIGNUP);
    },
  },
  {
    name: "código",
    path: "/registro/codigo",
    async reach(page: Page) {
      await requestCode(page);
    },
  },
  {
    name: "crear cuenta",
    path: "/registro/crear-cuenta",
    async reach(page: Page) {
      const code = await requestCode(page);
      await submitCode(page, code);
      await page.waitForURL("**/registro/crear-cuenta");
    },
  },
];

for (const screen of SCREENS) {
  test.describe(`the ${screen.name} screen`, () => {
    /*
     * The precondition, then the assertion — and a check that the redirect did
     * not happen anyway. Without that check a broken `reach` would leave every
     * case below silently measuring step 1.
     */
    async function arrive(page: Page) {
      await screen.reach(page);
      expect(new URL(page.url()).pathname).toBe(screen.path.split("?")[0]);
    }

    test("fits a narrow screen without horizontal scrolling (7.8)", async ({ page }) => {
      await page.setViewportSize(NARROW);
      await arrive(page);

      const overflow = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
      }));

      expect(overflow.scroll).toBeLessThanOrEqual(overflow.client);
    });

    test("reports no accessibility violation at either width", async ({ page }) => {
      // Reached once: the session and the pending-address cookie both live in
      // the context, so the second viewport only needs a reload.
      await page.setViewportSize(WIDE);
      await arrive(page);

      for (const size of [WIDE, NARROW]) {
        await page.setViewportSize(size);
        await page.reload();

        const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();

        expect(violations.map((violation) => ({ id: violation.id, help: violation.help }))).toEqual(
          [],
        );
      }
    });

    test("gives every control at least 44 by 44 pixels (7.6)", async ({ page }) => {
      await page.setViewportSize(NARROW);
      await arrive(page);

      /*
       * Hidden inputs are excluded, and they only appeared with the forms.
       *
       * React puts a hidden field carrying the action identifier inside every
       * `<form action={…}>`. It is not a target — nobody can point at it — so a
       * minimum size means nothing for it, and WCAG 2.5.8 is about targets.
       */
      const small = await page.evaluate(() =>
        [
          ...document.querySelectorAll<HTMLElement>(
            'a[href], button, input:not([type="hidden"])',
          ),
        ]
          .map((element) => {
            const rect = element.getBoundingClientRect();
            return { tag: element.tagName, w: rect.width, h: rect.height };
          })
          .filter((box) => box.w < 43.5 || box.h < 43.5),
      );

      expect(small).toEqual([]);
    });

    test("declares noindex", async ({ page }) => {
      await page.setViewportSize(WIDE);
      await arrive(page);

      /*
       * Every declaration, not «the» declaration.
       *
       * A screen reached by a redirect after a form post ends up with the tag
       * in the head *and* a copy in the body, which is how Next carries
       * metadata across that navigation. Asking for one of them is a strict
       * mode violation; asking for the first would let a second one disagree.
       */
      const declared = await page.locator('meta[name="robots"]').evaluateAll((tags) =>
        tags.map((tag) => tag.getAttribute("content") ?? ""),
      );

      expect(declared.length).toBeGreaterThan(0);
      for (const content of declared) {
        expect(content).toContain("noindex");
      }
    });
  });
}
