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

/**
 * The family name a token resolves to, read from the running page.
 *
 * These used to be the literals «IBM Plex Sans» and «IBM Plex Mono». They are
 * not any more: `next/font/local` generates the `@font-face` family from the
 * name of the constant in `app/layout.tsx`, so the browser knows the faces as
 * `plexSans` and `plexMono` and nothing can rename them — the loader takes no
 * family option.
 *
 * Hardcoding the generated name here would tie the suite to an implementation
 * detail of the loader. Reading it back costs something real and it should be
 * said plainly: the name no longer proves *which* typeface arrived, so swapping
 * the file in `app/fonts/` for a different face would not be caught here. What
 * the specs below still prove — and it is the thing that was broken before they
 * existed — is that a downloaded face is painting the page instead of the
 * system fallback. `app/fonts.test.ts` pins which files are declared.
 */
async function resolvedFamily(page: Page, token: string): Promise<string> {
  return page.evaluate((name) => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name);
    return value.split(",")[0]!.replaceAll(/["']/g, "").trim();
  }, token);
}

test.describe("the design typefaces are actually loaded", () => {
  for (const token of ["--font-sans-face", "--font-mono-face"]) {
    test(`the face behind ${token} is available to the document`, async ({ page }) => {
      await page.setViewportSize(WIDE);
      await page.goto("/");

      const family = await resolvedFamily(page, token);
      expect(family).not.toBe("");
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
  test("declares the sans face as the first family of the headline", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto("/");

    const declared = await page.evaluate(
      () => getComputedStyle(document.querySelector("h1")!).fontFamily,
    );

    expect(declared.split(",")[0]!.replaceAll(/["']/g, "").trim()).toBe(
      await resolvedFamily(page, "--font-sans-face"),
    );
  });

  test("the technical labels render in the mono face", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);

    const family = await page.evaluate(() => {
      const code = document.querySelector("[data-testid='module-code']")!;
      return getComputedStyle(code).fontFamily;
    });

    expect(family).toContain(await resolvedFamily(page, "--font-mono-face"));
  });

  /**
   * Measured, not declared. This is the spec that carries the guarantee.
   *
   * The probe is the sans face followed by `serif`, against plain `serif`,
   * deliberately: if the face never loaded, the first stack falls through to
   * `serif` too and the two widths come out identical. Comparing against
   * `monospace` instead would pass either way, because the fallback is not
   * monospace — that was the first version of this test, and a mutation showed
   * it asserted nothing.
   *
   * The family is read from the token rather than written in, for the reason
   * `resolvedFamily` explains. The probe deliberately does not use the token
   * itself: `--font-sans-face` carries the metric-adjusted fallback as its
   * second family, and that fallback is a real loaded face, so the stack would
   * measure wide even with the webfont missing.
   */
  test("the headline is not being painted by the system fallback", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);

    const family = await resolvedFamily(page, "--font-sans-face");

    const widths = await page.evaluate((sans) => {
      const probe = document.createElement("span");
      probe.textContent = "EXCELENCIA EN INVESTIGACIÓN DE CRIPTOACTIVOS";
      probe.style.cssText = "position:absolute;visibility:hidden;font-size:48px;white-space:nowrap";
      document.body.append(probe);

      probe.style.fontFamily = `'${sans}', serif`;
      const plex = probe.getBoundingClientRect().width;

      probe.style.fontFamily = "serif";
      const fallback = probe.getBoundingClientRect().width;

      probe.remove();
      return { plex, fallback };
    }, family);

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
