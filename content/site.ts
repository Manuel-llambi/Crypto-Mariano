/**
 * Site-wide copy: document metadata, the hero and the closing call to action.
 *
 * `enrollLabel` is the enrolment wording, shared by the header, the syllabus and
 * the closing block — the three controls 6.6 requires to agree.
 *
 * The hero is deliberately **not** one of them: in the finished design its
 * button reads «Explorar curso» and points at the syllabus, which is a different
 * invitation. `heroCtaLabel` is separate for that reason.
 */
export const site = {
  name: "Crypto Crime Academy",
  title: "Crypto Crime Academy — Investigación de criptoactivos",
  description:
    "Curso de investigación de criptoactivos para fuerzas del orden, profesionales legales, equipos de cumplimiento e investigadores forenses.",
  canonicalUrl: "https://cryptocrime.academy",
  ogImage: "/og.png",
  enrollLabel: "Inscríbete",
  loginLabel: "Iniciar sesión",
  hero: {
    eyebrow: "Lex Forensica",
    headline: "Excelencia en investigación de criptoactivos",
    subheadline:
      "Capacitación técnica continua para profesionales de justicia, seguridad y compliance en el rastreo y análisis de delitos financieros digitales.",
    ctaLabel: "Explorar curso",
    imageAlt: "Panel de análisis forense de transacciones en cadena",
  },
  finalCta: {
    eyebrow: "SESSION_INITIALIZE_REQUEST",
    headline: "Comience a desarrollar sus habilidades de investigación criptográfica.",
    body: "Únase a miles de profesionales que ya están asegurando condenas con evidencia de blockchain.",
    ctaLabel: "Inscríbete",
    footnote: "Seguridad de datos: entorno de entrenamiento certificado AES-256",
  },
};
