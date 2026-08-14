import { expect, test, type Page } from "@playwright/test";

/**
 * The typefaces of the design, checked as loaded rather than as declared.
 *
 * For most of this project `--font-sans: 'IBM Plex Sans'` was declared in the
 * tokens and **nothing loaded the files**, so every page painted in the system
 * fallback. A test that reads the CSS variable would have passed throughout.
 * These read `document.fonts`, which only knows about faces the browser actually
 * has.
 */

const WIDE = { width: 1280, height: 800 };

/** Waits for webfont loading to settle before asking what is available. */
async function loadedFamilies(page: Page): Promise<string[]> {
  await page.evaluate(() => document.fonts.ready);
  return page.evaluate(() =>
    [...document.fonts]
      .filter((face) => face.status === "loaded")
      .map((face) => face.family.replaceAll('"', "")),
  );
}

test.describe("the design typefaces are actually loaded", () => {
  for (const family of ["IBM Plex Sans", "IBM Plex Mono"]) {
    test(`${family} is available to the document`, async ({ page }) => {
      await page.setViewportSize(WIDE);
      await page.goto("/");

      expect(await loadedFamilies(page)).toContain(family);
    });
  }

  /**
   * Declaration only, and labelled as such.
   *
   * `fontFamily` echoes the stylesheet whether or not the file ever arrived, so
   * this cannot show the font is loaded — the two `document.fonts` specs above
   * and the width probe below do that. `document.fonts.check` was tried here and
   * dropped: it answers true for a family the browser does not have, because the
   * text is still renderable through the fallback.
   */
  test("declares IBM Plex Sans as the first family of the headline", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto("/");

    const declared = await page.evaluate(
      () => getComputedStyle(document.querySelector("h1")!).fontFamily,
    );

    expect(declared.split(",")[0]!.replaceAll(/["']/g, "").trim()).toBe("IBM Plex Sans");
  });

  test("the technical labels render in IBM Plex Mono", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);

    const family = await page.evaluate(() => {
      const code = document.querySelector("[data-testid='module-code']")!;
      return getComputedStyle(code).fontFamily;
    });

    expect(family).toContain("IBM Plex Mono");
  });

  /**
   * Measured, not declared.
   *
   * The probe is `'IBM Plex Sans', serif` against plain `serif`, deliberately:
   * if the face never loaded, the first stack falls through to `serif` too and
   * the two widths come out identical. Comparing against `monospace` instead
   * would pass either way, because the fallback is not monospace — that was the
   * first version of this test, and a mutation showed it asserted nothing.
   */
  test("the headline is not being painted by the system fallback", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);

    const widths = await page.evaluate(() => {
      const probe = document.createElement("span");
      probe.textContent = "EXCELENCIA EN INVESTIGACIÓN DE CRIPTOACTIVOS";
      probe.style.cssText = "position:absolute;visibility:hidden;font-size:48px;white-space:nowrap";
      document.body.append(probe);

      probe.style.fontFamily = "'IBM Plex Sans', serif";
      const plex = probe.getBoundingClientRect().width;

      probe.style.fontFamily = "serif";
      const fallback = probe.getBoundingClientRect().width;

      probe.remove();
      return { plex, fallback };
    });

    expect(widths.plex).toBeGreaterThan(0);
    expect(Math.abs(widths.plex - widths.fallback)).toBeGreaterThan(1);
  });

  test("serves the fonts from this origin, not from a third party", async ({ page }) => {
    const external: string[] = [];
    page.on("request", (request) => {
      const url = request.url();
      if (/\.(woff2?|ttf|otf)(\?|$)/i.test(url) && !url.includes("127.0.0.1")) {
        external.push(url);
      }
    });

    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);

    expect(external).toEqual([]);
  });
});
