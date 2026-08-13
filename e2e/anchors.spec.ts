import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * The fixed header and what it does to anchor navigation.
 *
 * A sticky header and fragment links are a classic pairing that goes wrong
 * quietly: the browser scrolls the target to the very top of the viewport,
 * which is exactly where the header already is, so the heading the visitor
 * asked for ends up underneath it. Nothing errors; the page just looks like it
 * jumped to the wrong place.
 */

const WIDE = { width: 1280, height: 800 };

/**
 * A link of the inline header list.
 *
 * Scoped by the accessible name of its `<nav>`: the header carries two lists at
 * once — the inline one and the narrow-screen panel — and an unscoped selector
 * matches the same destination twice.
 */
function inlineLink(page: Page, id: string): Locator {
  return page
    .getByRole("navigation", { name: "Secciones del sitio", exact: true })
    .locator(`a[href="#${id}"]`);
}

async function headerBottom(page: Page): Promise<number> {
  return page.evaluate(() => document.querySelector("header")!.getBoundingClientRect().bottom);
}

async function scrollBehaviour(page: Page): Promise<string> {
  return page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior);
}

// 1.4 — the header stays put while the page moves.
test.describe("the header stays at the top edge (1.4)", () => {
  test("is still at the top after scrolling down", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto("/");

    await page.evaluate(() => window.scrollTo(0, 2000));
    await page.waitForFunction(() => window.scrollY > 1500);

    const box = await page.locator("header").boundingBox();
    expect(box!.y).toBeLessThanOrEqual(1);
  });

  /**
   * The header may not grow past the band `scroll-padding` reserves.
   *
   * When the 44px activation targets of 7.6 were applied, the bar grew four
   * pixels past `--header-height` and six anchor specs failed at once — a
   * confusing symptom for a simple cause. This asserts the coupling directly,
   * so the next time it breaks it says so.
   */
  test("is no taller than the band reserved for it", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto("/");

    const measured = await page.evaluate(() => {
      const header = document.querySelector("header")!.getBoundingClientRect().height;
      const reserved = Number.parseFloat(
        getComputedStyle(document.documentElement).scrollPaddingTop,
      );
      return { header, reserved };
    });

    expect(measured.header).toBeLessThanOrEqual(measured.reserved + 1);
  });

  test("still covers the full width after scrolling", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto("/");

    await page.evaluate(() => window.scrollTo(0, 3000));
    await page.waitForFunction(() => window.scrollY > 2500);

    const box = await page.locator("header").boundingBox();
    // Compared against the client width, not the viewport: a scrollbar takes
    // its share and the header is not expected to sit under it.
    const client = await page.evaluate(() => document.documentElement.clientWidth);
    expect(Math.round(box!.width)).toBe(client);
  });
});

/**
 * 1.3 — the destination heading must clear the header.
 *
 * Checked for every navigable section, because the failure depends on where the
 * section sits in the document: the last one cannot always scroll far enough,
 * which is precisely the case a single spot check would miss.
 */
test.describe("the target heading clears the header (1.3)", () => {
  const sections = ["audiencia", "metodologia", "actualizaciones", "programa", "confianza", "faq"];

  /**
   * Narrow as well as wide, and the narrow case is the one that matters.
   *
   * At 1280 the section's own vertical padding is 96px against a 72px header,
   * so the heading clears it whether or not the scroll is corrected — the
   * criterion would look satisfied by decoration. At 375 that padding shrinks to
   * 48px, less than the header, and only `scroll-padding` keeps the heading out
   * from under it.
   */
  const viewports = [
    { name: "1280", size: WIDE },
    { name: "375", size: { width: 375, height: 720 } },
  ];

  for (const viewport of viewports) {
    for (const id of sections) {
      test(`shows the heading of #${id} below the header at ${viewport.name}px`, async ({
        page,
      }) => {
        await page.setViewportSize(viewport.size);
        await page.goto("/");

        // Below 1024 the links live in the panel, which has to be opened first.
        if (viewport.size.width < 1024) {
          await page.locator("header details summary").click();
        }

        const link =
          viewport.size.width < 1024
            ? page
                .getByRole("navigation", { name: "Secciones del sitio, panel" })
                .locator(`a[href="#${id}"]`)
            : inlineLink(page, id);

        await link.click();
        await page.waitForFunction((target) => window.location.hash === `#${target}`, id);
        // Settle any smooth scrolling before measuring.
        await page.waitForTimeout(600);

        const bottom = await headerBottom(page);

        // The heading itself, which is what 1.3 names.
        const heading = await page.locator(`#${id} h2`).boundingBox();
        expect(heading!.y).toBeGreaterThanOrEqual(bottom - 1);

        // And the top edge of the section, which is what actually depends on
        // the scroll being corrected. Without it the heading still clears the
        // header by luck of the section padding, so this is the assertion that
        // detects a missing `scroll-padding` rather than a lucky layout.
        const section = await page.locator(`#${id}`).boundingBox();
        expect(section!.y).toBeGreaterThanOrEqual(bottom - 1);
      });
    }
  }
});

// 1.7 — reduced motion means arriving at once, not gliding there.
test.describe("reduced motion arrives immediately (1.7)", () => {
  test("stops declaring smooth scrolling", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    expect(await scrollBehaviour(page)).toBe("auto");
  });

  test("lands on the section without an animated scroll", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize(WIDE);
    await page.goto("/");

    const before = await page.evaluate(() => window.scrollY);
    await inlineLink(page, "faq").click();

    // No settling wait on purpose: with reduced motion the jump is done by the
    // time the click resolves. A smooth scroll would still be in flight here.
    const after = await page.evaluate(() => window.scrollY);

    expect(after).toBeGreaterThan(before);

    const heading = await page.locator("#faq h2").boundingBox();
    const bottom = await headerBottom(page);
    expect(heading!.y).toBeGreaterThanOrEqual(bottom - 1);
  });
});

test.describe("motion is allowed by default", () => {
  test("declares smooth scrolling when no preference is set", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");

    expect(await scrollBehaviour(page)).toBe("smooth");
  });
});
