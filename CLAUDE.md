# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Crypto Crime Academy — landing pública

Landing de una sola página para un **curso de investigación de criptoactivos**, dirigido a fuerzas del orden, legales, cumplimiento y forense. Solo español, sin i18n. Su único compromiso con el resto del producto es un enlace saliente a la pantalla de acceso.

## Stack

- Next.js + TypeScript — elegido por sobre Astro para poder alojar más adelante la pantalla de acceso OTP en la misma app vía route handlers
- Zod 4 — validación del contenido en el momento de importarlo. Los esquemas usan `z.strictObject()` y `z.url()`; `.strict()` y `z.string().url()` están deprecados en la versión 4
- Vitest — corredor de tests, elegido en T1. Comparte con Vite la resolución de módulos y el alias `@/*`, sin paso de transpilación aparte. Desde T10 se agrega entorno DOM por archivo

## Comandos de verificación

La verificación de toda tarea es `npm run typecheck && npm test`. Las tareas T22 a T27 agregan `npm run test:e2e`, que **todavía no existe**: el andamiaje E2E lo crea T22.

| Comando | Qué hace |
|---|---|
| `npm run typecheck` | `tsc --noEmit`, con `strict` y `noUncheckedIndexedAccess` |
| `npm test` | `vitest run` |
| `npm run build` | `next build` |
| `npm run dev` | Servidor de desarrollo |

No afirmar que la suite está en verde sin haberla corrido.

## Workflow de trabajo

`/brainstorming` (definición) → `/specify` (spec en `docs/specs/`) → `planning-task` (convergencia del plan) → ejecución (TDD)

- **`/brainstorming`** — explora la idea y termina con un diseño aprobado. Ya se ejecutó para esta feature el 2026-08-11; sus decisiones son input ya resuelto (ver **Decisiones cerradas**), no se vuelven a discutir.
- **`/specify`** (`.claude/Skills/specify/SKILL.md`) — formaliza el diseño aprobado en `docs/specs/<YYYY-MM-DD>-<feature>/`: primero `requirements.md` con criterios EARS numerados `N.M`, pausa para aprobación explícita; luego `design.md`, pausa. La Fase 3 (`tasks.md`) no se escribe a mano: se delega en `planning-task`.
- **`planning-task`** (`.claude/Skills/planning-task/SKILL.md`) — asegura el input (`requirements.md` y `design.md` aprobados) y ejecuta la planeación lanzando el subagente `planner`: una invocación en modo `bootstrap` si `tasks.md` no existe, y después **una tarea por invocación, estrictamente secuencial** — nunca en paralelo, porque todas comparten el mismo archivo y una escritura concurrente lo corrompe. No cierra hasta el 100% de las tareas en `CRITERIA MET`; una convergencia parcial no cuenta.
- **`planner`** (subagente, `.claude/agents/planner.md`) — no es un revisor que devuelve observaciones: juzga cada tarea contra cuatro criterios (tamaño, alineación con el spec, completitud, necesidad) y **aplica él mismo los arreglos** en `tasks.md` antes de emitir su veredicto (`CRITERIA MET` / `NEEDS ITERATION`). Nunca implementa, nunca toca `requirements.md` ni `design.md` — si encuentra un hueco ahí, lo reporta en el veredicto. Tres `NEEDS ITERATION` seguidos sobre la misma tarea es señal de un hueco estructural del spec: se para y se consulta al usuario.
- Con el `tasks.md` aprobado, pasa a la ejecución en TDD, registrando en cada tarea su Decision log y Outcome. Durante la planeación esos dos campos quedan **vacíos**.

Estado actual del pipeline: **planeación cerrada, ejecución en curso.** Los tres artefactos están escritos y aprobados en `docs/specs/2026-08-12-landing-publica/`; `tasks.md` tiene 27 tareas convergidas. La tabla **Resumen de tareas** de ese archivo es la única fuente de verdad del avance — consultarla antes de empezar, no confiar en esta línea.

Hechas hasta hoy (2026-08-13): T1 a T17. Dejaron `lib/`, `styles/tokens.{ts,css}`, `components/ui/` (`Disclosure`, `Badge`, `ProfileCard`, `MetricCard`, `DecorativeIcon`), `components/sections/` (`Hero`, `FinalCta`, `ProgramSection`, `FaqSection`, `UpdatesSection`, `AudienceSection`, `MethodologySection`, `SocialProofSection`, `TopNavBar`, `SiteFooter`) y los nueve archivos de `content/`. Siguiente tarea: **T18** (composición de la página e integridad de anclas).

Patrón establecido para criterios que se cumplen **por ausencia** (sin scrollspy, sin JavaScript propio): el test lee el archivo fuente y afirma que no contiene `useState`, `useEffect`, `addEventListener`, `IntersectionObserver`, `onClick` ni `use client`. El DOM renderizado no distingue esos casos. **Quitar los comentarios antes de afirmar** — un comentario que menciona la palabra prohibida hace fallar el test (pasó en T17).

`NavPanel` es el **único** componente de cliente del sitio. Su efecto solo retira el atributo `open`; no llama a `preventDefault`, no toca historial ni desplazamiento. Cualquier responsabilidad extra ahí rompe el Requisito 8.

Commit inicial: `0ceac7e`, cubre T1 a T14. De acá en adelante conviene un commit por tarea.

`NEXT_PUBLIC_ACCESS_URL` vive en `.env.local` (no versionado) y, para los tests, en el bloque `test.env` de `vitest.config.ts`.

Los tokens de color tienen cuatro categorías en `styles/tokens.ts`: texto (4.5:1), interfaz (3:1), fondo y **decoración** (exenta de umbral). Un token nuevo sin clasificar rompe el test.

Tests de componente: entorno jsdom **por archivo**, con `// @vitest-environment jsdom` en la primera línea. `vitest.config.ts` declara `esbuild.jsx: "automatic"` porque `tsconfig.json` usa `jsx: "preserve"` para Next; sin eso, todo test de componente falla con `React is not defined`.

**Configuración requerida, todavía ausente:** `NEXT_PUBLIC_ACCESS_URL` (la dirección de la pantalla de acceso). No existe `.env.example` ni `.env.local`. `lib/access-url.ts` lanza al importarse sin ella, así que la compilación se romperá en cuanto T13 o T16 la usen.

T7 se ejecutó fuera del orden del listado, a propósito: los esquemas de navegación y pie de T5 validan `href` contra las anclas reales y necesitan `SECTION_IDS`. El orden a respetar es el de **Depende de**, no el numérico.

## Contenido y valores derivados

El contenido vive en archivos versionados del repositorio, validado con Zod al importarlo. Sin CMS, sin API, sin peticiones de red ni en compilación ni en ejecución. Contenido mal formado debe **romper la compilación** indicando archivo, campo y motivo.

El Requisito 3 es el que sostiene la estructura: la compilación falla si un archivo de contenido declara explícitamente cualquiera de estos valores.

| Valor | Se deriva de |
|---|---|
| Código de módulo `EXP-NN` | Posición en el temario, dos dígitos |
| Cantidad de módulos | Largo del arreglo |
| Duración total | Suma de `videoMinutes` solo sobre módulos `available`; se omite cuando da cero |

Otras decisiones cerradas del diseño:

- Los módulos son una **unión discriminada por `status`**: `available` (exige `videoMinutes`, resumen desplegable opcional) frente a `coming-soon` (adelanto siempre visible, NO debe declarar `videoMinutes` ni resumen).
- Los desplegables son `<details>`/`<summary>` nativos, varios abiertos a la vez. Esto es lo que vuelve alcanzable el Requisito 8 (funcionamiento sin JavaScript).
- El estado activo de la navegación es **solo hover**. Sin scrollspy, deliberadamente.
- La autenticación está fuera de alcance. La landing solo enlaza a la pantalla de correo y código, diferenciada por `?intent=login` y `?intent=signup`. La dirección base sale de la configuración del proyecto; si falta o es inválida, falla la compilación.

## Preguntas abiertas que bloquean la publicación

No bloquean diseño ni implementación, pero sí salir a producción:

- Sin respuestas de FAQ ni contenido desplegado para `EXP-00`/`EXP-01` — hasta que exista, esos módulos van sin control de despliegue (criterio 4.4).
- Los adelantos de `EXP-02` a `EXP-06` arrancan con el marcador `[REVISAR]`.
- Las métricas `5000+` investigadores y `120+` agencias no tienen respaldo. Este público evalúa evidencia de forma profesional: una cifra que no se sostiene es riesgo de credibilidad.
- Los tres sellos de confianza son marcadores de posición, no afiliaciones reales.
- No existe imagen de vista previa para redes — sin ella el criterio 10.3 falla la compilación. `content/site.ts` ya declara `/og.png`, que todavía no existe en disco.
- Contraste: **cerrado en T9**, con test que lo mide. `--cream` es `#f8f7f4` (leído del mockup, nodo 23:184). Sobre crema: navy 14.89:1, dorado de texto `#7d6234` 5.34:1, gris `#616267` 5.68:1, `--gold-line` `#98773e` 3.89:1 como elemento de interfaz. La tabla de `design.md` sigue diciendo «por confirmar»: hay que actualizarla.
- **Seguridad, parcialmente resuelta (2026-08-13).** `next` pasó de `15.5.4` a `15.5.23` y `vitest` de `3.1.4` a `3.2.7`: se cerraron las dos críticas, incluida la ejecución remota de código en el protocolo flight de React. Quedan **3 de severidad alta** en `postcss` y `sharp`, ambas transitivas de Next: el único arreglo que ofrece npm es `next@16.3.0`, un cambio mayor. Migrar a Next 16 es una decisión aparte, no un `audit fix`.
- **Registro verbal: tuteo, decidido por el usuario el 2026-08-13.** Los tres CTA dicen «Inscríbete» (criterio 6.6). El mockup usaba las tres formas —«Explorar curso» en el hero, «Inscríbete» en el temario, «Inscribite» en el cierre—; se unificó en tuteo. Cualquier texto nuevo de interfaz sigue el mismo registro: nada de voseo.
- Pendiente de revisar por el cambio de registro: `content/methodology.ts` dice «Aprenda a redactar…», que es forma de usted. Es copia literal del mockup, pero convive mal con el tuteo de los CTA.
- Copia del mockup que T6 no pudo leer (límite del plan Starter del MCP de Figma): subtítulo del hero (nodo 23:279), titular y texto del cierre (23:379, 23:381), titular y descripción de prueba social (23:232, 23:234), descripción del pie (23:396), rótulo del botón de acceso (23:445) y etiqueta de marca (23:431). Todos llevan marcador `[REVISAR]` en `content/`.
- La duración por módulo de `EXP-00` y `EXP-01` (35 y 45 min) está inventada para sumar los «1 H 20 MIN» del mockup, que solo declara el total.
- El pie del mockup enlaza Privacidad, Términos, Acreditaciones y Newsletter — páginas, no secciones. `design.md` modela `footer.links` como anclas. Si el pie debe enlazar páginas legales, hay que cambiar el diseño y el esquema, no el archivo de contenido.

## Reglas

- Una feature a la vez. No abrir frentes en paralelo.
- TDD: test que falla → implementar → test que pasa. Cada tarea es un solo ciclo y traza a al menos un criterio numerado.
- Los tres artefactos de spec se escriben **enteramente en español**, sin importar el idioma de la conversación. Código, identificadores, comentarios y commits en inglés; textos de interfaz en español.
- Ninguna fase arranca sin aprobación explícita del usuario de la anterior.
- `tasks.md` nunca se edita a mano: toda escritura pasa por el subagente `planner`.
- No agregar dependencias sin necesidad.
- `.atl/skill-registry.md` referencia las rutas como `.claude/skills/...` pero el directorio en disco es `.claude/Skills/`. Resuelve en Windows; se rompería en un sistema de archivos o CI sensible a mayúsculas.
