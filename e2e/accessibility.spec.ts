import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * The automated accessibility audit (9.6).
 *
 * It runs against the rendered production page, which is the only place where
 * the real content, the real stylesheet and the real markup meet. A violation
 * fails the suite, and the suite is part of continuous integration, so it fails
 * that too.
 *
 * An audit is a floor, not a ceiling: it catches what a machine can see. The
 * hand-written specs of T19 and T25 cover what it cannot.
 */

const WIDE = { width: 1280, height: 800 };
const NARROW = { width: 375, height: 720 };

/** WCAG 2.2 AA, which is the level requirement 9 is written against. */
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

function audit(page: Page) {
  return new AxeBuilder({ page }).withTags(TAGS);
}

/** A violation, reduced to what a person needs in order to fix it. */
function readable(violations: Awaited<ReturnType<AxeBuilder["analyze"]>>["violations"]) {
  return violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    nodes: violation.nodes.map((node) => node.target.join(" ")),
  }));
}

test.describe("the landing page (9.6)", () => {
  for (const viewport of [
    { name: "1280", size: WIDE },
    { name: "375", size: NARROW },
  ]) {
    test(`reports no violation at ${viewport.name}px`, async ({ page }) => {
      await page.setViewportSize(viewport.size);
      await page.goto("/");

      const { violations } = await audit(page).analyze();

      expect(readable(violations)).toEqual([]);
    });
  }

  /**
   * With the disclosures open, because the audit only sees what is rendered:
   * the answer text of a closed `<details>` is not in the accessibility tree,
   * so a contrast problem inside it would go unreported at rest.
   */
  test("reports no violation with the disclosures open", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto("/");

    const questions = page.locator("#faq details");
    const count = await questions.count();
    for (let index = 0; index < count; index += 1) {
      await questions.nth(index).locator("summary").click();
    }

    const { violations } = await audit(page).analyze();

    expect(readable(violations)).toEqual([]);
  });

  test("reports no violation with the navigation panel open", async ({ page }) => {
    await page.setViewportSize(NARROW);
    await page.goto("/");

    await page.locator("header details summary").click();

    const { violations } = await audit(page).analyze();

    expect(readable(violations)).toEqual([]);
  });
});

test.describe("the 404 page (9.6, 10.4)", () => {
  test("reports no violation", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto("/una-ruta-que-no-existe");

    const { violations } = await audit(page).analyze();

    expect(readable(violations)).toEqual([]);
  });
});

/**
 * 9.4 — contrast, confirmed on the rendered page.
 *
 * T9 measured the tokens in isolation. This measures what the visitor actually
 * sees, which is where a token applied to the wrong background would show up.
 *
 * The rule is `color-contrast`, the AA threshold — 4.5:1 for text and 3:1 for
 * interface elements, which is what 9.4 states. Its AAA sibling,
 * `color-contrast-enhanced`, asks 7:1 and the palette does not meet it; the
 * project never claimed to. Asserting the whole `cat.color` category would have
 * pulled that rule in and failed the build against a level nobody agreed to.
 */
test.describe("contrast on the rendered page (9.4)", () => {
  test("reports no contrast violation at the AA threshold", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto("/");

    const { violations } = await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze();

    expect(readable(violations)).toEqual([]);
  });

  test("actually ran the contrast rule, rather than passing by omission", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto("/");

    const { passes } = await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze();

    const contrast = passes.find((rule) => rule.id === "color-contrast");
    expect(contrast, "the color-contrast rule did not run").toBeDefined();
    expect(contrast!.nodes.length).toBeGreaterThan(10);
  });
});
