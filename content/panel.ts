/**
 * Copy and sample record for the student dashboard.
 *
 * The syllabus is NOT here. `/panel` shows the same seven modules as the
 * landing, read from `content/program.ts`, so the product has one syllabus
 * instead of two that drift apart. What this file adds is the student's
 * position in it.
 *
 * `record` is a fixture, and deliberately so: nothing here is stored per user.
 * `/panel` is guarded — the session decides who may look — but not personalised,
 * so the same numbers reach everyone. They describe an account that has just
 * been opened: nothing done, first module available, the rest locked. The
 * mockup's half-finished student (index 2, 35%) can be restored by editing the
 * record; every branch below still exists for it.
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
    /** Replaces `body` while the record shows no progress at all. */
    startBody:
      "Tu expediente formativo está activo. Empieza por el primer módulo para aprender a seguir las trazas digitales y a documentar la cadena de custodia en el entorno blockchain.",
  },

  /**
   * Both branches of the card, chosen by `derivePanel`'s `started`.
   *
   * Telling a student to «reanudar» a course they have not opened is a claim
   * the record contradicts, so the copy has a second half rather than one
   * wording that has to fit every case.
   */
  continueCard: {
    eyebrow: "Continuar aprendizaje",
    startEyebrow: "Comenzar aprendizaje",
    durationLabel: "Duración est.",
    attachmentsLabel: "Archivos adjuntos",
    ctaLabel: "Reanudar",
    startCtaLabel: "Comenzar",
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
    /** The module the student may open and has not: neither locked nor begun. */
    availableBadge: "Disponible",
    availableLabel: "Sin comenzar",
    lockedBadge: "Bloqueado",
    /** Prefix of «Requiere EXP-NN». The code itself is derived. */
    lockedPrefix: "Requiere",
  },

  /**
   * The student record, describing an account that has just been opened.
   *
   * Every zero here is load-bearing: `currentModuleIndex: 0` puts the student
   * on the first module, and `currentModulePercent: 0` says none of it is done,
   * which is what makes `derivePanel` call that module «disponible» instead of
   * «en curso» and the card offer «Comenzar» instead of «Reanudar».
   *
   * `overallPercent` stays stated rather than computed. It is zero now and the
   * arithmetic would agree, but the moment the student advances the two part
   * ways: two modules of seven is 28.6%, and the mockup's ring read 35% because
   * the module in progress counted for part of it. Which part is a product
   * decision nobody has taken, so a formula here would dress a guess up as
   * arithmetic.
   *
   * `estimatedMinutes` is the length of the module the card shows — EXP-00,
   * 35 minutes. The schema forbids zero, and rightly: a module that lasts no
   * time is a content mistake, not a starting state.
   */
  record: {
    /** Zero-based position in the syllabus. Everything before it is passed. */
    currentModuleIndex: 0,
    currentModulePercent: 0,
    overallPercent: 0,
    hoursSpent: 0,
    estimatedMinutes: 35,
    attachmentCount: 3,
  },
};
