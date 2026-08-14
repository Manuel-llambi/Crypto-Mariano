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
 * 4.5 on the syllabus itself.
 *
 * This spec used to pin the opposite: that no module offered a control, because
 * none declared a summary. It was written to fail the day one did, and that day
 * came — so it now asserts what the criterion actually says.
 */
test("opening two modules leaves both open (4.5)", async ({ page }) => {
  await page.goto("/");

  const modules = page.locator("#programa details");
  await expect(modules).toHaveCount(2);

  const first = modules.nth(0);
  const second = modules.nth(1);

  await expect(first).not.toHaveAttribute("open", /.*/);

  await first.locator("summary").click();
  await second.locator("summary").click();

  await expect(first).toHaveAttribute("open", /.*/);
  await expect(second).toHaveAttribute("open", /.*/);
});

/**
 * 4.2 and 4.4 — the branches that still hold.
 *
 * Coming-soon modules never offer a control, however many available ones become
 * disclosures around them.
 */
test("a coming-soon module still offers no control (4.2)", async ({ page }) => {
  await page.goto("/");

  const announced = page.locator("#programa article");
  await expect(announced).toHaveCount(5);
  await expect(announced.locator("details")).toHaveCount(0);
  await expect(announced.first().getByText("Próximamente")).toBeVisible();
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
