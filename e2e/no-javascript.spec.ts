import { expect, test } from "@playwright/test";

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
   * Signing up is a route of this app now, so the link is followed for real and
   * the whole flow is walked with scripting off: three screens, two of them
   * reached by nothing but an anchor.
   */
  test("the enrolment control walks the sign-up flow with no scripting", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto("/");

    await page.locator('header a[href*="intent=signup"]').first().click();
    await expect(page).toHaveURL(/\/registro\?intent=signup$/);
    await expect(page.locator('input[type="email"]')).toBeVisible();

    await page.getByRole("link", { name: "Enviar código" }).click();
    await expect(page).toHaveURL(/\/registro\/codigo$/);
    await expect(page.locator('input[inputmode="numeric"]')).toBeVisible();

    await page.getByRole("link", { name: "Verificar" }).click();
    await expect(page).toHaveURL(/\/registro\/crear-cuenta$/);
    await expect(page.locator('input[type="password"]')).toBeVisible();
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
