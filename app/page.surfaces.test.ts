import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * The alternation of the page surfaces.
 *
 * This is the one property of the landing that no file owns. The order lives in
 * `app/page.tsx`, and each fill lives in a different stylesheet, so the rhythm
 * only exists in the gap between nine files — which is exactly the kind of thing
 * that survives until somebody reorders a section and nobody notices that two
 * white blocks now sit against each other.
 *
 * It reads the sources rather than the DOM on purpose. A CSS module resolves to
 * class names under jsdom and carries no declarations, so a rendered page cannot
 * be asked what colour it is. The stylesheet can.
 */

const page = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");

/** The section components of `<main>`, in the order the page composes them. */
function sectionsOfMain(): string[] {
  const main = /<main>([\s\S]*?)<\/main>/.exec(page);
  if (main === null) {
    throw new Error("app/page.tsx renders no <main>");
  }
  return [...main[1]!.matchAll(/<([A-Z]\w+)/g)].map((match) => match[1]!);
}

/** The token a section paints its full-bleed ground with. */
function groundOf(component: string): string {
  const url = new URL(`../components/sections/${component}.module.css`, import.meta.url);
  const module = readFileSync(url, "utf8");

  const rule = /\.section\s*\{([^}]*)\}/.exec(module);
  if (rule === null) {
    throw new Error(`${component}.module.css declares no .section rule`);
  }

  const background = /background:\s*var\((--[\w-]+)\)/.exec(rule[1]!);
  if (background === null) {
    throw new Error(`${component}.module.css paints no ground on .section`);
  }
  return background[1]!;
}

/**
 * The two page grounds, and the one section that is neither.
 *
 * `FinalCta` paints itself navy, so it stands outside the alternation instead of
 * breaking it: the colour change is already doing the separating there.
 */
const ALTERNATING = ["--color-surface", "--color-background"] as const;
const OWN_GROUND = "--color-primary";

describe("the landing alternates its section grounds", () => {
  it("composes the sections it is expected to", () => {
    // Fails loudly if a section is added or removed, rather than letting the
    // alternation below silently re-index around it.
    expect(sectionsOfMain()).toEqual([
      "Hero",
      "AudienceSection",
      "MethodologySection",
      "UpdatesSection",
      "ProgramSection",
      "SocialProofSection",
      "FaqSection",
      "FinalCta",
    ]);
  });

  it("gives every section a ground drawn from the tokens", () => {
    for (const component of sectionsOfMain()) {
      expect([...ALTERNATING, OWN_GROUND]).toContain(groundOf(component));
    }
  });

  it("opens on white, as the hero is meant to", () => {
    expect(groundOf(sectionsOfMain()[0]!)).toBe("--color-surface");
  });

  it("never repeats a ground twice in a row", () => {
    const grounds = sectionsOfMain()
      .map(groundOf)
      .filter((ground) => ground !== OWN_GROUND);

    for (const [index, ground] of grounds.entries()) {
      expect(ground).toBe(ALTERNATING[index % 2]);
    }
  });
});
