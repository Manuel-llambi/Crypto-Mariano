# Diseño — Alta de cuenta contra Supabase local

**Estado:** Aprobado
**Fecha:** 2026-08-19
**Requisitos:** ./requirements.md

## Resumen

Tres Server Actions, una por pantalla, calcadas de `app/acceso/actions.ts`:
validar con Zod, llamar a Supabase, redirigir siempre. Las tres pantallas dejan
de ser anclas y pasan a ser `<form action={...}>`, que es lo que mantiene el alta
en pie con el script bloqueado (6.1, 6.3).

El paso 1 pide el código y guarda el correo en una cookie `httpOnly`. El paso 2
lo verifica y ahí nace la sesión, con lo cual la cookie del correo deja de hacer
falta y se descarta. El paso 3 no crea nada: le fija la contraseña a la cuenta
que la sesión identifica (3.5).

No se agrega ninguna dependencia. `@supabase/ssr` y `@supabase/supabase-js` ya
están, `lib/supabase/server.ts` ya sabe escribir cookies de sesión, y las tres
acciones nuevas usan ese mismo cliente.

## Arquitectura

```
/registro                    /registro/codigo              /registro/crear-cuenta
    │                              │                              │
  <form>                        <form>                         <form>
    │                              │                              │
    ▼                              ▼                              ▼
requestCode()                 verifyCode()                   setPassword()
    │                              │                              │
    │ escribe                      │ lee y borra                  │ lee
    ├──────────► cookie `registro_correo` (httpOnly) ◄────────────┤
    │                              │                              │
    ▼                              ▼                              ▼
signInWithOtp()              verifyOtp()                    updateUser()
    │                              │                              │
    │                        abre sesión                    fija contraseña
    │                        (cookies de                          │
    ▼                         `lib/supabase/server`)              ▼
/registro/codigo                   ▼                           /panel
                          /registro/crear-cuenta
```

Las tres acciones viven junto a su pantalla, como `app/acceso/actions.ts` junto a
`app/acceso/page.tsx`. Lo único compartido —la cookie del correo pendiente— sale
a `lib/` para que ninguna de las tres tenga que saber cómo se llama ni cuánto
dura.

**Ni el middleware ni la guardia del panel cambian.** `middleware.ts` sigue
renovando el token solo bajo `/panel`; las pantallas de `/registro` no necesitan
renovación porque la sesión que abren dura minutos, no días. La guardia de
`app/panel/layout.tsx` recibe al recién inscripto como a cualquier otro.

## Componentes e interfaces

### `lib/signup/pending-email.ts`

- **Responsabilidad:** la cookie del correo pendiente, y nada más. Su nombre, su
  duración y sus atributos viven acá y en ningún otro lugar (4.1, 4.2, 4.3).
- **Interfaz:**

```ts
export const PENDING_EMAIL_COOKIE = "registro_correo";

/** Retiene la dirección mientras el visitante teclea el código (4.1). */
export async function setPendingEmail(email: string): Promise<void>;

/** La dirección en curso, o `undefined` si no hay ninguna (4.3). */
export async function readPendingEmail(): Promise<string | undefined>;

/** La descarta apenas el código queda verificado (4.2). */
export async function clearPendingEmail(): Promise<void>;
```

- **Depende de:** `next/headers`.
- **Atributos de la cookie:** `httpOnly` (4.1), `sameSite: "lax"`, `secure` fuera
  de desarrollo, `path: "/registro"` —no la manda a ninguna otra pantalla— y
  `maxAge` igual al vencimiento del código que declara `config.toml`.

### `app/registro/actions.ts`

- **Responsabilidad:** pedirle el código a Supabase y retener el correo (1.1).
- **Interfaz:**

```ts
export async function requestCode(formData: FormData): Promise<never>;
```

- **Depende de:** `lib/supabase/server`, `lib/signup/pending-email`, `lib/routes`.
- **Llamada:** `signInWithOtp({ email, options: { shouldCreateUser: true } })`.
  `shouldCreateUser` es lo que hace que una dirección sin cuenta también reciba
  código, y es la mitad de 1.3: sin él, la respuesta delataría cuáles existen.

### `app/registro/codigo/actions.ts`

- **Responsabilidad:** comprobar el código y abrir la sesión (2.1).
- **Interfaz:**

```ts
export async function verifyCode(formData: FormData): Promise<never>;
```

- **Llamada:** `verifyOtp({ email, token, type: "email" })`. El correo sale de la
  cookie, nunca del formulario: es la única dirección para la que ese código
  vale.

### `app/registro/crear-cuenta/actions.ts`

- **Responsabilidad:** fijar la contraseña de la cuenta en sesión (3.1, 3.4).
- **Interfaz:**

```ts
export async function setPassword(formData: FormData): Promise<never>;
```

- **Llamada:** `updateUser({ password })`. **Solo lee el campo `password` del
  formulario.** La cuenta la identifica la sesión, y por eso una dirección
  posteada acá no puede desviar la escritura a otra cuenta (3.5).

### Las tres páginas

- **Responsabilidad:** dejar de ser maquetas. Cada una pasa `submitAction` en
  lugar de `submitHref` a `AccessScreen`, y lee su `?error=` para pasar `error`.
- **Nada visual cambia.** `AccessScreen` ya tiene los tres modos y ya sabe pintar
  el mensaje de error; `/acceso` estrenó ese camino. No se define ningún color,
  tipografía ni espaciado nuevo: la tarjeta, los campos y el mensaje salen de
  `AccessScreen.module.css` y de los tokens de `styles/tokens.css`, exactamente
  como en la pantalla de acceso.
- **La guardia de cada paso corre en la página, antes de renderizar**, no en la
  acción: `/registro/codigo` sin correo pendiente redirige (4.3), y
  `/registro/crear-cuenta` sin sesión también (4.4).

### El campo de correo del paso 3 — pregunta abierta resuelta

**Se conserva, como eco de solo lectura, y deja de enviarse.** La pantalla lo
muestra para que el visitante vea a qué cuenta le está poniendo contraseña, con
el valor que devuelve `getUser()` —la misma llamada que la guardia de 4.4 ya
hace, así que el eco no cuesta un viaje extra—, marcado `readOnly` y **sin
atributo `name`**, de modo que el navegador no lo incluye en el envío.

Esto exige un cambio menor: `name` pasa a ser opcional en `Field`. Se prefirió a
retirar el campo porque la pantalla quedaría pidiendo una contraseña sin decir
para quién, y se prefirió a dejarlo editable porque un campo que se puede cambiar
y que el servidor ignora es una mentira sobre lo que hace la pantalla.

### `supabase/templates/`

- **Responsabilidad:** que el correo traiga el código a la vista (7.1, 7.3).
- **Dos archivos**, porque Supabase elige plantilla según el caso y arreglar una
  sola deja a la mitad de la gente sin código (7.2):
  - `confirmation.html` — dirección sin cuenta previa.
  - `magic-link.html` — dirección que ya tiene cuenta.
- Ambas usan `{{ .Token }}`. Se declaran en `config.toml` bajo
  `[auth.email.template.confirmation]` y `[auth.email.template.magic_link]`.

### `e2e/mailbox.ts`

- **Responsabilidad:** leer el código del buzón local (9.3).
- **Interfaz:**

```ts
export const MAILBOX_URL: string;          // 127.0.0.1:55324, literal estático
export const SIGNUP_ADDRESS: string;       // dirección fija de prueba

/** El código del último correo recibido en esa dirección. */
export async function readLatestCode(address: string): Promise<string>;
```

- **Literales estáticos, sin `.env`**, igual que `e2e/seeded-account.ts`:
  Playwright no lee ese archivo ni puede importar TypeScript dinámicamente.
- **La API concreta queda por determinar**: hay que mirar si la instancia corre
  Inbucket o Mailpit antes de escribir el cuerpo. Es la primera tarea que toca
  este archivo.

## Modelos de datos

No hay tablas nuevas ni tipos persistidos. Lo único que se modela es la entrada
de cada acción, con la misma disciplina que `CredentialsSchema`: rechazar lo que
no puede tener éxito, y nada más.

```ts
// app/registro/actions.ts — 1.2
const RequestSchema = z.strictObject({ email: z.email() });

// app/registro/codigo/actions.ts — 2.3
const VerifySchema = z.strictObject({ code: z.string().min(1) });

// app/registro/crear-cuenta/actions.ts — 3.3
const PasswordSchema = z.strictObject({ password: z.string().min(1) });
```

`PasswordSchema` **no** restata la política de contraseña de Supabase. Un largo
mínimo acá solo produciría un segundo rechazo para el mismo resultado, y encima
uno que se desincroniza el día que la instancia cambie de política (3.3). Es la
misma decisión que tomó `CredentialsSchema` en el spec anterior.

Cada acción lee sus campos **uno por uno**, no con `Object.fromEntries`: el eco
de solo lectura del paso 3 no viaja, pero si alguna vez viajara, `strictObject`
haría fallar el alta por un campo de más que no tiene nada que ver con la
contraseña.

Textos nuevos en `content/access.ts`, bajo cada paso de `signup`, validados por
`AccessSchema` (8.1) y en tuteo (8.3):

```ts
signup: {
  email:   { …, errorMessage: string, expiredMessage: string },
  code:    { …, errorMessage: string },
  account: { …, errorMessages: { weak: string; generic: string } },
}
```

Direcciones y códigos en `lib/routes.ts` (8.2), derivados de las constantes que
ya existen para que dos deletreos de la misma ruta no puedan discrepar:

```ts
export const SIGNUP_ERROR_CODE = "correo";
export const SIGNUP_ERROR_HREF = `${SIGNUP_HREF}&error=${SIGNUP_ERROR_CODE}`;

export const SIGNUP_CODE_ERROR_CODE = "codigo";
export const SIGNUP_CODE_ERROR_HREF = `${SIGNUP_CODE_HREF}?error=${SIGNUP_CODE_ERROR_CODE}`;

/**
 * El correo pendiente venció o no está (4.3).
 *
 * Aterriza en el paso 1 y no en el 2: pedir el código de nuevo es exactamente lo
 * que el visitante tiene que hacer, y la pantalla que sabe hacerlo es aquella.
 */
export const SIGNUP_EXPIRED_CODE = "vencido";
export const SIGNUP_EXPIRED_HREF = `${SIGNUP_HREF}&error=${SIGNUP_EXPIRED_CODE}`;

/** Dos motivos, porque 3.2 pide decir cuál fue. */
export const SIGNUP_ACCOUNT_ERROR_CODES = { weak: "debil", generic: "error" } as const;
```

## Flujo de datos

**Alta completa, de la primera pantalla al panel (1.1 → 2.1 → 3.1 → 5.1):**

1. El visitante envía `/registro` con su dirección. `requestCode` la valida con
   `RequestSchema`.
2. `signInWithOtp({ shouldCreateUser: true })`. Supabase crea la fila del usuario
   si no existía y manda el correo. La cuenta existe, sin contraseña.
3. `setPendingEmail(email)` escribe la cookie, y la acción redirige a
   `/registro/codigo` — sin la dirección en la URL (1.5).
4. El visitante teclea el código. `verifyCode` lee la cookie, valida el campo, y
   llama a `verifyOtp`.
5. Supabase acepta: emite la sesión, que `lib/supabase/server` escribe en cookies
   `httpOnly`, **y marca la dirección como confirmada** (5.2).
   `clearPendingEmail()` borra la cookie del correo (4.2) y la acción redirige a
   `/registro/crear-cuenta`.
6. Esa pantalla comprueba la sesión con `getUser()`, pinta el correo como eco, y
   el visitante elige su contraseña.
7. `setPassword` llama a `updateUser({ password })` sobre la sesión vigente, y
   redirige a `/panel`, que la guardia deja pasar porque hay sesión.
8. La cuenta queda con la dirección confirmada y una contraseña: `/acceso` la
   acepta con `signInWithPassword` (5.1).

**Dirección que ya tenía cuenta (3.4, 1.3):** el recorrido es idéntico. En el
paso 2, Supabase manda la plantilla `magic-link` en lugar de `confirmation`, y en
el paso 7 `updateUser` reemplaza la contraseña anterior. En ningún punto la
pantalla dice ni sugiere cuál de los dos casos ocurrió.

## Manejo de errores

**La regla, y por qué cambia a mitad del flujo:** en los pasos 1 y 2 todo rechazo
dice lo mismo, porque distinguirlos filtraría qué direcciones están registradas.
En el paso 3 conviene ser específico: el visitante ya probó que el buzón es suyo,
no hay nada que ocultarle, y un mensaje genérico lo deja adivinando qué corregir.

| Condición | Manejo | Requisito |
|---|---|---|
| Correo vacío o malformado | Redirige a `SIGNUP_ERROR_HREF` sin consultar a Supabase | 1.2 |
| Supabase no responde o rechaza el envío | Redirige a `SIGNUP_ERROR_HREF`, mismo mensaje | 1.4 |
| La dirección ya tiene cuenta | **No es un error.** Mismo camino, mismo destino | 1.3 |
| Código vacío | Redirige a `SIGNUP_CODE_ERROR_HREF` sin consultar a Supabase | 2.3 |
| Código incorrecto, vencido o ya usado | Redirige a `SIGNUP_CODE_ERROR_HREF`, un solo mensaje | 2.2 |
| Pedido al paso 2 sin correo pendiente | La página redirige a `SIGNUP_EXPIRED_HREF` antes de renderizar | 4.3 |
| Envío del paso 2 con la cookie ya vencida | `verifyCode` redirige a `SIGNUP_EXPIRED_HREF` sin consultar a Supabase | 4.3 |
| Contraseña vacía | Redirige con el código `generic`, sin consultar a Supabase | 3.2 |
| Supabase la rechaza por débil | Redirige con el código `weak`, que nombra el motivo | 3.2 |
| Supabase la rechaza por otra causa | Redirige con el código `generic` | 3.2 |
| Pedido al paso 3 sin sesión | La página redirige a `/registro` antes de renderizar | 4.4 |

Los tres `redirect` van **fuera de todo `try`**, por la misma razón que en
`app/acceso/actions.ts`: `redirect` señala lanzando una excepción, y un `catch`
que la abrace se la come y deja al visitante mirando una pantalla que no
reaccionó. El `try` envuelve la llamada de red y nada más.

Ningún redirect lleva el correo, el código ni la contraseña (1.5, 2.5, 3.6).

## Estrategia de testing

- **Unitario (vitest), una suite por acción**, calcadas de
  `app/acceso/actions.test.ts`: el camino feliz, cada fila de la tabla de
  errores, y la afirmación de que el destino nunca contiene lo tecleado.
- **Unitario, `lib/signup/pending-email.ts`**: que escribe `httpOnly`, que lee lo
  que escribió, y que borrar deja `undefined`.
- **Componente (jsdom por archivo)**: las tres páginas ahora renderizan un
  `<form>` con su acción; el eco del paso 3 es `readOnly` y no tiene `name`; el
  mensaje de error aparece solo con `?error=` presente.
- **Tests a invertir (9.5):** los tres de `app/registro/**/page.test.tsx` que hoy
  afirman la ausencia de `<form>` y la presencia de un ancla, y `e2e/registro.spec.ts`.
  No se rompen por accidente: se dan vuelta a propósito, y ese giro es trabajo de
  la tarea que conecta cada pantalla.
- **Punta a punta, tres casos** (`plan-test-cases` los deriva del spec; acá solo
  se anota qué hace falta que existan):
  - Un alta completa que lee el código del buzón y termina **saliendo y volviendo
    a entrar por `/acceso`** con esas credenciales (9.1).
  - Un código incorrecto (9.2).
  - Un pedido a un paso sin su precondición (9.2).
- **`playwright.global-setup.ts` se extiende** para sondear también el buzón, con
  un mensaje que lo nombre (9.4). Hoy ya aborta si la instancia no responde.
- **Repetible sin preparar la base (9.6):** la dirección de prueba es fija y
  distinta de la sembrada. La segunda corrida encuentra la cuenta creada por la
  primera y, por 3.4, hace exactamente lo mismo.
- **Verificación por mutación** en los criterios que se cumplen por ausencia —que
  el destino no contenga el correo, que el eco no se envíe—: el DOM renderizado
  no distingue esos casos, así que hay que ver el test en rojo.

## Decisiones de diseño y trade-offs

- **Decisión:** conservar las tres pantallas en su orden y fijar la contraseña al
  final. — **Justificación:** Supabase crea la fila del usuario al **enviar** el
  código, no al verificarlo, así que la cuenta a medio hacer que este camino deja
  la dejan también los otros dos; a igual costo, gana el que no obliga a tirar
  diseño construido. — **Alternativa considerada:** juntar correo y contraseña en
  una pantalla con `signUp` (borra una pantalla y rehace otra), o pedir la
  contraseña antes del código (conserva las tres pero invierte lo que muestran).

- **Decisión:** el paso 3 fija la contraseña aunque la cuenta ya existiera. —
  **Justificación:** una sola regla y un solo camino de código; quien controla el
  buzón puede fijar la clave, que es exactamente el contrato de cualquier
  recuperación por correo. De regalo, cubre el hueco de recuperación que el
  proyecto tiene anotado. — **Alternativa considerada:** detectar la cuenta previa
  y saltear al panel, que necesita marcar de algún modo qué cuentas ya pasaron por
  el alta porque Supabase no lo distingue; y frenar en el paso 1, que enumera
  direcciones registradas y contradice el criterio 2.2 del spec de acceso.

- **Decisión:** el correo viaja en cookie `httpOnly` y no en la URL. —
  **Justificación:** la barra de direcciones termina en el historial, en los
  registros del servidor y en el `Referer` del pedido siguiente. Un correo no es
  una contraseña, pero es un dato personal y no hay razón para regalarlo. —
  **Alternativa considerada:** `?email=` en la ruta (más simple, deja rastro), o
  volver a pedirlo en el paso 2 (sin rastro, pero le hace teclear dos veces lo
  mismo a quien ya lo escribió).

- **Decisión:** la cuenta del paso 3 se identifica por la sesión. —
  **Justificación:** si saliera del formulario, cualquiera con sesión propia
  podría postear la dirección de otro y reescribirle la contraseña. Con la sesión
  como fuente, ese ataque no tiene por dónde entrar. — **Alternativa considerada:**
  leer el correo del formulario y comprobar que coincide con el de la sesión —
  misma protección, un campo más que validar y una forma más de equivocarse.

- **Decisión:** el control de reenvío del paso 2 sigue llevando al paso 1. —
  **Justificación:** es lo más simple que funciona, y el paso 1 ya sabe pedir un
  código. — **Alternativa considerada:** una cuarta acción que reenvíe sin
  moverse de pantalla; más cómoda, pero es superficie nueva para un caso que el
  camino existente ya cubre.

- **Decisión:** no se toca `middleware.ts`. — **Justificación:** renovar el token
  importa en una sesión que dura días, no en tres pantallas que se recorren en
  minutos. Ampliar su alcance a `/registro` agregaría trabajo por pedido sin
  arreglar ningún síntoma.

## Pendientes de verificar antes de implementar

Los tres salen de las preguntas abiertas de `requirements.md` y son
verificaciones contra la instancia, no decisiones:

1. **Si `auth.rate_limit.email_sent = 2` alcanza al buzón local.** Si alcanza, se
   sube en `config.toml` con un comentario que explique por qué. Afecta a 9.1 y 9.6.
2. **Si `enable_confirmations` interviene en este camino.** Probablemente no
   —gobierna el alta con contraseña—, pero 5.2 depende de que la verificación
   deje la dirección confirmada.
3. **Si el buzón local es Inbucket o Mailpit.** La API para listar mensajes
   cambió entre uno y otro, y `e2e/mailbox.ts` no se puede escribir sin saberlo.
