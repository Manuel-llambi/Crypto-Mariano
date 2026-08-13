import type { NavItem } from "@/lib/nav/sections";

/**
 * Header navigation, in document order (1.2).
 *
 * Typing the list as `NavItem[]` is what makes a broken anchor a compile error:
 * `href` only accepts a section that exists in `SECTION_IDS` (1.5).
 */
export const nav: NavItem[] = [
  { label: "Audiencia", href: "#audiencia" },
  { label: "Metodología", href: "#metodologia" },
  { label: "Actualizaciones", href: "#actualizaciones" },
  { label: "Programa", href: "#programa" },
  // The mockup labels this item "Testimonios" while the section delivers figures;
  // the wording is an open question of requirements.md.
  { label: "Testimonios", href: "#confianza" },
  { label: "FAQ", href: "#faq" },
];
