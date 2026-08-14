import type { NavItem } from "@/lib/nav/sections";

/**
 * Footer copy and links (1.6).
 *
 * `links` are section anchors, the same guarantee the header carries. The
 * newsletter is the one outbound destination, so it is a URL and not an anchor.
 *
 * **Known divergence from the design:** the finished layout groups page links —
 * Privacidad, Términos, Acreditaciones — under three headed columns. The schema
 * only admits anchors (`NavItem[]`), by the design decision recorded in T5, so
 * closing that gap is a change to `design.md` and the schema rather than to this
 * file.
 */
export const footer: {
  description: string;
  links: NavItem[];
  newsletter: { label: string; href: string };
  legal: string;
} = {
  description:
    "Especialistas en la detección y prevención de delitos financieros en el ecosistema Web3 para profesionales de alto nivel.",
  links: [
    { label: "Programa", href: "#programa" },
    { label: "Audiencia", href: "#audiencia" },
    { label: "FAQ", href: "#faq" },
  ],
  newsletter: {
    label: "Newsletter",
    href: "https://cryptocrime.academy/newsletter",
  },
  legal: "© 2026 CCA_UNITS. Todos los derechos reservados.",
};
