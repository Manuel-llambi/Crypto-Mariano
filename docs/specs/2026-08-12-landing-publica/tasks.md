# Tareas — Landing pública de Crypto Crime Academy

**Estado:** Borrador
**Fecha:** 2026-08-12
**Requisitos:** ./requirements.md
**Diseño:** ./design.md

Cada tarea es un solo ciclo TDD: un test que falla → la implementación más
chica que lo hace pasar → verificación. La verificación de toda tarea es
`npm run typecheck && npm test`; las tareas T22 a T27 agregan `npm run test:e2e`.

## Resumen de tareas

| ID | Tarea | Requisitos | Estado |
|----|-------|------------|--------|
| T1 | Andamiaje del proyecto y formateo de duración | 3.6 | [x] Hecha |
| T2 | Formateo de mes a partir de fecha ISO | 2.6 | [x] Hecha |
| T3 | Derivación del programa (`deriveProgram`) | 3.1, 3.2, 3.3, 3.5, 3.6, 4.8 | [x] Hecha |
| T4 | Esquemas de módulo y programa | 2.5, 2.8, 3.4, 4.1, 4.6, 4.7 | [x] Hecha |
| T5 | Esquemas del resto del contenido | 2.4, 2.5, 2.6, 2.8, 5.3 | [x] Hecha |
| T6 | Archivos de contenido y carga validada | 2.1, 2.2, 2.3, 2.7 | [x] Hecha |
| T7 | Identificadores de sección y tipo de ancla | 1.2, 1.5 | [x] Hecha |
| T8 | URL de la pantalla de acceso (`accessUrl`) | 6.1, 6.2, 6.4, 6.5, 6.7 | [x] Hecha |
| T9 | Tokens visuales y verificación de contraste | 9.4 | [x] Hecha |
| T10 | Componente `Disclosure` | 4.3, 4.4, 5.1, 8.1 | [x] Hecha |
| T11 | `ProgramSection` — temario con dos ramas | 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 4.8 | [x] Hecha |
| T12 | `FaqSection` — preguntas desplegables | 5.1, 5.2 | [x] Hecha |
| T13 | `Hero` y `FinalCta` — controles de inscripción | 6.1, 6.3 | [x] Hecha |
| T14 | `UpdatesSection` — actualizaciones fechadas | 2.6, 2.7 | [x] Hecha |
| T15 | Secciones de audiencia, metodología y prueba social | 2.4, 9.3 | [x] Hecha |
| T16 | `TopNavBar` y `SiteFooter` | 1.4, 1.6, 6.2, 6.3 | [x] Hecha |
| T17 | `NavPanel` — navegación de pantallas angostas | 7.2, 7.3, 8.4, 8.5 | [ ] Pendiente |
| T18 | Composición de la página e integridad de anclas | 1.1, 1.2, 1.5 | [ ] Pendiente |
| T19 | Invariantes de la página renderizada | 6.6, 9.2 | [ ] Pendiente |
| T20 | `layout.tsx` — idioma, metadatos y vista previa | 9.1, 10.1, 10.2, 10.3 | [ ] Pendiente |
| T21 | Página 404 | 10.4 | [ ] Pendiente |
| T22 | Andamiaje E2E y smoke test | 1.1, 4.5, 6.1 | [ ] Pendiente |
| T23 | Layout adaptable a pantallas angostas | 7.1, 7.4, 7.5, 7.7, 7.8 | [ ] Pendiente |
| T24 | Encabezado fijo y desplazamiento por anclas | 1.3, 1.4, 1.7 | [ ] Pendiente |
| T25 | Áreas activables y operación por teclado | 7.6, 9.5 | [ ] Pendiente |
| T26 | Funcionamiento sin JavaScript | 8.1, 8.2, 8.3, 8.4, 8.5 | [ ] Pendiente |
| T27 | Auditoría de accesibilidad en integración continua | 9.4, 9.6 | [ ] Pendiente |

## T1 — Andamiaje del proyecto y formateo de duración

**Requisitos:** 3.6
**Depende de:** ninguno

**Descripción:**

El repositorio está vacío: no hay control de versiones, ni `package.json`, ni
compilación, ni corredor de tests. Esta tarea levanta el andamiaje mínimo
—repositorio versionado con `.gitignore`, Next.js con App Router, TypeScript en
modo estricto, corredor de tests unitarios y los scripts `typecheck`, `test` y
`build`— y lo prueba implementando la primera unidad real del diseño:
`lib/format/duration.ts`, que convierte minutos en la etiqueta de duración en
horas y minutos (3.6). El formateador es dependencia de `deriveProgram` (T3),
así que existe antes.

La elección del corredor de tests no está fijada por `design.md`: se decide aquí
y se registra en el Decision log. La decisión debe contemplar que desde T10 harán
falta tests de componentes React, pero el entorno de componentes —DOM simulado y
utilidades de render— **no se instala acá**: se instala en T10, junto al primer
test de componente que lo ejercita en rojo. En T1 entra solo lo que el test de
`formatDuration` necesita para fallar y luego pasar.

`formatDuration` recibe siempre minutos positivos. El caso de duración cero no se
formatea: lo resuelve `deriveProgram` devolviendo `durationLabel === null` (3.5,
T3).

**Criterios de aceptación (trazados desde requirements.md):**

- 3.6 — `formatDuration` expresa la duración en horas y minutos con el formato
  que fija `design.md`: 80 minutos produce `1 h 20 min`.
- 3.6 — por debajo de la hora se omite la parte de horas: 45 minutos produce
  `45 min`.
- 3.6 — en horas exactas se omite la parte de minutos, sin sufijo en cero: 60
  minutos produce `1 h` y 120 minutos produce `2 h`.
- `npm run typecheck` y `npm test` existen y terminan en verde con el test de
  `formatDuration` incluido.
- `npm run build` existe y compila el proyecto. Es el mecanismo del que dependen
  todos los criterios de tipo «falla la compilación» (2.3, 3.4, 4.6, 4.7, 5.3,
  6.5, 10.3); sin él esas tareas no tienen cómo verificarse.
- `typecheck` corre con TypeScript en modo estricto: es lo que hace fallar el
  test de tipos de anclas de T7.
- El repositorio queda bajo control de versiones, con un `.gitignore` que excluye
  dependencias y artefactos de compilación. El Requisito 2 asume contenido
  versionado y T27 asume integración continua.

**Decision log:**

- Corredor de tests: **Vitest**. Comparte la resolución de módulos y el alias
  `@/*` con Vite, no exige un paso de transpilación aparte para TypeScript, y
  desde T10 admite entorno DOM (`environment: "jsdom"`) por archivo sin cambiar
  de herramienta. Alternativa considerada: Jest, descartada por necesitar
  configuración de transformación adicional para ESM y TypeScript en un proyecto
  que ya usa el pipeline de Vite.
- El entorno de componentes (jsdom, Testing Library) **no** se instala en T1: se
  instala en T10 junto al primer test que lo ejercita en rojo, tal como fija la
  descripción de la tarea.
- `app/layout.tsx` y `app/page.tsx` se crean como andamios mínimos porque
  `next build` no compila sin al menos una ruta. T20 y T18 los reemplazan por su
  versión real.

**Outcome:**

- `lib/format/duration.ts` implementado; `lib/format/duration.test.ts` pasa
  (3 tests: 80 → `1 h 20 min`, 45 → `45 min`, 60/120 → `1 h`/`2 h`).
- `npm run typecheck` en verde con `strict` y `noUncheckedIndexedAccess`.
- `npm run build` en verde: compila y prerenderiza `/` y `/_not-found`.
- Repositorio ya inicializado con `.gitignore`; los commits quedan a criterio del
  usuario, no se crearon desde la ejecución.

## T2 — Formateo de mes a partir de fecha ISO

**Requisitos:** 2.6
**Depende de:** T1

**Descripción:**

Implementar `lib/format/month.ts`: recibe la fecha ISO de una actualización con
formato `AAAA-MM` y devuelve la etiqueta que se muestra, tal como la fija
`design.md` (`2026-07` → `JULIO 2026`). El texto mostrado se deriva siempre de la
fecha almacenada, nunca se declara en el contenido (2.6).

El mapeo de mes es una tabla explícita en español, sin `new Date` ni
`Intl.DateTimeFormat`: parsear `2026-01` como fecha lo interpreta a medianoche
UTC y en husos negativos el mes local retrocede, y los nombres que devuelve `Intl`
dependen de los datos de ICU del entorno. La tabla hace el resultado
independiente de la máquina que corre los tests.

`formatMonth` recibe siempre una fecha ya validada con formato `AAAA-MM`. El
rechazo de una fecha malformada no es de esta tarea: lo hace el `.regex` de
`UpdateSchema` (T5), que es la fila correspondiente de la tabla de manejo de
errores de `design.md`. Mismo criterio que en T1, donde `formatDuration` recibe
siempre minutos positivos y el cero lo resuelve quien lo llama.

**Criterios de aceptación (trazados desde requirements.md):**

- 2.6 — la etiqueta tiene la forma que fija `design.md`: nombre del mes en
  mayúsculas, espacio y año de cuatro dígitos; `2026-07` produce `JULIO 2026`.
- 2.6 — los doce meses tienen etiqueta en español; se afirman al menos enero,
  julio y diciembre para descartar un corrimiento de índice en la tabla.
- 2.6 — el resultado no depende del huso horario ni de la configuración regional
  de la máquina: `2026-01` produce `ENERO 2026` en cualquier entorno, que es el
  caso que delata una implementación basada en `Date`.

**Decision log:**

- La tabla se indexa por la subcadena de dos dígitos (`"01"`…`"12"`) y no por un
  número, para no depender de `parseInt` ni de un corrimiento de índice base 0.
- El test de huso horario fija `process.env.TZ` en UTC+14 y UTC-11 alrededor de
  la aserción: son los extremos donde una implementación con `Date` cambia de
  mes.

**Outcome:**

- `lib/format/month.ts` implementado con tabla explícita; sin `Date` ni `Intl`.
- `lib/format/month.test.ts` pasa (4 tests: forma de la etiqueta, los doce meses,
  independencia de huso horario, año tomado de la fecha almacenada).
- `npm run typecheck && npm test` en verde.

## T3 — Derivación del programa (`deriveProgram`)

**Requisitos:** 3.1, 3.2, 3.3, 3.5, 3.6, 4.8
**Depende de:** T1

**Descripción:**

Implementar `lib/program/derive.ts` con `deriveProgram(input): DerivedProgram`
según la interfaz de `design.md`. Es la única lógica de cálculo del proyecto:
asigna el código de expediente por posición, cuenta módulos, suma minutos solo
de los módulos `available` y produce la etiqueta de duración reutilizando
`formatDuration` de T1.

**Criterios de aceptación (trazados desde requirements.md):**

- 3.1 — el código de cada módulo se deriva de su índice con formato `EXP-NN` y
  dos dígitos: el primero es `EXP-00`, el décimo primero es `EXP-10`.
- 3.2 — `moduleCount` es igual al largo de la lista de módulos.
- 3.3 — `totalMinutes` suma los minutos de los módulos `available` y excluye los
  `coming-soon`; con una lista mixta el total ignora los próximos.
- 3.5 — con todos los módulos en `coming-soon`, `totalMinutes` es cero y
  `durationLabel` es `null`.
- 3.6 — con minutos disponibles, `durationLabel` es la etiqueta en horas y
  minutos; caso borde de exactamente 60 minutos.
- 4.8 — el arreglo `modules` devuelto conserva el orden de declaración de la
  entrada, sin reordenar por estado ni por título.

**Decision log:**

- `DerivedModule` se modela como **unión discriminada** (`ModuleInput & { code }`)
  y no como la interfaz plana con tres campos opcionales que insinúa `design.md`.
  Motivo: la unión hace que el compilador exija el `switch` por `status` en T11 y
  que un `videoMinutes` sobre un `coming-soon` no compile. La interfaz plana
  dejaba esa garantía solo en manos del esquema Zod.
- Los tipos de entrada (`ModuleInput`, `ProgramInput`) se declaran en
  `derive.ts`, no en `schemas.ts`: T3 no depende de T4, y en T4 los esquemas se
  escriben para producir exactamente estos tipos.

**Outcome:**

- `lib/program/derive.ts` implementado; `lib/program/derive.test.ts` pasa
  (9 tests: `EXP-00`…`EXP-10`, `moduleCount`, suma que excluye `coming-soon`,
  `durationLabel === null` con cero, 60 minutos exactos, orden de declaración,
  descripción y campos de rama).
- `npm run typecheck && npm test` en verde (16 tests).

## T4 — Esquemas de módulo y programa

**Requisitos:** 2.5, 2.8, 3.4, 4.1, 4.6, 4.7
**Depende de:** T1

**Descripción:**

Agregar `zod` e implementar en `lib/content/schemas.ts` la parte del temario:
`NonEmpty`, `ModuleSchema` como unión discriminada por `status` con `.strict()`
en ambas ramas, y `ProgramSchema` con `.strict()` y `min(1)` módulos. Es
`.strict()` lo que convierte 3.4 y 4.6 de intención en garantía; los tests son
casos de rechazo, uno por cada fila IF/THEN de la tabla de manejo de errores que
corresponde al temario.

**Criterios de aceptación (trazados desde requirements.md):**

- 4.1 — un módulo con `status` distinto de `available` o `coming-soon` es
  rechazado; los dos estados son excluyentes por construcción del tipo.
- 4.6 — un módulo `coming-soon` que declara `videoMinutes` o `summary` es
  rechazado, con el nombre del campo sobrante en el error.
- 4.7 — un módulo `available` sin `videoMinutes` es rechazado.
- 3.4 — un módulo que declara `code`, o un programa que declara `moduleCount` o
  `duration`, es rechazado por `.strict()` en lugar de ignorarse en silencio.
- 2.5 — un programa con cero módulos es rechazado.
- 2.8 — un título o resumen vacío o solo con espacios es rechazado.
- Un módulo `available` sin `summary` es válido, y uno con `summary` también
  (habilita las ramas 4.3 y 4.4 en T11).

**Decision log:**

- Zod instalado en versión **4.4.3**. En Zod 4 el `.strict()` que muestra
  `design.md` sigue funcionando pero está deprecado; se usa `z.strictObject()`,
  que es exactamente el mismo comportamiento con la API vigente. La garantía de
  3.4 y 4.6 no cambia.
- El test agrega una aserción de tipos (`expectTypeOf`) de que
  `z.infer<typeof ProgramSchema>` es idéntico a `ProgramInput` de T3. Es lo que
  impide que el esquema y la derivación se separen sin que nadie se entere.
- Se agrega un caso no listado en los criterios: `videoMinutes` cero, negativo o
  fraccionario se rechaza. Es la consecuencia directa de `int().positive()` y
  protege el supuesto de T1 de que `formatDuration` recibe minutos positivos.

**Outcome:**

- `lib/content/schemas.ts` creado con `NonEmpty`, `ModuleSchema` (unión
  discriminada, ambas ramas estrictas) y `ProgramSchema`.
- `lib/content/schemas.program.test.ts` pasa (13 tests). Los rechazos por campo
  sobrante afirman además el nombre del campo (`unrecognized_keys`), que es lo
  que pide 4.6.
- `npm run typecheck && npm test` en verde (29 tests).

## T5 — Esquemas del resto del contenido

**Requisitos:** 2.4, 2.5, 2.6, 2.8, 5.3
**Depende de:** T4

**Descripción:**

Completar `lib/content/schemas.ts` con los esquemas de sitio, navegación, pie,
audiencia, metodología, actualizaciones, prueba social y preguntas frecuentes,
todos con `.strict()` y textos `NonEmpty`, y con las cardinalidades exactas que
exige el Requisito 2.

**Criterios de aceptación (trazados desde requirements.md):**

- 2.4 — se rechaza una lista de audiencia con distinto de 4 perfiles, de
  metodología con distinto de 2 bloques, de sellos con distinto de 3 y de
  métricas con distinto de 2, tanto por exceso como por defecto.
- 2.5 — se rechaza una lista vacía de actualizaciones y una lista vacía de
  preguntas frecuentes.
- 2.6 — la fecha de una actualización debe respetar `AAAA-MM`; `2026-13` y
  `julio 2026` son rechazadas.
- 2.8 — cualquier texto vacío o compuesto solo de espacios es rechazado en todos
  estos esquemas.
- 5.3 — una pregunta frecuente sin enunciado o sin respuesta es rechazada.

**Decision log:**

- Las cardinalidades exactas usan `.length(n)` en vez de `.min(n).max(n)`: un
  solo predicado, un solo mensaje de error, y el número queda escrito una vez.
- `NavSchema` valida el ancla contra `SECTION_IDS` en tiempo de ejecución
  (`z.enum` derivado de la tupla), no contra una expresión regular de forma. El
  tipo `Anchor` de T7 ya lo impide al compilar; esto cubre el contenido que llega
  como dato plano en T6. Ambas mitades salen de la misma tupla, así que no pueden
  divergir.
- `FooterSchema.links` **reutiliza** `NavSchema` en lugar de declarar su propio
  arreglo. El pie repite las mismas anclas que el encabezado (1.6); duplicar el
  esquema habilitaría que uno acepte lo que el otro rechaza.
- El rango de mes vive **dentro** de la expresión regular de `date`
  (`(0[1-9]|1[0-2])`) y no en una validación aparte. `2026-13` y `2026-00` se
  rechazan por la misma regla que `26-07` o `julio 2026`: un único predicado
  para la forma completa.
- `canonicalUrl` y el destino del boletín usan `z.url()`, la API vigente de
  Zod 4 (`z.string().url()` quedó deprecada). `ogImage` en cambio es `NonEmpty`:
  es una ruta interna del sitio, no una dirección absoluta.
- La aserción de tupla en `z.enum(... as [Anchor, ...Anchor[]])` es la única
  concesión de tipos del archivo. `SECTION_IDS` garantiza que la lista no está
  vacía, pero `.map()` borra esa garantía del tipo inferido.

**Outcome:**

- `lib/content/schemas.ts` completado con `AnchorSchema`, `NavSchema`,
  `FooterSchema`, `SiteSchema`, `AudienceSchema`, `MethodologySchema`,
  `SealsSchema`, `MetricsSchema`, `SocialProofSchema`, `UpdateSchema`,
  `UpdatesSchema`, `FaqSchema` y `FaqListSchema`. Todos estrictos.
- `lib/content/schemas.content.test.ts` pasa (19 tests: las cuatro
  cardinalidades exactas por exceso y por defecto, listas vacías de
  actualizaciones y preguntas, la forma ISO del mes con siete rechazos, el
  rechazo de una etiqueta declarada, textos en blanco en los nueve esquemas,
  anclas inexistentes en encabezado y pie, y el destino del boletín).
- `npm run typecheck && npm test` en verde (53 tests).

## T6 — Archivos de contenido y carga validada

**Requisitos:** 2.1, 2.2, 2.3, 2.7
**Depende de:** T3, T5

**Descripción:**

Crear los archivos de `content/` (`site`, `nav`, `footer`, `audience`,
`methodology`, `updates`, `program`, `social-proof`, `faq`) con el contenido del
mockup, y `lib/content/index.ts` como única puerta de entrada: importa cada
archivo, lo parsea con su esquema, ordena las actualizaciones de la más reciente
a la más antigua y expone `program` ya derivado por `deriveProgram`. La
validación ocurre al importar el módulo, de modo que un contenido inválido rompe
la compilación.

Los adelantos de `EXP-02` a `EXP-06` se escriben con el marcador `[REVISAR]`
según las preguntas abiertas de `requirements.md`.

**Criterios de aceptación (trazados desde requirements.md):**

- 2.2 — importar `lib/content/index.ts` ejecuta la validación de todos los
  archivos de contenido; no existe camino de acceso al contenido sin parsear.
- 2.3 — con un archivo de contenido inválido, la importación lanza y el mensaje
  nombra archivo, campo y motivo del rechazo.
- 2.7 — las actualizaciones se exponen en orden descendente por fecha aunque en
  el archivo estén escritas desordenadas.
- 2.1 — el módulo no realiza ninguna petición de red: todo el contenido entra
  por importaciones estáticas del repositorio.
- El contenido real del repositorio pasa la validación: `npm test` importa el
  índice sin lanzar.

**Decision log:**

- El parseo se extrae a `lib/content/parse.ts` (`parseContent(file, schema, data)`)
  en vez de repetir `schema.parse()` nueve veces en el índice. El criterio 2.3
  pide **archivo, campo y motivo**, y el `ZodError` crudo no conoce el nombre del
  archivo: pasarlo como argumento es lo que lo hace nombrable. Además vuelve al
  criterio testeable sin romper contenido real.
- Los mensajes de error de `parseContent` van en **inglés**, no en español. Los
  `issue.message` de Zod ya vienen en inglés y son la mitad del texto; una
  envoltura en español produciría un mensaje mezclado. Es un diagnóstico de
  compilación, no texto de interfaz.
- `unrecognized_keys` se trata aparte al armar el mensaje: su `path` viene vacío,
  así que el campo sale de `issue.keys`. Sin eso, un campo sobrante se reportaría
  como `(root)` y el criterio 2.3 quedaría sin cumplir justo en el caso que 3.4
  y 4.6 más ejercitan.
- El orden descendente usa `localeCompare` sobre la cadena ISO y va **sobre una
  copia** (`.slice()`): `sort` muta, y mutar el arreglo importado le cambiaría el
  orden al archivo de contenido para cualquier otro importador.
- `content/nav.ts` y `content/footer.ts` se tipan con `NavItem`; el resto de los
  archivos de contenido quedan sin tipar y se validan solo al parsear. Es la
  distinción del diseño: el ancla es la única garantía que conviene tener en
  tiempo de compilación además de en tiempo de ejecución.
- La duración por módulo de `EXP-00` y `EXP-01` (35 y 45 minutos) está
  **inventada**. El mockup solo declara el total, «1 H 20 MIN»; el reparto elegido
  suma exactamente 80 para reproducirlo. Los dos valores individuales necesitan
  confirmación.

**Outcome:**

- Nueve archivos en `content/` (`site`, `nav`, `footer`, `audience`,
  `methodology`, `updates`, `program`, `social-proof`, `faq`), más
  `lib/content/parse.ts` y `lib/content/index.ts`.
- `lib/content/index.test.ts` pasa (11 tests: las tres formas de rechazo con
  archivo y campo, el caso válido, importación sin lanzar, `fetch` no invocado
  durante la carga, cardinalidades expuestas, orden descendente, ausencia de
  pérdida o duplicado al ordenar, programa ya derivado, y anclas de encabezado y
  pie contra `SECTION_IDS`).
- `npm run typecheck && npm test` en verde (64 tests). `npm run build` en verde.
- **Caveat:** que un contenido inválido rompa `next build` todavía no está
  probado de punta a punta, porque `app/page.tsx` sigue siendo el andamio de T1 y
  nadie importa `lib/content/index.ts` desde la compilación. Queda garantizado
  recién con T18.
- **Copia faltante del mockup.** La lectura por MCP de Figma se cortó por límite
  del plan Starter tras leer temario, audiencia y preguntas frecuentes. Quedan
  con marcador `[REVISAR]` y número de nodo: subtítulo del hero (23:279), titular
  y texto del cierre (23:379, 23:381), titular y descripción de prueba social
  (23:232, 23:234), los tres sellos, y la descripción del pie (23:396). También
  sin confirmar: el rótulo del botón de acceso de la barra superior (23:445) y la
  etiqueta de marca (23:431).
- **Desajuste entre mockup y spec, sin resolver.** El pie del mockup enlaza
  Privacidad, Términos, Acreditaciones y Newsletter — páginas, no secciones. El
  diseño modela `footer.links` como anclas (`NavItem[]`) y deja el boletín como
  único destino saliente. Se implementó según el diseño, con tres anclas de
  sección; si el pie tiene que enlazar páginas legales, el cambio es de
  `design.md` y del esquema, no del archivo de contenido.
- **CTA sin unificar en el propio mockup, resuelto por el usuario.** El botón del
  hero decía «Explorar curso», el del temario «Inscríbete» y el del cierre
  «Inscribite». El criterio 6.6 exige que los tres coincidan. Se adoptó
  provisoriamente «Inscribite» y el 2026-08-13 el usuario decidió **tuteo**:
  `content/site.ts` fija «Inscríbete» en los tres lugares y ese es el registro
  del sitio. Queda por revisar `content/methodology.ts`, que trae «Aprenda a
  redactar…» —forma de usted— literal del mockup.

## T7 — Identificadores de sección y tipo de ancla

**Requisitos:** 1.2, 1.5
**Depende de:** T1

**Descripción:**

Implementar `lib/nav/sections.ts` con `SECTION_IDS` como tupla `as const`, y los
tipos `SectionId` y `Anchor`. Los `href` de `content/nav.ts` y
`content/footer.ts` se declaran como `Anchor`, de modo que un ancla mal escrita
deja de compilar. El test es de tipos: `@ts-expect-error` sobre un ancla
inexistente, más una aserción de que los identificadores son únicos.

**Criterios de aceptación (trazados desde requirements.md):**

- 1.2 — `SECTION_IDS` enumera un identificador único por sección navegable, sin
  repetidos.
- 1.5 — asignar un `href` con un identificador que no pertenece a `SectionId`
  produce error de tipos: el test con `@ts-expect-error` falla `npm run
  typecheck` si el tipo se afloja.

**Decision log:**

- **T7 se ejecuta antes que T5 y T6**, no en el orden del listado. Motivo: los
  esquemas de navegación y pie de T5 validan `href` contra las anclas reales, y
  para eso necesitan `SECTION_IDS`. Las dependencias declaradas se respetan
  igual: T7 solo depende de T1.
- La interfaz `NavItem` (`{ label, href: Anchor }`) se declara acá y no en
  `schemas.ts`, para que el tipo de ancla y su único origen vivan en el mismo
  archivo.
- El test incluye tres directivas `@ts-expect-error`: ancla inexistente, ancla
  sin `#` e identificador inexistente. Si alguien afloja el tipo a `string`, las
  directivas quedan sin usar y `tsc` falla con `TS2578` — verificado en rojo
  antes de implementar.

**Outcome:**

- `lib/nav/sections.ts` implementado con la tupla `as const`, `SectionId`,
  `Anchor` y `NavItem`.
- `lib/nav/sections.test.ts` pasa (5 tests: unicidad, listado esperado, forma de
  los identificadores, y los dos bloques de aserciones de tipos).
- `npm run typecheck && npm test` en verde (34 tests).

## T8 — URL de la pantalla de acceso (`accessUrl`)

**Requisitos:** 6.1, 6.2, 6.4, 6.5, 6.7
**Depende de:** T1

**Descripción:**

Implementar `lib/access-url.ts`: lee `NEXT_PUBLIC_ACCESS_URL` de la
configuración del proyecto, la valida con Zod al importar el módulo y expone
`accessUrl(intent)` que le agrega el parámetro de intención. No implementa nada
de autenticación: solo construye una cadena.

**Criterios de aceptación (trazados desde requirements.md):**

- 6.1 — `accessUrl("signup")` devuelve la dirección base con `?intent=signup`.
- 6.2 — `accessUrl("login")` devuelve la dirección base con `?intent=login`.
- 6.4 — la dirección base sale de la configuración del proyecto, no está escrita
  en el código.
- 6.5 — con la variable ausente, vacía o con un valor que no es URL válida, la
  importación del módulo lanza.
- 6.7 — el módulo no expone ni ejecuta nada de autenticación, envío de códigos,
  cobro o sesión: su superficie pública es solo `accessUrl`.

**Decision log:**

- El parámetro se agrega con `URL` y `searchParams.set`, no concatenando
  `?intent=`. Con concatenación, una dirección base que ya trae consulta
  (`…/acceso?ref=landing`) produciría dos `?` y un enlace roto. Hay dos tests
  para eso: conserva la consulta previa y reemplaza un `intent` ya presente.
- `process.env.NEXT_PUBLIC_ACCESS_URL` se lee como acceso estático de miembro y
  aparece **dos veces** en el archivo, una en la validación y otra en el mensaje
  de error. Es deliberado: Next sustituye textualmente esa expresión al compilar,
  y guardarla en una variable intermedia o leerla por clave dinámica la dejaría
  `undefined` en el paquete del navegador.
- El mensaje de error se escribe a mano en vez de reusar el de Zod, porque 6.5
  exige que se pueda identificar la variable y el `ZodError` solo diría
  «expected string, received undefined».
- `z.url()` sola cubre ausente, vacía, solo espacios y cadena que no es URL: los
  cuatro casos de 6.5 caen en el mismo predicado, sin validación adicional.
- El test de 6.7 afirma la superficie con `Object.keys` del módulo. `AccessIntent`
  es un tipo y se borra al compilar, así que la única exportación en tiempo de
  ejecución es `accessUrl`.

**Outcome:**

- `lib/access-url.ts` implementado; `lib/access-url.test.ts` pasa (11 tests:
  las dos intenciones, dirección configurable, consulta previa conservada,
  `intent` previo reemplazado, los cuatro rechazos de 6.5, la variable nombrada
  en el fallo, y la superficie pública).
- `npm run typecheck && npm test` en verde (75 tests).
- **Pendiente manual:** `NEXT_PUBLIC_ACCESS_URL` no está declarada en ninguna
  parte del repositorio. Mientras nada importe `lib/access-url.ts` la compilación
  sigue pasando, pero se romperá en T13/T16. Falta crear `.env.example` con la
  clave documentada y un `.env.local` real — no se pudo escribir desde la
  ejecución por permisos del entorno.

## T9 — Tokens visuales y verificación de contraste

**Requisitos:** 9.4
**Depende de:** T1

**Descripción:**

Crear `styles/tokens.css` con los tokens derivados del mockup y las dos
correcciones que `design.md` documenta: `--gold-text` `#7d6234` y `--grey-text`
`#616267`, conservando `--gold-line` `#98773e` solo para bordes y decoración.
Los valores se declaran una vez en un módulo TypeScript de tokens del que
`tokens.css` se deriva, para poder testearlos. El test calcula la relación de
contraste de cada par token/fondo real y falla si no alcanza el umbral.

Bloqueante conocido: `design.md` deja `--cream` «por confirmar» y advierte que
un fondo más oscuro que el blanco baja los ratios alrededor de un 8 %. La tarea
no puede llegar a verde sin ese valor.

**Criterios de aceptación (trazados desde requirements.md):**

- 9.4 — los tokens de texto (`--navy`, `--gold-text`, `--grey-text`) alcanzan al
  menos 4.5:1 contra cada fondo sobre el que se usan (`--white` y `--cream`).
- 9.4 — los tokens de elemento de interfaz y decoración (`--gold-line`) alcanzan
  al menos 3:1 contra sus fondos.
- 9.4 — el test falla si alguien reintroduce `#98773e` o `#76777e` como color de
  texto.

**Decision log:**

- **El bloqueante se levantó con evidencia, no con una elección.** `--cream` es
  `#f8f7f4`: es el fondo que el mockup declara en la sección de audiencia
  (`bg-[#f8f7f4]`, nodo 23:184), leído por MCP. No hizo falta inventar un valor.
- La caída real del crema respecto del blanco es de **~6.7 %**, no del 8 % que
  estimaba `design.md`. Con ese fondo los tres tokens de texto siguen pasando:
  navy 14.89:1, dorado corregido 5.34:1, gris corregido 5.68:1. `--gold-line`
  queda en 3.89:1, sobre el umbral de 3:1 que le corresponde.
- `tokens.css` se **verifica** contra `tokens.ts` en vez de generarse desde él.
  Un paso de generación exigiría script de compilación y otra pieza en el
  pipeline; el test de paridad da la misma garantía —no pueden divergir— sin
  agregar herramienta. El costo es que el CSS se edita a mano y el test avisa.
- `contrastRatio` vive en `lib/color/contrast.ts`, no dentro del test. Es la
  fórmula de la norma, y T27 la va a necesitar para la auditoría en integración
  continua; escondida en un archivo de test habría que duplicarla.
- El test de la fórmula se ancla en los tres ratios que `design.md` ya midió
  (15.95, 4.16, 4.46). Una fórmula mal implementada podría igual declarar «pasa»
  sobre los tokens buenos; contra valores conocidos, no.
- Los tokens de tipografía y espaciado se declaran acá junto a los de color,
  aunque 9.4 solo hable de contraste. Son los mismos valores del mockup y T10 en
  adelante los necesita; separarlos en otro archivo obligaría a un segundo test
  de paridad para la misma garantía.
- Las listas `TEXT_TOKENS` / `UI_TOKENS` / `BACKGROUND_TOKENS` usan
  `satisfies ColorToken[]`, y un test afirma que su unión es exactamente
  `COLOR_TOKENS`. Un token de color nuevo sin clasificar rompe el test en vez de
  quedar sin medir.

**Outcome:**

- `styles/tokens.ts`, `styles/tokens.css` y `lib/color/contrast.ts`
  implementados.
- `styles/tokens.test.ts` pasa (14 tests: paridad de nombres y de valores entre
  CSS y módulo, 4.5:1 de los tres tokens de texto sobre blanco y sobre crema,
  3:1 de `--gold-line` sobre ambos, tres guardas de regresión de los colores
  rechazados, y el cierre de la clasificación).
- `lib/color/contrast.test.ts` pasa (8 tests: los dos extremos de la escala,
  simetría del par, los tres ratios medidos en `design.md`, hex de tres dígitos y
  rechazo de valores que no son hex).
- `npm run typecheck && npm test` en verde (97 tests).
- **Para `design.md`:** su tabla sigue diciendo `--cream` «por confirmar» y
  advirtiendo una caída del 8 % por verificar. Las dos cosas quedaron resueltas
  acá. No se editó el documento: es artefacto de spec y su cambio necesita
  aprobación.
- **Hallazgo para T10 y T12:** el mockup usa `#c6c6ce` como borde de los
  `<details>` de preguntas frecuentes y no es ninguno de los seis tokens del
  diseño. Da 1.70:1 sobre blanco y 1.59:1 sobre crema. Si ese borde se considera
  el límite visible de un control interactivo, 9.4 le pide 3:1 y no lo alcanza;
  si se considera decoración, no aplica. Hay que decidirlo antes de escribir esos
  componentes.

## T10 — Componente `Disclosure`

**Requisitos:** 4.3, 4.4, 5.1, 8.1
**Depende de:** T9

**Descripción:**

Implementar `components/ui/Disclosure` según la interfaz de `design.md`: emite
`<details><summary>…</summary>…</details>` nativo, sin atributo `open`, sin
atributo `name` y sin estado de React. Si `children` está vacío, emite el
encabezado sin `<details>` y sin control de despliegue. Es el único desplegable
del sitio: lo consumen el temario (T11) y las preguntas frecuentes (T12).

**Criterios de aceptación (trazados desde requirements.md):**

- 4.3 / 5.1 — con `children`, renderiza `<details>` cerrado por omisión (sin
  atributo `open`) y un `<summary>` como control visible.
- 4.4 — sin `children`, no renderiza `<details>` ni control de despliegue: solo
  el encabezado.
- 8.1 — el desplegable no depende de JavaScript propio: no registra manejadores
  de evento ni estado; el marcado emitido es `<details>` nativo.
- El componente nunca emite el atributo `name` (agrupar forzaría cierre mutuo y
  contradiría 4.5 y 5.2).

**Decision log:**

- Entorno de componentes instalado acá, como fijaba T1: `jsdom`,
  `@testing-library/react` y `@testing-library/dom`. **No** se instaló
  `@testing-library/jest-dom`: sus comparadores son azúcar sobre aserciones de
  DOM que ya se pueden escribir, y la regla del proyecto es no agregar
  dependencias sin necesidad.
- El entorno se declara **por archivo** con `// @vitest-environment jsdom`, no
  globalmente. Los diez archivos de test que ya existen son de lógica pura y
  correr jsdom en todos los haría más lentos sin ganar nada.
- **Hubo que tocar `vitest.config.ts`:** `esbuild.jsx: "automatic"`. El
  `tsconfig.json` declara `jsx: "preserve"` porque Next hace su propia
  transformación, pero Vitest no tiene ese pipeline y caía en el runtime clásico:
  los once tests fallaban con `React is not defined`. Es configuración de
  andamiaje que T1 no podía anticipar porque no había ningún componente.
- El test de 8.1 no intenta demostrar la ausencia de manejadores inspeccionando
  el DOM, que no es observable. Usa dos evidencias: `renderToStaticMarkup`
  produce el control entero sin hidratar, y el propio archivo fuente se lee y se
  afirma que no contiene `use client`, `useState`, `onClick` ni `onToggle`. Es
  una aserción sobre el código, poco habitual, pero es lo que hace verificable el
  criterio en vez de declarativo.
- «Sin contenido» incluye **texto en blanco**, no solo `undefined`.
  `Children.toArray` ya descarta `null`, `undefined` y booleanos; el filtro extra
  descarta cadenas que solo tienen espacios. Un `<summary>` que abre a la nada es
  peor que no tener control (4.4).
- La rama sin contenido devuelve un `<div>`, no un fragmento: `className` tiene
  que aterrizar en algún lado, y quien consume el componente (T11, T12) espera un
  solo elemento en las dos ramas.
- **El chevron se dibuja en CSS, no en el marcado.** Es presentación pura y así
  el componente no crece en superficie. Va con `--navy` y no con `--rule`: es el
  objeto gráfico que informa que la fila abre, y `design.md` fija que necesita
  3:1.
- El archivo de test bajo jsdom no puede usar `new URL(..., import.meta.url)`
  para leer el fuente: ahí `import.meta.url` es una URL `http`. Se resuelve desde
  `process.cwd()`.

**Outcome:**

- `components/ui/Disclosure.tsx` y `components/ui/Disclosure.module.css`
  implementados; `vitest.config.ts` ajustado.
- `components/ui/Disclosure.test.tsx` pasa (11 tests: `<details>` nativo con
  `<summary>` de control, ausencia de `open`, ausencia de `name`, resumen como
  nodo compuesto, `className` en las dos ramas, ausencia de `<details>` y de
  control sin contenido, encabezado igual presente, `null`/`false`/`""`/espacios
  tratados como vacío, marcado estático completo y ausencia de directiva de
  cliente).
- `npm run typecheck && npm test` en verde (108 tests). `npm run build` en verde.
- **Actualización de seguridad, fuera del ciclo TDD de T10 y pedida aparte.**
  `npm audit` reportaba 4 vulnerabilidades (2 críticas) heredadas de las
  versiones que fijó T1. Se subió `next` de `15.5.4` a `15.5.23` y `vitest` de
  `3.1.4` a `3.2.7`, ambos saltos de parche o menores dentro de la misma mayor.
  Con eso se cierran las dos críticas, incluida la ejecución remota de código en
  el protocolo flight de React.
  - Quedan **3 de severidad alta** en `postcss` y `sharp`, las dos transitivas de
    Next. El único arreglo que ofrece npm es `next@16.3.0`, cambio mayor. Se
    dejan abiertas a propósito: migrar de mayor es una decisión de proyecto, no
    un `audit fix`.
  - `allowScripts` de `package.json` suma `esbuild@0.28.2`, que entró con Vitest.
  - Verificado después de subir: `npm run typecheck`, `npm test` (108) y
    `npm run build`, los tres en verde.

## T11 — `ProgramSection` — temario con dos ramas

**Requisitos:** 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 4.8
**Depende de:** T3, T10

**Descripción:**

Implementar `components/sections/ProgramSection` recibiendo `DerivedProgram` por
props, sin importar nada de `content/`. Es el único lugar de la página con dos
ramas de presentación: `coming-soon` produce ficha estática con `Badge` y
adelanto siempre visible; `available` produce `Disclosure` con el resumen, o
encabezado sin control si no hay resumen. Muestra además la cantidad de módulos
y la duración, omitiendo la duración cuando es `null`.

**Criterios de aceptación (trazados desde requirements.md):**

- 4.1 / 4.2 — un módulo `coming-soon` muestra su etiqueta de estado y su
  adelanto de forma permanente y **no** renderiza `<details>` ni control.
- 4.3 — un módulo `available` con resumen renderiza un `<details>` cerrado por
  omisión con control visible.
- 4.4 — un módulo `available` sin resumen se renderiza sin control de despliegue.
- 4.5 — con dos módulos desplegables, ningún `<details>` comparte atributo
  `name`: abrir uno no cierra al otro.
- 4.8 — el orden de los módulos renderizados es el del arreglo recibido.
- 3.5 — con `durationLabel === null` la sección no anuncia duración (ni cero, ni
  etiqueta vacía); con etiqueta presente, la muestra.
- Cada módulo muestra su `code` `EXP-NN` tal como viene derivado, sin
  recalcularlo.

**Decision log:**

- **4.3 y 4.4 no producen dos ramas acá.** `Disclosure` ya suprime el control
  cuando no recibe contenido (T10), así que la rama `available` pasa
  `module.summary` —presente o no— y el componente hace lo correcto en los dos
  casos. Escribir un `if` extra habría duplicado esa decisión en dos lugares.
  Las ramas reales son dos, no tres: `coming-soon` y `available`.
- El `switch` sobre `status` es exhaustivo por la unión discriminada de T3: un
  tercer estado no compila. Es la garantía de 4.1 que T3 buscaba al modelar la
  unión en vez de la interfaz plana.
- 4.5 no necesita código: se cumple **por omisión**, porque `Disclosure` nunca
  emite `name`. El test lo verifica igual con dos módulos desplegables, porque el
  criterio es sobre la sección, no sobre el componente.
- Los `data-testid` (`module-code`, `module-title`, `module-count`, `duration`)
  se agregan para poder afirmar orden y presencia sin depender de textos que
  todavía están sin cerrar. Se prefieren a consultas por rol o por texto porque
  varios rótulos de esta sección son `[REVISAR]` y cambiarán.
- La duración se omite con `durationLabel === null` no renderizando el bloque
  entero, no renderizando una cadena vacía. El test afirma además que no aparece
  ningún «0 min» (3.5).
- **`--rule` se agregó a los tokens en esta tarea**, no en T9: `design.md` lo
  incorporó recién al resolverse la pregunta del borde. Trajo una cuarta
  categoría, `DECORATION_TOKENS`, exenta de umbral. Para que la exención sea un
  acto deliberado y no un descuido, `styles/tokens.test.ts` ahora afirma que esos
  tokens **no** alcanzan 3:1 y que cada token está clasificado exactamente una
  vez.

**Outcome:**

- `components/sections/ProgramSection.tsx` y su módulo CSS;
  `components/ui/Badge.tsx` y su módulo CSS (`Badge` lo pedía `design.md` y no
  existía). `styles/tokens.ts`, `styles/tokens.css` y `styles/tokens.test.ts`
  extendidos con `--rule`.
- `components/sections/ProgramSection.test.tsx` pasa (13 tests: etiqueta y
  adelanto permanentes sin control, ausencia de etiqueta en módulos disponibles,
  `<details>` cerrado con resumen, sin control sin resumen, dos desplegables sin
  `name` compartido, orden de declaración, códigos derivados, cantidad de
  módulos, duración presente y duración omitida sin cero, identificador de
  sección y descripción recibida).
- `styles/tokens.test.ts` pasa ahora con 16 tests.
- `npm run typecheck && npm test` en verde (123 tests). `npm run build` en verde.
- **Copia sin cerrar:** el titular `<h2>` de la sección va como
  `[REVISAR] Titular del temario`. El nodo 23:104 del mockup es un texto sin
  nombrar y la lectura por MCP se agotó en T6. El rótulo de estado
  («Próximamente») y los de las cifras («Duración», «Temario») sí salen del
  mockup.
- **Fuera de alcance a propósito:** el mockup pone un botón de inscripción dentro
  de la sección del temario (nodo 35:83). Ningún criterio de T11 lo menciona y los
  controles de inscripción son T13; no se implementó acá.

## T12 — `FaqSection` — preguntas desplegables

**Requisitos:** 5.1, 5.2
**Depende de:** T10

**Descripción:**

Implementar `components/sections/FaqSection`: recibe la lista de preguntas por
props y renderiza cada una con `Disclosure`, enunciado como `summary` y
respuesta como contenido.

**Criterios de aceptación (trazados desde requirements.md):**

- 5.1 — cada pregunta se renderiza como `<details>` cerrado por omisión.
- 5.2 — ningún `<details>` de la sección comparte atributo `name`: desplegar una
  pregunta no cierra las ya abiertas.
- Todas las preguntas recibidas se renderizan, en el orden recibido.

**Decision log:**

- La sección no tiene lógica propia: los dos criterios los cumple `Disclosure`.
  5.1 porque nunca emite `open`, y 5.2 porque nunca emite `name`. El componente
  es un `map`. Que la tarea sea casi vacía es la consecuencia de T10, no una
  omisión.
- `FaqEntry` se exporta desde `lib/content/schemas.ts` como
  `z.infer<typeof FaqSchema>` en lugar de declarar una interfaz aparte en el
  componente. El esquema ya es la definición; una interfaz paralela podría
  divergir de él sin que nada avise.
- La `key` del `map` es el enunciado y no el índice. El esquema no garantiza
  unicidad de enunciados, pero dos preguntas idénticas serían un error de
  contenido; con índice, reordenar la lista reasignaría el estado abierto de los
  `<details>` a la pregunta equivocada.
- El test de 5.2 manipula el atributo `open` a mano en vez de simular clics.
  jsdom no implementa de forma fiable el comportamiento nativo de
  `<details>`/`<summary>`; el criterio real —que abrir una no cierra otra— se
  verifica de dos formas complementarias: acá, que no hay `name` que las acople,
  y en el navegador de verdad en T26.
- El enunciado y el titular «Preguntas frecuentes» salen del mockup y no llevan
  marcador: son de los pocos textos que la lectura de Figma alcanzó a leer
  completos.

**Outcome:**

- `components/sections/FaqSection.tsx` y su módulo CSS; `FaqEntry` exportado
  desde `lib/content/schemas.ts`.
- `components/sections/FaqSection.test.tsx` pasa (8 tests: un `<details>` por
  pregunta, todos cerrados, enunciado en el `summary` y respuesta adentro,
  ausencia de `name`, dos abiertas a la vez, todas las preguntas en orden, todas
  las respuestas, e identificador de sección).
- `npm run typecheck && npm test` en verde (131 tests). `npm run build` en verde.
- **Recordatorio de contenido:** las tres respuestas reales siguen sin escribirse.
  `content/faq.ts` las tiene como `[REVISAR]`; el mockup solo definía los
  enunciados.

## T13 — `Hero` y `FinalCta` — controles de inscripción

**Requisitos:** 6.1, 6.3
**Depende de:** T8, T9

**Descripción:**

Implementar `components/sections/Hero` y `components/sections/FinalCta`. Ambas
secciones llevan un control de inscripción construido con `accessUrl("signup")`
en tiempo de compilación. El hero incluye el titular de primer nivel de la
página y su panel visual con dimensiones explícitas y fondo `--navy`.

**Criterios de aceptación (trazados desde requirements.md):**

- 6.1 — el control de inscripción de cada sección es un enlace cuyo destino
  incluye `?intent=signup`.
- 6.3 — el control es un `<a href>` estándar: no es `<button>`, no tiene manejador
  de clic y no navega por script.
- La imagen del hero declara ancho y alto explícitos para que el layout no salte
  si no carga.

**Decision log:**

- **El destino se resuelve en el módulo, no por prop.** `Hero` y `FinalCta`
  importan `accessUrl` y guardan `accessUrl("signup")` en una constante de
  módulo. Se evaluó recibir el `href` por prop, como hacen `ProgramSection` y
  `FaqSection` con sus datos, pero eso habría dejado a los tests verificando el
  paso de una prop en vez de 6.1: con la constante, la intención `signup` es del
  componente y el test la puede afirmar. Además queda como cadena literal en el
  bundle, sin trabajo en tiempo de ejecución (6.3). Ambas constantes salen de la
  misma llamada, así que 6.6 se cumple por construcción y no por coincidencia.
- **`NEXT_PUBLIC_ACCESS_URL` para la suite se declara en `vitest.config.ts`**
  (`test.env`). Importar cualquiera de los dos componentes dispara la validación
  de `lib/access-url.ts` en tiempo de importación; sin la variable, el archivo de
  test ni siquiera carga. La alternativa era importación dinámica en cada test,
  como hace `lib/access-url.test.ts`, y volvía asincrónico todo test de
  componente sin ganar nada. `lib/access-url.test.ts` sigue sobrescribiendo la
  variable por caso y restaurándola, así que los cuatro rechazos de 6.5 se
  siguen midiendo.
- **El panel visual del hero es un `<div role="img">`, no un `<img>`.** No hay
  fuente de imagen en ninguna parte: `SiteSchema.hero` declara `imageAlt` y nada
  más, y el árbol de `design.md` solo lista `og.png` bajo `public/` (que además
  todavía no existe). Un `<img>` habría exigido un campo `imageSrc` nuevo en un
  `z.strictObject`, tocar `content/site.ts` y un asset inexistente — un cambio de
  esquema que no pertenece a esta tarea. El `div` con `role="img"` y
  `aria-label` cumple 9.3, y el fondo `--navy` es el mismo respaldo que pide
  `design.md`.
- **Las dimensiones del panel (480×480) van inline, no en el CSS module.** Van
  inline porque son afirmables: en jsdom los CSS modules no aplican estilo
  calculado, así que un ancho declarado en la hoja no se puede testear. El
  criterio pide reserva de espacio explícita y el test la mide sobre
  `style.width` / `style.height`.
- **Cobertura parcial y declarada de 6.3.** «No tiene manejador de clic» no es
  observable desde el DOM cuando el manejador sería sintético de React. El test
  afirma lo que sí se puede afirmar: el control es un `<a>` con `href`, no hay
  ningún `<button>` en la sección, y el elemento no lleva atributo `onclick`.
  Queda anotado en el propio test.

**Outcome:**

- Creados `components/sections/Hero.{tsx,module.css,test.tsx}` y
  `components/sections/FinalCta.{tsx,module.css,test.tsx}`.
- Agregados los tipos `HeroContent` y `FinalCtaContent` en
  `lib/content/schemas.ts`, derivados de `SiteSchema` — el esquema no cambió.
- `vitest.config.ts` declara `test.env.NEXT_PUBLIC_ACCESS_URL`.
- `npm run typecheck && npm test` en verde: **146 tests en 15 archivos** (15
  nuevos: 8 de `Hero`, 7 de `FinalCta`). `npm run build` en verde.
- **Primera tarea que consume `accessUrl` en un componente.** `.env.local` ya
  existe y carga bien (verificado con el loader de Next: la clave sale sin BOM).
- **Pendiente manual, arrastrado de T8:** `.env.example` sigue sin existir. Los
  permisos del entorno de ejecución rechazan escribir cualquier archivo `.env*`.
- **Copia sin cerrar:** `Hero` y `FinalCta` renderizan lo que hay en
  `content/site.ts`, donde el subtítulo del hero y los dos textos del cierre
  siguen con marcador `[REVISAR]` (nodos 23:279, 23:379, 23:381). Los tests usan
  copia de muestra propia, así que no dependen de esos marcadores.
- **Fuera de alcance a propósito:** ninguna de las dos secciones lleva `id`.
  `SECTION_IDS` no incluye al hero ni al cierre; no son destinos de ancla. La
  composición en la página es T18.
- **Sin resolver del mockup:** las dimensiones reales del panel del hero no se
  pudieron leer (misma cuota agotada del MCP de Figma que en T6). 480×480 es un
  valor de relleno; lo que el criterio exige es que estén declaradas, no su
  valor.

## T14 — `UpdatesSection` — actualizaciones fechadas

**Requisitos:** 2.6, 2.7
**Depende de:** T2, T7, T9

**Descripción:**

Implementar `components/sections/UpdatesSection`: recibe las actualizaciones ya
ordenadas y renderiza cada una con su etiqueta de mes derivada por
`formatMonth`, su título y su descripción.

La sección es **presentación pura**: no ordena. La regla de orden de 2.7 vive en
un solo lugar, `lib/content/index.ts` (T6), que expone las actualizaciones de la
más reciente a la más antigua sin importar cómo estén escritas en el archivo, y
`lib/content/index.test.ts` es el que lo prueba. Reordenar acá pondría la misma
regla en dos lugares y volvería posible que discrepen. Lo que a esta tarea le
toca de 2.7 es no deshacer esa garantía: renderizar la lista tal como llega.

**Criterios de aceptación (trazados desde requirements.md):**

- 2.6 — la sección muestra la etiqueta de mes derivada de la fecha ISO por
  `formatMonth` (`2026-07` → `JULIO 2026`), no una cadena de fecha declarada en
  el contenido; la fecha ISO cruda no aparece en el texto renderizado.
- 2.6 — la etiqueta se emite dentro de un `<time>` con la fecha ISO en
  `dateTime`: el texto visible es derivado y el valor almacenado sigue
  disponible en el marcado.
- 2.7 — la sección renderiza **todas** las actualizaciones recibidas y en el
  mismo orden en que las recibe, sin reordenar, duplicar ni descartar ninguna.
  Con una entrada deliberadamente desordenada, la sección la muestra desordenada:
  el orden descendente es responsabilidad de T6 y ya está cubierto por
  `lib/content/index.test.ts`.
- Con una sola actualización la sección renderiza una sola ficha, sin exigir un
  mínimo propio (el mínimo de una lo impone `UpdatesSchema` en T5).
- La sección lleva el identificador `actualizaciones` tomado de `SECTION_IDS`,
  para poder ser destino de ancla cuando T18 componga la página.

**Decision log:**

- **La sección no ordena; decisión del usuario, consultada antes de implementar.**
  La Descripción y el criterio de 2.7 originales se contradecían: la primera
  decía «recibe las actualizaciones ya ordenadas», el segundo exigía un test con
  «una entrada de datos deliberadamente desordenada» cuya salida fuera
  descendente — que solo es posible si el componente ordena. Se paró la ejecución
  y se consultó. El usuario eligió dejar la regla de orden en un único lugar,
  `lib/content/index.ts`. El criterio se reescribió a través del subagente
  `planner`, no a mano.
- **El test de esta tarea afirma lo complementario:** que la sección no reordena
  ni pierde nada de lo que recibe. Es el test que atrapa a quien más adelante
  agregue un `.sort()` acá y ponga la regla en dos lugares.
- **La etiqueta va dentro de un `<time dateTime>`.** No estaba pedido en el
  criterio original. El texto visible sigue siendo derivado por `formatMonth`,
  que es lo que exige 2.6; el atributo solo conserva el valor almacenado en el
  marcado para lectura automática. Se agregó como criterio explícito en la misma
  iteración del `planner`.
- **La ISO cruda no debe aparecer en el texto renderizado.** Se afirma con un
  test propio sobre `textContent`, en vez de confiar en que la etiqueta esté
  bien: es el que atrapa una regresión de alguien que muestre `update.date`
  directo junto a la etiqueta derivada.
- **`key` compuesta `date + title`.** La fecha sola no es única: `UpdateSchema`
  no impide dos actualizaciones del mismo mes.

**Outcome:**

- Creados `components/sections/UpdatesSection.{tsx,module.css,test.tsx}`.
- Agregado el tipo `Update` en `lib/content/schemas.ts`, derivado de
  `UpdateSchema` — el esquema no cambió.
- `npm run typecheck && npm test` en verde: **153 tests en 16 archivos** (7
  nuevos). `npm run build` en verde.
- **Corrección de spec aplicada por el `planner` en esta tarea:** se reescribió
  el criterio de 2.7, se precisaron los dos de 2.6, se agregaron los de una sola
  actualización y del identificador de sección, y **Depende de** pasó de
  `T2, T9` a `T2, T7, T9` (el criterio del `id` necesita `SECTION_IDS`, de T7,
  ya hecha). Veredicto `CRITERIA MET`. No hubo hueco en `requirements.md` ni en
  `design.md`: `design.md:93` ya declaraba `updates` como ordenadas descendente
  en la interfaz del índice, así que la decisión coincide con el diseño aprobado.
- **Nota del `planner`, no corregida:** `UpdatesSection` también importa `Badge`
  (T11) y el tipo `Update` (T5), que no figuran en **Depende de**. Es el mismo
  criterio laxo que ya traen T11 y T12; unificarlo exigiría editar tareas ya
  cerradas.
- **Pendiente manual, arrastrado de T8 y T13:** `.env.example` sigue sin existir.

## T15 — Secciones de audiencia, metodología y prueba social

**Requisitos:** 2.4, 9.3
**Depende de:** T9

**Descripción:**

Implementar `components/sections/AudienceSection`,
`components/sections/MethodologySection` y
`components/sections/SocialProofSection`, junto con los componentes de interfaz
que consumen (`ProfileCard`, `MetricCard`, `Badge`). Son presentación sin
ramificación: reciben sus datos por props y los renderizan. Se agrupan en una
sola tarea porque cada una por separado no tiene comportamiento que pueda fallar
de forma independiente.

Las métricas y los sellos se renderizan tal como llegan; sus valores están entre
las preguntas abiertas y no se resuelven acá.

**Criterios de aceptación (trazados desde requirements.md):**

- 2.4 — la sección de audiencia renderiza los 4 perfiles recibidos, la de
  metodología los 2 bloques, y la de prueba social los 3 sellos y las 2 métricas.
- 9.3 — los iconos de perfil y los sellos decorativos quedan ocultos a las
  tecnologías de asistencia (`aria-hidden`) y no aportan texto alternativo
  redundante.

**Decision log:**

- 9.3 se resuelve con un componente, `DecorativeIcon`, y no repitiendo
  `aria-hidden` en cada sitio. El criterio es fácil de cumplir y fácil de olvidar
  en el próximo icono que alguien agregue; concentrado en un componente, la
  decisión se toma una sola vez y el test la cubre entera.
- El nombre del icono viaja por `data-icon` y **no** se renderiza como texto.
  Sirve al CSS y nunca llega al árbol de accesibilidad. Hay un test explícito de
  que la palabra `shield` no aparece en el texto accesible: era la forma más
  probable de romper 9.3 sin darse cuenta.
- Las cardinalidades de 2.4 **no** se verifican en los componentes. Los esquemas
  ya rechazan una lista que no tenga exactamente 4, 2, 3 y 2 al importar el
  contenido; comprobarlo otra vez en la presentación pondría la misma regla en
  dos lugares que pueden discrepar. Los tests afirman que se renderiza todo lo
  recibido, que es lo que sí le toca a la sección.
- `MetricCard` imprime `value` literal, sin formatear. «5000+» es una afirmación
  escrita por un editor, no una cantidad calculada: pasarla por un formateador de
  números le comería el signo.
- La jerarquía de encabezados se testea acá aunque 9.2 sea de T19: cada sección
  aporta un `<h2>` y sus tarjetas `<h3>`, y T19 solo puede afirmar la ausencia de
  saltos si cada pieza ya llega bien. Ninguna sección emite `<h1>`.
- Los sellos son `<ul>`/`<li>` y no `<div>`: son una lista de afiliaciones, y el
  recuento que anuncia el lector de pantalla es información real para alguien que
  está evaluando credibilidad institucional.
- Los titulares «Diseñado para profesionales» y «Rigor forense» salen del mockup
  y no llevan marcador; el de prueba social viene del contenido, que sí lo tiene.

**Outcome:**

- `components/sections/` suma `AudienceSection`, `MethodologySection` y
  `SocialProofSection`; `components/ui/` suma `ProfileCard`, `MetricCard` y
  `DecorativeIcon`, cada uno con su módulo CSS. `lib/content/schemas.ts` exporta
  `AudienceProfile`, `MethodologyBlock`, `Seal`, `Metric` y `SocialProof`.
- Tres archivos de test pasan (24 tests en total: perfiles, bloques, sellos y
  métricas completos y en orden; iconos `aria-hidden` sin texto alternativo ni
  filtración del identificador; valores sin reformatear; jerarquía de encabezados;
  y los tres identificadores de sección).
- `npm run typecheck && npm test` en verde (174 tests). `npm run build` en verde.
- **Iconos sin dibujo.** Los glifos del mockup nunca se exportaron: la lectura de
  Figma se agotó antes de bajar los activos. `DecorativeIcon` reserva la caja
  diseñada para que el layout sea correcto y nada se corra cuando lleguen; hoy se
  ve un bloque sólido. Falta bajar los SVG y enchufarlos por `mask-image`.
- **Recordatorio:** los tres sellos y las dos métricas siguen siendo marcadores
  de posición sin respaldo. Es pregunta abierta de publicación, no de esta tarea.

## T16 — `TopNavBar` y `SiteFooter`

**Requisitos:** 1.4, 1.6, 6.2, 6.3
**Depende de:** T7, T8, T9

**Descripción:**

Implementar `components/sections/TopNavBar` y `components/sections/SiteFooter`.
El encabezado recibe los ítems de navegación por props, los renderiza como
enlaces de ancla y suma los dos controles de acceso: inscripción e inicio de
sesión. El resaltado del ítem activo es exclusivamente `:hover` /
`:focus-visible`, sin observador de desplazamiento. El pie repite los enlaces de
ancla y el enlace de newsletter (enlace, no formulario). El comportamiento
`sticky` se declara acá y se verifica en ventana real en T24.

**Criterios de aceptación (trazados desde requirements.md):**

- 1.6 — no existe observador de desplazamiento ni estado de sección activa: el
  resaltado sale solo de `:hover` / `:focus-visible`, y el marcado no lleva
  atributo de activo.
- 6.2 — el control de inicio de sesión es un enlace cuyo destino incluye
  `?intent=login`.
- 6.3 — ambos controles de acceso son `<a href>` estándar, sin navegación por
  script.
- 1.4 — el encabezado se declara `position: sticky` anclado al borde superior.
- Los `href` de navegación salen de los datos recibidos, no están escritos en el
  componente.

**Decision log:**

- **1.6 se verifica por ausencia, y eso hay que testearlo aparte.** «No hay
  scrollspy» no se ve en el DOM renderizado: un componente con
  `IntersectionObserver` produce el mismo marcado inicial que uno sin él. El test
  lee el fuente y afirma que no contiene `IntersectionObserver`,
  `addEventListener`, `useState` ni `useEffect`, y que el marcado no lleva
  `aria-current` ni `data-active`. Mismo enfoque que 8.1 en T10.
- El resaltado se verifica en la hoja de estilos, no en jsdom: se afirma que
  `:hover` y `:focus-visible` existen. jsdom no computa CSS de módulos, así que
  una aserción sobre estilo calculado sería verde y vacía.
- Igual criterio para 1.4: se afirma `position: sticky` y `top: 0` leyendo el
  CSS. La tarea ya decía que el comportamiento real se verifica en ventana en
  T24; acá solo se prueba que está declarado.
- **La interfaz de `design.md` estaba incompleta.** Declaraba
  `{ items, siteName }`, pero el encabezado necesita además los rótulos de los
  dos controles de acceso. Se agregaron `enrollLabel` y `loginLabel` como props
  en lugar de importar `site` desde el componente: mantiene la regla de que las
  secciones no importan de `content/` y deja a T18 pasar el mismo `enrollLabel`
  a los tres controles, que es lo que 6.6 necesita para ser verificable.
- Los destinos de acceso se resuelven en el ámbito del módulo
  (`accessUrl("signup")` y `accessUrl("login")`), igual que en `Hero`: quedan
  como cadenas constantes en la salida y no hay trabajo en tiempo de ejecución
  detrás del enlace (6.3).
- Hay un test de que ni el encabezado ni el pie escriben `href="#` en su fuente.
  Es la forma directa de sostener que los destinos salen de los datos: si alguien
  escribe un ancla a mano, el tipo `Anchor` no lo detecta —sería una cadena
  válida— pero este test sí.
- El pie **no emite ningún encabezado**. Es lo que garantiza que no pueda meter un
  salto de nivel en la jerarquía de la página (9.2) sin que T19 tenga que
  ocuparse de él.
- El boletín es enlace y no formulario. Un formulario acá significaría recolectar
  una dirección en una página cuyo contrato entero es no hablar con la red (2.1).
  El test afirma que no hay `<form>` ni `<input>`.

**Outcome:**

- `components/sections/TopNavBar.tsx` y `components/sections/SiteFooter.tsx` con
  sus módulos CSS; `Footer` exportado desde `lib/content/schemas.ts`.
- Los dos archivos de test pasan (20 tests: un enlace por ítem con su `href`,
  lista no cableada, ausencia de anclas en el fuente, nombre del sitio, los dos
  destinos de acceso con su intención, ambos como `<a href>` sin botones ni
  script, ausencia de estado activo y de observadores, `:hover`/`:focus-visible`
  presentes, `sticky` y `top: 0` declarados, landmarks `banner` y `contentinfo`,
  boletín como enlace sin formulario ni campo, copia del pie y ausencia de
  encabezados).
- `npm run typecheck && npm test` en verde (194 tests). `npm run build` en verde.
- **Sin resolver, heredado de T6:** el pie del mockup enlaza Privacidad,
  Términos y Acreditaciones —páginas, no secciones—, y el modelo del diseño solo
  admite anclas. El componente respeta el diseño; si el pie tiene que enlazar
  páginas legales, hay que cambiar `design.md` y el esquema.
- **Para T17:** este encabezado todavía no contempla pantallas angostas. Muestra
  los enlaces en línea siempre; el umbral de 1024 px y el `NavPanel` son T17.

## T17 — `NavPanel` — navegación de pantallas angostas

**Requisitos:** 7.2, 7.3, 8.4, 8.5
**Depende de:** T16

**Descripción:**

Implementar `components/ui/NavPanel`: panel construido con `<details>` para que
abra sin JavaScript, que agrupa los enlaces de navegación por debajo de 1024 px
mientras el nombre del sitio y el control de inscripción quedan siempre
visibles. Un efecto de cliente de unas pocas líneas escucha clics en enlaces
internos y quita el atributo `open`. Es la única degradación aceptada sin
JavaScript.

**Criterios de aceptación (trazados desde requirements.md):**

- 7.2 — el panel agrupa los enlaces de ancla y deja fuera —siempre visibles— el
  nombre del sitio y el control de inscripción; está cerrado por omisión (sin
  atributo `open`).
- 7.3 — al activar un enlace de ancla del panel, el atributo `open` se retira.
- 8.4 — la apertura del panel no depende del efecto de cliente: el marcado es
  `<details>` nativo y `<summary>` es su control.
- 8.5 — el efecto de cliente se limita a retirar `open`: no agrega ninguna otra
  responsabilidad cuyo bloqueo degrade el sitio.

**Decision log:**

**Outcome:**

## T18 — Composición de la página e integridad de anclas

**Requisitos:** 1.1, 1.2, 1.5
**Depende de:** T6, T11, T12, T13, T14, T15, T16, T17

**Descripción:**

Implementar `app/page.tsx`: importa el contenido validado de
`lib/content/index.ts` y compone las diez secciones en orden, pasando props
tipadas a cada una y asignando a cada sección navegable su `id` tomado de
`SECTION_IDS`. El test es de integración sobre la página renderizada y es el que
convierte un ancla rota en un fallo automático.

**Criterios de aceptación (trazados desde requirements.md):**

- 1.1 — la página renderiza, en este orden: encabezado, hero, audiencia,
  metodología, actualizaciones, programa, prueba social, preguntas frecuentes,
  cierre y pie.
- 1.2 — por cada `SectionId` existe en el documento exactamente un elemento con
  ese `id`.
- 1.5 — todo `href` que empieza con `#`, tanto del encabezado como del pie,
  corresponde a un `SectionId` existente en la página renderizada.

**Decision log:**

**Outcome:**

## T19 — Invariantes de la página renderizada

**Requisitos:** 6.6, 9.2
**Depende de:** T18

**Descripción:**

Agregar el test de integración de invariantes estructurales sobre la página ya
compuesta, y corregir el contenido o el marcado que los incumpla. Son
propiedades que ninguna sección puede garantizar por sí sola porque emergen de
la composición.

Bloqueante conocido: la forma verbal de los CTA está sin resolver en
`requirements.md` (`Inscribite` frente a `Inscríbete`). El test verifica que las
tres coincidan, sea cual sea la elegida, pero el contenido necesita la decisión.

**Criterios de aceptación (trazados desde requirements.md):**

- 6.6 — los tres controles de inscripción de la página (encabezado, hero y
  cierre) usan exactamente el mismo texto.
- 9.2 — existe un único encabezado de primer nivel en el documento.
- 9.2 — la jerarquía de encabezados no salta niveles en ningún punto del
  documento.

**Decision log:**

**Outcome:**

## T20 — `layout.tsx` — idioma, metadatos y vista previa

**Requisitos:** 9.1, 10.1, 10.2, 10.3
**Depende de:** T6

**Descripción:**

Implementar `app/layout.tsx`: documento con idioma español, metadatos de título,
descripción y dirección canónica, y metadatos de vista previa para redes
sociales apuntando a `public/og.png`. La existencia del archivo de imagen se
verifica al importar los metadatos, de modo que su ausencia rompe la
compilación.

Bloqueante conocido: la imagen de vista previa todavía no existe en el
repositorio (pregunta abierta de `requirements.md`); sin ella la tarea no llega
a verde, que es exactamente lo que 10.3 pide.

**Criterios de aceptación (trazados desde requirements.md):**

- 9.1 — el elemento raíz del documento declara el español como idioma.
- 10.1 — el documento declara título, descripción y dirección canónica.
- 10.2 — el documento declara los metadatos de vista previa para redes,
  incluyendo la imagen.
- 10.3 — si el archivo de imagen de vista previa no existe en el repositorio, la
  importación de los metadatos lanza y la compilación falla.

**Decision log:**

**Outcome:**

## T21 — Página 404

**Requisitos:** 10.4
**Depende de:** T16

**Descripción:**

Implementar `app/not-found.tsx`: reutiliza `TopNavBar` y `SiteFooter` y ofrece
un enlace al inicio. La ruta inexistente debe responder con el código de estado
404, no con un 200 que muestre la página de error.

**Criterios de aceptación (trazados desde requirements.md):**

- 10.4 — una ruta inexistente responde con código 404.
- 10.4 — la página de error conserva encabezado y pie.
- 10.4 — la página de error ofrece un enlace al inicio.

**Decision log:**

**Outcome:**

## T22 — Andamiaje E2E y smoke test

**Requisitos:** 1.1, 4.5, 6.1
**Depende de:** T18, T20

**Descripción:**

Levantar el corredor E2E sobre navegador real con el script `test:e2e` y
escribir el único smoke test del proyecto. El corredor es prerequisito de las
tareas T23 a T27, que verifican comportamiento que sólo existe en una ventana
real (puntos de quiebre, desplazamiento, foco, ausencia de JavaScript). La
elección del corredor no está fijada por `design.md`: se decide acá y se
registra en el Decision log.

**Criterios de aceptación (trazados desde requirements.md):**

- 1.1 — la página carga y muestra sus secciones.
- 4.5 — desplegar dos módulos deja ambos abiertos.
- 6.1 — el control de inscripción apunta a la dirección de acceso con
  `?intent=signup`.
- `npm run test:e2e` existe y corre contra la compilación de producción.

**Decision log:**

**Outcome:**

## T23 — Layout adaptable a pantallas angostas

**Requisitos:** 7.1, 7.4, 7.5, 7.7, 7.8
**Depende de:** T22

**Descripción:**

Escribir los estilos adaptables partiendo del diseño para pantalla angosta, con
puntos de quiebre en 640, 768 y 1024 píxeles. El test recorre esos anchos más
320 píxeles en ventana real y verifica la geometría resultante, no las clases
CSS.

**Criterios de aceptación (trazados desde requirements.md):**

- 7.1 — el diseño base es el de pantalla angosta y los cambios ocurren en 640,
  768 y 1024 píxeles.
- 7.4 — por debajo de 768 píxeles el hero está apilado con el texto y su llamado
  a la acción por encima del panel visual.
- 7.5 — la grilla de audiencia tiene dos columnas por debajo de 1024 píxeles y
  una sola por debajo de 768.
- 7.7 — el titular del hero cambia de tamaño de forma continua con el ancho,
  sin salto en los puntos de quiebre.
- 7.8 — no hay desplazamiento horizontal en 320, 640, 768, 1024 y 1440 píxeles.

**Decision log:**

**Outcome:**

## T24 — Encabezado fijo y desplazamiento por anclas

**Requisitos:** 1.3, 1.4, 1.7
**Depende de:** T22

**Descripción:**

Ajustar el encabezado fijo y el desplazamiento a destino: `scroll-margin-top` en
las secciones equivalente a la altura del encabezado, y desplazamiento animado
solo cuando el visitante no declara preferencia por movimiento reducido. Se
verifica en ventana real midiendo la posición del título de destino.

**Criterios de aceptación (trazados desde requirements.md):**

- 1.4 — al desplazarse por la página el encabezado permanece en el borde
  superior de la ventana.
- 1.3 — tras activar un enlace de navegación, el título de la sección destino
  queda completamente visible por debajo del encabezado, sin quedar tapado.
- 1.7 — con preferencia de movimiento reducido declarada, la llegada a la
  sección es inmediata, sin desplazamiento animado.

**Decision log:**

**Outcome:**

## T25 — Áreas activables y operación por teclado

**Requisitos:** 7.6, 9.5
**Depende de:** T22

**Descripción:**

Ajustar tamaños de área activable e indicadores de foco. El test recorre en
ventana real todos los controles interactivos de la página —enlaces de
navegación, controles de acceso, `summary` de módulos y de preguntas, control
del panel— y mide su caja y su foco.

**Criterios de aceptación (trazados desde requirements.md):**

- 7.6 — todo control interactivo ofrece un área activable de al menos 44 por 44
  píxeles.
- 9.5 — todo control interactivo se alcanza y se activa por teclado siguiendo el
  orden del documento.
- 9.5 — todo control enfocado muestra un indicador de foco visible, distinguible
  del estado en reposo.

**Decision log:**

**Outcome:**

## T26 — Funcionamiento sin JavaScript

**Requisitos:** 8.1, 8.2, 8.3, 8.4, 8.5
**Depende de:** T22

**Descripción:**

Verificar y corregir el funcionamiento de la página con JavaScript
deshabilitado en el navegador. Es el test que protege la decisión de usar
`<details>` nativo: cualquier regresión hacia un desplegable con estado de React
lo rompe.

**Criterios de aceptación (trazados desde requirements.md):**

- 8.1 — sin JavaScript, los módulos del temario y las preguntas frecuentes se
  despliegan y se cierran.
- 8.2 — sin JavaScript, los enlaces de ancla llevan a su sección.
- 8.3 — sin JavaScript, los controles de inscripción e inicio de sesión navegan
  a la dirección de acceso con su intención.
- 8.4 — sin JavaScript, el panel de navegación de pantallas angostas abre.
- 8.5 — la única diferencia observable sin JavaScript es que el panel de
  navegación no se cierra solo al activar un enlace.

**Decision log:**

**Outcome:**

## T27 — Auditoría de accesibilidad en integración continua

**Requisitos:** 9.4, 9.6
**Depende de:** T19, T21, T22

**Descripción:**

Integrar la auditoría automatizada de accesibilidad sobre la página renderizada
y sobre la página 404, y conectarla a la integración continua junto con
`typecheck`, `test`, `build` y `test:e2e`. Corregir las violaciones que reporte.

**Criterios de aceptación (trazados desde requirements.md):**

- 9.6 — la auditoría corre sobre la página renderizada y una violación hace
  fallar la integración continua.
- 9.4 — la auditoría no reporta violaciones de contraste sobre el texto ya
  renderizado, confirmando en la página lo que T9 verificó sobre los tokens.
- La integración continua encadena `typecheck`, `test`, `build`, `test:e2e` y la
  auditoría, y falla si alguno falla.

**Decision log:**

**Outcome:**

## Cobertura de requisitos

| Criterio | Tareas | Criterio | Tareas |
|---|---|---|---|
| 1.1 | T18, T22 | 6.1 | T8, T13, T22 |
| 1.2 | T7, T18 | 6.2 | T8, T16 |
| 1.3 | T24 | 6.3 | T13, T16 |
| 1.4 | T16, T24 | 6.4 | T8 |
| 1.5 | T7, T18 | 6.5 | T8 |
| 1.6 | T16 | 6.6 | T19 |
| 1.7 | T24 | 6.7 | T8 |
| 2.1 | T6 | 7.1 | T23 |
| 2.2 | T6 | 7.2 | T17 |
| 2.3 | T6 | 7.3 | T17 |
| 2.4 | T5, T15 | 7.4 | T23 |
| 2.5 | T4, T5 | 7.5 | T23 |
| 2.6 | T2, T5, T14 | 7.6 | T25 |
| 2.7 | T6, T14 | 7.7 | T23 |
| 2.8 | T4, T5 | 7.8 | T23 |
| 3.1 | T3 | 8.1 | T10, T26 |
| 3.2 | T3 | 8.2 | T26 |
| 3.3 | T3 | 8.3 | T26 |
| 3.4 | T4 | 8.4 | T17, T26 |
| 3.5 | T3, T11 | 8.5 | T17, T26 |
| 3.6 | T1, T3 | 9.1 | T20 |
| 4.1 | T4, T11 | 9.2 | T19 |
| 4.2 | T11 | 9.3 | T15 |
| 4.3 | T10, T11 | 9.4 | T9, T27 |
| 4.4 | T10, T11 | 9.5 | T25 |
| 4.5 | T11, T22 | 9.6 | T27 |
| 4.6 | T4 | 10.1 | T20 |
| 4.7 | T4 | 10.2 | T20 |
| 4.8 | T3, T11 | 10.3 | T20 |
| 5.1 | T10, T12 | 10.4 | T21 |
| 5.2 | T12 | | |
| 5.3 | T5 | | |
