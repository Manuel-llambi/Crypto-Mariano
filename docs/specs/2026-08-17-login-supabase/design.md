# Diseño — Acceso real contra Supabase local

**Estado:** Aprobado
**Fecha:** 2026-08-17
**Requisitos:** ./requirements.md

## Resumen

El inicio de sesión se resuelve enteramente en el servidor con una Server
Action. `/acceso` renderiza un `<form>` que postea a esa acción; la acción
valida, le pregunta a Supabase, y termina siempre en un `redirect`: a `/panel`
si entró, de vuelta a `/acceso` con un marcador de error si no. No aparece
ningún componente de cliente nuevo, y por lo tanto `NavPanel` sigue siendo el
único del proyecto (5.4).

Tres decisiones sostienen el resto del documento:

1. **El `<form>` vuelve, y ahora es seguro.** Lo que el spec de la landing
   prohibía era un formulario **sin `action`**, que se envía por GET y pondría
   la contraseña en la barra de direcciones. Una Server Action postea al
   servidor, así que ningún campo se serializa en la URL (1.5).
2. **El error viaja por la URL, no por estado de React.** Leer el valor de
   retorno de una Server Action exige `useActionState`, que es un componente de
   cliente. Un `redirect` a `/acceso?intent=login&error=credenciales` consigue lo mismo sin
   una línea de JavaScript (5.2).
3. **Autoriza el layout, refresca el middleware.** La guardia real vive en
   `app/panel/layout.tsx`, del lado del servidor y antes de emitir contenido
   (4.3). El middleware solo renueva el token, porque un componente de servidor
   no puede escribir cookies.

## Arquitectura

```
                 POST (cuerpo, nunca query)
  navegador ─────────────────────────────────▶ signIn  (app/acceso/actions.ts)
      ▲                                            │
      │                                            ├─ Zod: correo y contraseña ──▶ falla ─┐
      │                                            │                                      │
      │                                            ├─ createClient()                      │
      │                                            │   (lib/supabase/server.ts)           │
      │                                            │        │                             │
      │                                            │        ▼                             │
      │                                            │   Supabase local  :55321             │
      │                                            │   signInWithPassword                 │
      │                                            │        │                             │
      │        redirect /panel  ◀── cookies ◀──────┴── ok ──┤                              │
      │                                                     └── rechazo ──┐                │
      │        redirect /acceso?intent=login&error=credenciales ◀────────┴────────────────┘
      │
      │  GET /panel
      └──────────────────▶ middleware (renueva) ──▶ app/panel/layout.tsx
                                                        │
                                                        ├─ getUser() ── sin usuario ──▶ redirect /acceso
                                                        └─ con usuario ──▶ panel
```

El único módulo que sabe de cookies de sesión es `lib/supabase/server.ts`. Todo
lo demás le pide un cliente ya armado.

## Componentes e interfaces

### `lib/supabase/env.ts`

- **Responsabilidad:** leer y validar la configuración de Supabase al importar.
- **Interfaz:**

```ts
/** La dirección y la clave publicable de la instancia, ya validadas. */
export const supabaseEnv: { url: string; publishableKey: string };
```

- **Depende de:** `zod`.
- **Notas:** las variables **no llevan prefijo `NEXT_PUBLIC_`**, a diferencia de
  lo que documenta Supabase. Ese prefijo existe para exponer un valor al
  navegador, y acá no hay navegador que lo consuma: todo el acceso ocurre en el
  servidor (5.4). Sin el prefijo, el valor nunca se inlinea en el bundle del
  cliente, y de paso se evita la regla de Next de que el acceso debe escribirse
  como literal para que el reemplazo ocurra.
  El esquema usa `z.url()` y `z.strictObject()`, como el resto del proyecto —
  `z.string().url()` está deprecado en Zod 4. Lanzar al importar es lo que hace
  fallar la compilación con el nombre de la variable que falta (6.1); es el
  mismo mecanismo que `lib/access-url.ts` ya demostró en este repositorio.

### `lib/supabase/server.ts`

- **Responsabilidad:** armar un cliente de Supabase atado a las cookies del
  pedido en curso. Único punto del proyecto que las toca.
- **Interfaz:**

```ts
/** Un cliente atado a las cookies de este pedido. */
export async function createClient(): Promise<SupabaseClient>;
```

- **Depende de:** `@supabase/ssr`, `next/headers`, `lib/supabase/env`.
- **Notas:** implementa el adaptador `getAll` / `setAll` de `@supabase/ssr`
  sobre `cookies()`, que en Next 15 es asíncrono. `setAll` fuerza
  `httpOnly: true` sobre las opciones que llega la librería, y eso se puede
  hacer justamente porque no existe ningún cliente de navegador que necesite
  leerlas (3.4). Desde un componente de servidor la escritura de cookies no está
  permitida y arroja; ahí `setAll` traga el error, porque en ese contexto solo
  se está leyendo.

### `middleware.ts`

- **Responsabilidad:** renovar el token de sesión antes de que el layout lo
  consulte, y persistir la cookie renovada.
- **Interfaz:**

```ts
export async function middleware(request: NextRequest): Promise<NextResponse>;
export const config = { matcher: ["/panel/:path*"] };
```

- **Depende de:** `@supabase/ssr`, `lib/supabase/env`.
- **Notas:** existe por una razón concreta. `config.toml` fija
  `jwt_expiry = 3600`, y un componente de servidor no puede escribir cookies, de
  modo que sin este archivo la sesión renovada nunca se guardaría y el alumno
  quedaría afuera a la hora (3.2). El `matcher` deja fuera la landing, que sigue
  siendo estática y no debe pagar este costo.
  **El middleware no autoriza nada.** Solo refresca. La decisión de dejar pasar
  o no la toma el layout, y esa separación es deliberada: un guardia que vive
  únicamente en el middleware es un guardia que se saltea con una cabecera.

### `app/acceso/actions.ts`

- **Responsabilidad:** el inicio de sesión, de punta a punta.
- **Interfaz:**

```ts
"use server";

/** Valida, autentica y redirige. Nunca retorna. */
export async function signIn(formData: FormData): Promise<never>;
```

- **Depende de:** `lib/supabase/server`, `lib/routes`, `zod`,
  `next/navigation`.
- **Notas:** el `redirect` de Next señaliza lanzando una excepción propia, así
  que va **fuera** de cualquier `try`/`catch` — envuelto, se lo traga el
  manejador y la navegación no ocurre.

### `AccessScreen` — tercer modo

- **Responsabilidad:** además de sus dos modos actuales, envolver los campos en
  un formulario que postea, y mostrar el mensaje de error cuando lo hay.
- **Interfaz:**

```ts
interface AccessScreenProps {
  // …las propiedades actuales…
  /** Postea a esta acción de servidor. Excluyente con `submitHref`. */
  submitAction?: (formData: FormData) => Promise<void>;
  /** El mensaje de un intento rechazado, si el pedido anterior falló. */
  error?: string;
}
```

- **Notas:** la elección del control queda en tres ramas —`submitAction` da un
  `<form>` con `<button type="submit">`; `submitHref` da el `<a>` de hoy; sin
  ninguna de las dos, el botón inerte—. Las cuatro pantallas que ya usan el
  componente no cambian ni una línea.
  **Visual:** el mensaje va debajo del subtítulo y antes de los campos, para que
  se lea antes de volver a teclear. Reutiliza el espaciado y la tipografía de
  `.subtitle`, que ya está en la tarjeta; lo único nuevo es el color.
  **No lleva `role="alert"` ni región viva.** Una región viva anuncia *cambios*,
  y este mensaje ya está en el documento cuando la página carga: el lector de
  pantalla lo encuentra leyendo, no hay cambio que anunciar.

### `styles/tokens.ts` — un color nuevo

- **Responsabilidad:** el color del mensaje de error.
- **Notas:** `--error-text` entra en `TEXT_TOKENS`, no en decoración, así que el
  test de contraste le exige 4.5:1 contra el fondo de la tarjeta. Un token sin
  clasificar rompe ese test — es la única forma de agregarlo.

### `lib/routes.ts` y `content/access.ts`

- `lib/routes.ts` gana ``LOGIN_ERROR_HREF = `${LOGIN_HREF}&error=credenciales` ``.
  Va acá y no junto a la acción por la misma razón que el resto: una dirección
  escrita dos veces termina discrepando consigo misma.

  **Derivada de `LOGIN_HREF`, no escrita como literal, y con el `intent`
  puesto.** Este documento llegó a decir `/acceso?error=credenciales` a secas, y
  eso se contradecía con su propia guardia, que redirige a `LOGIN_HREF` —con
  `intent=login`— a la misma pantalla. Dos redirecciones de servidor al mismo
  destino que difieren en la intención declarada es justamente lo que 6.1 y 6.2
  del spec de la landing piden evitar. Derivarla en vez de repetirla es lo que
  impide que vuelvan a separarse.
- `content/access.ts` gana `login.errorMessage`, y `LoginSchema` el campo
  correspondiente como `NonEmpty` (2.4).

### `supabase/seed.sql`

- **Responsabilidad:** dejar la base local con la cuenta con la que se entra.
- **Notas:** `config.toml` ya declara `sql_paths = ["./seed.sql"]`, pero el
  archivo no existe. Inserta una fila en `auth.users` con la contraseña cifrada
  por `crypt()` y `email_confirmed_at` ya puesto, más su fila en
  `auth.identities` con el proveedor `email`. Es idempotente, de modo que
  `supabase db reset` la reproduce siempre igual (6.2).

  **Las columnas de token van en cadena vacía, nunca en NULL.** Comprobado
  contra la instancia local el 2026-08-17 (GoTrue v2.195.0): la base las declara
  nulables, pero GoTrue las escanea hacia `string` de Go, así que un NULL hace
  que el acceso devuelva 500 con `Scan error on column index 3, name
  "confirmation_token": converting NULL to string is unsupported`. `phone` sí
  puede quedar en NULL. La cadena vacía no colisiona entre cuentas porque esos
  índices únicos son parciales, con predicado `!~ '^[0-9 ]*$'`.

  **La fila de `auth.identities` no habilita el acceso.** La misma comprobación
  sembró dos cuentas, una con esa fila y otra sin, y ambas iniciaron sesión. Se
  siembra igual, pero por paridad con `auth.admin.createUser` — sin ella,
  `user.identities` vuelve vacío.

  **El destino del `on conflict` es el `id`, no el correo.** `auth.users` no
  tiene una restricción única simple sobre `email`: solo el índice parcial
  `users_email_partial_key … WHERE is_sso_user = false`, que no sirve como
  destino. La cuenta lleva un UUID literal y `on conflict (id) do nothing`. En
  `auth.identities` sí sirve `on conflict (provider_id, provider)`.

### `app/panel/layout.tsx` — la guardia

```ts
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) redirect(LOGIN_HREF);
```

En el layout y no en `page.tsx` porque el layout es el chrome que toda pantalla
futura del panel comparte: una guardia cubre lo que venga (4.4).

## Modelos de datos

No hay tablas propias. Los únicos datos nuevos son la configuración y la forma
del formulario:

```ts
// lib/supabase/env.ts
const EnvSchema = z.strictObject({
  SUPABASE_URL: z.url(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

// app/acceso/actions.ts
const CredentialsSchema = z.strictObject({
  email: z.email(),
  password: z.string().min(1),
});
```

`CredentialsSchema` **no** replica la política de contraseñas de Supabase. Solo
exige que los campos estén y que el correo tenga forma de correo: quien decide
si la contraseña sirve es Supabase (1.3), y una regla de largo acá solo
produciría dos mensajes distintos para el mismo rechazo.

El panel sigue leyendo `content/panel.ts` y `content/program.ts`. La sesión
decide si se entra, no qué se ve.

## Flujo de datos

**Acceso exitoso (1.1, 1.5, 3.1)**

1. El visitante completa correo y contraseña y activa el control.
2. El navegador postea el formulario. Los campos van en el cuerpo; la barra de
   direcciones sigue diciendo `/acceso`.
3. `signIn` parsea el `FormData` con `CredentialsSchema`.
4. `createClient()` arma el cliente sobre las cookies del pedido.
5. `signInWithPassword` verifica contra la instancia local.
6. Supabase devuelve la sesión; el adaptador escribe las cookies con
   `httpOnly`.
7. `redirect(PANEL_HREF)`. La URL final es `/panel`, pelada.

**Acceso rechazado (1.2, 2.1, 2.2, 2.3)**

1. a 5. igual que arriba.
6. `signInWithPassword` devuelve error. No se escribe ninguna cookie.
7. `redirect(LOGIN_ERROR_HREF)` — sin el correo, sin la contraseña.
8. `/acceso` lee `searchParams.error` y le pasa `login.errorMessage` a
   `AccessScreen`.

**Panel sin sesión (4.1, 4.3)**

1. Llega `GET /panel`.
2. El middleware intenta renovar; sin cookies, no hay nada que renovar.
3. `app/panel/layout.tsx` llama a `getUser()`.
4. `getUser()` **valida el token contra el servidor de autenticación**, no se
   limita a leer la cookie (3.3). Sin usuario, `redirect(LOGIN_HREF)`.
5. No se emitió una sola línea del panel.

## Manejo de errores

| Condición | Manejo | Requisito |
|---|---|---|
| Correo vacío o malformado, o contraseña vacía | Zod rechaza; no se consulta a Supabase; `redirect` al acceso con el error | 1.4 |
| Credenciales que no coinciden | `redirect(LOGIN_ERROR_HREF)`; sin cookies | 1.2, 2.1 |
| La cuenta no existe | **El mismo mensaje**, indistinguible del anterior | 2.2 |
| Se pide `/acceso` sin intento previo | Sin `error` en la query, no se renderiza el mensaje | 2.5 |
| Llega un `error=` con un valor que el sistema nunca emite, vacío o repetido | Se ignora: el mensaje se muestra solo si el valor es exactamente el marcador | 2.5 |
| Cookie de sesión adulterada o vencida | `getUser()` la rechaza contra el servidor; se trata como sin sesión | 3.3, 4.1 |
| Pedido al panel sin sesión | `redirect(LOGIN_HREF)` antes de emitir contenido | 4.1, 4.3 |
| Falta `SUPABASE_URL` o la clave | Excepción al importar: la compilación falla nombrando la variable | 6.1 |
| Supabase no responde al arrancar la suite E2E | Chequeo previo que aborta nombrando esa causa | 7.1 |
| Supabase no responde en tiempo de ejecución | El acceso se rechaza con el mensaje genérico | 2.1 |

Esa última fila es un compromiso consciente: una instancia caída y una
contraseña equivocada le dicen lo mismo al visitante. Distinguirlas en pantalla
significaría describirle el estado de la infraestructura a quien todavía no se
autenticó.

## Estrategia de testing

**Unitario (Vitest).** `vitest.config.ts` suma `SUPABASE_URL` y
`SUPABASE_PUBLISHABLE_KEY` a su bloque `test.env`, o todo módulo que importe
`lib/supabase/env` lanza al cargarse.

- `lib/supabase/env.test.ts` — falta una variable → lanza nombrándola (6.1).
- `app/acceso/actions.test.ts` — con `lib/supabase/server` y `next/navigation`
  mockeados: credenciales válidas → redirige a `/panel` (1.1); rechazo →
  redirige a `LOGIN_ERROR_HREF` (1.2); correo malformado → **no se llama a
  Supabase** (1.4).
- `app/acceso/page.test.tsx` — con `error` en la query, el mensaje aparece
  (2.1); sin él, no (2.5); y es el texto de `content/access.ts` (2.4).
- `app/panel/layout.test.tsx` — sin usuario → redirige (4.1); con usuario →
  renderiza (4.2).
- `components/sections/AccessScreen.test.tsx` — con `submitAction` renderiza un
  `<form>` con submit; los dos modos existentes no cambian.
- **Por ausencia** (5.4), con el patrón ya establecido: leer las fuentes de
  `app/acceso/` y afirmar que no contienen `use client`, `useState` ni
  `useEffect`. Quitar los comentarios antes de afirmar — un comentario que
  nombre la palabra prohibida hace fallar el test, como pasó en T17.

**Punta a punta (Playwright).** `e2e/acceso.spec.ts` se reescribe entero: hoy
afirma exactamente lo contrario (7.3).

- `CP-01` — credenciales sembradas → aterriza en `/panel`, URL pelada (1.1).
- `CF-01` — credenciales inválidas → sigue en `/acceso`, con el mensaje, y la
  contraseña no aparece en la URL (1.2, 1.5, 2.1).
- `CF-02` — `/panel` sin sesión → redirige a `/acceso` (4.1).

El chequeo previo de 7.1 va como `globalSetup` de Playwright: pide
`${SUPABASE_URL}/auth/v1/health` —verificado el 2026-08-18 contra la instancia
local: responde 200 sin `apikey` ni `Authorization`— y, si no responde, aborta
diciendo que la instancia no está arriba. Sin eso, el síntoma sería un `expect`
vencido a los 30 segundos, que apunta al código equivocado.

**«Previo» es un nombre engañoso, y conviene decirlo: el `globalSetup` corre
DESPUÉS del `webServer`.** Comprobado en Playwright 1.56.1, por fuente y por
corrida. O sea que el aborto llega recién tras el `build && start` completo: no
ahorra un solo minuto, solo cambia el diagnóstico. Dos consecuencias. La primera,
que una variable de entorno faltante nunca llega hasta acá —el build muere antes,
dentro del `webServer`— y está bien que así sea, porque ese caso es 6.1 y no 7.1;
el `globalSetup` no debe validar configuración. La segunda, que **Playwright no
carga `.env`**: lo lee Next al compilar y al servir, no el runner. El chequeo
tiene que poblar su propio entorno, o va a fallar con el mensaje de 6.1 en vez del
suyo.

**Verificación por mutación.** Vale la regla del proyecto: un test que pasa en
la primera corrida no cuenta. Los dos que más la necesitan son la guardia —es
fácil escribir una que redirija siempre y parezca correcta— y el caso de la
contraseña en la URL, que ya pasó en verde una vez sin implementación.

## Decisiones de diseño y trade-offs

- **Decisión:** Server Action en vez de componente de cliente con
  `createBrowserClient`. — **Justificación:** el camino que documenta Supabase
  convertiría a `/acceso` en el segundo componente de cliente del sitio y
  movería la sesión al navegador, rompiendo los requisitos 5.1 y 5.4. —
  **Alternativa considerada:** un route handler con `<form method="post">`;
  igual de válido, pero obliga a manejar a mano el redirect, las cookies y el
  retorno del error.

- **Decisión:** el error viaja por `redirect` a la query, no por
  `useActionState`. — **Justificación:** es la única forma de mostrarlo sin
  JavaScript. — **Costo asumido:** se pierde el correo tecleado y hay que
  reescribirlo. Devolverlo en la URL metería un dato personal en el historial,
  en los registros del servidor y en el `Referer` siguiente, que es exactamente
  el razonamiento que echó al `<form>` sin `action`.

- **Decisión:** un solo mensaje para credenciales inválidas y cuenta
  inexistente. — **Justificación:** distinguirlos le regala a cualquiera un
  oráculo para averiguar qué correos están registrados. — **Costo asumido:** un
  mensaje menos útil para quien se equivocó de buena fe.

- **Decisión:** `getUser()` y no `getSession()`. — **Justificación:**
  `getSession()` lee la cookie y le cree. En el servidor, la cookie es entrada
  del usuario. — **Costo asumido:** un viaje al servidor de autenticación por
  pedido al panel.

- **Decisión:** autorizar en el layout, refrescar en el middleware. —
  **Justificación:** el middleware es el único lugar que puede persistir la
  cookie renovada, pero una guardia que vive solo ahí se saltea con una
  cabecera; la decisión de dejar pasar tiene que estar donde se sirve el
  contenido. — **Alternativa considerada:** guardia únicamente en el middleware,
  descartada por eso mismo.

- **Decisión:** variables sin prefijo `NEXT_PUBLIC_`. — **Justificación:** nada
  en el navegador las consume, y el prefijo existe solo para exponerlas ahí. —
  **Alternativa considerada:** seguir la documentación de Supabase al pie de la
  letra, descartada porque publicaría en el bundle valores que nadie lee.

- **Decisión:** la cuenta de prueba sale de `supabase/seed.sql`. —
  **Justificación:** versionada y reproducible con `supabase db reset`, que es
  lo que vuelve determinista el E2E. — **Alternativa considerada:** crearla a
  mano desde Studio, descartada porque nada la reproduce en otra máquina.

- **Decisión:** el E2E depende de la instancia local. — **Justificación:** lo
  que esta feature agrega *es* la integración; simularla dejaría sin cubrir lo
  único nuevo. — **Costo asumido:** `npm run test:e2e` —y con él `npm run
  verify`, que es lo mismo que CI— deja de ser autónomo y pasa a necesitar
  Docker arriba y la base sembrada. El chequeo de 7.1 no reduce ese costo
  —corre después del `webServer`, así que el build se paga igual—; lo que hace
  es que la falla se lea como «la instancia no está arriba» en vez de como un
  test roto.

## Pendientes heredados de los requisitos

Las tres preguntas abiertas de `requirements.md` siguen sin resolver y tocan
este diseño en puntos concretos:

- **Versionar o no un `.env` con las claves de demo** decide si `npm run build`
  funciona en un clon recién hecho (6.1).
- **El registro verbal del mensaje de error** decide el texto de
  `login.errorMessage` (2.4). `login` trata de usted y `signup` de tú; el texto
  nuevo tiene que elegir uno.
- **El correo y la contraseña de la cuenta sembrada** son literales que
  `seed.sql` y el E2E comparten (6.2).

Ninguna bloquea la planificación de tareas; las tres bloquean la ejecución de la
tarea que las toca.
