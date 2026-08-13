import { expect, test, type Page } from "@playwright/test";

/**
 * Every interactive control, measured and driven from the keyboard.
 *
 * The suite walks the whole page rather than a chosen sample: a control that
 * nobody thought to list is exactly the one that ends up 30px tall.
 */

const NARROW = { width: 375, height: 720 };
const WIDE = { width: 1280, height: 800 };
const MIN_TARGET = 44;

/** Everything a visitor can activate, in document order. */
const INTERACTIVE = "a[href], button, summary, [tabindex]:not([tabindex='-1'])";

/** Boxes of the visible interactive controls, with something to identify them. */
async function controlBoxes(page: Page) {
  return page.evaluate((selector) => {
    return [...document.querySelectorAll<HTMLElement>(selector)]
      .filter((el) => el.getClientRects().length > 0)
      .map((el) => {
        const r = el.getBoundingClientRect();
        return {
          tag: el.tagName,
          label: (el.textContent ?? "").trim().slice(0, 40),
          width: r.width,
          height: r.height,
        };
      });
  }, INTERACTIVE);
}

// 7.6 — 44x44 on every control, at both shapes of the page.
for (const viewport of [
  { name: "375", size: NARROW },
  { name: "1280", size: WIDE },
]) {
  test.describe(`activation targets at ${viewport.name}px (7.6)`, () => {
    test("gives every visible control at least 44 by 44 pixels", async ({ page }) => {
      await page.setViewportSize(viewport.size);
      await page.goto("/");

      const boxes = await controlBoxes(page);
      expect(boxes.length).toBeGreaterThan(5);

      const small = boxes.filter(
        (box) => box.width < MIN_TARGET - 0.5 || box.height < MIN_TARGET - 0.5,
      );
      expect(small, `controls under ${MIN_TARGET}px: ${JSON.stringify(small)}`).toEqual([]);
    });

    test("keeps the disclosure controls large enough once opened", async ({ page }) => {
      await page.setViewportSize(viewport.size);
      await page.goto("/");

      await page.locator("#faq details").first().locator("summary").click();

      const boxes = await controlBoxes(page);
      const small = boxes.filter(
        (box) => box.width < MIN_TARGET - 0.5 || box.height < MIN_TARGET - 0.5,
      );
      expect(small, `controls under ${MIN_TARGET}px: ${JSON.stringify(small)}`).toEqual([]);
    });
  });
}

// 9.5 — reachable and operable from the keyboard, in document order.
test.describe("keyboard operation (9.5)", () => {
  test("reaches every control by tabbing, in document order", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto("/");

    const expected = await page.evaluate((selector) => {
      return [...document.querySelectorAll<HTMLElement>(selector)]
        .filter((el) => el.getClientRects().length > 0)
        .map((el) => (el.textContent ?? "").trim().slice(0, 40));
    }, INTERACTIVE);

    const reached: string[] = [];
    for (let index = 0; index < expected.length; index += 1) {
      await page.keyboard.press("Tab");
      reached.push(
        await page.evaluate(() => (document.activeElement?.textContent ?? "").trim().slice(0, 40)),
      );
    }

    expect(reached).toEqual(expected);
  });

  test("opens a question with the keyboard alone", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto("/");

    const first = page.locator("#faq details").first();
    await first.locator("summary").focus();
    await page.keyboard.press("Enter");

    await expect(first).toHaveAttribute("open", /.*/);
  });

  test("opens the narrow-screen panel with the keyboard alone", async ({ page }) => {
    await page.setViewportSize(NARROW);
    await page.goto("/");

    const panel = page.locator("header details");
    await panel.locator("summary").focus();
    await page.keyboard.press("Enter");

    await expect(panel).toHaveAttribute("open", /.*/);
  });
});

/**
 * 9.5 — the focus indicator, reached the way a keyboard user reaches it.
 *
 * The ring is bound to `:focus-visible`, which a programmatic `element.focus()`
 * does not trigger on a link: the browser only counts it when focus arrived
 * from the keyboard. Measuring after `.focus()` would report "no ring" on a
 * page that rings correctly, so every control here is reached with Tab.
 */
test.describe("focus indicator (9.5)", () => {
  test("rings each of the first controls as it is tabbed to", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto("/");

    const withoutRing: string[] = [];

    for (let index = 0; index < 10; index += 1) {
      await page.keyboard.press("Tab");

      const state = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (el === null || el === document.body) {
          return null;
        }
        const style = getComputedStyle(el);
        return {
          label: (el.textContent ?? "").trim().slice(0, 30),
          width: Number.parseFloat(style.outlineWidth),
          style: style.outlineStyle,
          visible: el.matches(":focus-visible"),
        };
      });

      if (state === null) {
        break;
      }
      if (!state.visible || state.style === "none" || state.width < 2) {
        withoutRing.push(`${state.label} (${state.style} ${state.width}px)`);
      }
    }

    expect(withoutRing, `controls with no visible focus ring: ${withoutRing.join(", ")}`).toEqual(
      [],
    );
  });

  test("does not ring a control that was only clicked", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto("/");

    const summary = page.locator("#faq summary").first();
    await summary.click();

    const ringed = await summary.evaluate((el) => el.matches(":focus-visible"));
    expect(ringed).toBe(false);
  });

  test("differs from the resting state", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto("/");

    const outlineOf = (label: string) =>
      page.evaluate((text) => {
        const el = [...document.querySelectorAll<HTMLElement>("header a")].find((candidate) =>
          (candidate.textContent ?? "").includes(text),
        )!;
        return getComputedStyle(el).outlineStyle;
      }, label);

    const resting = await outlineOf("Audiencia");

    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(
      () => getComputedStyle(document.activeElement as HTMLElement).outlineStyle,
    );

    expect(resting).toBe("none");
    expect(focused).not.toBe("none");
  });
});
