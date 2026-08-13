import { expect, test } from "@playwright/test";

/**
 * The one smoke test of the project.
 *
 * It covers what only a real window can answer: that the page actually loads
 * from the production build, that native `<details>` behaves as the design
 * assumes, and that the enrolment link resolves to a real destination. The
 * detailed behaviour of breakpoints, focus and JavaScript-off lives in T23-T27.
 */

test("the page loads and shows its sections (1.1)", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("header")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  for (const id of ["audiencia", "metodologia", "actualizaciones", "programa", "confianza", "faq"]) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }

  await expect(page.locator("footer")).toBeVisible();
});

/**
 * 4.5 and 5.2 — the criterion jsdom could not answer: opening one disclosure
 * must leave the others alone. It holds because no `<details>` carries a
 * `name`, and only a real browser runs that behaviour.
 *
 * The section under test is the FAQ, not the syllabus. With the current
 * content the syllabus renders **no disclosure at all**: `EXP-00` and `EXP-01`
 * are available with no summary written yet, so 4.4 says they render without a
 * control, and every other module is coming-soon. The mechanism is the same
 * component in both places; see the test below, which pins the syllabus state.
 */
test("opening two disclosures leaves both open (4.5, 5.2)", async ({ page }) => {
  await page.goto("/");

  const disclosures = page.locator("#faq details");
  await expect(disclosures).toHaveCount(3);

  const first = disclosures.nth(0);
  const second = disclosures.nth(1);

  await expect(first).not.toHaveAttribute("open", /.*/);
  await expect(second).not.toHaveAttribute("open", /.*/);

  await first.locator("summary").click();
  await expect(first).toHaveAttribute("open", /.*/);

  await second.locator("summary").click();

  await expect(second).toHaveAttribute("open", /.*/);
  await expect(first).toHaveAttribute("open", /.*/);
});

/**
 * 4.4 — what the real syllabus exercises today.
 *
 * Every module either has no summary written yet or is coming-soon, so none of
 * them offers a disclosure control. This is the designed behaviour, not a bug,
 * and the assertion is written so that it starts failing the day a module gets
 * a summary — which is the day 4.5 becomes verifiable on the syllabus itself.
 */
test("no module offers a control while none declares a summary (4.4)", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("#programa")).toBeVisible();
  await expect(page.locator("#programa details")).toHaveCount(0);
});

test("the enrolment control points at the access screen with intent=signup (6.1)", async ({
  page,
}) => {
  await page.goto("/");

  const controls = page.locator('a[href*="intent=signup"]');
  await expect(controls).toHaveCount(3);

  const href = await controls.first().getAttribute("href");
  expect(href).toContain("intent=signup");
  expect(href).toMatch(/^https?:\/\//);
});

// 10.4 — the status code, which jsdom could not observe in T21.
test("a route that does not exist answers 404 (10.4)", async ({ page }) => {
  const response = await page.goto("/una-ruta-que-no-existe");

  expect(response?.status()).toBe(404);
  await expect(page.locator("header")).toBeVisible();
  await expect(page.locator("footer")).toBeVisible();
  await expect(page.getByRole("link", { name: "Volver al inicio" })).toBeVisible();
});
