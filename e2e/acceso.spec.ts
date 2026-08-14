import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * The access screen, in a real browser.
 *
 * It is UI only: nothing authenticates, and the checks below are about that
 * being true rather than merely intended.
 */

const WIDE = { width: 1280, height: 900 };
const NARROW = { width: 375, height: 720 };
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

test.describe("the screen renders", () => {
  test("shows the card with both fields and the control", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto("/acceso");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole("button")).toBeVisible();
  });

  test("fits a narrow screen without horizontal scrolling (7.8)", async ({ page }) => {
    await page.setViewportSize(NARROW);
    await page.goto("/acceso");

    const overflow = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));

    expect(overflow.scroll).toBeLessThanOrEqual(overflow.client);
  });
});

/**
 * The credential must not reach the URL.
 *
 * This is the assertion behind the decision to make the control a plain button:
 * a `<form>` with no action submits by GET and puts every field into the query
 * string, from where the password reaches browser history, server logs and the
 * referrer of the next request.
 */
test.describe("typing a password and pressing the control leaks nothing", () => {
  test("leaves the URL untouched", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto("/acceso");
    const before = page.url();

    await page.locator('input[type="email"]').fill("investigador@fiscalia.example");
    await page.locator('input[type="password"]').fill("una-contraseña-real");
    await page.getByRole("button").click();

    await page.waitForTimeout(300);

    expect(page.url()).toBe(before);
    expect(page.url()).not.toContain("contraseña");
    expect(page.url()).not.toContain("password");
    expect(page.url()).not.toContain("fiscalia");
  });

  test("does not navigate on Enter inside a field", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto("/acceso");
    const before = page.url();

    await page.locator('input[type="password"]').fill("otra-contraseña");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(300);

    expect(page.url()).toBe(before);
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
      await page.goto("/acceso");

      const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();

      expect(
        violations.map((violation) => ({ id: violation.id, help: violation.help })),
      ).toEqual([]);
    });
  }

  test("reaches every control by keyboard, with a visible ring", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto("/acceso");

    const withoutRing: string[] = [];

    for (let index = 0; index < 4; index += 1) {
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
    await page.goto("/acceso");

    const small = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>("a[href], button, input")]
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return { tag: element.tagName, w: rect.width, h: rect.height };
        })
        .filter((box) => box.w < 43.5 || box.h < 43.5),
    );

    expect(small).toEqual([]);
  });
});

test.describe("the screen stays out of search results", () => {
  test("declares noindex", async ({ page }) => {
    await page.goto("/acceso");

    const robots = await page.locator('meta[name="robots"]').getAttribute("content");
    expect(robots).toContain("noindex");
  });
});
