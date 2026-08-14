# Diseño — Landing pública de Crypto Crime Academy

**Estado:** Aprobado
**Fecha:** 2026-08-12
**Requisitos:** ./requirements.md

## Resumen

Una única página estática construida con Next.js (App Router) y exportada sin
servidor de aplicación. Todo el contenido vive en módulos TypeScript del
repositorio y se valida con Zod en el momento de importarlo, de modo que un
error de contenido rompe `next build` en vez de llegar a producción (2.2, 2.3).

Tres decisiones estructurales sostienen el resto del diseño:

1. **El contenido no sabe de presentación.** `content/` expone datos validados;
   `components/sections/` los recibe como props tipadas y no importa nada de
   `content/` directamente. Se testea cada sección con datos falsos.
2. **Los desplegables son HTML nativo.** `<details>`/`<summary>` resuelven
   teclado, lectores de pantalla y funcionamiento sin JavaScript sin escribir
   lógica de estado (4.3, 5.1, 8.1).
3. **La integridad de anclas la impone el compilador.** Los identificadores de
   sección son un tipo union; un enlace hacia un ancla inexistente es un error
   de tipos, no un enlace roto en producción (1.5).

La página no tiene estado de servidor, no hace peticiones de red y no gestiona
sesión (2.1, 6.7).

## Arquitectura

```
content/*.ts                  datos crudos, escritos a mano
      │
      │ import  ──►  lib/content/schemas.ts   (Zod: 2.2-2.8, 4.6, 4.7)
      ▼
lib/content/index.ts          parsea al importar; lanza si algo no valida (2.3)
      │
      ├──►  lib/program/derive.ts    code, moduleCount, duración (3.1-3.6)
      ├──►  lib/nav/sections.ts      SectionId + tipo de href (1.2, 1.5)
      └──►  lib/access-url.ts        URL de acceso + intent (6.1, 6.2, 6.4, 6.5)
      ▼
app/page.tsx                  compone y pasa props (1.1)
      ▼
components/sections/*         presentación pura, sin importar content/
      ▼
components/ui/*               Disclosure, Badge, MetricCard, ProfileCard
```

Árbol de archivos:

```
app/
  layout.tsx            lang="es" (9.1), metadatos (10.1, 10.2)
  page.tsx              composición de secciones (1.1)
  not-found.tsx         404 con encabezado y pie (10.4)
content/
  site.ts  nav.ts  footer.ts  audience.ts  methodology.ts
  updates.ts  program.ts  social-proof.ts  faq.ts
lib/
  content/schemas.ts    esquemas Zod
  content/index.ts      carga validada
  program/derive.ts     derivaciones
  nav/sections.ts       SectionId
  access-url.ts         construcción de URL saliente
  format/duration.ts    minutos → "1 h 20 min" (3.6)
  format/month.ts       ISO → "JULIO 2026" (2.6)
components/
  sections/  TopNavBar Hero AudienceSection MethodologySection
             UpdatesSection ProgramSection SocialProofSection
             FaqSection FinalCta SiteFooter
  ui/        Disclosure Badge MetricCard ProfileCard NavPanel
styles/
  tokens.css            variables CSS derivadas del mockup
public/
  og.png                imagen de vista previa (10.2, 10.3)
```

## Componentes e interfaces

### lib/content/index.ts

- **Responsabilidad:** única puerta de entrada al contenido. Importa cada
  archivo de `content/`, lo pasa por su esquema y exporta el resultado tipado.
  Si algo no valida, la excepción ocurre durante `next build` (2.3).
- **Interfaz:**

```ts
export const site: Site;
export const nav: NavItem[];
export const footer: Footer;
export const audience: Profile[];        // exactamente 4 (2.4)
export const methodology: MethodBlock[]; // exactamente 2 (2.4)
export const updates: Update[];          // ordenadas desc por fecha (2.7)
export const program: DerivedProgram;    // ya derivado (3.1-3.6)
export const socialProof: SocialProof;   // 3 sellos + 2 métricas (2.4)
export const faq: FaqEntry[];            // mínimo 1 (2.5)
```

- **Depende de:** `zod`, `lib/program/derive.ts`.

### lib/program/derive.ts

- **Responsabilidad:** convertir la lista cruda de módulos en el programa que
  la página muestra. Es la única lógica de cálculo del proyecto.
- **Interfaz:**

```ts
export interface DerivedModule {
  code: string;               // "EXP-00" (3.1)
  title: string;
  status: "available" | "coming-soon";
  summary?: string;           // solo available (4.3, 4.4)
  teaser?: string;            // solo coming-soon (4.2)
  videoMinutes?: number;      // solo available
}

export interface DerivedProgram {
  description: string;
  modules: DerivedModule[];
  moduleCount: number;        // modules.length (3.2)
  totalMinutes: number;       // suma de available (3.3)
  durationLabel: string | null; // null si totalMinutes === 0 (3.5)
}

export function deriveProgram(input: ProgramInput): DerivedProgram;
```

- **Depende de:** `lib/format/duration.ts`.

### lib/nav/sections.ts

- **Responsabilidad:** hacer imposible un ancla rota (1.5).
- **Interfaz:**

```ts
export const SECTION_IDS = [
  "audiencia", "metodologia", "actualizaciones",
  "programa", "confianza", "faq",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];
export type Anchor = `#${SectionId}`;
```

Los `href` de navegación en `content/nav.ts` se declaran como `Anchor`. Un
identificador mal escrito deja de compilar — no hace falta un script de
verificación. Que la sección además exista renderizada lo cubre un test (ver
estrategia de testing).

**El pie no sigue esta regla, y es una corrección al diseño original.** Se
había modelado `content/footer.ts` con anclas de sección, pero el diseño
terminado agrupa allí **páginas** —Privacidad, Términos, Acreditaciones— más
una dirección postal y un correo, bajo columnas con encabezado. Ninguna de esas
cosas es una sección de esta página.

En consecuencia `FooterSchema` usa `href` como cadena y no como `Anchor`. Lo que
se pierde es la garantía en tiempo de compilación: una ruta equivocada en el pie
falla como 404 y no al compilar. Lo que se gana es que el pie pueda decir lo que
el diseño dice. La navegación dentro de la página sigue siendo exclusiva del
encabezado, y un test de `app/page.test.tsx` afirma justamente eso: que las
anclas están en el encabezado y **no** en el pie.

Las tres rutas de página (`/privacidad`, `/terminos`, `/acreditaciones`) todavía
no existen; hoy caen en la página 404. En la réplica del diseño esos enlaces son
`href="#"`, así que tampoco están resueltos allá.

### lib/access-url.ts

- **Responsabilidad:** construir el enlace saliente a la pantalla de acceso
  (6.1, 6.2) y validar la configuración (6.4, 6.5).
- **Interfaz:**

```ts
export type AccessIntent = "login" | "signup";
export function accessUrl(intent: AccessIntent): string;
```

Lee `NEXT_PUBLIC_ACCESS_URL`, la valida con `z.string().url()` al importar el
módulo y le agrega `?intent=`. Una variable ausente o malformada rompe el build
(6.5). No implementa nada de autenticación (6.7).

### components/ui/Disclosure

- **Responsabilidad:** el único desplegable del sitio, usado por el temario
  (4.3) y por las preguntas frecuentes (5.1).
- **Interfaz:**

```ts
interface DisclosureProps {
  summary: React.ReactNode;
  children?: React.ReactNode;   // ausente ⇒ no se renderiza el control (4.4)
  className?: string;
}
```

Renderiza `<details><summary>…</summary>…</details>`. Sin `open`, sin `name`
(agrupar con `name` forzaría cierre mutuo, y 4.5 y 5.2 exigen lo contrario) y
sin estado de React. Si `children` está vacío, emite el encabezado sin
`<details>` y sin chevron.

### components/sections/ProgramSection

- **Responsabilidad:** el temario, que es el único lugar de la página con dos
  ramas de presentación.
- **Interfaz:**

```ts
interface ProgramSectionProps { program: DerivedProgram; }
```

Por cada módulo: `status === "coming-soon"` → ficha estática con `Badge` y
adelanto siempre visible, sin control (4.2). `status === "available"` →
`Disclosure` con el resumen como contenido, o encabezado sin control si no hay
resumen (4.3, 4.4).

### components/sections/TopNavBar

- **Responsabilidad:** navegación fija y los dos controles de acceso.
- **Interfaz:**

```ts
interface TopNavBarProps { items: NavItem[]; siteName: string; }
```

Encabezado `position: sticky` (1.4). Por encima de 1024 px muestra los enlaces
en línea; por debajo, nombre y control de inscripción visibles y el resto
dentro de `NavPanel` (7.2). El resaltado es solo `:hover`/`:focus-visible`, sin
observador de scroll (1.6).

### components/ui/NavPanel

- **Responsabilidad:** el panel de navegación de pantallas angostas.
- Se construye con `<details>` para que abra sin JavaScript (8.4). Un efecto de
  cliente de unas pocas líneas escucha clics en enlaces internos y quita el
  atributo `open` (7.3). Es la única degradación aceptada sin JavaScript (8.5).

### styles/tokens.css — fundamento visual

El proyecto no tiene patrones visuales previos (repositorio vacío) y el archivo
de Figma **no define variables**, así que los tokens se derivan de los valores
reales del mockup, leídos por MCP:

| Token | Valor | Origen en el mockup |
|---|---|---|
| `--navy` | `#16213c` | titulares, botones, panel visual del hero |
| `--gold-line` | `#98773e` | bordes, filetes, decoración **sin texto** |
| `--gold-text` | `#7d6234` | códigos `EXP·NN` y etiquetas de estado |
| `--grey-text` | `#616267` | texto de párrafo |
| `--white` | `#ffffff` | fondo de tarjetas y del hero |
| `--cream` | `#f8f7f4` | fondo alternado de secciones (nodo 23:184) |
| `--rule` | `#c6c6ce` | filete de las tarjetas desplegables (nodo 23:359) |

Tipografía: **IBM Plex Sans** (titulares 36/45 semibold en versalitas,
subtítulos 24/32 y 20/28 regular, párrafo 16/24 y 14/20, adelantos en itálica)
e **IBM Plex Mono** (botones 12/16; códigos y etiquetas 10/15 con `1px` de
espaciado, en versalitas).

Espaciado observado: márgenes de sección `64px` horizontales y `96px`
verticales, tarjetas con `40px` de padding, filas de módulo con `32px` y `16px`
de separación interna, botones `32px`/`16px` con `4px` de radio, etiquetas
`9px`/`3px` con borde de `1px`.

**Dos colores del mockup incumplen 9.4 y el diseño los corrige.** Medido sobre
blanco:

| Color | Ratio actual | 9.4 | Corrección |
|---|---|---|---|
| `#16213c` navy | 15.95:1 | pasa | — |
| `#98773e` dorado | **4.16:1** | **falla** | `#7d6234` para texto |
| `#76777e` gris | **4.46:1** | **falla** | `#616267` |

El dorado original **se conserva** donde no lleva texto: bordes, el filete
vertical del hero y el contorno de las etiquetas superan el umbral de 3:1 que
9.4 pide para elementos de interfaz. Solo se oscurece donde el dorado ES texto
—los códigos de expediente y el rótulo «PRÓXIMAMENTE», ambos de 10 px— porque
ahí rige el 4.5:1. Así la identidad visual sobrevive y el texto cumple.

El gris falla por 0.04, invisible a ojo y real para la norma.

**Verificado contra el crema en T10.** `--cream` es `#f8f7f4`, leído del fondo
de la sección de audiencia del mockup. La caída respecto del blanco resultó ser
de ~6.7 %, no del 8 % estimado, y los cuatro tokens siguen cumpliendo:

| Token | Sobre blanco | Sobre crema | Umbral | |
|---|---|---|---|---|
| `--navy` `#16213c` | 15.95:1 | 14.89:1 | 4.5:1 | pasa |
| `--gold-text` `#7d6234` | 5.72:1 | 5.34:1 | 4.5:1 | pasa |
| `--grey-text` `#616267` | 6.09:1 | 5.68:1 | 4.5:1 | pasa |
| `--gold-line` `#98773e` | 4.16:1 | 3.89:1 | 3:1 | pasa |

Los ratios no son una afirmación de este documento: `styles/tokens.test.ts` los
calcula sobre los tokens reales en cada corrida y falla si alguno baja del
umbral, o si `#98773e` o `#76777e` reaparecen como color de texto.

**`--rule` `#c6c6ce` es decoración, no elemento de interfaz.** Da 1.70:1 sobre
blanco y 1.59:1 sobre crema, muy por debajo del 3:1. No lo incumple porque no es
lo que identifica al control: el desplegable se reconoce por el texto de su
`<summary>` en navy y por el chevron. El filete solo agrupa visualmente. La
consecuencia es vinculante para T10 y T12: **el chevron sí es objeto gráfico
informativo y debe dibujarse con un token que alcance 3:1** —`--navy` o
`--gold-line`—, nunca con `--rule`.

Estilos con **CSS Modules más variables CSS**, sin framework de utilidades (ver
trade-offs).

## Modelos de datos

```ts
// lib/content/schemas.ts
import { z } from "zod";

const NonEmpty = z.string().trim().min(1);            // 2.8

export const ModuleSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("available"),
    title: NonEmpty,
    summary: NonEmpty.optional(),                     // 4.3 / 4.4
    videoMinutes: z.number().int().positive(),        // 4.7
  }).strict(),                                        // 3.4 y 4.6
  z.object({
    status: z.literal("coming-soon"),
    title: NonEmpty,
    teaser: NonEmpty,                                 // 4.2
  }).strict(),                                        // 4.6
]);

export const ProgramSchema = z.object({
  description: NonEmpty,
  modules: z.array(ModuleSchema).min(1),              // 2.5, 4.8
}).strict();                                          // 3.4

export const UpdateSchema = z.object({
  date: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),  // 2.6
  title: NonEmpty,
  description: NonEmpty,
}).strict();

export const ProfileSchema = z.object({
  icon: NonEmpty, title: NonEmpty, description: NonEmpty,
}).strict();

export const FaqSchema = z.object({
  question: NonEmpty,
  answer: NonEmpty,                                   // 5.3
}).strict();

export const AudienceSchema    = z.array(ProfileSchema).length(4);   // 2.4
export const MethodologySchema = z.array(MethodBlockSchema).length(2);
export const SealsSchema       = z.array(SealSchema).length(3);
export const MetricsSchema     = z.array(MetricSchema).length(2);
export const UpdatesSchema     = z.array(UpdateSchema).min(1);       // 2.5
export const FaqListSchema     = z.array(FaqSchema).min(1);          // 2.5
```

**Invariantes que impone el esquema.** `.strict()` es lo que hace cumplir 3.4 y
4.6: un `code`, un `moduleCount`, una `duration` o un `videoMinutes` puesto
donde no corresponde deja de ser un campo ignorado y pasa a ser un error. El
tipo discriminado hace el resto — un módulo `coming-soon` no tiene dónde
declarar minutos, y uno `available` no compila sin ellos.

## Flujo de datos

**Escenario A — el visitante abre la página.**

1. `next build` importa `lib/content/index.ts`, que importa cada archivo de
   `content/` y lo parsea (2.2). Cualquier fallo detiene la compilación (2.3).
2. `deriveProgram` recorre los módulos: asigna `EXP-NN` por índice (3.1), toma
   `moduleCount` del largo (3.2) y suma `videoMinutes` solo de los `available`
   (3.3). Si la suma es cero, `durationLabel` queda en `null` (3.5); si no, se
   formatea como horas y minutos (3.6).
3. Las actualizaciones se ordenan descendente por `date` (2.7) y cada `date` se
   formatea para mostrar (2.6).
4. `app/page.tsx` renderiza las diez secciones en orden (1.1), cada una con su
   `id` tomado de `SECTION_IDS` (1.2).
5. El HTML se sirve estático. No hay peticiones de red (2.1).

**Escenario B — el visitante hace clic en «Inscribite».**

1. El control es un `<a href>` construido por `accessUrl("signup")` en tiempo de
   build (6.3).
2. `NEXT_PUBLIC_ACCESS_URL` ya fue validada al importar el módulo; si faltaba,
   este build nunca existió (6.5).
3. El navegador navega a la pantalla de acceso con `?intent=signup` (6.1). La
   landing no participa de lo que pase después (6.7).

**Escenario C — el visitante despliega dos módulos.**

1. Clic en `EXP-00`: el navegador alterna el atributo `open` del `<details>`.
2. Clic en `EXP-01`: se abre también. Como ningún `<details>` comparte atributo
   `name`, el primero sigue abierto (4.5). No corrió JavaScript propio (8.1).

## Manejo de errores

| Condición | Manejo | Requisito |
|---|---|---|
| Campo de contenido ausente, vacío o de tipo incorrecto | `ZodError` al importar; `next build` falla con archivo, campo y motivo | 2.3, 2.8 |
| Cantidad distinta de 4 perfiles / 2 métodos / 3 sellos / 2 métricas | `.length(n)` rechaza; build falla | 2.4 |
| Cero módulos, cero actualizaciones o cero preguntas | `.min(1)` rechaza; build falla | 2.5 |
| Fecha de actualización fuera de formato ISO | `.regex` rechaza; build falla | 2.6 |
| Módulo `coming-soon` con `videoMinutes` o `summary` | `.strict()` rechaza; build falla | 4.6 |
| Módulo `available` sin `videoMinutes` | Tipo requerido; build falla | 4.7 |
| Contenido que declara `code`, `moduleCount` o `duration` | `.strict()` rechaza; build falla | 3.4 |
| Pregunta frecuente sin respuesta | `NonEmpty` rechaza; build falla | 5.3 |
| Ancla de navegación hacia una sección inexistente | Error de tipos: `href` no es `Anchor`; build falla | 1.5 |
| Sección declarada en `SECTION_IDS` pero no renderizada | Test de integridad de anclas falla en CI | 1.5 |
| `NEXT_PUBLIC_ACCESS_URL` ausente o no es una URL | Validación al importar; build falla | 6.5 |
| Imagen de vista previa ausente en `public/` | Verificación de existencia al importar los metadatos; build falla | 10.3 |
| Sin módulos disponibles (duración total cero) | `durationLabel = null`; la sección omite el dato | 3.5 |
| La imagen del hero no carga | Dimensiones explícitas y fondo `--navy`; el layout no salta | — |
| La pantalla de acceso está caída | Fuera de alcance: es un `<a>` y responde el navegador | 6.3, 6.7 |
| Ruta inexistente | `not-found.tsx` con encabezado, pie y enlace al inicio | 10.4 |
| JavaScript no disponible | Desplegables, anclas, CTA y apertura del panel siguen operativos; solo se pierde el cierre automático | 8.1-8.5 |
| Violación de accesibilidad detectada | axe sobre la página renderizada falla CI | 9.6 |

## Estrategia de testing

**Unitario — es donde está la lógica real.**

- `deriveProgram`: `code` con dos dígitos por índice (3.1); `moduleCount` igual
  al largo (3.2); `totalMinutes` **excluyendo** los `coming-soon` (3.3);
  `durationLabel === null` con suma cero (3.5); formato horas/minutos (3.6).
- Esquemas: un caso de rechazo por cada fila IF/THEN de la tabla de errores.
- `accessUrl`: `?intent=login` y `?intent=signup` (6.1, 6.2); rechazo de URL
  base inválida (6.5).
- `format/month`: ISO → etiqueta mostrada (2.6). Orden descendente (2.7).

**Componentes — solo ramificación, nunca apariencia.**

- `ProgramSection`: un `coming-soon` renderiza etiqueta y adelanto y **no**
  renderiza `<details>` (4.2); un `available` con resumen sí lo renderiza
  (4.3); un `available` sin resumen no (4.4).
- `Disclosure`: sin `children` no emite `<details>` ni control.
- `TopNavBar`: los `href` salen de los datos y no hay observador de scroll (1.6).

**Casos borde.** Un solo módulo, todos `coming-soon`, todos `available`,
resumen ausente, actualizaciones escritas fuera de orden, duración exactamente
60 minutos.

**Integración.**

- **Integridad de anclas (1.5):** renderiza la página y afirma que por cada
  `SectionId` existe un elemento con ese `id`, y que todo `href` que empieza con
  `#` corresponde a un `SectionId`. Es el test que convierte el bug de
  «Testimonios» en un fallo automático.
- **axe (9.6):** auditoría sobre la página renderizada, en CI.
- **Un solo smoke E2E:** la página carga, un módulo despliega, el CTA apunta a
  la URL con `?intent=`.

**Explícitamente sin cobertura:** textos concretos, snapshots de marcado, clases
CSS y posiciones. Son el diseño, no el comportamiento; se rompen con cada
cambio de copy y no atrapan defectos.

## Decisiones de diseño y trade-offs

- **Decisión:** integridad de anclas por tipos y no por script de verificación —
  **Justificación:** un `href` mal escrito deja de compilar sin agregar
  herramientas ni pasos de build — **Alternativa:** un script que recorra el
  HTML generado; se rechazó porque corre tarde y hay que mantenerlo.

- **Decisión:** `<details>` nativo sin `name` — **Justificación:** teclado,
  lectores de pantalla y funcionamiento sin JavaScript salen gratis, y omitir
  `name` es lo que permite varios abiertos a la vez (4.5, 5.2) —
  **Alternativa:** desplegable con estado de React; se rechazó porque cuesta más
  código para conseguir menos accesibilidad.

- **Decisión:** `.strict()` en todos los esquemas — **Justificación:** es lo que
  convierte 3.4 y 4.6 de intención en garantía; sin él, un campo de más se
  ignora en silencio y la página miente — **Alternativa:** esquemas permisivos;
  se rechazó por eso mismo.

- **Decisión:** dos tokens de dorado en vez de uno — **Justificación:** el
  dorado del mockup rinde 4.16:1 y falla 9.4 para texto, pero supera el 3:1 que
  la norma pide para bordes y elementos de interfaz; separarlos preserva la
  identidad visual donde se ve y corrige solo el texto de 10 px —
  **Alternativa:** oscurecer un único dorado para todo; se rechazó porque
  ensucia el diseño sin necesidad.

- **Decisión:** CSS Modules con variables CSS, sin framework de utilidades —
  **Justificación:** el conjunto de tokens es chico y cerrado, no hay sistema de
  diseño que escalar, y evita una dependencia de build en un sitio de una sola
  página — **Alternativa:** Tailwind, que además es el formato en que Figma
  devuelve el código de referencia y ahorraría traducción. **Es la decisión de
  este documento con más probabilidad de ser revocada; si preferís Tailwind,
  solo cambia esta sección.**

- **Decisión:** el panel de navegación acepta unas líneas de JavaScript —
  **Justificación:** `<details>` no se cierra solo al navegar a un ancla y
  dejarlo abierto tapa la sección de destino — **Alternativa:** cero JavaScript
  aceptando el panel abierto; se rechazó por ser peor experiencia, y 8.5
  documenta la excepción.
