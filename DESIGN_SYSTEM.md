# Lex Forensica — Design System
> Fuente de verdad única de estilo para Crypto Crime Academy.
> Combina la intención de marca definida en Stitch (`DESIGN.md` original) con la implementación real relevada en `/`, `/acceso?intent=login`, `/panel` y `/panel/modulo/exp-NN/lec-NN`.
> Última sincronización con código: 2026-08-21.
>
> **Desde el 2026-08-20 este archivo ya no va por delante del código: la sección 3 está aplicada.** `styles/tokens.{ts,css}` declara la nomenclatura Material, los 30 módulos CSS del proyecto la usan, y no queda ni un `var(--navy)`. Lo que sigue abierto está al final, en la sección 7.

---

## 0. Cómo usar este archivo

- **Para exploración visual (Stitch / diseño):** usar la sección 1 (Brand) y 2 (Tokens de intención) como brief.
- **Para implementación (código):** usar la sección 3 (Tokens reales `:root`) y 4 (Inventario de componentes) — son los valores que *ya existen* en el CSS, con su clase de origen.
- **Sección 5 (Divergencias):** diferencias detectadas entre la spec de Stitch y lo implementado. Resolver antes de seguir construyendo pantallas nuevas, para no arrastrar inconsistencias.
- Cuando agregues una pantalla nueva: primero buscá si el componente ya existe acá (sección 4). Si no existe, definilo acá antes que en código.

---

## 1. Brand & Concepto

**Metáfora:** "Expediente" (Case File). Plataforma de e-learning para perfiles de justicia, seguridad y compliance, con estética de repositorio institucional — lo opuesto a la volatilidad visual del marketing cripto.

Pilares del estilo — **Institutional Minimalism**:
- **Densidad tipo informe:** legibilidad y densidad de datos por sobre el whitespace "consumer".
- **Autoridad documental:** bordes y grillas estructuradas en vez de sombras flotantes.
- **Precisión forense:** todo módulo/recurso tiene un código de referencia verificable (`EXP-00`, `EXP-01`...).
- **Contención táctil:** radios sutiles, texturas "Paper"/"Ink".

Respuesta emocional buscada: **solemnidad, confiabilidad, precisión.**

Reglas duras:
- Sin gradientes decorativos.
- Contraste alto (WCAG AA).
- Iconografía: metáforas legales/forenses (balanzas, lupas, candados). Prohibido: monedas, cohetes, cubos 3D, sparkles.

---

## 2. Paleta — nomenclatura Material (canónica)

Esta es la nomenclatura oficial del sistema, tanto para Stitch como para código. Reemplaza los nombres cortos (`--navy`, `--gold-text`, etc.) que hoy están en el CSS servido — ver nota de migración al final de la sección 3.

| Token Material | Hex | Uso |
|---|---|---|
| `primary` | `#16213C` | Navy — texto de marca, fondos oscuros, botones sólidos, bordes de card activa |
| `on-primary` | `#FFFFFF` | Texto/ícono sobre `primary` |
| `secondary` | `#586474` | Slate — metadata, texto secundario |
| `tertiary` / accent | `#98773E` | Brass — líneas de acento, eyebrows, código `EXP-XX`, iconos de metodología |
| `on-tertiary` | `#7D6234` | Brass texto (variante más oscura, usada sobre fondo claro) |
| `background` | `#F8F7F4` | Paper — fondo base de toda la app |
| `on-background` | `#1A1C1A` | Texto principal sobre `background` |
| `surface` | `#FFFFFF` | Fondo de cards, inputs, contenedores |
| `on-surface` | `#1A1C1A` | Texto principal sobre `surface` |
| `on-surface-variant` | `#616267` | Texto secundario/metadata sobre `surface` |
| `outline` | `#C6C6CE` | Bordes por defecto — inputs, badges "locked", separadores |
| `outline-variant` | `#E3E2DF` | Bordes muy sutiles / divisores internos |
| `error` | `#BA1A1A` | Errores, warnings destructivos, "Procedural Flags" |
| `on-error` | `#FFFFFF` | Texto/ícono sobre `error` |
| `error-container` | `#FFDAD6` | Fondo suave para mensajes de error no críticos |
| `on-error-container` | `#93000A` | Texto sobre `error-container` |
| `ink` | `#151B28` | Variante más oscura de `primary`, uso puntual (headers full-bleed) |
| `parchment` | `#F1E9DC` | Variante cálida de `surface`, para bloques "nested" |

Tipografía: **IBM Plex Sans** (headlines, UI y body — ver divergencia resuelta en sección 5.1), **IBM Plex Mono** (data/labels/eyebrows/botones). Source Serif 4 queda disponible como recurso puntual (ver 5.1), no como default de headline.

---

## 3. Tokens CSS (`:root`) — nomenclatura Material

Listos para reemplazar el bloque `:root` actual del proyecto. Mantiene la estructura de layout/spacing/forma ya validada en producción, pero migra el color a nomenclatura Material y fija los puntos resueltos con vos (headline en sans, botón unificado, error `#BA1A1A`).

```css
:root {
  /* Color — Material naming */
  --color-primary: #16213c;
  --color-on-primary: #ffffff;
  --color-secondary: #586474;
  --color-tertiary: #98773e;
  --color-on-tertiary: #7d6234;
  --color-background: #f8f7f4;
  --color-on-background: #1a1c1a;
  --color-surface: #ffffff;
  --color-on-surface: #1a1c1a;
  --color-on-surface-variant: #616267;
  --color-outline: #c6c6ce;
  --color-outline-variant: #e3e2df;
  --color-error: #ba1a1a;
  --color-on-error: #ffffff;
  --color-error-container: #ffdad6;
  --color-on-error-container: #93000a;
  --color-ink: #151b28;
  --color-parchment: #f1e9dc;

  /* Tipografía */
  --font-sans: var(--font-sans-face), system-ui, sans-serif;   /* IBM Plex Sans — headlines + UI + body */
  --font-mono: var(--font-mono-face), ui-monospace, monospace; /* IBM Plex Mono — data/labels/eyebrows/botones */
  --font-serif: var(--font-serif-face), Georgia, serif;        /* Source Serif 4 — uso puntual, no default */

  /* Layout */
  --content-max: 1152px;
  --nav-max: 1232px;
  --section-inset: clamp(1.25rem, 5vw, 4rem);
  --section-inline: max(var(--section-inset), (100% - var(--content-max)) / 2);
  --section-block: clamp(3rem, 8vw, 6rem);
  --card-padding: clamp(1.5rem, 4vw, 2.5rem);
  --row-padding: clamp(1.25rem, 3vw, 2rem);
  --header-height: 4.5rem;
  --row-gap: 16px;
  --label-inline: 9px;
  --label-block: 3px;

  /* Botón — unificado (ver 5.3) */
  --button-padding-block: 14px;
  --button-padding-inline: 32px;

  /* Forma */
  --radius: 4px;           /* radio único en toda la app — no hay sm/md/lg distintos en uso real */

  /* Movimiento */
  --duration-fast: 120ms;
  --duration-base: 200ms;
  --ease-out: cubic-bezier(0.2, 0, 0, 1);
}
```

**Nota de migración — hecha el 2026-08-20.** Los nombres cortos ya no existen en el código; el mapeo queda como registro de qué se convirtió en qué, porque los tres `tasks.md` y los `design.md` de los specs siguen citando los viejos y hay que poder leerlos. Mapeo aplicado:

| Nombre viejo | Nombre nuevo |
|---|---|
| `--navy` | `--color-primary` |
| `--gold-line` | `--color-tertiary` |
| `--gold-text` | `--color-on-tertiary` |
| `--grey-text` | `--color-on-surface-variant` |
| `--white` | `--color-surface` **o** `--color-background`, según el caso (ver abajo) |
| `--cream` | `--color-background` |
| `--rule` | `--color-outline` |
| `--error-text` (`#b3261e`) | `--color-error` (`#ba1a1a` — valor corregido) |

**`--white` fue el único que no se pudo traducir mecánicamente**, y es el cambio visual más grande de la migración. El nombre viejo decía «blanco» y no decía para qué, así que sus 41 usos eran tres cosas distintas: letras sobre navy (→ `--color-on-primary`), fondo de tarjeta (→ `--color-surface`) y fondo de sección (→ `--color-background`). Ese tercer grupo es el que mueve el diseño: §6 prohíbe pintar la página de blanco, así que **todas las secciones pasaron a papel** y el blanco quedó solo dentro de tarjetas, barras y campos.

**El ritmo se resolvió con alternancia, no con filetes — y eso diverge de §6.** El primer intento aplicó §6 al pie de la letra: todas las secciones en papel y la separación en un filete de 1px declarado una vez en `styles/global.css`. El usuario lo revirtió el 2026-08-20: el hero vuelve a ser blanco y las secciones alternan blanco/papel, como el diseño original. Es una divergencia deliberada de §6 («nunca blanco puro salvo dentro de cards»), registrada en la sección 7. La regla de filetes se retiró: con la alternancia de vuelta, el color separa y el borde encima sería ruido.

**La alternancia no vive en ningún archivo.** El orden está en `app/page.tsx` y cada relleno en un módulo distinto, así que el ritmo solo existe en el hueco entre nueve archivos. `app/page.surfaces.test.ts` lo sostiene: lee las fuentes —no el DOM, porque bajo jsdom un módulo CSS resuelve a nombres de clase y no lleva declaraciones—, afirma la lista de secciones, que el hero abre en blanco, y que ningún fondo se repite dos veces seguidas. `FinalCta` queda fuera de la alternancia por pintar navy.

**Nota de radio:** toda la app converge en `4px` (`--radius`). El DESIGN.md original proponía una escala `sm/DEFAULT/md/lg/xl/full`, pero en código no hay evidencia de esa escala en uso — se mantiene el radio plano hasta que se decida introducir variantes.

---

## 4. Inventario de componentes (relevado en pantalla)

### 4.1 Navegación — `TopNavBar`
| Elemento | Clase | Fuente | Tamaño | Color texto | Fondo | Radio | Padding |
|---|---|---|---|---|---|---|---|
| Link nav (ej. "Iniciar sesión") | `TopNavBar_login__*` | plexSans 400 | 14px | `--color-primary` | transparente | — | — |
| Botón "Inscríbete" (header) | `TopNavBar_enrol__*` | plexMono, uppercase, ls 1px | 12px | `--color-on-primary` | `--color-primary` | 4px | `14px 32px` *(unificado, ver 5.3)* |

> **El umbral de la barra es 1152px, no 1024px (2026-08-20).** Con el padding unificado la barra necesita 1089px de contenido y a 1024 se superponía la marca con el primer enlace — ya pasaba antes, el padding solo ensanchó la banda. Arriba del umbral van los enlaces inline; abajo, `NavPanel`. El número vive tipeado en cuatro `@media` de dos archivos porque CSS no permite nombrarlo, y `components/sections/nav-threshold.test.ts` es lo que los mantiene juntos.

### 4.2 Hero
| Elemento | Clase | Fuente | Tamaño | Detalle |
|---|---|---|---|---|
| Eyebrow ("LEX FORENSICA") | — | plexMono 400, uppercase | 12px | ls `0.96px`, color `--color-on-tertiary` |
| H1 | — | **plexSans** 600 | 56px / lh 61.6px | color `--color-primary` — estándar de headline en toda la app (ver 5.1) |
| CTA "Explorar curso" | `Hero_cta__*` | plexSans 600, uppercase, ls `0.56px` | 14px | fondo `--color-primary`, radio 4px, padding `14px 32px` |

### 4.3 Badges / "Evidence Tags"
El componente insignia del sistema — coherente con la metáfora de expediente.

| Variante | Clase | Fuente | Tamaño | Estilo |
|---|---|---|---|---|
| Código de módulo (`EXP-01`) | `ProgramSection_code__*` / `ModuleGrid_code__*` | plexMono, uppercase | 10px | ls 1px, color `--color-on-tertiary`, sin fondo |
| Estado "DISPONIBLE" | `ModuleGrid_badgeAvailable__*` | plexMono 600, uppercase | 10px | ls 1px, fondo `--color-primary`, texto `--color-on-primary`, radio 4px, padding `3px 9px` |
| Estado "BLOQUEADO" | `ModuleGrid_badgeLocked__*` | plexMono 600, uppercase | 10px | ls 1px, borde 1px `--color-outline`, texto `--color-on-surface-variant`, sin fondo, radio 4px |
| "PRÓXIMAMENTE" (roadmap) | — | plexMono, uppercase | ~10-12px | borde `--color-tertiary`, texto `--color-on-tertiary` |

> **Era falso hasta el 2026-08-20, y ahora es cierto.** `Badge.module.css` no declaraba `border-radius`: los badges eran cuadrados, igual que `ProfileCard`, `MetricCard`, las tarjetas de `ModuleGrid`, las entradas de FAQ y `NavPanel`. El relevamiento leyó por ojo un radio que no existía — a 4px sobre un filete de 1px es invisible. Los nueve tomaron `--radius` ese día y `styles/radius.test.ts` es lo que ahora impide que vuelva a desviarse.

### 4.4 Cards
| Tipo | Clase | Borde | Padding | Fondo | Sombra |
|---|---|---|---|---|---|
| Card de audiencia (home) | — | 1px `--color-outline` | `--card-padding` | `--color-surface` | ninguna |
| Card de módulo — disponible | `ModuleGrid_card__*` | 2px `--color-primary` | 24px | `--color-surface` | ninguna |
| Card de módulo — bloqueada | `ModuleGrid_card__* ModuleGrid_cardLocked__*` | 2px `--color-primary` (mismo grosor) | 24px | `--color-surface` | ninguna |
| Card "Continuar" (panel) | `ContinueCard_*` | 1px `--color-outline` | `--card-padding` | `--color-surface` | ninguna |

Regla observada: **el borde, no la sombra, es el que comunica jerarquía** (card activa = borde 2px navy vs. resto). Consistente con el principio "Borders over Shadows" del DESIGN.md.

### 4.5 Formularios — `Field`
| Elemento | Clase | Detalle |
|---|---|---|
| Label | siempre visible, encima del input (nunca solo placeholder) | plexSans — **corregido en código el 2026-08-20**: estaba en plexMono sin mayúsculas ni tracking, o sea leyendo como dato sin serlo |
| Input | `Field_input__*` | border 1px `--color-outline`, radio 4px, padding `12px 16px`, plexSans 16px |
| Link auxiliar ("Olvidé mi contraseña") | plexSans, subrayado | color `--color-primary` o `--color-on-surface-variant` |

### 4.6 Pantalla de acceso — `AccessScreen`
| Elemento | Clase | Detalle |
|---|---|---|
| Título ("Iniciar sesión") | `AccessScreen_title__*` | **plexSans** 600, 28px — unificado con el resto de headlines (ver 5.1) |
| Caption inferior ("PROTOCOLO DE ACCESO: AUTH-2024") | — | plexMono, uppercase, `--color-on-surface-variant` |
| Botón submit | `AccessScreen_submit__*` | plexMono, uppercase, ls `2.1px`, 14px, fondo `--color-primary`, radio 4px, padding `14px 32px` *(unificado, ver 5.3)*, ancho fijo 350px |

### 4.7 Panel / Dashboard
| Elemento | Clase | Detalle |
|---|---|---|
| Sidebar nav item (activo) | `PanelSidebar_item__* PanelSidebar_itemCurrent__*` | plexSans 600, 15px, padding `12px 24px`, color `--color-primary` |
| CTA "Comenzar" | `ContinueCard_cta__*` | plexMono, uppercase, ls `1.4px`, 14px, fondo `--color-primary`, radio 4px, padding `14px 32px` *(unificado, ver 5.3)*, `text-decoration: none`. **Es `<a>` desde el 2026-08-21**, no `<button>`: abre la leccion del alumno en el visor (4.8). Vuelve a `<button>` inerte cuando no hay leccion que abrir |
| Progreso circular | — | ring SVG, texto central grande (plexSans bold) + label "Completado" en gris |

> **El CTA de la tarjeta tiene dos formas, y la dirección decide cuál (2026-08-21).** Con lección que abrir es un `<a>` al visor; sin ella, el `<button>` inerte de siempre. Es la misma regla que `PanelSidebar` aplica a una entrada cuya pantalla no existe: **un enlace a un 404 es peor que un control que admite que no hace nada.** El aspecto no cambia — las dos formas comparten `.cta`, y por eso ahí hay un `text-decoration: none` que en un `<button>` no hacía falta.

### 4.8 Visor de lección — `/panel/modulo/<exp>/<lec>`

Tres columnas sobre un mismo temario. Arriba de 64rem cada una desplaza por separado; abajo se apilan en orden de lectura (temario, reproductor, notas) y desplaza el documento entero. Agregado el 2026-08-21.

| Elemento | Clase | Detalle |
|---|---|---|
| Barra de rastro | `LessonTopBar_header__*` | alto mínimo 56px (no `--header-height`: acá lleva rastro, no controles), fondo `--color-surface`, borde inferior 1px `--color-outline` |
| Migas | `LessonTopBar_brand/code/lesson__*` | marca y código en plexMono 10px ls `0.1em`; la marca separada por filete, no por bullet. Abajo de 40rem quedan solo la lección |
| Columna de temario | `LessonOutline_outline__*` | 300px, fondo `--color-background`, borde derecho 1px `--color-outline` |
| Anillo de progreso | `LessonOutline_ring__*` | 44px, `conic-gradient` + `mask` radial — sin SVG y sin script, igual que `ProgressCard` |
| Cabecera de módulo | `LessonOutline_summary__*` | `<summary>` nativo: código plexMono 10px, título plexSans 600 15px, contador plexMono 11px, chevron que rota con `[open]` |
| Fila de lección | `LessonOutline_row__*` | alto mínimo 44px, borde izquierdo 4px transparente; activa: borde `--color-tertiary` + fondo `--color-parchment` |
| Estado de lección | `LessonOutline_rowState__*` | **solo para lectores de pantalla.** En pantalla los cuatro estados se distinguen por glifo (check, triángulo, contorno, candado), nunca por color |
| Reproductor | `LessonPlayer_poster__*` | 16:9, fondo plano `--color-ink`. Sin `<video>`: no hay archivo, y uno vacío expondría controles reales cableados a nada |
| Control de play | `LessonPlayer_playIcon__*` | **disco de 50%, no aro** — ver §7, es el único radio del sistema que no es `--radius` |
| Barra de transporte | `LessonPlayer_controls__*` | `aria-hidden`: es un dibujo. Solo el play lleva nombre accesible |
| Card de cabecera | `LessonHeader_header__*` | borde 1px `--color-outline`, radio 4px, padding `--row-padding`, fondo `--color-surface` |
| Pager Anterior/Siguiente | `LessonHeader_step__*` | plexMono 10px, alto mínimo 44px, padding-inline 16px. **No usa `14px 32px`**: §5.3 unifica el control principal de una pantalla, y esto es un paginador al lado de un título |
| Sin vecino | `LessonHeader_stepAbsent__*` | texto plano, no `<button disabled>` — un control deshabilitado es un control apagado; acá no hay control |
| Solapas Contenido/Recursos | `LessonNotes_tab__*` | anclas con `role="tab"` + `aria-selected`, alto mínimo 44px, subrayado 2px `--color-primary` en la activa |
| Nota del instructor | `LessonNotes_note__*` | fondo `--color-parchment`, borde 1px `--color-outline-variant`, radio 4px |
| Chips de herramientas | `LessonNotes_tool__*` | evidence tag de §4.3: plexMono 10px uppercase, borde 1px `--color-outline`, radio 4px, padding `--label-block --label-inline` |

> **Las dos vistas del panel derecho son dos direcciones, no dos estados.** Las solapas son anclas con `?vista=`, la página lee el parámetro y renderiza una de las dos. Cuesta una navegación por cambio y no necesita una línea de JavaScript — `NavPanel` sigue siendo el único componente de cliente del sitio. Los nombres viven en `lib/routes.ts` (`LESSON_VIEW_PARAM`, `LESSON_VIEWS`), no al lado de las solapas.

---

## 5. Decisiones tomadas (ex-divergencias)

Estos puntos estaban abiertos en la primera versión de este documento. Ya están resueltos — el código debería actualizarse para reflejarlos.

1. **Headlines → `plexSans` en toda la app.** El Hero ya lo usaba; se llevó el título de `AccessScreen` (que estaba en `sourceSerif`) al mismo estándar. Source Serif 4 queda disponible como recurso puntual, no como default.
2. **Botones → padding unificado `14px 32px`** en todas las variantes (nav, hero, submit de login, CTA de panel). Reemplaza los paddings dispares que había (`8px 24px`, `16px 6px`). Sigue pendiente crear un componente `Button` real con esta medida como base y variantes de `size` si hiciera falta una versión compacta (ej. nav).
3. **Color de error → `#BA1A1A`** (token `--color-error`), reemplaza el `#B3261E` que estaba en `--error-text`.
4. **Nomenclatura → Material** (`primary`, `on-primary`, `surface`, `outline`, etc.) es ahora la canónica, tanto en este documento como en el CSS objetivo (sección 3). El naming corto (`--navy`, `--gold-text`...) queda deprecado — ver tabla de mapeo en sección 3 para migrar el CSS existente.

## 7. Puntos abiertos

- **§6 y §4 se contradicen sobre el blanco, y hoy manda §4.** §6 dice «fondo base `--color-background`, nunca blanco puro salvo dentro de cards/containers». La landing no lo cumple a propósito: el hero es blanco y las secciones alternan blanco/papel (decisión del usuario, 2026-08-20). Lo que sí se respeta de §6 es lo demás — sin sombras, jerarquía por borde, radio único, botones a `14px 32px`. Antes de escribir una pantalla nueva hay que decidir cuál de las dos gana; hoy la respuesta es «la landing alterna, el resto sigue §6».

- **El borde de `Field` no llega a 3:1.** §4.5 declara `border: 1px solid --color-outline` para los inputs, y ese token da 1.70:1 contra el blanco del propio campo. WCAG 1.4.11 pide 3:1 exactamente de eso: el límite de un control. No es lo mismo que el filete que agrupa un desplegable —ese se puede perder sin costo, un input que dejó de parecer un input no—, así que el token está clasificado como decoración con razón y §4.5 lo está usando fuera de esa clasificación. El arreglo es un borde más oscuro (`--color-secondary` da 6.02:1 ahí), y cambia el peso de todos los campos de las cuatro pantallas transaccionales: es una decisión, no una limpieza. Registrado en el comentario de `components/ui/Field.module.css`.
- ~~**El radio único no está aplicado.**~~ **Resuelto el 2026-08-20.** Los nueve cuadrados tomaron `--radius`. `app/panel/page.module.css .rule` quedó afuera a propósito y no era el décimo: declara `border: 0` más `border-block-start`, o sea es un `<hr>` — una línea, no una caja, y un radio ahí no significa nada. `styles/radius.test.ts` sostiene la regla: toda regla con borde de caja declara radio, y lo toma del token. Un literal lo hace fallar, que es como empezaría la escala que nadie decidió.
- **El sistema no dice qué forma tiene un control circular, y el visor de lección chocó con eso (2026-08-21).** El mockup dibuja el play como un círculo de filete fino. Un `border` en shorthand ahí hace fallar `styles/radius.test.ts`, que exige `var(--radius)` de toda caja con borde — y exige bien: §6 legisla cajas y no dice nada de círculos. Ensanchar el guardián para que pasara un botón costaba más que el filete, así que el círculo quedó **relleno** (`background: rgb(255 255 255 / 15%)`, `border-radius: 50%`, sin borde), que es como `ProgressCard` ya dibuja su anillo. Es la decisión más barata, no la correcta: lo que falta es decidir si el sistema admite controles circulares y con qué trazo. Mientras tanto hay exactamente dos radios en el código, `--radius` y el `50%` de las dos formas redondas.

- **Escala de radios.** Se mantiene `--radius: 4px` único — no se definió una escala `sm/md/lg` porque no hay un caso de uso concreto que la necesite. Si alguna vez lo hay, el test de radios es el que hay que ampliar primero.

---

## 6. Checklist para nuevas pantallas

- [ ] Fondo base `--color-background`, nunca blanco puro salvo dentro de cards/containers (`--color-surface`).
- [ ] Todo dato verificable (ID, hash, fecha, código EXP) va en `--font-mono`, uppercase, con letter-spacing.
- [ ] Headlines y UI en `--font-sans`. `--font-serif` solo si hay una razón editorial explícita para esa pantalla puntual.
- [ ] Separación entre bloques con borde 1px `--color-outline`, no con sombra.
- [ ] Sombra solo en elementos flotantes temporales (dialogs, tooltips, popovers) — nunca en cards en reposo.
- [ ] Radio único `4px` en todo (botones, inputs, cards, badges).
- [ ] Botones: padding `14px 32px` por defecto (`--button-padding-block` / `--button-padding-inline`). No copiar paddings distintos de otras pantallas viejas.
- [ ] Errores y estados destructivos: `--color-error` (`#BA1A1A`), nunca un rojo ad-hoc.
- [ ] Iconos Lucide, stroke 1.5px, vocabulario legal/forense — nada de íconos "cripto genéricos".
