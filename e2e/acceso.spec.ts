import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

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
    await expect(page.locator('a[href="/panel"]')).toBeVisible();
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
 * The control walks to the dashboard — nothing is checked, so it walks there
 * whatever was typed — and this is the assertion behind making it an anchor
 * rather than a form control. A `<form>` with no action submits by GET and puts
 * every field into the query string, from where the password reaches browser
 * history, server logs and the referrer of the next request. An anchor
 * serialises nothing, so the address that lands is a bare `/panel`.
 */
test.describe("typing a password and pressing the control leaks nothing", () => {
  test("lands on the dashboard with a bare address", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto("/acceso");

    await page.locator('input[type="email"]').fill("investigador@fiscalia.example");
    await page.locator('input[type="password"]').fill("una-contraseña-real");
    await page.locator('a[href="/panel"]').click();

    await page.waitForURL("**/panel");

    expect(new URL(page.url()).pathname).toBe("/panel");
    expect(page.url()).not.toContain("?");
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

/**
 * The address the rest of the site actually links to.
 *
 * Every check above enters a bare `/acceso`, but no control in the product does:
 * «Iniciar sesión» points at `LOGIN_HREF`, which carries `?intent=login`. The
 * query has to survive the render and then die at the navigation — a parameter
 * that leaks into `/panel` would be the same class of defect the anchor exists
 * to prevent, arriving by a different door.
 */
test.describe("entered from the address the site links to", () => {
  /*
   * Found by the control's position, not its address.
   *
   * The checks in this block are about which address the control leads to, so
   * selecting it by that same address would make them circular: an href that
   * wrongly carried the query would miss the selector and the run would fail on
   * a missing element, never reaching — and so never proving — the assertion.
   * The submit is the last link of the card.
   */
  const submit = (page: Page) => page.locator("main a").last();

  test("renders the screen and drops the intent on the way to the dashboard", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto("/acceso?intent=login");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await page.locator('input[type="email"]').fill("investigador@demo.example");
    await page.locator('input[type="password"]').fill("una-contraseña-cualquiera");
    await submit(page).click();

    await page.waitForURL("**/panel**");

    expect(new URL(page.url()).search).toBe("");
    expect(page.url()).not.toContain("intent");
  });

  test("lands on a dashboard that actually rendered", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto("/acceso?intent=login");

    await submit(page).click();
    await page.waitForURL("**/panel**");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("navigation")).toBeVisible();
  });
});

/**
 * The structural guard, not the symptom.
 *
 * The checks above prove the password does not reach the address bar, which is
 * what a `<form>` here would cause. This one proves the cause is absent: a form
 * with no action submits by GET, and the moment anyone wraps these fields in one
 * this fails, rather than waiting for a URL assertion to notice the fallout.
 */
test.describe("the screen renders no form", () => {
  test("has no form element at all", async ({ page }) => {
    await page.goto("/acceso?intent=login");

    await expect(page.locator("form")).toHaveCount(0);
  });
});

test.describe("the screen stays out of search results", () => {
  test("declares noindex", async ({ page }) => {
    await page.goto("/acceso");

    const robots = await page.locator('meta[name="robots"]').getAttribute("content");
    expect(robots).toContain("noindex");
  });
});
