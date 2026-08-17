/**
 * Copy and sample record for the student dashboard.
 *
 * The syllabus is NOT here. `/panel` shows the same seven modules as the
 * landing, read from `content/program.ts`, so the product has one syllabus
 * instead of two that drift apart. What this file adds is the student's
 * position in it.
 *
 * `record` is a fixture, and deliberately so: the screen is a mock. Nothing
 * authenticates, nothing reads a session, and these numbers describe a made-up
 * student called Mariano — the same one the Stitch mockup shows.
 *
 * Note what `record` does not declare: no `EXP-NN` anywhere. The codes are
 * derived from the position in the syllabus (3.1) and this file states a
 * position, never a code. The schema rejects it if it tries.
 *
 * Register is tuteo, closed on 2026-08-13. The mockup wrote the welcome as
 * «usted» («Su expediente… Continúe analizando…»); it is converted here so the
 * panel does not address the visitor differently from the enrolment controls.
 */
export const panel = {
  /** Document title of the screen, before the site name. */
  title: "Panel del alumno",

  student: {
    name: "Mariano",
    statusLabel: "Estado del investigador",
    statusValue: "Activo",
  },

  /**
   * The four destinations of the sidebar.
   *
   * `id` is a key, not an address: the component resolves it against
   * `lib/routes.ts`, and the three screens that do not exist yet render
   * without an `href` rather than as links into a 404.
   */
  nav: [
    { id: "courses", icon: "book", label: "Mis cursos" },
    { id: "resources", icon: "document", label: "Recursos" },
    { id: "certifications", icon: "seal", label: "Certificaciones" },
    { id: "support", icon: "support", label: "Soporte" },
  ],
  settingsLabel: "Ajustes",
  logoutLabel: "Cerrar sesión",

  welcome: {
    eyebrow: "Curso: investigaciones con criptomonedas",
    /** The name is appended by the screen, from `student.name`. */
    greeting: "Bienvenido",
    body: "Tu expediente formativo está activo. Continúa analizando las trazas digitales y documentando la cadena de custodia en el entorno blockchain.",
  },

  continueCard: {
    eyebrow: "Continuar aprendizaje",
    durationLabel: "Duración est.",
    attachmentsLabel: "Archivos adjuntos",
    ctaLabel: "Reanudar",
  },

  progressCard: {
    title: "Progreso del expediente",
    completedLabel: "Completado",
    modulesLabel: "Módulos aprobados",
    hoursLabel: "Horas invertidas",
    hoursSuffix: "h",
  },

  modules: {
    filterLabel: "Filtrar",
    passedBadge: "Completado",
    passedLabel: "Aprobado",
    currentBadge: "En curso",
    lockedBadge: "Bloqueado",
    /** Prefix of «Requiere EXP-NN». The code itself is derived. */
    lockedPrefix: "Requiere",
  },

  /**
   * The made-up student record.
   *
   * `overallPercent` is stated rather than computed: two modules of seven is
   * 28.6%, and the mockup's ring reads 35% because the module in progress
   * counts for part of it. Which part is a product decision nobody has taken,
   * so inventing a formula here would be dressing a guess up as arithmetic.
   */
  record: {
    /** Zero-based position in the syllabus. Everything before it is passed. */
    currentModuleIndex: 2,
    currentModulePercent: 40,
    overallPercent: 35,
    hoursSpent: 12.5,
    estimatedMinutes: 45,
    attachmentCount: 3,
  },
};
