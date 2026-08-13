import { expect, test, type Page } from "@playwright/test";

/**
 * Layout behaviour at real widths.
 *
 * Everything here is measured on the rendered geometry, never on class names or
 * media-query text: what matters is where the boxes end up, and a stylesheet can
 * carry the right rule and still lay out wrong.
 */

const HEIGHT = 900;

async function at(page: Page, width: number) {
  await page.setViewportSize({ width, height: HEIGHT });
  await page.goto("/");
}

/** Number of distinct column positions among a set of elements. */
async function columnCount(page: Page, selector: string): Promise<number> {
  return page.evaluate((sel) => {
    const xs = [...document.querySelectorAll(sel)].map((el) =>
      Math.round(el.getBoundingClientRect().x),
    );
    return new Set(xs).size;
  }, selector);
}

// 7.8 — the one failure a visitor notices immediately.
test.describe("no horizontal scrolling (7.8)", () => {
  for (const width of [320, 640, 768, 1024, 1440]) {
    test(`fits the viewport at ${width}px`, async ({ page }) => {
      await at(page, width);

      const overflow = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
      }));

      expect(overflow.scroll).toBeLessThanOrEqual(overflow.client);
    });
  }
});

// 7.4 — below 768 the hero stacks, copy first.
test.describe("hero stacking (7.4)", () => {
  test("puts the copy above the visual panel at 375px", async ({ page }) => {
    await at(page, 375);

    const copy = await page.locator("main section").first().locator("h1").boundingBox();
    const panel = await page.locator('main [role="img"]').boundingBox();

    expect(copy!.y + copy!.height).toBeLessThanOrEqual(panel!.y);
  });

  test("puts the call to action above the visual panel too at 375px", async ({ page }) => {
    await at(page, 375);

    const cta = await page.locator("main a[href*='intent=signup']").first().boundingBox();
    const panel = await page.locator('main [role="img"]').boundingBox();

    expect(cta!.y + cta!.height).toBeLessThanOrEqual(panel!.y);
  });

  test("puts them side by side at 1024px", async ({ page }) => {
    await at(page, 1024);

    const copy = await page.locator("main section").first().locator("h1").boundingBox();
    const panel = await page.locator('main [role="img"]').boundingBox();

    expect(panel!.x).toBeGreaterThanOrEqual(copy!.x + copy!.width - 1);
  });
});

// 7.5 — the audience grid narrows in two steps.
test.describe("audience grid (7.5)", () => {
  test("shows one column below 768px", async ({ page }) => {
    await at(page, 375);

    expect(await columnCount(page, "#audiencia article")).toBe(1);
  });

  test("shows two columns between 768px and 1024px", async ({ page }) => {
    await at(page, 800);

    expect(await columnCount(page, "#audiencia article")).toBe(2);
  });

  test("shows the four profiles in a row at 1280px", async ({ page }) => {
    await at(page, 1280);

    expect(await columnCount(page, "#audiencia article")).toBe(4);
  });
});

// 7.7 — the headline scales continuously; no jump at a breakpoint.
test.describe("hero headline scaling (7.7)", () => {
  async function headlineSize(page: Page, width: number): Promise<number> {
    await at(page, width);
    return page.evaluate(() =>
      Number.parseFloat(getComputedStyle(document.querySelector("h1")!).fontSize),
    );
  }

  test("grows with the viewport", async ({ page }) => {
    const narrow = await headlineSize(page, 375);
    const wide = await headlineSize(page, 1440);

    expect(wide).toBeGreaterThan(narrow);
  });

  test("does not jump across the 768px breakpoint", async ({ page }) => {
    const before = await headlineSize(page, 767);
    const after = await headlineSize(page, 769);

    expect(Math.abs(after - before)).toBeLessThan(1);
  });

  test("does not jump across the 1024px breakpoint", async ({ page }) => {
    const before = await headlineSize(page, 1023);
    const after = await headlineSize(page, 1025);

    expect(Math.abs(after - before)).toBeLessThan(1);
  });

  test("stops growing at the top of its range, so it stays readable", async ({ page }) => {
    const wide = await headlineSize(page, 1440);
    const wider = await headlineSize(page, 1920);

    expect(wider).toBe(wide);
  });
});

// 7.2, checked as geometry rather than as a rule.
test.describe("navigation shape (7.2)", () => {
  test("hides the inline list and shows the panel below 1024px", async ({ page }) => {
    await at(page, 800);

    await expect(page.getByRole("navigation", { name: "Secciones del sitio", exact: true })).toBeHidden();
    await expect(page.locator("header details")).toBeVisible();
  });

  test("shows the inline list and hides the panel at 1280px", async ({ page }) => {
    await at(page, 1280);

    await expect(page.getByRole("navigation", { name: "Secciones del sitio", exact: true })).toBeVisible();
    await expect(page.locator("header details")).toBeHidden();
  });

  test("keeps the site name and the enrolment control visible at 320px", async ({ page }) => {
    await at(page, 320);

    await expect(page.locator("header").getByText("Crypto Crime Academy")).toBeVisible();
    await expect(page.locator("header a[href*='intent=signup']")).toBeVisible();
  });
});
