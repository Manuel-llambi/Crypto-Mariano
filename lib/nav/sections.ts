/**
 * Every navigable section of the page, in document order (1.2).
 *
 * `as const` is what makes this tuple the single source of truth: `SectionId`
 * and `Anchor` are derived from it, so adding or renaming a section here is the
 * only edit needed — and a link to a section that is not in this list stops
 * compiling (1.5).
 */
export const SECTION_IDS = [
  "audiencia",
  "metodologia",
  "actualizaciones",
  "programa",
  "confianza",
  "faq",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

/** A fragment link that is guaranteed to have a destination on the page (1.5). */
export type Anchor = `#${SectionId}`;

/** The navigation items of the header and the footer. */
export interface NavItem {
  label: string;
  href: Anchor;
}
