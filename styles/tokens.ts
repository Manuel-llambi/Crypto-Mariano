/**
 * The visual foundation, declared once (9.4).
 *
 * `styles/tokens.css` is derived from this module and a test asserts the two
 * never drift. Declaring the values here is what makes the contrast of every
 * token measurable instead of a claim in a document.
 *
 * The Figma file defines no variables, so every value below was read off the
 * mockup by hand — except the two colours design.md corrected.
 */
export const COLOR_TOKENS = {
  /** Headings, buttons, the visual panel of the hero. */
  "--navy": "#16213c",
  /** Borders, rules and decoration. Never text: as text it is 4.16:1 (fails). */
  "--gold-line": "#98773e",
  /** `EXP·NN` codes and status labels. The corrected gold. */
  "--gold-text": "#7d6234",
  /** Body copy. The corrected grey: the mockup's #76777e was 4.46:1 (fails). */
  "--grey-text": "#616267",
  /** Card and hero background. */
  "--white": "#ffffff",
  /** Alternating section background, read off the audience section of the mockup. */
  "--cream": "#f8f7f4",
  /**
   * The hairline that groups the disclosure cards. Decoration, not an interface
   * element: at 1.70:1 on white it would never reach 3:1, and design.md settles
   * that it does not have to — the control is identified by its text and its
   * chevron, never by this rule.
   */
  "--rule": "#c6c6ce",
} as const;

/**
 * The three families of the design, loaded from `@fontsource` in `app/layout.tsx`.
 *
 * The fallbacks are not decoration: until the font files arrive the page paints
 * with them, and for a long stretch of this project they were all the page ever
 * used, because the families were declared here and nothing loaded them.
 */
export const TYPOGRAPHY_TOKENS = {
  "--font-sans": "'IBM Plex Sans', system-ui, sans-serif",
  "--font-mono": "'IBM Plex Mono', ui-monospace, monospace",
  "--font-serif": "'Source Serif 4', Georgia, serif",
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
  "--radius": "4px",
} as const;

export const TOKENS = {
  ...COLOR_TOKENS,
  ...TYPOGRAPHY_TOKENS,
  ...SPACE_TOKENS,
};

export type ColorToken = keyof typeof COLOR_TOKENS;

/** Used as text, so 9.4 asks them for 4.5:1. */
export const TEXT_TOKENS = ["--navy", "--gold-text", "--grey-text"] as const satisfies ColorToken[];

/** Used as interface element or decoration, so 9.4 asks them for 3:1. */
export const UI_TOKENS = ["--gold-line"] as const satisfies ColorToken[];

/** The surfaces the other tokens are measured against. */
export const BACKGROUND_TOKENS = ["--white", "--cream"] as const satisfies ColorToken[];

/**
 * Decoration: 9.4 sets no threshold because nothing is identified by these.
 *
 * A token only belongs here if losing it entirely would cost the visitor no
 * information. Anything that signals state or affordance is a UI token.
 */
export const DECORATION_TOKENS = ["--rule"] as const satisfies ColorToken[];

/**
 * The two mockup colours design.md rejected as text.
 *
 * They stay listed so the test can prove they never come back: neither reaches
 * 4.5:1 on white or on cream.
 */
export const REJECTED_AS_TEXT = ["#98773e", "#76777e"] as const;
