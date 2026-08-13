import type { NavItem } from "@/lib/nav/sections";

/**
 * Footer copy and links (1.6).
 *
 * `links` are section anchors, the same guarantee the header carries. The
 * newsletter is the one outbound destination, so it is a URL and not an anchor.
 */
export const footer: {
  description: string;
  links: NavItem[];
  newsletter: { label: string; href: string };
  legal: string;
} = {
  description:
    "[REVISAR] Descripción del pie pendiente de leer del mockup (nodo 23:396).",
  links: [
    { label: "Programa", href: "#programa" },
    { label: "Audiencia", href: "#audiencia" },
    { label: "FAQ", href: "#faq" },
  ],
  newsletter: {
    label: "Newsletter",
    href: "https://cryptocrime.academy/newsletter",
  },
  legal: "© 2026 Crypto Crime Academy",
};
