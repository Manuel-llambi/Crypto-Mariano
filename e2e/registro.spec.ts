import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * The three screens of signing up, in a real browser.
 *
 * They are UI only: no code is sent, none is checked, no account is created.
 * The checks below are about that being true rather than merely intended, and
 * about the three screens meeting the same bar as the landing.
 */

const WIDE = { width: 1280, height: 900 };
const NARROW = { width: 375, height: 720 };
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const SCREENS = [
  { name: "e-mail", path: "/registro" },
  { name: "código", path: "/registro/codigo" },
  { name: "crear cuenta", path: "/registro/crear-cuenta" },
];

test.describe("the flow advances by anchor alone", () => {
  test("walks the three steps and ends on the account screen", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto("/registro?intent=signup");

    await page.locator('input[type="email"]').fill("investigador@fiscalia.example");
    await page.getByRole("link", { name: "Enviar código" }).click();

    await expect(page).toHaveURL(/\/registro\/codigo$/);
    await page.locator('input[inputmode="numeric"]').fill("123456");
    await page.getByRole("link", { name: "Verificar" }).click();

    await expect(page).toHaveURL(/\/registro\/crear-cuenta$/);
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  /**
   * The step that holds a password is the end of the road.
   *
   * Same reasoning as `/acceso`: the control is a button that does nothing, so
   * nothing typed here can reach the URL and from there browser history, server
   * logs or the referrer of the next request.
   */
  test("creating the account leads nowhere and leaks nothing", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto("/registro/crear-cuenta");
    const before = page.url();

    await page.locator('input[type="email"]').fill("investigador@fiscalia.example");
    await page.locator('input[type="password"]').fill("una-contraseña-real");
    await page.getByRole("button", { name: "Crear cuenta" }).click();
    await page.waitForTimeout(300);

    expect(page.url()).toBe(before);
    expect(page.url()).not.toContain("contraseña");
    expect(page.url()).not.toContain("fiscalia");
  });

  test("the code step offers a way back to ask for another one", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto("/registro/codigo");

    await page.getByRole("link", { name: "Reenviar código" }).click();

    await expect(page).toHaveURL(/\/registro\?intent=signup$/);
  });
});

// 9.5, 9.6, 7.6, 7.8, 10 — the same bar the landing and `/acceso` are held to.
for (const screen of SCREENS) {
  test.describe(`the ${screen.name} screen`, () => {
    test("fits a narrow screen without horizontal scrolling (7.8)", async ({ page }) => {
      await page.setViewportSize(NARROW);
      await page.goto(screen.path);

      const overflow = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
      }));

      expect(overflow.scroll).toBeLessThanOrEqual(overflow.client);
    });

    test("reports no accessibility violation at either width", async ({ page }) => {
      for (const size of [WIDE, NARROW]) {
        await page.setViewportSize(size);
        await page.goto(screen.path);

        const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();

        expect(
          violations.map((violation) => ({ id: violation.id, help: violation.help })),
        ).toEqual([]);
      }
    });

    test("gives every control at least 44 by 44 pixels (7.6)", async ({ page }) => {
      await page.setViewportSize(NARROW);
      await page.goto(screen.path);

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

    test("declares noindex", async ({ page }) => {
      await page.goto(screen.path);

      const robots = await page.locator('meta[name="robots"]').getAttribute("content");
      expect(robots).toContain("noindex");
    });
  });
}
