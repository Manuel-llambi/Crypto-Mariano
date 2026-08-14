/**
 * The syllabus.
 *
 * Module codes, module count and total duration are NOT declared here: they are
 * derived from this list (3.1-3.3) and the schema rejects the file if it tries
 * to state them (3.4).
 *
 * `EXP-00` and `EXP-01` carry a placeholder `summary`, which is what turns them
 * into disclosures (4.3). The text is provisional and marked as such: the real
 * copy for what each module reveals is still an open question.
 */
export const program = {
  description:
    "Este curso brinda los fundamentos técnicos del ecosistema de criptomonedas, la metodología para leer e interpretar transacciones y las estrategias de investigación que los profesionales del campo utilizan en casos reales. Está diseñado para abogados, fiscales, oficiales de compliance y profesionales forenses que necesitan comprender, investigar y responder ante actividad delictiva en criptomonedas, sin requerir experiencia técnica previa.",
  modules: [
    {
      status: "available",
      title: "Introducción a las criptomonedas",
      summary:
        "[REVISAR] Qué es un criptoactivo, cómo se registra una transacción y qué queda asentado de forma pública. Descripción provisional del contenido del módulo.",
      videoMinutes: 35,
    },
    {
      status: "available",
      title: "Bitcoin y blockchains basadas en UTXO",
      summary:
        "[REVISAR] El modelo de salidas no gastadas, cómo se encadenan las transacciones y qué revela esa estructura al reconstruir un recorrido. Descripción provisional del contenido del módulo.",
      videoMinutes: 45,
    },
    {
      status: "coming-soon",
      title: "Ethereum, EVM y blockchains basadas en cuenta",
      teaser:
        "[REVISAR] Ethereum, la máquina virtual EVM y las blockchains que llevan saldo por cuenta en lugar del modelo UTXO.",
    },
    {
      status: "coming-soon",
      title: "Trazabilidad e investigación on-chain",
      teaser:
        "[REVISAR] Seguimiento de fondos sobre la cadena: cómo se reconstruye el recorrido de un activo entre direcciones y servicios.",
    },
    {
      status: "coming-soon",
      title: "Métodos de ofuscación",
      teaser:
        "[REVISAR] Las técnicas que se usan para cortar el rastro de los fondos y qué sigue siendo observable pese a ellas.",
    },
    {
      status: "coming-soon",
      title: "Tipologías de crimen y casos reales",
      teaser:
        "[REVISAR] Los patrones de delito que aparecen con criptoactivos y cómo se presentan en casos concretos.",
    },
    {
      status: "coming-soon",
      title: "Marco legal y operativo",
      teaser:
        "[REVISAR] El encuadre normativo del trabajo con criptoactivos y los procedimientos que lo acompañan en la práctica.",
    },
  ],
};
