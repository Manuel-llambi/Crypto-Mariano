/**
 * Trust seals and headline figures (2.4).
 *
 * Copy taken from the finished design. The figures still have no source behind
 * them: «5,000+» and «120+» are claims the design makes, not measurements this
 * project can vouch for. With an audience that evaluates evidence professionally,
 * they remain a launch question.
 */
export const socialProof = {
  title: "Cuentan con la confianza de instituciones en todo el mundo",
  description:
    "Nuestras metodologías son el estándar para unidades en jurisdicciones federales, estatales e internacionales.",
  seals: [
    { icon: "seal-doj", name: "Afiliados al DOJ", detail: "Departamento de Justicia" },
    { icon: "seal-interpol", name: "Socios de Interpol", detail: "Cooperación internacional" },
    { icon: "seal-banks", name: "Bancos globales", detail: "Instituciones financieras" },
  ],
  metrics: [
    { value: "5,000+", label: "Investigadores capacitados" },
    { value: "120+", label: "Agencias representadas" },
  ],
};
