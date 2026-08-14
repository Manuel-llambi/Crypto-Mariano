/**
 * Footer copy, following the finished design.
 *
 * These are pages and addresses, not section anchors — the header owns the
 * in-page navigation. The replica leaves every one of them as `href="#"`, so the
 * paths below are ours: `/privacidad`, `/terminos` and `/acreditaciones` **do
 * not exist yet** and currently land on the 404 page, which at least keeps the
 * visitor oriented. Creating them is outside this landing.
 */
export const footer = {
  description:
    "Especialistas en la detección y prevención de delitos financieros en el ecosistema Web3 para profesionales de alto nivel.",
  columns: [
    {
      title: "Protocolo",
      links: [
        { label: "Privacidad", href: "/privacidad" },
        { label: "Términos", href: "/terminos" },
      ],
    },
    {
      title: "Nodos",
      links: [
        { label: "Acreditaciones", href: "/acreditaciones" },
        { label: "Newsletter", href: "https://cryptocrime.academy/newsletter" },
      ],
    },
  ],
  address: {
    title: "Sede central",
    line: "Sede: Madrid, España / Virtual Global Node",
    emailLabel: "E-mail:",
    email: "contacto@cryptocrime.academy",
  },
  legal: "© 2026 CCA_UNITS. Todos los derechos reservados.",
  notes: ["Transmisión: AES_256_SECURED", "Lex Forensica v.1.2"],
};
