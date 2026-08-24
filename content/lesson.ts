/**
 * Copy and sample lessons for the lesson viewer.
 *
 * The syllabus is NOT here. This screen shows the same seven modules as the
 * landing and the dashboard, read from `content/program.ts`; `moduleLessons`
 * only hangs lessons off them, aligned by position — index 0 is EXP-00, index 1
 * is EXP-01, and the five announced modules carry an empty list because a module
 * nobody can open has nothing to open.
 *
 * Note what it does not declare: no `EXP-NN` and no `LEC-NN` anywhere. Both are
 * derived from the position, two digits, the same rule the syllabus follows.
 *
 * `record` is a fixture, like the dashboard's: nothing is stored per student
 * yet. It describes the account `content/panel.ts` already describes — just
 * opened, standing on the first lesson of the first module, nothing watched.
 * The mockup's half-finished student can be restored by moving the numbers;
 * every branch below still exists for it.
 *
 * The lesson bodies are provisional and marked as such. The instructor of the
 * mockup's note is a placeholder, not a person: this audience weighs evidence
 * for a living, and a name that cannot answer for itself is a credibility risk.
 *
 * Register is tuteo, closed on 2026-08-13.
 */
export const lesson = {
  /** Document title of the screen, before the lesson title. */
  title: "Lección",

  /** The way back to the dashboard, in the top bar. */
  panelLabel: "Mi panel",

  outline: {
    progressLabel: "Progreso del curso",
    /** Tail of «0/8 lecciones». */
    lessonsSuffix: "lecciones",
    /** Tail of «2/4 completadas», on each module header. */
    completedSuffix: "completadas",
    /** The tree is a navigation landmark, and landmarks need names. */
    ariaLabel: "Temario del curso",
  },

  /** What the student's position is called, wherever it is named. */
  states: {
    passed: "Completado",
    current: "En curso",
    upcoming: "Disponible",
    locked: "Bloqueado",
  },

  player: {
    /** The inert play control is the only one carrying a visible name. */
    playLabel: "Reproducir",
    posterAlt: "[REVISAR] Fotograma de la lección",
  },

  header: {
    /** «Lección 3 de 4» is built from these two around the numbers. */
    positionLabel: "Lección",
    positionJoiner: "de",
    updatedLabel: "Actualizado",
    previousLabel: "Anterior",
    nextLabel: "Siguiente",
  },

  notes: {
    /** The two views of the right rail, switched by `?vista=`. */
    contentView: "Contenido",
    resourcesView: "Recursos",
    descriptionTitle: "Descripción",
    keyPointsTitle: "Puntos clave",
    noteTitle: "Nota del instructor",
    toolsTitle: "Herramientas mencionadas",
    filesTitle: "Archivos descargables",
    /** The resources view admits it is empty rather than inventing files. */
    filesEmpty:
      "[REVISAR] Todavía no hay archivos publicados para esta lección. El material de práctica se sube junto con el video.",
  },

  /**
   * Lessons per module, aligned to the syllabus by position.
   *
   * The two published modules carry four lessons each; the five announced ones
   * carry none. Adding lessons here does not open a module: the screen reads the
   * status from the syllabus, never from the length of this list.
   */
  moduleLessons: [
    [
      {
        title: "Qué es un criptoactivo",
        duration: "08:12",
        summary:
          "[REVISAR] Qué se registra cuando alguien transfiere un criptoactivo, quién guarda ese registro y por qué queda a la vista de cualquiera. Descripción provisional del contenido de la lección.",
        keyPoints: [
          "[REVISAR] Qué queda asentado y qué no",
          "[REVISAR] Por qué el registro es público",
          "[REVISAR] Dirección, billetera y titular no son lo mismo",
        ],
        updatedOn: "2026-08-21",
      },
      {
        title: "Cómo se registra una transacción",
        duration: "09:45",
        summary:
          "[REVISAR] El recorrido de una transferencia desde que se firma hasta que queda confirmada, y qué evidencia deja cada paso. Descripción provisional del contenido de la lección.",
        keyPoints: [
          "[REVISAR] Firma, difusión y confirmación",
          "[REVISAR] Qué significa una confirmación y cuántas alcanzan",
          "[REVISAR] Marcas de tiempo y su valor probatorio",
        ],
        instructorNote: {
          text: "[REVISAR] Conviene detenerse en la diferencia entre una transacción difundida y una confirmada: es la distinción que más se malinterpreta al redactar un informe.",
          author: "[REVISAR] Instructor por confirmar",
        },
        updatedOn: "2026-08-21",
      },
      {
        title: "Leer un explorador de bloques",
        duration: "07:33",
        summary:
          "[REVISAR] Recorrido guiado por un explorador público: dónde está cada dato, cuál es interpretación del explorador y cuál viene de la cadena. Descripción provisional del contenido de la lección.",
        keyPoints: [
          "[REVISAR] Qué campos vienen de la cadena",
          "[REVISAR] Qué campos son interpretación del explorador",
          "[REVISAR] Cómo citar lo que se ve en pantalla",
        ],
        tools: ["Explorador público", "Captura con sello de tiempo"],
        updatedOn: "2026-08-21",
      },
      {
        title: "Qué queda asentado de forma pública",
        duration: "09:30",
        summary:
          "[REVISAR] El límite entre lo que la cadena revela y lo que hay que probar por otros medios. Descripción provisional del contenido de la lección.",
        keyPoints: [
          "[REVISAR] Seudonimato no es anonimato",
          "[REVISAR] Qué hace falta para atribuir una dirección",
          "[REVISAR] Dónde termina la prueba técnica",
        ],
        updatedOn: "2026-08-21",
      },
    ],
    [
      {
        title: "El modelo de salidas no gastadas",
        duration: "11:20",
        summary:
          "[REVISAR] Cómo Bitcoin representa el saldo sin llevar cuentas, y qué implica eso al reconstruir un recorrido. Descripción provisional del contenido de la lección.",
        keyPoints: [
          "[REVISAR] Entradas, salidas y vuelto",
          "[REVISAR] Por qué no hay saldo por dirección",
          "[REVISAR] Qué revela el vuelto sobre quién gasta",
        ],
        updatedOn: "2026-08-21",
      },
      {
        title: "Cómo se encadenan las transacciones",
        duration: "12:05",
        summary:
          "[REVISAR] El grafo que forman las salidas al gastarse, y cómo se lo recorre hacia atrás y hacia adelante. Descripción provisional del contenido de la lección.",
        keyPoints: [
          "[REVISAR] Recorrido hacia atrás desde una salida",
          "[REVISAR] Ramificación y reagrupamiento",
          "[REVISAR] Dónde se pierde el rastro y por qué",
        ],
        tools: ["Explorador público", "Planilla de trazado"],
        updatedOn: "2026-08-21",
      },
      {
        title: "Heurísticas de agrupamiento",
        duration: "10:50",
        summary:
          "[REVISAR] Las reglas que permiten atribuir varias direcciones a un mismo control, y qué las invalida. Descripción provisional del contenido de la lección.",
        keyPoints: [
          "[REVISAR] Co-gasto y sus límites",
          "[REVISAR] Detección del vuelto",
          "[REVISAR] Qué convierte una heurística en un supuesto frágil",
        ],
        instructorNote: {
          text: "[REVISAR] Una heurística que no se explicita en el informe es un supuesto oculto. Conviene declarar cuál se usó y qué la haría fallar antes de firmar.",
          author: "[REVISAR] Instructor por confirmar",
        },
        tools: ["Planilla de trazado", "Marco OSINT"],
        updatedOn: "2026-08-21",
      },
      {
        title: "Documentar un recorrido",
        duration: "10:45",
        summary:
          "[REVISAR] Cómo se pasa de la pantalla al expediente: qué se captura, cómo se sella y qué debe poder reproducir un tercero. Descripción provisional del contenido de la lección.",
        keyPoints: [
          "[REVISAR] Qué hace reproducible un recorrido",
          "[REVISAR] Cadena de custodia de una captura",
          "[REVISAR] Formato de exportación admisible",
        ],
        tools: ["Captura con sello de tiempo", "Planilla de trazado"],
        updatedOn: "2026-08-21",
      },
    ],
    [],
    [],
    [],
    [],
    [],
  ],

  /**
   * Where the student stands, at lesson resolution.
   *
   * The same account `content/panel.ts` describes: `moduleIndex: 0` plus
   * `lessonIndex: 0` plus nothing watched. Those zeros are what make the first
   * lesson «en curso» and everything after it pending, and they are the only
   * difference between this and a student halfway through.
   *
   * `playedPercent` is the width of the bar under the poster and `elapsed` the
   * figure beside it. Both are decorative while the controls are inert: there is
   * no video file, so there is nothing they could measure.
   */
  record: {
    moduleIndex: 0,
    lessonIndex: 0,
    playedPercent: 0,
    elapsed: "00:00",
  },
};
