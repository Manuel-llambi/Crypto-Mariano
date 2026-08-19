# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Crypto Crime Academy — landing pública

Landing de una sola página para un **curso de investigación de criptoactivos**, dirigido a fuerzas del orden, legales, cumplimiento y forense. Solo español, sin i18n. Su único compromiso con el resto del producto es un enlace saliente a la pantalla de acceso.

## Stack

- Next.js + TypeScript — elegido por sobre Astro para poder alojar más adelante la pantalla de acceso OTP en la misma app vía route handlers
- Zod 4 — validación del contenido en el momento de importarlo. Los esquemas usan `z.strictObject()` y `z.url()`; `.strict()` y `z.string().url()` están deprecados en la versión 4
- Vitest — corredor de tests, elegido en T1. Comparte con Vite la resolución de módulos y el alias `@/*`, sin paso de transpilación aparte. Desde T10 se agrega entorno DOM por archivo

## Comandos de verificación

La verificación de toda tarea es `npm run typecheck && npm test`. Las tareas T22 a T27 agregan `npm run test:e2e` (Playwright, contra `next build` + `next start` en el puerto 3100). **`workers: 1` a propósito:** con más, cinco Chromium en paralelo no disparan `load` y toda la suite expira. **`tsconfig.json` excluye `e2e/`**, así que `typecheck` no cubre las specs.

| Comando | Qué hace |
|---|---|
| `npm run typecheck` | `tsc --noEmit`, con `strict` y `noUncheckedIndexedAccess` |
| `npm test` | `vitest run` |
| `npm run test:e2e` | `playwright test` — compila y sirve antes de correr. **Exige Docker con `supabase start` arriba y la base sembrada** |
| `npm run verify` | encadena typecheck, test, build y test:e2e — lo mismo que CI |
| `npm run build` | `next build` |
| `npm run dev` | Servidor de desarrollo |

No afirmar que la suite está en verde sin haberla corrido.

## Workflow de trabajo

`/brainstorming` (definición) → `/specify` (spec en `docs/specs/`) → `planning-task` (convergencia del plan) → ejecución (TDD) → `verify-implementation` (loop de verificación E2E, que puede devolver a ejecución)

- **`/brainstorming`** — explora la idea y termina con un diseño aprobado. Ya se ejecutó para esta feature el 2026-08-11; sus decisiones son input ya resuelto (ver **Decisiones cerradas**), no se vuelven a discutir.
- **`/specify`** (`.claude/Skills/specify/SKILL.md`) — formaliza el diseño aprobado en `docs/specs/<YYYY-MM-DD>-<feature>/`: primero `requirements.md` con criterios EARS numerados `N.M`, pausa para aprobación explícita; luego `design.md`, pausa. La Fase 3 (`tasks.md`) no se escribe a mano: se delega en `planning-task`.
- **`planning-task`** (`.claude/Skills/planning-task/SKILL.md`) — asegura el input (`requirements.md` y `design.md` aprobados) y ejecuta la planeación lanzando el subagente `planner`: una invocación en modo `bootstrap` si `tasks.md` no existe, y después **una tarea por invocación, estrictamente secuencial** — nunca en paralelo, porque todas comparten el mismo archivo y una escritura concurrente lo corrompe. No cierra hasta el 100% de las tareas en `CRITERIA MET`; una convergencia parcial no cuenta.
- **`planner`** (subagente, `.claude/agents/planner.md`) — no es un revisor que devuelve observaciones: juzga cada tarea contra cuatro criterios (tamaño, alineación con el spec, completitud, necesidad) y **aplica él mismo los arreglos** en `tasks.md` antes de emitir su veredicto (`CRITERIA MET` / `NEEDS ITERATION`). Nunca implementa, nunca toca `requirements.md` ni `design.md` — si encuentra un hueco ahí, lo reporta en el veredicto. Tres `NEEDS ITERATION` seguidos sobre la misma tarea es señal de un hueco estructural del spec: se para y se consulta al usuario.
- Con el `tasks.md` aprobado, pasa a la ejecución en TDD, registrando en cada tarea su Decision log y Outcome. Durante la planeación esos dos campos quedan **vacíos**.
- **`verify-implementation`** (`.claude/Skills/verify-implementation/SKILL.md`) — se dispara al terminar la implementación y **es un loop, no una etapa lineal**: corre la verificación del repo y, solo si queda en verde, encadena `plan-test-cases` → subagente `generate-tests` → subagente `healer`. El veredicto del healer decide si el ciclo se cierra o vuelve a implementación. No arranca sobre una base en rojo.
- **`plan-test-cases`** (`.claude/Skills/plan-test-cases/SKILL.md`) — deriva del spec **exactamente tres** casos E2E: uno de camino feliz y dos de fallo, cada uno trazado a un criterio numerado. Escribe `E2E-test-cases-plan.md` en la carpeta del spec y declara ahí el nombre del archivo destino en `e2e/`. Se deriva del spec, nunca del código.
- **`generate-tests`** (subagente, `.claude/agents/generate-tests.md`) — traduce ese plan a un único `.spec.ts` en `e2e/`, con los IDs `CP-01`/`CF-01`/`CF-02` en los títulos. No corre lo que escribe, y ese reparto es a propósito: quien corre el test tiene la tentación de ajustar la aserción hasta que pase.
- **`healer`** (subagente, `.claude/agents/healer.md`) — corre el script y diagnostica cada fallo decidiendo si la culpa es del test, del código o del plan. **No cura nada, pese al nombre**: el único archivo que puede crear o modificar es `E2E-test-cases-report.md`. Un veredicto de «Código» sin archivo y línea citados no es válido.

Estado actual del pipeline: **dos specs ejecutados.**

- `docs/specs/2026-08-12-landing-publica/` — las 27 tareas en `[x] Hecha`.
- `docs/specs/2026-08-17-login-supabase/` — las 16 tareas en `[x] Hecha` (2026-08-18). Dejó el acceso real: `.env` versionado, `lib/supabase/{env,server,health}.ts`, `app/acceso/actions.ts`, `middleware.ts`, la guardia de `app/panel/layout.tsx`, `supabase/seed.sql`, y las suites `e2e/{acceso,no-javascript,panel}.spec.ts` con su `auth.setup.ts`.

La tabla **Resumen de tareas** de cada archivo sigue siendo la fuente de verdad.

**Las 27 tareas están hechas.** Dejaron `lib/`, `styles/tokens.{ts,css}`, `components/ui/` (`Disclosure`, `Badge`, `ProfileCard`, `MetricCard`, `DecorativeIcon`), `components/sections/` (`Hero`, `FinalCta`, `ProgramSection`, `FaqSection`, `UpdatesSection`, `AudienceSection`, `MethodologySection`, `SocialProofSection`, `TopNavBar`, `SiteFooter`) y los nueve archivos de `content/`. La implementación está completa; lo que queda son las preguntas abiertas de publicación listadas más abajo.

**Después del spec, y fuera de sus 27 tareas**, se agregaron las cuatro pantallas transaccionales: `app/acceso/` y las tres de `app/registro/`, con `components/sections/AccessScreen` y `AccessTopBar`, `components/ui/Field` y `FieldAction`, `content/access.ts` con su `AccessSchema`, `lib/routes.ts`, y las suites `e2e/acceso.spec.ts` y `e2e/registro.spec.ts`. No tienen entrada en `tasks.md` ni requisitos numerados; se implementaron contra el diseño de Stitch.

**Y después el panel del alumno (2026-08-14), también contra Stitch** («Dashboard de Alumno — Fidelity Replica»): `app/panel/` con su propio `layout.tsx` —el chrome que las pantallas siguientes del panel van a compartir—, `components/sections/PanelTopBar`, `PanelSidebar`, `ContinueCard`, `ProgressCard` y `ModuleGrid`, `components/ui/PanelIcon`, `content/panel.ts` con su `PanelSchema`, `lib/panel/derive.ts` y `e2e/panel.spec.ts`. **No repite el temario**: lee los mismos siete módulos de `content/program.ts` y solo les superpone la posición del alumno. Sin requisitos numerados propios.

Patrón establecido para criterios que se cumplen **por ausencia** (sin scrollspy, sin JavaScript propio): el test lee el archivo fuente y afirma que no contiene `useState`, `useEffect`, `addEventListener`, `IntersectionObserver`, `onClick` ni `use client`. El DOM renderizado no distingue esos casos. **Quitar los comentarios antes de afirmar** — un comentario que menciona la palabra prohibida hace fallar el test (pasó en T17).

`NavPanel` es el **único** componente de cliente del sitio. Su efecto solo retira el atributo `open`; no llama a `preventDefault`, no toca historial ni desplazamiento. Cualquier responsabilidad extra ahí rompe el Requisito 8.

Commit inicial: `0ceac7e`, cubre T1 a T14. De acá en adelante, un commit por tarea.

**Un test que pasa en la primera corrida no cuenta como verificado.** Si no lo viste en rojo, comprobalo por mutación: rompé a propósito lo que debería detectar, confirmá que falla *solo* ese test, y restaurá con `git checkout`. Se usó en T18, T19, T20 y T21. En T18 descubrió un defecto real en el mensaje de error. En T24 hizo falta **tres veces**: las dos primeras el test seguía verde sin la implementación, porque el criterio se cumplía por relleno decorativo; recién al afirmar el borde superior de la sección la mutación tumbó los casos. **Ojo:** `git checkout` no restaura un archivo que todavía no está versionado — commitealo antes de mutarlo, o reponé a mano.

`NEXT_PUBLIC_ACCESS_URL` sigue declarada en el bloque `test.env` de `vitest.config.ts`, pero **solo la usa el test de `lib/access-url.ts`**. Ningún componente importa ese módulo desde el 2026-08-14 (ver más abajo).

Los tokens de color tienen cuatro categorías en `styles/tokens.ts`: texto (4.5:1), interfaz (3:1), fondo y **decoración** (exenta de umbral). Un token nuevo sin clasificar rompe el test.

Tests de componente: entorno jsdom **por archivo**, con `// @vitest-environment jsdom` en la primera línea. `vitest.config.ts` declara `esbuild.jsx: "automatic"` porque `tsconfig.json` usa `jsx: "preserve"` para Next; sin eso, todo test de componente falla con `React is not defined`.

**No hace falta configurar nada para compilar**, y ahora es una promesa sostenida por un archivo versionado: `.env` trae `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` de la instancia local, que son públicas e idénticas en cualquier máquina. `.env.local` sigue ignorado y lo pisa, que es por donde entraría una instancia alojada.

**6.1 dejó de ser un mecanismo y pasó a ser una protección real.** `lib/supabase/env.ts` lanza al importar, y desde el 2026-08-18 hay dos rutas que lo meten en el grafo que `next build` **carga** — `/acceso` y `/panel` —, así que sin el `.env` el build **falla de verdad**: `Failed to collect configuration for /acceso` con `- SUPABASE_URL: Invalid input`. Es lo contrario de lo que pasaba con `NEXT_PUBLIC_ACCESS_URL`: `lib/access-url.ts` sigue lanzando si falta, pero nadie lo importa desde el 2026-08-14, así que el módulo no se carga y no protege nada. Retirar ese archivo, su test y la entrada de `vitest.config.ts` es limpieza pendiente, no una decisión tomada.

**La suite de punta a punta depende de Docker.** `supabase start` tiene que estar arriba y la base sembrada (`supabase db reset`). Si la instancia no responde, el `globalSetup` de Playwright aborta la corrida con un mensaje que nombra esa causa y **cero casos ejecutados**, en vez de dejar que cada caso muera en un `expect` vencido apuntando a código sano. Ojo: ese setup corre **después** del `webServer`, así que no ahorra el build — solo reemplaza el diagnóstico.

T7 se ejecutó fuera del orden del listado, a propósito: los esquemas de navegación y pie de T5 validan `href` contra las anclas reales y necesitan `SECTION_IDS`. El orden a respetar es el de **Depende de**, no el numérico.

## Contenido y valores derivados

El contenido vive en archivos versionados del repositorio, validado con Zod al importarlo. Sin CMS, sin API, sin peticiones de red ni en compilación ni en ejecución. Contenido mal formado **rompe la compilación** indicando archivo, campo y motivo — verificado de punta a punta en T18: `Invalid content in content/faq.ts: - 0.categoria: unrecognized field`. `app/page.tsx` es el único módulo que importa `lib/content`; las secciones reciben props.

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
- **La autenticación dejó de estar fuera de alcance, y solo en `/acceso` (2026-08-18).** El spec `2026-08-17-login-supabase` revirtió dos de las seis prohibiciones de 6.7 —autenticar y gestionar sesión— para esa pantalla; el criterio quedó tachado parcialmente en `requirements.md` de la landing. El alta de cuentas, el envío y la verificación de códigos y el cobro siguen prohibidos.
- **Las pantallas transaccionales viven acá, y todas las rutas son internas (2026-08-14).** «Iniciar sesión» va a `/acceso?intent=login`. Los tres controles de «Inscríbete» van a `/registro?intent=signup`, paso 1 de un alta de tres pantallas: `/registro` (correo) → `/registro/codigo` (código) → `/registro/crear-cuenta` (cuenta). Y `/acceso` desemboca en `/panel`. Todas las direcciones son constantes de `lib/routes.ts`; no hay variable de entorno ni URL saliente. Esto dejó **superados los criterios 6.4 y 6.5**, tachados en `requirements.md` sin renumerar el resto.
- **Las tres de `/registro` siguen siendo maquetas inertes.** No envían el código, no lo verifican y no crean la cuenta (6.7). El control de cada paso intermedio es un ancla que avanza pase lo que pase, incluso sin escribir nada; la única que cierra con un botón inerte es `/registro/crear-cuenta`. **`/acceso` ya no es una de ellas:** verifica las credenciales contra la instancia local de Supabase y abre sesión.
- **`/acceso` renderiza un `<form>`, y las otras tres no. La regla es el `action`, no el `<form>`.** Un formulario **sin `action`** se envía por GET y pondría la contraseña en la barra de direcciones, y de ahí en el historial, los registros del servidor y el `Referer` siguiente. El de `/acceso` postea a una Server Action, así que ningún campo se serializa en la URL — y encima es lo que hace que el acceso funcione sin JavaScript. `e2e/acceso.spec.ts` lo defiende por el lado que importa: afirma que un rechazo aterriza en `?intent=login&error=credenciales` **exacto**, sin la contraseña ni el correo. Si alguna vez agregás un `<form>` a las de `/registro`, los tres tests de esas pantallas te van a frenar.
- **Ninguna tiene requisitos numerados propios del spec de la landing**: se implementaron contra el diseño de Stitch. `/acceso` sí los tiene ahora, en `docs/specs/2026-08-17-login-supabase/`. Las cuatro transaccionales comparten `AccessScreen`, que tiene **tres** modos: `submitAction` es un `<form>` que postea, `submitHref` es un `<a>`, ninguno de los dos es un botón inerte. Todas, panel incluido, declaran `noindex`, y no deben publicarse mientras el alta siga siendo maqueta.
- **El panel tiene guardia de ruta desde el 2026-08-18.** Vive en `app/panel/layout.tsx` —el chrome compartido, para que alcance a las pantallas que se agreguen debajo— y consulta la sesión con `getUser()`, que valida contra el servidor de autenticación, nunca con `getSession()`, que le cree a la cookie. `middleware.ts` renueva el token en `/panel/:path*` y **no autoriza nada**: la decisión de dejar pasar es del layout.
- **Un solo módulo toca cookies de sesión: `lib/supabase/server.ts`.** Fuerza `httpOnly: true` sobre lo que la librería mande, se lo haya pedido o no, y se traga la excepción que Next arroja al escribir cookies desde un componente de servidor. `middleware.ts` arma su propio adaptador porque la renovación tiene que viajar en la **respuesta**, un objeto que aquel módulo no ve.
- **La cuenta de trabajo y de pruebas es una sola**, sembrada por `supabase/seed.sql`: `alumno@crypto-crime.test` / `investigacion-2024`. El SQL no puede importar nada, así que los mismos literales viven una segunda vez en `e2e/seeded-account.ts`; si los dos archivos se separan, el síntoma es «credenciales inválidas» sobre credenciales correctas. **Las ocho columnas de token de `auth.users` van en cadena vacía y no en NULL:** GoTrue las escanea hacia un `string` de Go y un NULL devuelve `500 Database error querying schema` al iniciar sesión.
- **El panel deriva el estado del alumno de un solo número.** `content/panel.ts` declara `record.currentModuleIndex` y nada más sobre la posición; `lib/panel/derive.ts` saca de ahí qué módulo está aprobado, cuál en curso, cuáles bloqueados y qué `EXP-NN` desbloquea a cada uno. Es la misma regla del criterio 3.4: el archivo de contenido declara una posición, nunca un código. `overallPercent` sí está declarado a mano, y el comentario del archivo dice por qué (2 de 7 es 28,6%, no 35%).

## Preguntas abiertas que bloquean la publicación

No bloquean diseño ni implementación, pero sí salir a producción:

- **El acceso solo existe contra la instancia local.** `.env` apunta a `http://127.0.0.1:55321` con la clave publicable de demo; una instancia alojada entra por `.env.local` o por el entorno del proveedor, y esa decisión no se tomó. Mientras tanto, `supabase/seed.sql` versiona un usuario con contraseña en claro — inofensivo en una base local que se recrea con `db reset`, inaceptable si ese archivo llegara a correrse contra otra cosa.
- **El alta de cuentas sigue siendo maqueta.** Se puede entrar, pero no registrarse: `/registro` no envía el código, no lo verifica y no crea la cuenta. Publicar un acceso que funciona junto a un alta que no lo hace es peor que no publicar ninguno. Conectarlo es un spec posterior.
- **No hay forma de cerrar sesión**, y está declarado fuera de alcance en el spec de acceso: el enlace «Cerrar sesión» del panel lleva a `/acceso` sin terminar nada. Las cookies se limpian a mano.
- **`/panel` no tiene recuperación de contraseña**: `forgotHref` apunta a `/recuperar-acceso`, que no existe y cae en la 404 (ver más abajo).
- Sin respuestas de FAQ ni contenido desplegado para `EXP-00`/`EXP-01` — hasta que exista, esos módulos van sin control de despliegue (criterio 4.4).
- Los adelantos de `EXP-02` a `EXP-06` arrancan con el marcador `[REVISAR]`.
- Las métricas `5000+` investigadores y `120+` agencias no tienen respaldo. Este público evalúa evidencia de forma profesional: una cifra que no se sostiene es riesgo de credibilidad.
- Los tres sellos de confianza son marcadores de posición, no afiliaciones reales.
- **`public/og.png` es un marcador de posición** (rayas navy y doradas, generado en T20). Se verificó que el guardián de 10.3 aborta el build cuando falta el archivo, pero **con el marcador presente ya no protege nada**: dejó de avisar justo del problema que sigue abierto. Reemplazarla por la imagen real es requisito de publicación.
- Contraste: **cerrado en T9**, con test que lo mide. `--cream` es `#f8f7f4` (leído del mockup, nodo 23:184). Sobre crema: navy 14.89:1, dorado de texto `#7d6234` 5.34:1, gris `#616267` 5.68:1, `--gold-line` `#98773e` 3.89:1 como elemento de interfaz. La tabla de `design.md` sigue diciendo «por confirmar»: hay que actualizarla.
- **Seguridad, parcialmente resuelta (2026-08-13).** `next` pasó de `15.5.4` a `15.5.23` y `vitest` de `3.1.4` a `3.2.7`: se cerraron las dos críticas, incluida la ejecución remota de código en el protocolo flight de React. Quedan **3 de severidad alta** en `postcss` y `sharp`, ambas transitivas de Next: el único arreglo que ofrece npm es `next@16.3.0`, un cambio mayor. Migrar a Next 16 es una decisión aparte, no un `audit fix`.
- **Registro verbal: tuteo, decidido por el usuario el 2026-08-13.** Los tres CTA dicen «Inscríbete» (criterio 6.6). El mockup usaba las tres formas —«Explorar curso» en el hero, «Inscríbete» en el temario, «Inscribite» en el cierre—; se unificó en tuteo. Cualquier texto nuevo de interfaz sigue el mismo registro: nada de voseo.
- Pendiente de revisar por el cambio de registro: `content/methodology.ts` dice «Aprenda a redactar…», que es forma de usted. Es copia literal del mockup, pero convive mal con el tuteo de los CTA.
- **Mismo problema dentro de `content/access.ts`:** `login` trata de usted («Acceda a su terminal…»), copia literal del mockup, mientras las tres pantallas de `signup` son tuteo. Dos pantallas contiguas del mismo flujo tratan al visitante de distinta forma.
- **`forgotHref` apunta a `/recuperar-acceso`, que no existe**: hoy cae en la 404. Además está declarado en `content/access.ts`, no en `lib/routes.ts`, lo que contradice el criterio que el propio archivo enuncia («las direcciones son rutas y viven en `lib/routes.ts`»).
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
