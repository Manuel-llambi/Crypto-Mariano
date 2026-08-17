import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * The student dashboard, in a real browser.
 *
 * It is UI only: nothing authenticates, nothing guards the route, and no
 * control on it does anything. The checks below are about that being true
 * rather than merely intended, and about the screen holding the same
 * accessibility bar as the rest of the site.
 */

const WIDE = { width: 1280, height: 900 };
const NARROW = { width: 375, height: 720 };
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

test.describe("the screen renders", () => {
  test("shows the greeting, the ring and the whole syllabus", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto("/panel");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("35%")).toBeVisible();
    await expect(page.locator("li")).toHaveCount(7);
  });

  test("shows a state for every module, in words and not only in colour", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto("/panel");

    // Scoped to the grid: «Completado» is also the label under the ring.
    const cards = page.locator("li");

    await expect(cards.getByText("Completado")).toHaveCount(2);
    await expect(cards.getByText("En curso")).toHaveCount(1);
    await expect(cards.getByText("Bloqueado")).toHaveCount(4);
    await expect(page.getByText("Requiere EXP-02")).toBeVisible();
  });

  test("fits a narrow screen without horizontal scrolling (7.8)", async ({ page }) => {
    await page.setViewportSize(NARROW);
    await page.goto("/panel");

    const overflow = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));

    expect(overflow.scroll).toBeLessThanOrEqual(overflow.client);
  });
});

/**
 * 8.1 — the panel works with scripting off, because it has none of its own.
 *
 * `NavPanel` is the single client component of the site and it is not on this
 * screen. The progress ring and the module bar are conic gradients fed by a
 * custom property written into the markup, so both arrive already drawn.
 */
test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("renders the whole dashboard anyway", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto("/panel");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("li")).toHaveCount(7);
    await expect(page.getByText("35%")).toBeVisible();
  });
});

test.describe("nothing on the screen leads anywhere it should not", () => {
  test("keeps every destination inside the site", async ({ page }) => {
    await page.goto("/panel");

    const hrefs = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLAnchorElement>("a[href]")].map((a) =>
        a.getAttribute("href"),
      ),
    );

    for (const href of hrefs) {
      expect(href).toMatch(/^\//);
    }
  });

  test("offers a way back out through «Cerrar sesión»", async ({ page }) => {
    await page.goto("/panel");

    await page.getByRole("link", { name: "Cerrar sesión" }).click();
    await page.waitForURL("**/acceso**");

    expect(new URL(page.url()).pathname).toBe("/acceso");
  });
});

// 9.5, 9.6 — the same bar the landing is held to.
test.describe("accessibility", () => {
  for (const viewport of [
    { name: "1280", size: WIDE },
    { name: "375", size: NARROW },
  ]) {
    test(`reports no violation at ${viewport.name}px`, async ({ page }) => {
      await page.setViewportSize(viewport.size);
      await page.goto("/panel");

      const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();

      expect(
        violations.map((violation) => ({ id: violation.id, help: violation.help })),
      ).toEqual([]);
    });
  }

  test("reaches every control by keyboard, with a visible ring", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto("/panel");

    const withoutRing: string[] = [];

    for (let index = 0; index < 8; index += 1) {
      await page.keyboard.press("Tab");

      const state = await page.evaluate(() => {
        const element = document.activeElement as HTMLElement | null;
        if (element === null || element === document.body) {
          return null;
        }
        const style = getComputedStyle(element);
        return {
          tag: element.tagName,
          width: Number.parseFloat(style.outlineWidth),
          visible: element.matches(":focus-visible"),
        };
      });

      if (state === null) {
        break;
      }
      if (!state.visible || state.width < 2) {
        withoutRing.push(state.tag);
      }
    }

    expect(withoutRing).toEqual([]);
  });

  test("gives every control at least 44 by 44 pixels (7.6)", async ({ page }) => {
    await page.setViewportSize(NARROW);
    await page.goto("/panel");

    const small = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>("a[href], button, input")]
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return { tag: element.tagName, text: element.textContent?.trim(), w: rect.width, h: rect.height };
        })
        .filter((box) => box.w < 43.5 || box.h < 43.5),
    );

    expect(small).toEqual([]);
  });
});

test.describe("the screen stays out of search results", () => {
  test("declares noindex", async ({ page }) => {
    await page.goto("/panel");

    const robots = await page.locator('meta[name="robots"]').getAttribute("content");
    expect(robots).toContain("noindex");
  });
});
