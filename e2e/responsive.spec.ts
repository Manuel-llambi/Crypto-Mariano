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

/**
 * The content stops at 1152px; the backgrounds do not.
 *
 * Implemented as horizontal padding rather than a wrapper with
 * `max-inline-size`, so each section keeps painting its colour edge to edge
 * while the text inside it stays centred and capped. Both halves are asserted:
 * a wrapper would satisfy the first and fail the second.
 */
const CAP = 1152;

test.describe("content is capped at 1152px", () => {

  for (const width of [1440, 1920, 2560]) {
    test(`keeps the content at ${CAP}px on a ${width}px viewport`, async ({ page }) => {
      await at(page, width);

      // The hero is skipped on purpose: its panel bleeds past the cap by
      // design, which the suite below covers on its own terms.
      const measured = await page.evaluate(() => {
        const sections = [...document.querySelectorAll<HTMLElement>("main > section")].slice(1);
        return sections.map((section) => {
          const style = getComputedStyle(section);
          const left = Number.parseFloat(style.paddingLeft);
          const right = Number.parseFloat(style.paddingRight);
          return Math.round(section.getBoundingClientRect().width - left - right);
        });
      });

      expect(measured.length).toBeGreaterThan(5);
      for (const box of measured) {
        expect(box).toBeLessThanOrEqual(CAP);
        expect(box).toBeGreaterThanOrEqual(CAP - 1);
      }
    });

    test(`keeps the backgrounds full width on a ${width}px viewport`, async ({ page }) => {
      await at(page, width);

      const client = await page.evaluate(() => document.documentElement.clientWidth);
      const widths = await page.evaluate(() =>
        [...document.querySelectorAll("main > section, header, footer")].map((element) =>
          Math.round(element.getBoundingClientRect().width),
        ),
      );

      for (const measured of widths) {
        expect(measured).toBe(client);
      }
    });
  }

  test("centres the capped content", async ({ page }) => {
    await at(page, 1920);

    const offsets = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>("main > section")]
        .slice(1)
        .map((section) => {
          const style = getComputedStyle(section);
          return Math.round(
            Number.parseFloat(style.paddingLeft) - Number.parseFloat(style.paddingRight),
          );
        }),
    );

    for (const offset of offsets) {
      expect(offset).toBe(0);
    }
  });

  // Below the cap nothing changes: the inset alone governs.
  test("does not cap anything at 1024px", async ({ page }) => {
    await at(page, 1024);

    const client = await page.evaluate(() => document.documentElement.clientWidth);
    const box = await page.evaluate(() => {
      // Second section: the hero drops its right padding for the bleed.
      const section = [...document.querySelectorAll<HTMLElement>("main > section")][1]!;
      const style = getComputedStyle(section);
      return (
        section.getBoundingClientRect().width -
        Number.parseFloat(style.paddingLeft) -
        Number.parseFloat(style.paddingRight)
      );
    });

    expect(box).toBeLessThan(client);
    expect(box).toBeGreaterThan(client - 200);
  });

  /**
   * The header runs wider than the content, by design: 1232 against 1152. It is
   * asserted rather than left implicit, because «wider» is easy to turn into
   * «uncapped» by deleting one rule.
   */
  test("caps the header at 1232px, wider than the content", async ({ page }) => {
    await at(page, 1920);

    const measured = await page.evaluate(() => {
      const header = document.querySelector<HTMLElement>("header")!;
      const style = getComputedStyle(header);
      return Math.round(
        header.getBoundingClientRect().width -
          Number.parseFloat(style.paddingLeft) -
          Number.parseFloat(style.paddingRight),
      );
    });

    expect(measured).toBe(1232);
    expect(measured).toBeGreaterThan(CAP);
  });
});

/**
 * The hero panel is the one thing that ignores the content cap.
 *
 * It is where a photograph will go, and the design runs it to the right edge of
 * the viewport at the hero's full height. It escapes by cancelling the section's
 * padding with negative margins, which is why the assertions below are about
 * where its edges land rather than about any declared width.
 */
test.describe("the hero panel bleeds off the grid", () => {
  test("reaches the right edge of the viewport at 1920px", async ({ page }) => {
    await at(page, 1920);

    const client = await page.evaluate(() => document.documentElement.clientWidth);
    const panel = await page.locator('main [role="img"]').boundingBox();

    expect(Math.round(panel!.x + panel!.width)).toBe(client);
  });

  test("fills the full height of the hero at 1920px", async ({ page }) => {
    await at(page, 1920);

    const hero = await page.locator("main section").first().boundingBox();
    const panel = await page.locator('main [role="img"]').boundingBox();

    expect(Math.round(panel!.y)).toBe(Math.round(hero!.y));
    expect(Math.round(panel!.height)).toBe(Math.round(hero!.height));
  });

  test("leaves the hero copy on the content grid", async ({ page }) => {
    await at(page, 1920);

    const headline = await page.locator("main h1").boundingBox();
    const audience = await page.locator("#audiencia h2").boundingBox();

    // The copy still starts where every other section's content starts.
    expect(Math.round(headline!.x)).toBe(Math.round((1920 - CAP) / 2));
    expect(audience).not.toBeNull();
  });

  test("stays inside the page: bleeding never becomes overflow", async ({ page }) => {
    await at(page, 1920);

    const overflow = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));

    expect(overflow.scroll).toBeLessThanOrEqual(overflow.client);
  });

  test("goes back into the flow when the hero stacks at 375px", async ({ page }) => {
    await at(page, 375);

    const client = await page.evaluate(() => document.documentElement.clientWidth);
    const panel = await page.locator('main [role="img"]').boundingBox();

    // Stacked, it is an ordinary block inside the padding, not a bleed.
    expect(panel!.x).toBeGreaterThan(0);
    expect(Math.round(panel!.x + panel!.width)).toBeLessThan(client);
  });
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

    // The hero control is the one inside the hero section. It used to be found
    // by `intent=signup`, which now matches the syllabus and closing controls
    // instead — the hero button leads to the syllabus, not to enrolment.
    const cta = await page.locator("main section").first().locator("a").first().boundingBox();
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
