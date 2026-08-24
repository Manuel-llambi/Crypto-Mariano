/**
 * The visual foundation, declared once (9.4).
 *
 * `styles/tokens.css` is derived from this module and a test asserts the two
 * never drift. Declaring the values here is what makes the contrast of every
 * token measurable instead of a claim in a document.
 *
 * The names are Material's, as `DESIGN_SYSTEM.md` §3 settles: a role and the
 * surface it is read on, rather than the colour itself. `--navy` said what the
 * value looked like; `--color-primary` says what it is for, and
 * `--color-on-primary` says where it may be read. That pairing is the whole
 * reason the contrast test below could stop measuring every colour against
 * every surface.
 *
 * The Figma file defines no variables, so the values still come from the
 * mockup, read by hand — except the two colours design.md corrected and
 * `--color-error`, which has no origin in the design at all: the Stitch screens
 * are inert mock-ups with no error state. It was picked to clear 4.5:1 on every
 * light surface and measured here.
 */
export const COLOR_TOKENS = {
  /** Headings, solid buttons, the visual panel of the hero. */
  "--color-primary": "#16213c",
  /** The only thing legible on `--color-primary` and `--color-ink`. */
  "--color-on-primary": "#ffffff",
  /** Metadata and secondary copy where `--color-on-surface-variant` reads flat. */
  "--color-secondary": "#586474",
  /** Rules, eyebrow underlines, the focus ring. Never text: 3.89:1 on paper. */
  "--color-tertiary": "#98773e",
  /** `EXP·NN` codes and status labels. The corrected gold, 5.34:1 on paper. */
  "--color-on-tertiary": "#7d6234",
  /** Paper. The base surface of every page — §6 forbids painting it white. */
  "--color-background": "#f8f7f4",
  /** Body copy on paper. */
  "--color-on-background": "#1a1c1a",
  /** Cards, inputs and containers — the only places white is allowed. */
  "--color-surface": "#ffffff",
  /** Body copy inside a card. */
  "--color-on-surface": "#1a1c1a",
  /** The corrected grey: the mockup's #76777e was 4.46:1 and failed. */
  "--color-on-surface-variant": "#616267",
  /**
   * The hairline that groups cards and rows.
   *
   * Decoration, not an interface element: at 1.70:1 on white it would never
   * reach 3:1, and design.md settles that it does not have to — a disclosure is
   * identified by its text and its chevron, never by this rule. An input
   * *boundary* carried by this token alone would be a different claim, and a
   * weaker one; `components/ui/Field.module.css` says what it does instead.
   */
  "--color-outline": "#c6c6ce",
  /** Divisions inside a container, one step quieter than `--color-outline`. */
  "--color-outline-variant": "#e3e2df",
  /**
   * A rejected sign-in attempt (2.1).
   *
   * `#ba1a1a` and no longer `#b3261e`: DESIGN_SYSTEM.md §5.3 settles the value.
   * Measured on paper and not on white — the message lives inside the card, the
   * card sits on paper, and paper is the darker of the two, so it is the
   * demanding one. 6.03:1 there, 6.46:1 on white.
   */
  "--color-error": "#ba1a1a",
  /** The only thing legible on `--color-error`. */
  "--color-on-error": "#ffffff",
  /** A non-blocking notice, where a solid red would overstate the problem. */
  "--color-error-container": "#ffdad6",
  /** Copy on `--color-error-container`. */
  "--color-on-error-container": "#93000a",
  /** A darker `--color-primary`, for a header that bleeds to both edges. */
  "--color-ink": "#151b28",
  /** A warmer `--color-surface`, for a block nested inside another. */
  "--color-parchment": "#f1e9dc",
} as const;

/**
 * The three families of the design, loaded by `app/layout.tsx`.
 *
 * The fallbacks are not decoration: until the font files arrive the page paints
 * with them, and for a long stretch of this project they were all the page ever
 * used, because the families were declared here and nothing loaded them.
 *
 * The families come from the layout, never named literally here.
 *
 * Each `--font-*-face` variable is emitted by `next/font/local` and already
 * resolves to the real typeface followed by a fallback carrying `size-adjust`
 * and the ascent/descent overrides measured from the font file. Writing
 * `'IBM Plex Sans', system-ui` instead would render the same letters and
 * quietly drop that adjusted fallback, which is the whole point of loading
 * them through `next/font` — so `app/fonts.test.ts` fails if a family name
 * reappears in this block.
 *
 * The generic that follows is a last resort, for the case where the variable
 * itself is missing: a stray render outside the layout, or the stylesheet
 * loaded on its own in a test.
 *
 * `--font-serif` is a resource, not a default: DESIGN_SYSTEM.md §5.1 settles
 * every headline on the sans, including the one on `AccessScreen` that used to
 * be set in the serif.
 */
export const TYPOGRAPHY_TOKENS = {
  "--font-sans": "var(--font-sans-face), system-ui, sans-serif",
  "--font-mono": "var(--font-mono-face), ui-monospace, monospace",
  "--font-serif": "var(--font-serif-face), Georgia, serif",
} as const;

/**
 * Spacing.
 *
 * The mockup only exists at 1280px, so its values are the **upper** bound of
 * each clamp; the lower bound is what keeps a 320px screen from spending its
 * width on margins (7.8). Being continuous, these also avoid a jump at any
 * breakpoint — no media query redefines them.
 */
export const SPACE_TOKENS = {
  /**
   * The widest the content ever gets: the content width of the 1280px mockup,
   * once its 64px margins are taken off.
   */
  "--content-max": "1152px",
  /**
   * The header runs wider than the content on purpose.
   *
   * Its brand sits left and its access controls right, so pulling them in to the
   * content column left the bar looking narrower than the page. Eighty pixels of
   * extra room is enough to reach past the text without losing the centring.
   */
  "--nav-max": "1232px",
  /** The breathing room a narrow screen needs, before any centring. */
  "--section-inset": "clamp(1.25rem, 5vw, 4rem)",
  /**
   * Horizontal padding for every full-bleed block.
   *
   * `max()` of the inset and half the leftover width: below 1152px it is just
   * the inset and nothing changes, above it the padding grows so the content
   * stays 1152px wide and centred. Done as padding rather than a wrapper with
   * `max-inline-size`, so the section keeps painting its background edge to
   * edge — the margins grow, the colour does not stop.
   */
  "--section-inline": "max(var(--section-inset), (100% - var(--content-max)) / 2)",
  "--section-block": "clamp(3rem, 8vw, 6rem)",
  "--card-padding": "clamp(1.5rem, 4vw, 2.5rem)",
  "--row-padding": "clamp(1.25rem, 3vw, 2rem)",
  /**
   * Height of the fixed header.
   *
   * It is a token because two unrelated rules must agree on it: the header
   * reserves it, and `scroll-padding` on the document subtracts it so an anchor
   * target does not land underneath (1.3). Two hardcoded numbers would drift.
   */
  "--header-height": "4.5rem",
  "--row-gap": "16px",
  "--label-inline": "9px",
  "--label-block": "3px",
  /**
   * One button measurement for the whole site (DESIGN_SYSTEM.md §5.2).
   *
   * It is a token for the same reason `--header-height` is: four unrelated
   * stylesheets — the nav, the hero, the sign-in card and the panel — have to
   * agree on it, and before this they did not. Typed in at each call site they
   * had already drifted to `8px 24px` and `16px 6px`.
   */
  "--button-padding-block": "14px",
  "--button-padding-inline": "32px",
  /**
   * One radius for the whole site.
   *
   * DESIGN_SYSTEM.md §3 keeps it flat on purpose: the original brief proposed an
   * `sm/md/lg/xl` scale and no screen ever needed a second value, so the scale
   * would have been four names for one number.
   */
  "--radius": "4px",
} as const;

/**
 * Motion.
 *
 * Two durations, not one. A colour swapping under the pointer has no distance
 * to cover and reads as lag past roughly 150ms; anything that actually moves —
 * the chevron of a disclosure, a card lifting — needs longer to be legible.
 * Copying a single duration onto every transition is the usual way this goes
 * wrong, so the two tiers are named rather than typed in at each call site.
 *
 * The curve leaves fast and settles slowly, which is what makes a hover state
 * feel like an answer instead of an animation. Reduced motion does not scale
 * these down: `styles/global.css` removes the transitions outright.
 */
export const MOTION_TOKENS = {
  /** Colour, border and opacity feedback directly under the pointer. */
  "--duration-fast": "120ms",
  /** Anything that changes geometry: transforms, shadows, revealed rules. */
  "--duration-base": "200ms",
  "--ease-out": "cubic-bezier(0.2, 0, 0, 1)",
} as const;

export const TOKENS = {
  ...COLOR_TOKENS,
  ...TYPOGRAPHY_TOKENS,
  ...SPACE_TOKENS,
  ...MOTION_TOKENS,
};

export type ColorToken = keyof typeof COLOR_TOKENS;

/** A foreground token and the surface it is read on. */
export type ContrastPair = readonly [foreground: ColorToken, surface: ColorToken];

/**
 * The surfaces a page may paint, light first.
 *
 * They are listed so the closure test can prove no colour was left unassigned,
 * and so `DECORATION_EXEMPT_ON` has something to point at.
 */
export const LIGHT_SURFACES = [
  "--color-background",
  "--color-surface",
  "--color-parchment",
  "--color-error-container",
] as const satisfies ColorToken[];

export const DARK_SURFACES = [
  "--color-primary",
  "--color-ink",
  "--color-error",
] as const satisfies ColorToken[];

/**
 * Every pair 9.4 asks 4.5:1 of, written out.
 *
 * This used to be a cross product: four text tokens against two backgrounds,
 * every combination required to clear the threshold. Material naming makes that
 * model unusable, and it is worth saying why rather than quietly dropping it.
 * `--color-on-primary` is white; as text on paper it is 1.07:1. It is not a
 * broken token — it is a token that names its surface, and it only ever appears
 * on `--color-primary` (15.95:1) or `--color-ink` (17.22:1). A cross product
 * cannot express that, so the pairs are enumerated. The cost is that adding a
 * colour means adding its pairs by hand; the closure test is what makes
 * forgetting fail loudly instead of silently shrinking the coverage.
 */
export const TEXT_PAIRS = [
  ["--color-primary", "--color-background"],
  ["--color-primary", "--color-surface"],
  ["--color-primary", "--color-parchment"],
  ["--color-primary", "--color-error-container"],
  ["--color-on-background", "--color-background"],
  ["--color-on-surface", "--color-surface"],
  ["--color-on-surface", "--color-parchment"],
  ["--color-secondary", "--color-background"],
  ["--color-secondary", "--color-surface"],
  ["--color-secondary", "--color-parchment"],
  // The corrected gold is not paired with `--color-error-container`: it lands at
  // 4.43:1 there, just under. Nothing puts it on that surface today, and the
  // omission is what keeps anything from starting to.
  ["--color-on-tertiary", "--color-background"],
  ["--color-on-tertiary", "--color-surface"],
  ["--color-on-tertiary", "--color-parchment"],
  ["--color-on-surface-variant", "--color-background"],
  ["--color-on-surface-variant", "--color-surface"],
  ["--color-on-surface-variant", "--color-parchment"],
  ["--color-error", "--color-background"],
  ["--color-error", "--color-surface"],
  ["--color-on-error-container", "--color-error-container"],
  ["--color-on-primary", "--color-primary"],
  ["--color-on-primary", "--color-ink"],
  ["--color-on-error", "--color-error"],
] as const satisfies ContrastPair[];

/**
 * Every pair 9.4 asks 3:1 of: an interface element, not a letter.
 *
 * The accent carries the focus ring, so it has to hold on the dark surfaces too
 * — a ring that vanishes over the hero panel is a ring that is not there.
 */
export const UI_PAIRS = [
  ["--color-tertiary", "--color-background"],
  ["--color-tertiary", "--color-surface"],
  ["--color-tertiary", "--color-parchment"],
  ["--color-tertiary", "--color-primary"],
  ["--color-tertiary", "--color-ink"],
] as const satisfies ContrastPair[];

/**
 * Decoration: 9.4 sets no threshold because nothing is identified by these.
 *
 * A token only belongs here if losing it entirely would cost the visitor no
 * information. Anything that signals state or affordance is a UI token.
 */
export const DECORATION_TOKENS = [
  "--color-outline",
  "--color-outline-variant",
] as const satisfies ColorToken[];

/**
 * The surfaces the decoration exemption is measured on.
 *
 * Light only, and deliberately: both hairlines are pale, so on `--color-ink`
 * they are high contrast (10.15:1) rather than low. Asserting they stay under
 * 3:1 everywhere would be asserting they are never used on a dark surface,
 * which is a layout claim this module has no way to check.
 */
export const DECORATION_EXEMPT_ON = LIGHT_SURFACES;

/**
 * The two mockup colours design.md rejected as text.
 *
 * They stay listed so the test can prove they never come back: neither reaches
 * 4.5:1 on any light surface. `#98773e` survives as `--color-tertiary`, which is
 * exactly the point — the value is fine, reading words in it is not.
 */
export const REJECTED_AS_TEXT = ["#98773e", "#76777e"] as const;
