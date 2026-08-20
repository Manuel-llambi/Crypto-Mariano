import { expect, test } from "@playwright/test";

import { SIGNUP_ADDRESS, freshPassword, readLatestCode, respectSendFrequency } from "./mailbox";
import { SEEDED_EMAIL, SEEDED_PASSWORD } from "./seeded-account";

/**
 * The page with JavaScript blocked.
 *
 * This is the suite that protects the native `<details>` decision, and since
 * the login spec of 2026-08-17 also the one that proves signing in works with
 * no script at all. Any
 * regression toward a React-state disclosure keeps passing every jsdom test and
 * fails here — which is the whole reason the design chose the native element
 * over a component that looks identical in the markup.
 */

// A context with JavaScript disabled, the way a restricted network delivers it.
test.use({ javaScriptEnabled: false });

const NARROW = { width: 375, height: 720 };
const WIDE = { width: 1280, height: 800 };

test("no script runs at all", async ({ page }) => {
  await page.setViewportSize(WIDE);
  await page.goto("/");

  // The page renders from the server, so the content is there regardless.
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator("#programa")).toBeVisible();
});

// 8.1 — the disclosures still open and close.
test.describe("disclosures work (8.1)", () => {
  test("opens and closes a question", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto("/");

    const first = page.locator("#faq details").first();
    await expect(first).not.toHaveAttribute("open", /.*/);

    await first.locator("summary").click();
    await expect(first).toHaveAttribute("open", /.*/);

    await first.locator("summary").click();
    await expect(first).not.toHaveAttribute("open", /.*/);
  });

  test("keeps two questions open at once", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto("/");

    const items = page.locator("#faq details");
    await items.nth(0).locator("summary").click();
    await items.nth(1).locator("summary").click();

    await expect(items.nth(0)).toHaveAttribute("open", /.*/);
    await expect(items.nth(1)).toHaveAttribute("open", /.*/);
  });

  test("reveals the answer text when opened", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto("/");

    const first = page.locator("#faq details").first();
    const answer = first.locator("div").last();

    await expect(answer).toBeHidden();
    await first.locator("summary").click();
    await expect(answer).toBeVisible();
  });
});

// 8.2 — anchor links still reach their section.
test.describe("anchor navigation works (8.2)", () => {
  test("lands on the section and updates the address", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto("/");

    await page
      .getByRole("navigation", { name: "Secciones del sitio", exact: true })
      .locator('a[href="#programa"]')
      .click();

    expect(page.url()).toContain("#programa");

    const section = await page.locator("#programa").boundingBox();
    const header = await page.evaluate(
      () => document.querySelector("header")!.getBoundingClientRect().bottom,
    );
    expect(section!.y).toBeGreaterThanOrEqual(header - 1);
  });
});

// 8.3 — the access controls still navigate, with their intent.
test.describe("access controls work (8.3)", () => {
  /**
   * The enrolment control reaches step 1 with no scripting.
   *
   * It used to walk all three screens by anchor, which is what the mock-up did.
   * The screens post now, so the walk moved to the sign-up cases at the bottom
   * of this file, where it is done for real against the instance.
   */
  test("the enrolment control reaches the sign-up screen with no scripting", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto("/");

    await page.locator('header a[href*="intent=signup"]').first().click();

    await expect(page).toHaveURL(/\/registro\?intent=signup$/);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  /**
   * Signing in is a route of this app, so it is followed for real: with no
   * JavaScript the anchor still has to land on the access screen.
   */
  test("the login control reaches the access screen with no scripting", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto("/");

    await page.locator('header a[href*="intent=login"]').first().click();

    await expect(page).toHaveURL(/\/acceso\?intent=login$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });
});

// 8.4 — the narrow-screen panel still opens.
test.describe("the navigation panel opens (8.4)", () => {
  test("opens on click and shows its links", async ({ page }) => {
    await page.setViewportSize(NARROW);
    await page.goto("/");

    const panel = page.locator("header details");
    await expect(panel).not.toHaveAttribute("open", /.*/);

    await panel.locator("summary").click();

    await expect(panel).toHaveAttribute("open", /.*/);
    await expect(panel.getByRole("link", { name: "Programa" })).toBeVisible();
  });

  test("its links still navigate", async ({ page }) => {
    await page.setViewportSize(NARROW);
    await page.goto("/");

    await page.locator("header details summary").click();
    await page.locator('header details a[href="#faq"]').click();

    expect(page.url()).toContain("#faq");
  });
});

/**
 * 8.5 — the whole degradation, stated as an assertion.
 *
 * With the effect of NavPanel unable to run, the panel stays open after a link
 * is followed. That is the one accepted difference, and pinning it here is what
 * stops it from quietly growing into two.
 */
test.describe("the degradation is exactly one thing (8.5)", () => {
  test("the panel stays open after following a link", async ({ page }) => {
    await page.setViewportSize(NARROW);
    await page.goto("/");

    const panel = page.locator("header details");
    await panel.locator("summary").click();
    await page.locator('header details a[href="#faq"]').click();

    await expect(panel).toHaveAttribute("open", /.*/);
  });

  test("everything else behaves as it does with scripting", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto("/");

    // The six sections, the three enrolment controls and the disclosures: the
    // same facts the scripted suite asserts, restated with nothing running.
    for (const id of ["audiencia", "metodologia", "actualizaciones", "programa", "confianza", "faq"]) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
    await expect(page.locator('a[href*="intent=signup"]')).toHaveCount(3);
    await expect(page.locator("#faq details")).toHaveCount(3);
  });
});

/**
 * Signing in with the script blocked — spec 2026-08-17-login-supabase.
 *
 * These two are the only cases in the whole plan that prove the Server Action
 * is progressive enhancement in fact and not just in theory. The numbers here
 * are 5.1 and 5.2 of that spec, not the 8.x of the landing that the rest of
 * this file uses.
 *
 * Both enter through the address the site actually links to. With no script the
 * browser posts natively against the URL in flight, so entering by the right
 * one is what makes the refusal land on exactly `?intent=login&error=credenciales`.
 *
 * The instance has to be up (`supabase start`) and seeded (`supabase db reset`).
 */
test.describe("signing in with no scripting (login spec)", () => {
  const LOGIN = "/acceso?intent=login";
  const ERROR_MESSAGE = "No pudimos verificar tus credenciales. Revisa el correo y la contraseña.";

  test("5.1 — completes a sign-in and reaches the dashboard", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto(LOGIN);

    await page.locator('input[type="email"]').fill(SEEDED_EMAIL);
    await page.locator('input[type="password"]').fill(SEEDED_PASSWORD);
    await page.locator('button[type="submit"]').click();

    await page.waitForURL("**/panel**");

    expect(new URL(page.url()).pathname).toBe("/panel");
    expect(new URL(page.url()).search).toBe("");

    // Arriving is not the same as the panel being there: it renders entirely on
    // the server, so with no script it has to look the same. A URL-only check
    // would let a blank dashboard through.
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("5.2 — shows the message of a refused attempt", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto(LOGIN);

    await page.locator('input[type="email"]').fill(SEEDED_EMAIL);
    await page.locator('input[type="password"]').fill("centinela-contrasena-equivocada");
    await page.locator('button[type="submit"]').click();

    await page.waitForURL("**/acceso**");

    expect(new URL(page.url()).pathname).toBe("/acceso");
    expect(new URL(page.url()).search).toBe("?intent=login&error=credenciales");

    // The text is a literal here, as in CF-01. That it is the one declared in
    // content is asserted by `app/acceso/page.test.tsx`, by reference.
    await expect(page.getByText(ERROR_MESSAGE)).toBeVisible();
  });
});

/**
 * Signing up with the script blocked — spec 2026-08-19-registro-supabase.
 *
 * The oldest promise of this project, extended to the newest flow: the whole
 * sign-up completes with nothing running, from the first screen to the
 * dashboard. It lives here and not in `e2e/registro.spec.ts` because the
 * scriptless context is declared per file.
 *
 * These two are the only cases in the plan that prove the three Server Actions
 * are progressive enhancement in fact and not just in theory. If anyone ever
 * turns one of those screens into a client component, the jsdom suites see it
 * in the source and this sees it in the browser.
 *
 * The numbers are 6.1 and 6.2 of that spec, not the 8.x of the landing that the
 * rest of this file uses. The instance and its mailbox have to be up.
 */
test.describe("signing up with no scripting (sign-up spec)", () => {
  // 6.1 — every step of the flow, with nothing running.
  test("6.1 — completes the whole sign-up and reaches the dashboard", async ({ page }) => {
    await page.setViewportSize(WIDE);

    // Two sends to the same address inside a second come back 429, which the
    // action reports as an ordinary refusal. Waiting keeps a rate limit from
    // being read as a broken flow.
    await respectSendFrequency();

    await page.goto("/registro?intent=signup");
    await page.locator('input[type="email"]').fill(SIGNUP_ADDRESS);
    await page.locator('button[type="submit"]').click();

    await page.waitForURL("**/registro/codigo");

    // Read from the mailbox mid-run, exactly as the scripted suite does.
    const code = await readLatestCode(SIGNUP_ADDRESS);

    await page.locator('input[inputmode="numeric"]').fill(code);
    await page.locator('button[type="submit"]').click();

    await page.waitForURL("**/registro/crear-cuenta");

    // The echo of the address, which is what tells the visitor whose account
    // this is. It carries no `name`, so the browser leaves it out of the post.
    await expect(page.locator('input[type="email"]')).toHaveValue(SIGNUP_ADDRESS);

    /*
     * A password this account has never had: Supabase refuses one identical to
     * the current password, so a constant would pass once and fail on every
     * later run — and on the scripted suite running the same flow minutes
     * earlier.
     */
    const password = freshPassword("nojs");

    await page.locator('input[type="password"]').fill(password);
    await page.locator('button[type="submit"]').click();

    await page.waitForURL("**/panel**");

    expect(new URL(page.url()).pathname).toBe("/panel");
    expect(page.url()).not.toContain(password);

    // Arriving is not the same as the dashboard being there: it renders on the
    // server, so with no script it has to look the same.
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  /**
   * 6.2 — a refusal says so, with nothing running.
   *
   * This is what proves the message travels in the HTML the server sent rather
   * than being painted afterwards by something. The address never reaches
   * Supabase, so it costs no e-mail either.
   *
   * `a@b` and not `no-es-una-direccion`, and the difference is the whole reason
   * this case works: the field is `type="email"`, so the browser's own
   * validation refuses to submit something with no `@` at all and the request
   * is never made — there would be nothing for the server to reject. `a@b`
   * satisfies the browser, which asks only for `something@something`, and is
   * refused by `z.email()`, which wants a real domain. So the round trip
   * happens and the message comes back from the server.
   */
  test("6.2 — shows the message of a refused step with the script blocked", async ({ page }) => {
    await page.setViewportSize(WIDE);

    await page.goto("/registro?intent=signup");
    await page.locator('input[type="email"]').fill("a@b");
    await page.locator('button[type="submit"]').click();

    // On the marker and not on the path: the page is already at `/registro`
    // when the form is submitted, so a path pattern matches before the round
    // trip has happened.
    await page.waitForURL(/error=correo/);

    expect(new URL(page.url()).pathname).toBe("/registro");
    expect(new URL(page.url()).search).toBe("?intent=signup&error=correo");

    // The text is a literal here, as in the other scriptless cases. That it is
    // the one declared in content is asserted by reference in the jsdom suite.
    await expect(
      page.getByText(
        "No pudimos enviar el código. Revisa tu email institucional e inténtalo de nuevo.",
      ),
    ).toBeVisible();
  });
});
