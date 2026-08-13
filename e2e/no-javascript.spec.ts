import { expect, test } from "@playwright/test";

/**
 * The page with JavaScript blocked.
 *
 * This is the suite that protects the native `<details>` decision. Any
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
  for (const [name, intent] of [
    ["enrolment", "signup"],
    ["login", "login"],
  ] as const) {
    test(`the ${name} control carries intent=${intent}`, async ({ page }) => {
      await page.setViewportSize(WIDE);
      await page.goto("/");

      const control = page.locator(`header a[href*="intent=${intent}"]`).first();
      const href = await control.getAttribute("href");

      // The destination is an absolute address on another host, so the link is
      // checked rather than followed: the access screen is out of scope (6.7).
      expect(href).toMatch(/^https?:\/\//);
      expect(href).toContain(`intent=${intent}`);
      await expect(control).toBeVisible();
    });
  }
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
