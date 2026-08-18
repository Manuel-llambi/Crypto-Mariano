# Tareas — Acceso real contra Supabase local

**Estado:** Borrador
**Fecha:** 2026-08-17
**Requisitos:** ./requirements.md
**Diseño:** ./design.md

## Resumen de tareas

| ID | Tarea | Requisitos | Estado |
|----|-------|------------|--------|
| T1 | Configuración de Supabase validada al importar (`lib/supabase/env.ts`) | 6.1, 6.3 | [ ] Pendiente |
| T2 | Siembra de la cuenta de trabajo (`supabase/seed.sql`) | 6.2 | [ ] Pendiente |
| T3 | Cliente de servidor atado a cookies (`lib/supabase/server.ts`) | 3.1, 3.4 | [ ] Pendiente |
| T4 | `login.errorMessage` en `content/access.ts` y su esquema | 2.4 | [ ] Pendiente |
| T5 | `AccessScreen`: tercer modo, el `<form>` que postea | 1.5, 5.3 | [ ] Pendiente |
| T6 | `AccessScreen`: el mensaje de error y el token `--error-text` | 2.1, 2.5 | [ ] Pendiente |
| T7 | La acción `signIn`: autentica y redirige | 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1 | [ ] Pendiente |
| T8 | La acción `signIn`: valida antes de consultar a Supabase | 1.4 | [ ] Pendiente |
| T9 | `/acceso` postea a la acción y muestra el error de la query | 2.1, 2.4, 2.5, 5.3, 5.4, 6.1 | [ ] Pendiente |
| T10 | `middleware.ts`: renovación del token de sesión | 3.2, 3.3 | [ ] Pendiente |
| T11 | La guardia en `app/panel/layout.tsx` | 3.3, 4.1, 4.2, 4.3, 4.4, 6.1 | [ ] Pendiente |
| T12 | `globalSetup` de Playwright: la instancia local responde | 7.1 | [ ] Pendiente |
| T13 | `e2e/acceso.spec.ts` reescrito: CP-01, CF-01 y CF-02 | 1.1, 1.2, 1.5, 2.1, 3.1, 3.2, 3.4, 4.1, 7.2, 7.3 | [ ] Pendiente |
| T14 | Cobertura del acceso sin JavaScript en `e2e/no-javascript.spec.ts` | 5.1, 5.2 | [ ] Pendiente |
| T15 | `e2e/panel.spec.ts` entra con sesión antes de mirar el panel | 3.2, 4.2, 7.2 | [ ] Pendiente |
| T16 | Acotar el criterio 6.7 en el spec de la landing | — (Relación con el spec) | [ ] Pendiente |

## Cobertura de requisitos

| Criterio | Tareas |
|---|---|
| 1.1 | T7, T13 |
| 1.2 | T7, T13 |
| 1.3 | T7 |
| 1.4 | T8 |
| 1.5 | T5, T13 |
| 2.1 | T7, T6, T9, T13 |
| 2.2 | T7 |
| 2.3 | T7 |
| 2.4 | T4, T9 |
| 2.5 | T6, T9 |
| 3.1 | T3, T7, T13 (la cookie, observada en un navegador real) |
| 3.2 | T10 (el mecanismo de renovación), T13, T15 (el pedido posterior reconocido) |
| 3.3 | T10 (el middleware), T11 (el layout del panel) |
| 3.4 | T3 (el adaptador fuerza `httpOnly`), T13 (la cookie emitida lo trae) |
| 4.1 | T11, T13 |
| 4.2 | T11, T15 |
| 4.3 | T11 |
| 4.4 | T11 |
| 5.1 | T14 |
| 5.2 | T14 |
| 5.3 | T5, T9 |
| 5.4 | T9 |
| 6.1 | T1 (el mecanismo), T9 y T11 (los dos puntos donde entra al grafo del build) |
| 6.2 | T2 |
| 6.3 | T1 |
| 7.1 | T12 |
| 7.2 | T13, T15 |
| 7.3 | T13 |

## Orden de ejecución

El orden a respetar es el de **Depende de**, no el numérico. En el tramo inicial
solo T1, T2, T4 y T5 están libres y pueden tomarse en cualquier orden; T3 espera
a T1 y T6 espera a T5. De T7 en adelante la cadena se estrecha.

## T1 — Configuración de Supabase validada al importar (`lib/supabase/env.ts`)

**Requisitos:** 6.1, 6.3
**Depende de:** ninguno

**Bloqueada para ejecución:** pregunta abierta 1 de `requirements.md` — si se
versiona un `.env` con las claves de demo de la instancia local o si se deja un
`.env.example` con un paso manual. Decide si `npm run build` funciona en un clon
recién hecho. No bloquea escribir el módulo ni su test, sí bloquea cerrar la
tarea. Dato de terreno para quien la responda: hoy no existe ningún `.env` en el
repositorio y `.gitignore` solo ignora `.env*.local`, de modo que un `.env`
versionado no exige tocar el ignorado.

**Descripción:**

Crear `lib/supabase/env.ts` según el componente homónimo de `design.md`: un
`EnvSchema` con `z.strictObject({ SUPABASE_URL: z.url(), SUPABASE_PUBLISHABLE_KEY:
z.string().min(1) })` que se parsea **al importar**, de modo que la ausencia de
cualquiera de las dos variables lance nombrándola. Es el mismo mecanismo que
`lib/access-url.ts` ya demostró en este repositorio.

Exporta lo que `design.md` fija, y solo eso:
`supabaseEnv: { url: string; publishableKey: string }` — los nombres de las
variables se traducen a los dos campos del objeto, que son los que consumen T3,
T10 y T12.

Las variables van **sin prefijo `NEXT_PUBLIC_`**: nada en el navegador las
consume y el prefijo solo sirve para inlinearlas en el bundle del cliente.

Dos trampas concretas del armado, ambas comprobadas:

1. **No se parsea `process.env`.** Con `z.strictObject` esa llamada falla
   siempre con `unrecognized_keys`, porque el entorno trae cientos de claves
   ajenas. Hay que parsear un objeto literal armado con dos accesos estáticos
   —`{ SUPABASE_URL: process.env.SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY:
   process.env.SUPABASE_PUBLISHABLE_KEY }`—, que además es la forma que el
   propio `lib/access-url.ts` ya usa.
2. **El test tiene que poder ver rojo.** `vitest.config.ts` va a definir las dos
   variables para toda la suite (abajo), así que cada caso debe borrar la que
   está probando, llamar a `vi.resetModules()` e importar el módulo de nuevo,
   restaurando el valor original al terminar. Es el montaje de
   `lib/access-url.test.ts`; sin él, el caso de la variable faltante nunca
   falla.

Agregar `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` al bloque `test.env` de
`vitest.config.ts`, o todo test que importe un módulo que dependa de este lanzará
al cargarse. La dirección de prueba debe ser la de la instancia local declarada
en `supabase/config.toml` (`http://127.0.0.1:55321`), no una inventada.

**Alcance de «fallar la compilación» (6.1):** el módulo lanza al importar, y eso
hace fallar el build **mientras algo del grafo de compilación lo importe**. En
T1 todavía no lo importa nadie: el primero es T3. La lección ya está pagada en
este repositorio —`lib/access-url.ts` sigue lanzando y ya no protege nada porque
ningún módulo lo carga—, así que la protección de 6.1 no se da por conseguida
acá; se sostiene desde T3 en adelante. Esta tarea entrega el mecanismo y su test
de importación.

**Verificación por mutación obligatoria** en el caso de 6.3: es un test que pasa
en la primera corrida, que es exactamente lo que la regla del proyecto no acepta
como verificado. Hay que verlo en rojo introduciendo a propósito una referencia
a la clave secreta y confirmando que falla solo ese caso.

**Criterios de aceptación (trazados desde requirements.md):**

- 6.1 — falta `SUPABASE_URL` → se lanza al importar y el mensaje **nombra
  `SUPABASE_URL`**; falta `SUPABASE_PUBLISHABLE_KEY` → se lanza y el mensaje
  nombra esa otra. Cada caso nombra la que falta y no la que está: es lo que
  distingue «cuál de las dos» de un «falta configuración» genérico.
- 6.1 — una `SUPABASE_URL` presente pero malformada, y una
  `SUPABASE_PUBLISHABLE_KEY` presente pero vacía, también lanzan; `z.url()` y
  `min(1)` son lo que lo consigue.
- 6.1 — con las dos variables bien puestas, el módulo importa sin lanzar y
  `supabaseEnv` expone `url` y `publishableKey` con esos valores.
- 6.3 — el módulo no lee ninguna clave secreta ni de servicio: el esquema tiene
  exactamente esas dos claves y el módulo exporta solo `supabaseEnv`. El test
  afirma además, con el patrón por ausencia ya establecido en el proyecto, que
  las fuentes de la aplicación no mencionan una variable de clave secreta ni de
  rol de servicio. Ese test queda de guardia sobre T3, T10 y T12, que son las
  que podrían caer en la tentación.

**Decision log:**

_(vacío hasta la ejecución)_

**Outcome:**

_(vacío hasta que la tarea esté terminada)_

## T2 — Siembra de la cuenta de trabajo (`supabase/seed.sql`)

**Requisitos:** 6.2
**Depende de:** ninguno

**Bloqueada para ejecución:** pregunta abierta 3 de `requirements.md` — hacen
falta el correo y la contraseña concretos, y que el correo sea evidentemente de
prueba. Son literales que este archivo y el E2E comparten (T13, T14, T15).

**Precondición de entorno:** la instancia local tiene que estar arriba
(`supabase start`). No es una dependencia de otra tarea: es lo que vuelve
ejecutable el ciclo de abajo, porque el entregable es SQL y su rojo solo existe
contra la base.

**Descripción:**

Crear `supabase/seed.sql` con la cuenta única que sirve a la vez de cuenta de
trabajo y de cuenta de pruebas — 6.2 nombra las dos y es una sola, la misma que
la pregunta abierta 3 tiene que resolver y la que T13, T14 y T15 tecleen.
`supabase/config.toml` ya declara `sql_paths = ["./seed.sql"]` con
`db.seed.enabled = true`, pero el archivo no existe. La ruta **no está ignorada**
—ni por `supabase/.gitignore` ni por el raíz—, así que queda versionada sin tocar
ningún ignorado.

Inserta la cuenta en `auth.users` con la contraseña cifrada por `crypt(…,
gen_salt('bf'))` y `email_confirmed_at` ya puesto, más su fila en
`auth.identities` con el proveedor `email`.

**Lo que de verdad rompe la cuenta, y no es lo que dice `design.md`.** Ambas
cosas se comprobaron contra la instancia local (GoTrue v2.195.0) sembrando dos
cuentas de sonda y pidiéndoles un token:

1. **Las columnas de token no pueden quedar en NULL.** Son nulables en la base,
   pero GoTrue las lee hacia un `string` de Go y NULL revienta el escaneo: el
   acceso devuelve `500 {"error_code":"unexpected_failure","msg":"Database error
   querying schema"}` y el log de `supabase_auth` dice `Scan error on column
   index 3, name "confirmation_token": converting NULL to string is
   unsupported`. Hay que ponerlas en cadena vacía: `confirmation_token`,
   `recovery_token`, `email_change_token_new`, `email_change`,
   `email_change_token_current`, `phone_change`, `phone_change_token` y
   `reauthentication_token`. `phone` sí puede quedar en NULL. La cadena vacía no
   colisiona entre cuentas: los índices únicos de esas columnas son parciales,
   con predicado `!~ '^[0-9 ]*$'`, que justamente deja fuera al `''`.
2. **La fila de `auth.identities` no es la que habilita el acceso.**
   `design.md` la justifica diciendo que «sin esa segunda fila algunas versiones
   de GoTrue no reconocen la cuenta»; en esta versión eso **no** ocurre: la
   cuenta de sonda sin fila en `auth.identities` inició sesión y `getUser()` la
   devolvió igual. Se la siembra igual, pero por otro motivo honesto: es lo que
   produce `auth.admin.createUser`, y sin ella `user.identities` vuelve `[]`.
   Que quede escrito para que nadie, al toparse con el 500 de arriba, sospeche
   de la tabla equivocada.

**Idempotencia, con el conflicto bien apuntado.** `auth.users` no tiene una
restricción única simple sobre `email` —solo el índice parcial
`users_email_partial_key … WHERE is_sso_user = false`—, de modo que
`on conflict (email)` no es un destino usable. La forma que sí funciona es fijar
un UUID literal para la cuenta y resolver por clave primaria:
`on conflict (id) do nothing`. En `auth.identities` sí hay restricción única
simple: `on conflict (provider_id, provider) do nothing`.

`crypt()` y `gen_salt()` viven en el esquema `extensions`, que ya está en el
`search_path` por defecto del rol `postgres`; la llamada sin calificar resuelve.
Calificarla como `extensions.crypt(…)` es la variante defensiva.

**Cómo se ve el rojo acá.** El entregable es SQL, así que el ciclo se corre
contra la instancia, no en Vitest:

1. **Rojo** — con la base sin la cuenta, pedir un token con las credenciales
   elegidas a `POST ${SUPABASE_URL}/auth/v1/token?grant_type=password` (cabecera
   `apikey` con la clave publicable, cuerpo `{"email":…,"password":…}`) devuelve
   `400` de credenciales inválidas.
2. **Verde** — escribir `seed.sql`, correr `supabase db reset`, repetir el mismo
   pedido: devuelve `200` con `access_token`.
3. **Idempotencia** — volver a aplicar `seed.sql` sobre la base ya sembrada
   termina sin error y deja **una** fila en `auth.users` y una en
   `auth.identities`.

**No se agrega un test de Vitest que lea el archivo y busque subcadenas.** Sería
tautológico —afirmaría `auth.identities` sobre un archivo donde uno acaba de
escribir `auth.identities`— y, sobre todo, habría quedado **verde durante el
defecto de NULL que se documenta arriba**, que es el único que impide entrar. La
red automática de regresión la ponen T13 y T14, que usan esta misma cuenta; meter
la instancia local dentro de `npm test` le sacaría a la suite unitaria la
autonomía que `design.md` solo aceptó perder en `test:e2e`.

**Criterios de aceptación (trazados desde requirements.md):**

- 6.2 (versionado) — `supabase/seed.sql` existe y queda bajo control de
  versiones; `git check-ignore` no lo reclama.
- 6.2 (declara la cuenta) — el archivo declara el correo y la contraseña de la
  cuenta de trabajo y de pruebas, con la contraseña cifrada por `crypt()` y
  `email_confirmed_at` puesto, más su fila en `auth.identities`.
- 6.2 (reproducible al reiniciar) — tras `supabase db reset` la cuenta existe y
  **autentica**: el pedido de token devuelve `200` con `access_token`. Es la
  afirmación que distingue una cuenta sembrada de una cuenta que sirve.
- 6.2 (reproducible) — aplicar el archivo dos veces no falla ni duplica: queda
  una sola fila en cada tabla.
- Ninguna columna de token de la cuenta sembrada queda en NULL, y el acceso no
  devuelve `Database error querying schema`.

**Decision log:**

_(vacío hasta la ejecución)_

**Outcome:**

_(vacío hasta que la tarea esté terminada)_

## T3 — Cliente de servidor atado a cookies (`lib/supabase/server.ts`)

**Requisitos:** 3.1, 3.4
**Depende de:** T1

**Descripción:**

Crear `lib/supabase/server.ts` con `createClient(): Promise<SupabaseClient>`
según el componente homónimo de `design.md`. Arma el cliente con
`createServerClient(supabaseEnv.url, supabaseEnv.publishableKey, { cookies: {
getAll, setAll } })`: los dos valores salen de `lib/supabase/env` (T1), nunca de
un literal ni de `process.env` leído acá. Es el único módulo del proyecto que
toca cookies de sesión.

El adaptador va sobre `cookies()` de `next/headers`, que en Next 15 devuelve una
promesa. `getAll` reexpone lo que el almacén trae; `setAll` recibe la lista de
`{ name, value, options }` y escribe cada entrada **forzando `httpOnly: true`
sobre las opciones que llegan**, se lo haya pedido la librería o no. Se puede
justamente porque no existe ningún cliente de navegador que necesite leerlas
(3.4). Y traga la excepción que Next arroja al escribir cookies desde un
componente de servidor: en ese contexto solo se está leyendo.

**Las dos dependencias se agregan acá, dentro de esta tarea.** Hoy
`package.json` solo trae la CLI `supabase` como dependencia de desarrollo.
Instalar un paquete no es un ciclo TDD por sí mismo —no hay rojo que ver— y la
regla de tamaño manda fusionar lo que no puede fallar solo con la tarea que
primero lo usa; esta es esa tarea. Van las dos como dependencias de ejecución:
`@supabase/supabase-js` **no** viene de arrastre, porque en `@supabase/ssr`
(0.12.4) figura como `peerDependency`, no como `dependency` — comprobado con
`npm view`. Además es de donde sale el tipo `SupabaseClient` que la interfaz de
`design.md` nombra, y un tipo importado de un paquete que nadie declaró se
rompe con el primer `npm install` que reordene el árbol.

**Esta tarea no cierra 6.1, y conviene decirlo acá porque es tentador creer lo
contrario.** T1 deja el mecanismo que lanza al importar; para que eso haga
fallar la compilación, `lib/supabase/env` tiene que quedar en el grafo que
`next build` **carga**. Al terminar T3 nadie importa `lib/supabase/server.ts`
todavía, así que el grafo no cambia. Comprobado en este worktree el 2026-08-17:
sin ningún `.env` presente, `npm run build` termina en 0 pese a que
`lib/access-url.ts` sigue lanzando cuando le falta su variable — porque ningún
módulo de ruta lo carga. Las primeras tareas que sí lo meten son T9
(`app/acceso/page.tsx` → `signIn` → este módulo) y T11 (`app/panel/layout.tsx` →
este módulo), que son módulos de ruta y `next build` los carga.

**Cómo se ve el rojo.** El módulo no se puede ejercitar contra la red sin
credenciales, así que el ciclo se corre sobre el adaptador, en Vitest, con dos
dobles: `next/headers` devuelve un almacén de mentira que registra cada `set`, y
`@supabase/ssr` devuelve un `createServerClient` de mentira que **captura el
objeto `cookies` que le pasan** en vez de armar un cliente. El test llama a
`createClient()`, toma el adaptador capturado y lo invoca a mano. Es el primer
`vi.mock` del repositorio —hoy no hay ninguno—, de modo que conviene dejar el
montaje legible para las tareas que vienen: T7 y T11 van a mockear este mismo
módulo.

La trampa del rojo de 3.4 es qué opciones se le entregan a `setAll`. Si el caso
le pasa `{ httpOnly: true }`, una implementación que reenvía las opciones tal
cual queda **verde sin haber forzado nada**, y el test no prueba lo que dice
probar. Los dos casos tienen que entrar por el lado contrario: opciones **sin**
`httpOnly`, y opciones con `httpOnly: false` puesto a propósito. La mutación que
lo confirma es reemplazar el forzado por un reenvío directo de las opciones —
los dos casos deben caer, y solo esos.

**Criterios de aceptación (trazados desde requirements.md):**

- 3.1 — `setAll` escribe en el almacén de cookies del pedido en curso: para una
  entrada `{ name, value, options }`, el almacén recibe ese nombre y ese valor, y
  las demás opciones que la librería mandó (`path`, `maxAge`, `sameSite`) llegan
  sin alterarse. `getAll` devuelve lo que el almacén tiene.
- 3.4 — cuando la librería entrega opciones **sin** `httpOnly`, el almacén recibe
  igual `httpOnly: true`.
- 3.4 — cuando la librería entrega `httpOnly: false`, el almacén recibe
  `httpOnly: true`: el forzado pisa lo que venga, no completa lo que falta. Este
  caso es el que distingue forzar de rellenar por omisión.
- El cliente se arma con `supabaseEnv.url` y `supabaseEnv.publishableKey` de T1:
  el doble de `createServerClient` afirma los dos primeros argumentos. Ni
  literales ni un `process.env` leído en este módulo.
- Escribir desde un contexto de solo lectura no rompe el pedido: con un almacén
  cuyo `set` arroja —lo que hace Next desde un componente de servidor—, `setAll`
  no propaga la excepción.

**Decision log:**

_(vacío hasta la ejecución)_

**Outcome:**

_(vacío hasta que la tarea esté terminada)_

## T4 — `login.errorMessage` en `content/access.ts` y su esquema

**Requisitos:** 2.4
**Depende de:** ninguno

**Bloqueada para ejecución:** pregunta abierta 2 de `requirements.md` — el
registro verbal del mensaje. Solo bloquea el **texto**; el esquema, el test y el
ciclo entero se pueden armar con el texto definitivo puesto al final.

Dato de terreno para quien la responda, medido sobre `content/access.ts` tal
como está hoy: la incoherencia es **de una sola cadena**, no de todo el bloque.
De los siete textos de `login`, seis son neutros al registro —`title` («Iniciar
sesión»), `emailLabel`, `passwordLabel`, `forgotLabel` («Olvidé mi contraseña»,
primera persona), `submitLabel` («Acceder al sistema», infinitivo) y
`protocol`—. El único que trata de usted es `subtitle`: «Acceda a su terminal de
investigación institucional». En `signup`, el tuteo vive en los seis
`title`/`subtitle` de los tres pasos; sus etiquetas y rótulos también son
neutros. Unificar `login` en tuteo cuesta entonces **una cadena de contenido**
—`login.subtitle`— más el comentario de cabecera de `content/access.ts`, que hoy
documenta el reparto usted/tú. Ningún test ni ninguna spec de `e2e/` cita ese
literal: `app/acceso/page.test.tsx` lo compara por referencia
(`access.login.subtitle`), así que cambiarlo no rompe nada. Unificar es una
decisión aparte de esta tarea; T4 solo necesita saber en qué registro se escribe
el texto nuevo.

**Descripción:**

Agregar `login.errorMessage` a `content/access.ts` y el campo correspondiente a
`LoginSchema` en `lib/content/schemas.ts`, como `NonEmpty`, igual que el resto de
los textos de interfaz del proyecto. El texto es el mismo para credenciales
inválidas y para una cuenta que no existe; el mensaje no revela cuál de las dos
ocurrió — es una restricción sobre cómo se redacta, no una aserción de esta
tarea: quien hace indistinguibles los dos caminos es T7.

**De qué lado se ve el rojo, que acá no es simétrico.** `LoginSchema` es un
`z.strictObject` y `lib/content/index.ts` lo parsea al importar, de modo que los
dos archivos tienen que cambiar en el mismo paso; lo que hay que elegir es dónde
se escribe la aserción que hoy falla:

- Agregar el campo **solo al contenido** no produce un rojo dirigido: hace que
  `parseContent` lance al importar y **toda** la suite se caiga con
  `Invalid content in content/access.ts: - login.errorMessage: unrecognized
  field`. Es el mecanismo ya probado en T18 de la landing, pero como error de
  carga, no como test en rojo.
- Agregar el campo **solo al esquema** tampoco sirve: la misma importación lanza
  por clave faltante y arrastra a la suite entera.
- El rojo dirigido va **contra `LoginSchema`**, antes de tocar ninguno de los
  dos archivos: un objeto de `login` sin `errorMessage` hoy se acepta, y debe
  pasar a rechazarse. Ese caso falla solo, con los dos archivos intactos, que es
  la condición de un ciclo TDD de verdad.

**Dónde va el test: hay que crear el archivo.** Los esquemas de acceso son los
únicos del proyecto **sin cobertura propia** — existen `schemas.content.test.ts`,
`schemas.panel.test.ts` y `schemas.program.test.ts`, y ninguno importa
`LoginSchema` ni `AccessSchema`. Crear `lib/content/schemas.access.test.ts`
siguiendo la convención de nombre de los otros dos. Es trabajo que el diseño da
por hecho y que ningún criterio nombra, así que queda explícito acá en vez de
escondido dentro de la tarea.

**Una de las dos aserciones ve su rojo en `typecheck`, no en `vitest`.** `access`
está tipado por `z.infer<typeof AccessSchema>`, de modo que escribir
`access.login.errorMessage` no compila hasta que el campo entre en el esquema.
Vale igual: la verificación de toda tarea es `npm run typecheck && npm test`, y
un rojo de `tsc` es un rojo. Para armar el caso de la clave faltante sin ese
problema, la omisión se construye sobre una copia tratada como
`Record<string, unknown>`, no con un destructurado del campo que todavía no
existe.

Agregar el campo es aditivo y no rompe nada del código actual: ningún fixture de
test construye un objeto tipado como `LoginContent`, y `app/acceso/page.test.tsx`
recorre una lista literal de nombres de campo, no las claves del objeto.

**Criterios de aceptación (trazados desde requirements.md):**

- 2.4 (validado por su esquema) — `LoginSchema` rechaza un objeto de `login` al
  que le falta `errorMessage`, y lo rechaza también con el campo presente pero
  vacío o en puros espacios, que es lo que aporta `NonEmpty`. Este es el caso
  que hoy está en verde y tiene que verse en rojo antes de implementar.
- 2.4 (declarado en `content/access.ts`) — `access.login.errorMessage` existe, es
  una cadena no vacía, y `AccessSchema.safeParse(access)` sigue aceptando el
  contenido real: el campo entra en los dos archivos a la vez, no en uno solo.
- El campo declara **un** mensaje, no dos: `LoginSchema` no gana una variante
  por tipo de fallo. Es lo que deja a T7 sin forma de distinguir credenciales
  inválidas de cuenta inexistente en pantalla.

**Decision log:**

_(vacío hasta la ejecución)_

**Outcome:**

_(vacío hasta que la tarea esté terminada)_

## T5 — `AccessScreen`: tercer modo, el `<form>` que postea

**Requisitos:** 1.5, 5.3
**Depende de:** ninguno

**Descripción:**

Agregar la propiedad `submitAction?: (formData: FormData) => Promise<void>` a
`AccessScreen`, excluyente con `submitHref`. La elección del control queda en tres
ramas: con `submitAction`, un `<form action={submitAction}>` con
`<button type="submit">`; con `submitHref`, el `<a>` de hoy; sin ninguna de las
dos, el botón inerte. La exclusión se resuelve por **precedencia de la rama**
—`submitAction` se mira primero—, no por una unión discriminada de props: de las
cuatro pantallas que hoy usan el componente, tres pasan `submitHref` y
`/registro/crear-cuenta` no pasa ninguna, ninguna pasa las dos, y una unión
obligaría a retipar a las cuatro para resolver un conflicto que nadie produce.

El envoltorio ya existe: hoy los campos y el control viven dentro de
`<div className={styles.form}>`. En la tercera rama ese mismo nodo se renderiza
como `<form className={styles.form} action={submitAction}>` — no se mueve nada
más, así que el espaciado de la tarjeta queda igual. Los campos llegan por
`children` y ya traen `name` (`Field` lo renderiza; `app/acceso/page.tsx` pasa
`name="email"` y `name="password"`), de modo que el cuerpo del envío no exige
tocar ninguna pantalla.

**Hay comentarios que quedan mintiendo, y hay que actualizarlos en esta tarea.**
El bloque de cabecera de `AccessScreen.tsx` afirma hoy «There is no `<form>`
anywhere, and that absence is the point»; el `describe("the submit control")` de
`AccessScreen.test.tsx` habla de «the two shapes of the control»; y el comentario
de `.submit` en `AccessScreen.module.css` dice «One rule for the two shapes». Las
tres frases dejan de ser ciertas acá. Los comentarios se quitan antes de la
aserción por ausencia, así que no rompen ningún test — precisamente por eso hay
que acordarse a mano.

**Cómo se ve el rojo, y qué se puede afirmar de verdad en jsdom.** Comprobado en
este worktree el 2026-08-17, renderizando `<form action={fn}>` con React 19.1.1 y
`@testing-library/react` sobre jsdom:

1. **No hay `method="post"` que afirmar.** React deja `getAttribute("method")` en
   `null` —`form.method` lee `"get"` por omisión del DOM— y escribe en `action`
   un centinela literal: `javascript:throw new Error('A React form was
   unexpectedly submitted…')`. El marcado con `action` real y `method="POST"` lo
   emite el renderizador de servidor de una Server Action, que este test no
   ejecuta. Por eso la aserción que esta tarea pedía antes —«no declara
   `method="get"` ni queda sin `action`»— **es falsa contra el DOM real y se
   retira**: escribirla dejaría la tarea trabada o produciría una aserción vacía.
2. **Lo que sí prueba el hecho:** activar el control llama a `submitAction`
   exactamente una vez con un `FormData` que trae los campos tecleados —
   comprobado, `[["email","…"],["password","…"]]`. Que el `FormData` los traiga
   demuestra de paso que los campos quedaron **dentro** del formulario, que es lo
   único que hace que viajen en el cuerpo. El montaje es
   `fireEvent.click` sobre el botón más un `vi.waitFor`, porque la acción se
   invoca de forma asíncrona.
3. **`window.location.search` no sirve de prueba acá.** Sigue vacío tras el
   envío, pero en jsdom lo estaría igual sin implementación. El tramo «nunca en la
   barra de direcciones» de 1.5 lo cierra CF-01 de T13 contra un navegador de
   verdad; esta tarea aporta la otra mitad, que los campos viajan en el cuerpo.

**Lo que esta tarea no toca, para que el ejecutor no se lo encuentre de sorpresa.**
`app/acceso/page.tsx` sigue pasando `submitHref={PANEL_HREF}` — la pantalla se
conecta en T9. Como la pantalla no cambia, al terminar T5 siguen verdes y **no se
tocan acá**:

- `app/acceso/page.test.tsx`, con «renders no form at all» y el ancla a `/panel`:
  esas aserciones son de T9, que las reemplaza.
- `e2e/acceso.spec.ts`, con `expect(page.locator("form")).toHaveCount(0)` y el
  caso de que Enter dentro del campo no navega: son de T13, que reescribe el
  archivo.
- Los tres tests de `/registro` que afirman `querySelector("form")` nulo, más el
  caso «renders no form in either shape (6.7)» de `AccessScreen.test.tsx`: esos
  son la red que prueba que las otras cuatro pantallas no cambian y deben seguir
  verdes tal como están.

El mensaje de error no entra acá: es T6.

**Criterios de aceptación (trazados desde requirements.md):**

- 5.3 — con `submitAction`, los campos y el control quedan dentro de un `<form>`,
  y el control es un `<button type="submit">`: `screen.queryByRole("link", { name:
  submitLabel })` es nulo en este modo.
- 5.3 — activar el control llama a `submitAction` exactamente una vez. El envío lo
  hace el formulario y no un manejador escrito a mano: el test por ausencia que ya
  existe sigue afirmando que la fuente no contiene `onSubmit`, `onClick`,
  `useState` ni `use client`.
- 1.5 — el `FormData` con el que se llama a `submitAction` trae los campos con
  nombre que se pasaron como `children`. Es lo que demuestra que están dentro del
  formulario y viajan en el cuerpo. **No se afirma nada sobre `method` ni sobre el
  atributo `action`** — ver el punto 1 de arriba.
- Los modos `submitHref` y botón inerte siguen sin renderizar `<form>`: el caso ya
  existe en `AccessScreen.test.tsx` y se conserva sin duplicarlo, solo ampliando
  su comentario a las tres ramas.
- Los tests de las cuatro pantallas que ya usan el componente pasan sin tocar
  ninguno de esos archivos.
- El comentario de cabecera de `AccessScreen.tsx` deja de afirmar que no existe
  ningún `<form>`.

**Decision log:**

_(vacío hasta la ejecución)_

**Outcome:**

_(vacío hasta que la tarea esté terminada)_

## T6 — `AccessScreen`: el mensaje de error y el token `--error-text`

**Requisitos:** 2.1, 2.5
**Depende de:** T5

**Por qué depende de T5, que no es por el `<form>`.** T6 no necesita nada de lo
que T5 entrega: el mensaje va fuera del control de envío y se renderiza igual en
las tres ramas. La dependencia es de archivo compartido, y es real: las dos
tareas reescriben la misma interfaz `AccessScreenProps`, el mismo cuerpo del
componente y el mismo helper `renderScreen` de `AccessScreen.test.tsx`, que hoy
recibe un único parámetro posicional `submitHref?: string`. Tomarlas a la vez
corrompe los tres archivos; tomarlas al revés obliga a rehacer el helper dos
veces. T5 va primero porque cambia la **estructura** —las tres ramas del control
y la firma del helper, que pasa a necesitar un objeto de opciones—; T6 solo
agrega una propiedad y un nodo sobre esa estructura ya fija.

**Descripción:**

Agregar la propiedad `error?: string` a `AccessScreen`. Cuando llega, el mensaje
se renderiza debajo del subtítulo y antes de los campos, para que se lea antes de
volver a teclear; reutiliza el espaciado y la tipografía de `.subtitle`. **No
lleva `role="alert"` ni región viva**: el mensaje ya está en el documento cuando
la página carga, no hay cambio que anunciar.

Hay dos ubicaciones que cumplen «debajo del subtítulo y antes de los campos», y
la elección tiene una consecuencia visible: dentro de `.intro`, después del
`<p className={styles.subtitle}>`, el mensaje hereda el `text-align: center` y el
`margin-block-end: 2rem` del bloque; como hermano entre `.intro` y `.form`, no
hereda ninguno de los dos y necesita su propio espaciado. Cualquiera de las dos
sirve, pero la segunda no es gratis.

Lo único nuevo del estilo es el color: `--error-text` entra en `COLOR_TOKENS` de
`styles/tokens.ts`, se replica idéntico en `styles/tokens.css` y se clasifica en
`TEXT_TOKENS`, no en decoración — un token sin clasificar rompe el test de
tokens, y como texto se le exige 4.5:1.

**El fondo contra el que se mide es `--cream`, no `--white`.** Comprobado en la
fuente: `AccessScreen.module.css` pone `.main { background: var(--white) }`, pero
el mensaje vive dentro de `.card`, que declara `background: var(--cream)`.
`design.md` dice «contra el fondo de la tarjeta», y el fondo de la tarjeta es
crema. La distinción no es formal: `--cream` (`#f8f7f4`) es más oscuro que el
blanco, así que para un mismo color el ratio sobre crema es ~7% menor y es el
que manda. Medido con `lib/color/contrast.ts`, un rojo de `#c0392b` da 5.44:1
sobre blanco y 5.08:1 sobre crema; uno de `#b3261e`, 6.54:1 y 6.10:1.

**El caso de contraste no se escribe: ya existe.** `styles/tokens.test.ts`
recorre `TEXT_TOKENS × BACKGROUND_TOKENS`, y `BACKGROUND_TOKENS` son `--white` y
`--cream`. Clasificar el token nuevo como texto le genera solos sus dos casos —
la suite del archivo pasa de 16 a 18 casos, verificado en verde antes de
empezar—. Otros dos tests ya existentes lo obligan de paso: «declares exactly the
tokens the module defines» cae si `tokens.css` no se actualiza, y «classifies
every colour token» cae si el token queda sin clasificar.

**Un comentario que esta tarea deja mintiendo, y no es de los que se lleva T5.**
La cabecera de `styles/tokens.ts` afirma que «every value below was read off the
mockup by hand — except the two colours design.md corrected». `--error-text` no
sale del mockup: las pantallas de Stitch son maquetas inertes y no tienen estado
de error, y `design.md` tampoco cita un nodo para él. Es el primer color del
proyecto sin origen en el diseño, y la cabecera tiene que decirlo. Los tres
comentarios de `AccessScreen.tsx`, `AccessScreen.test.tsx` y
`AccessScreen.module.css` que hablan del `<form>` son de T5 y no se repiten acá.

**Cómo se ve el rojo, y cuál de los dos casos no lo ve.**

1. **2.1 ve rojo por partida doble.** Pasarle `error` a un componente que no
   declara la propiedad no compila (`tsc`), y la aserción de que el texto está en
   pantalla falla en `vitest`. La verificación de toda tarea es
   `npm run typecheck && npm test`, así que un rojo de `tsc` cuenta.
2. **2.5 pasa en la primera corrida, y por eso lleva mutación obligatoria.** Sin
   la propiedad no se renderiza ningún mensaje, de modo que «sin `error`, no hay
   mensaje» está verde antes de escribir una línea — exactamente lo que la regla
   del proyecto no acepta como verificado. La mutación es renderizar el mensaje
   sin condicionar: debe caer **solo** ese caso.

**Lo que esta tarea no toca.** `app/acceso/page.tsx` no pasa `error` todavía:
leer `searchParams.error` es T9. Tampoco se tocan los campos, que llegan por
`children` y no le pertenecen al componente — nada de `aria-invalid` ni
`aria-describedby` acá.

**Criterios de aceptación (trazados desde requirements.md):**

- 2.1 — con `error`, el texto que llega por la propiedad aparece dentro de la
  tarjeta. **Esta tarea cubre solo la mitad de 2.1 que vive en el componente**:
  que un intento rechazado *produzca* ese texto es T9, y comprobarlo contra un
  navegador es CF-01 de T13. Es el mismo reparto que T5 hace con 1.5.
- 2.1 — el mensaje precede a los campos en el orden del documento, que es lo que
  lo hace legible antes de volver a teclear. Se afirma sobre el orden real de los
  nodos de la tarjeta, no sobre la clase CSS.
- 2.5 — sin `error`, **no existe el nodo**, no basta con que esté vacío. Un
  `<p className={styles.error}>{error}</p>` incondicional deja un párrafo vacío
  en el DOM y haría pasar un `queryByText` nulo sin cumplir el criterio: la
  aserción va contra `container.querySelector` de la clase del mensaje.
- El mensaje no declara `role="alert"` ni `aria-live`. El caso deja escrita la
  decisión de `design.md` para que nadie la revierta por reflejo.
- `--error-text` queda en `COLOR_TOKENS` con su comentario, replicado con el
  mismo valor en `styles/tokens.css`, y clasificado en `TEXT_TOKENS` — no en
  `UI_TOKENS` ni en `DECORATION_TOKENS`.
- El token alcanza 4.5:1 **sobre `--cream`**, el fondo real de la tarjeta, y
  también sobre `--white`. Los dos casos los genera `styles/tokens.test.ts` por
  sí solo; el criterio se cumple cuando ese archivo pasa de 16 a 18 casos en
  verde.
- La cabecera de `styles/tokens.ts` deja de afirmar que todos los valores salen
  del mockup.
- Los tests de las cuatro pantallas que ya usan el componente siguen pasando sin
  tocar ninguno de esos archivos: `error` es opcional y ninguna lo pasa.

**Decision log:**

_(vacío hasta la ejecución)_

**Outcome:**

_(vacío hasta que la tarea esté terminada)_

## T7 — La acción `signIn`: autentica y redirige

**Requisitos:** 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1
**Depende de:** T3

**Descripción:**

Crear `app/acceso/actions.ts` con `"use server"` en la primera línea y
`signIn(formData: FormData): Promise<never>`: arma el cliente con
`createClient()`, llama a `signInWithPassword` y termina siempre en un
`redirect` — a `PANEL_HREF` si entró, a `LOGIN_ERROR_HREF` si no. La verificación
de la contraseña queda enteramente del lado de Supabase; acá no se compara nada.

La directiva `"use server"` no es decorativa: sin ella el `<form action={signIn}>`
de T9 no tiene a qué postear. Comprobado que `Promise<never>` como anotación de
retorno compila tanto con `redirect(…)` suelto al final como con
`return redirect(…)`, así que la firma de `design.md` no obliga a ninguna forma
en particular. Es además asignable a la propiedad `submitAction?: (formData:
FormData) => Promise<void>` que T5 declara, de modo que T9 conecta las dos sin
adaptador.

**`LOGIN_ERROR_HREF` lleva el intent, y esto discrepa de `design.md` a
propósito.** El valor es `"/acceso?intent=login&error=credenciales"`, no el
`"/acceso?error=credenciales"` que fija el componente `lib/routes.ts` de
`design.md`. Tres razones, en orden de peso:

1. **`design.md` ya es incoherente consigo mismo.** Manda dos redirecciones de
   servidor a la misma pantalla: la guardia de T11 va a `LOGIN_HREF`
   —`/acceso?intent=login`, con intent— y el rechazo iría sin él. Dos formas de
   la misma dirección es exactamente lo que la cabecera de `lib/routes.ts` dice
   evitar.
2. **El propio archivo enuncia la regla:** «The intent is kept on the two entry
   points even though the route already identifies the flow: 6.1 and 6.2 ask the
   destination to state it». `/acceso` tras un rechazo sigue siendo la pantalla
   de ingreso, y sigue teniendo que declarar de qué flujo es.
3. **Nada consume el intent hoy** —`app/acceso/page.tsx` no lo lee, y ningún
   test fuera de `lib/access-url.test.ts` lo interpreta—, así que agregarlo no
   cuesta nada y quitarlo pierde la única forma canónica de la dirección.

La forma que garantiza la coherencia es derivarlo:
`` export const LOGIN_ERROR_HREF = `${LOGIN_HREF}&error=credenciales`; ``. Va en
`lib/routes.ts` y no junto a la acción, por la misma razón que el resto. No se
agrega un `lib/routes.test.ts` para esto: la constante se afirma donde se usa
—ver el criterio 2.3, que la mira como literal y no comparándola contra sí
misma—.

**El `redirect` va fuera de todo `try`/`catch`, y esta tarea lo tiene que
demostrar.** El de Next señaliza lanzando una excepción propia: envuelto, se lo
traga el manejador y la navegación no ocurre. No es una advertencia teórica —es
el error más probable de la primera implementación, porque esta tarea **sí**
necesita un `try`/`catch`, alrededor del `signInWithPassword`: la fila «Supabase
no responde en tiempo de ejecución» de `design.md` exige que una instancia caída
termine en el mismo rechazo genérico, y eso llega como excepción, no como
`{ error }`. El `try` abraza la llamada a la red y nada más; los dos `redirect`
quedan afuera.

**Montaje de dobles, y no es el de T3.** T3 mockea `next/headers` y
`@supabase/ssr` para ejercitar el adaptador de cookies por dentro; T7 mockea una
capa más arriba y no necesita ninguno de los dos:

- `vi.mock("@/lib/supabase/server")` — `createClient` devuelve
  `{ auth: { signInWithPassword: vi.fn() } }`. Cada caso decide si ese `vi.fn`
  resuelve con sesión, resuelve con `{ error }` o **lanza**.
- `vi.mock("next/navigation")` — `redirect` es un `vi.fn` que **registra su
  argumento y después lanza**, como el de verdad. Si el doble se limita a
  devolver `undefined`, un `try`/`catch` mal puesto queda invisible y el criterio
  de arriba no prueba nada.

Con esos dos dobles el módulo no carga `lib/supabase/env`, así que esta tarea no
depende de las variables de entorno de T1 más allá de lo que T3 ya arrastra.

**Qué no entra acá.** La validación previa con Zod es T8: en T7 el `FormData` se
lee y se pasa tal cual. El texto del mensaje es T4 y su renderizado T6/T9; T7
solo produce el marcador `error=credenciales` en la dirección.

**Criterios de aceptación (trazados desde requirements.md):**

- 1.1 — con el doble resolviendo sin error, `signInWithPassword` se llama con
  exactamente `{ email, password }` tomados del `FormData`, y el `redirect`
  recibe `/panel` pelado, sin query.
- 1.2 — con el doble resolviendo `{ error }`, el `redirect` recibe
  `LOGIN_ERROR_HREF` y `signInWithPassword` fue la única llamada al cliente: no
  se invoca `setSession` ni ningún otro método que abra sesión.
- 1.3 — **la decisión es de Supabase, no de la acción**: con el *mismo* correo y
  la *misma* contraseña en el `FormData`, un doble que resuelve sin error termina
  en `/panel` y uno que resuelve con error termina en `LOGIN_ERROR_HREF`. Mismo
  insumo, destinos opuestos: lo único que cambió fue la respuesta de Supabase.
  Esta pareja de casos es lo que prueba 1.3, no una aserción por ausencia sobre
  el texto fuente.
- 2.2 — tres formas distintas de rechazo terminan en la **misma** dirección, y el
  test las corre las tres: credenciales inválidas, cuenta inexistente (un error
  con otro mensaje y otro código) y el doble **lanzando** —la instancia caída—.
  Ninguna rama del código mira el código de error para elegir destino. Es la
  tarea que hace indistinguibles los tres casos; nada aguas abajo puede
  recuperarlos.
- 2.2 (el `redirect` fuera del `try`) — el caso del doble que lanza es también el
  que prueba la ubicación del `try`/`catch`: como el doble de `redirect` lanza,
  `await expect(signIn(fd)).rejects.toThrow()` cae si la implementación envolvió
  el `redirect`. Vale para los tres caminos, y los tres lo afirman.
- 2.3 — la dirección de vuelta se afirma **como literal**, no comparándola contra
  la constante importada: el argumento del `redirect` es
  `/acceso?intent=login&error=credenciales`, y no contiene ni el correo ni la
  contraseña que el caso puso en el `FormData` —dos literales distintivos, para
  que la aserción no pueda pasar por coincidencia—. La misma comprobación se hace
  sobre el argumento del camino feliz: `/panel`, sin query.
- 2.1 (solo el tercio que le toca) — un intento rechazado **produce** el marcador
  `error=credenciales` en la dirección de vuelta. Los otros dos tercios están
  repartidos: leerlo de la query y pasar el texto es T9, renderizarlo es T6, y
  verlo en un navegador es CF-01 de T13. Mismo reparto que T5 y T6 hacen con 1.5
  y 2.1.
- 3.1 — el cliente sale de `createClient()` de T3 y de ningún lado más: el doble
  de `lib/supabase/server` se llama exactamente una vez por invocación y
  `signInWithPassword` se invoca sobre el cliente que ese doble devolvió. Es lo
  único de 3.1 que esta tarea puede afirmar de verdad, y alcanza: usar el cliente
  atado a las cookies del pedido es lo que hace que la sesión se persista, y el
  adaptador que la escribe ya está cubierto por T3. **La aserción anterior —«no
  se escribe ninguna cookie en el camino de rechazo»— se retira:** con
  `@supabase/ssr` fuera del montaje no hay almacén que observar, y era verdadera
  contra una implementación vacía, que es justo lo que la regla del proyecto no
  acepta. Que el acceso rechazado no deje sesión se comprueba donde sí se puede
  ver: CF-01 y CF-02 de T13.
- El archivo empieza con `"use server"`. Sin la directiva, `signIn` no es una
  Server Action y el `<form action={signIn}>` de T9 no llega a existir.

**Decision log:**

_(vacío hasta la ejecución)_

**Outcome:**

_(vacío hasta que la tarea esté terminada)_

## T8 — La acción `signIn`: valida antes de consultar a Supabase

**Requisitos:** 1.4
**Depende de:** T7

**Descripción:**

Agregar a `signIn` el parseo del `FormData` con
`CredentialsSchema = z.strictObject({ email: z.email(), password: z.string().min(1) })`
antes de tocar la red. Un correo vacío o malformado, o una contraseña vacía,
terminan en el mismo `redirect` de rechazo **sin haber consultado a Supabase**.

El esquema **no** replica la política de contraseñas de Supabase: quien decide si
la contraseña sirve es Supabase (1.3), y una regla de largo acá solo produciría
dos mensajes distintos para el mismo rechazo.

**El rechazo por validación va a `LOGIN_ERROR_HREF`, el mismo destino que el
rechazo por credenciales de T7.** `design.md` lo da por hecho en su tabla de
errores —«`redirect` al acceso con el error»— pero no nombra la constante; esta
tarea la fija. Compartir destino es deliberado: quien dejó el campo vacío y quien
se equivocó de contraseña ven la misma pantalla y el mismo texto, y no hay un
segundo mensaje que declarar en `content/access.ts` — T4 declara exactamente uno.

**El objeto a parsear se arma con dos `formData.get()` explícitos, no con
`Object.fromEntries(formData)`.** Comprobado contra la versión instalada (Zod
4.4.3): `z.strictObject` rechaza una clave ajena con `unrecognized_keys`, de modo
que el día que el formulario gane un campo más —un `intent`, un testigo— el
acceso entero pasaría a rechazarse por una razón que nada tiene que ver con las
credenciales. Es la misma trampa que T1 esquiva al no parsear `process.env`
entero. Un campo ausente llega como `null` y el esquema lo rechaza por tipo en
vez de por formato; el destino es el mismo, así que 1.4 se cumple tanto si el
campo viene vacío como si no viene.

**`safeParse`, no `parse`.** Con `safeParse` el fallo es un valor y el
`redirect(LOGIN_ERROR_HREF)` queda **fuera de todo `try`/`catch`**, que es la
regla que T7 fijó; `.parse` obligaría a envolver el parseo en un `try` y
reabriría justo el agujero que T7 cerró. El parseo va **antes** de
`createClient()`, así que un intento rechazado ni siquiera arma el cliente.

**El montaje de dobles es el de T7 y no se rehace:** doble de
`@/lib/supabase/server` cuyo `createClient` devuelve
`{ auth: { signInWithPassword: vi.fn() } }`, y doble de `next/navigation` cuyo
`redirect` **registra su argumento y después lanza**. Que lance importa también
acá: es lo que permite afirmar el destino de un rechazo por validación, y lo que
delata un `redirect` envuelto en el `try` que esta tarea podría agregar. Los
casos nuevos van en el mismo `app/acceso/actions.test.ts` que T7 creó.

**Cómo se ve el rojo, que en esta tarea tiene trampa.** «No se llamó a Supabase»
es verdadero contra una implementación vacía, así que por sí sola esa aserción no
prueba nada. Tres cosas mantienen honesto el ciclo:

1. El punto de partida no es un archivo vacío sino la `signIn` de T7, que llama a
   Supabase incondicionalmente: contra ella los casos nuevos nacen en rojo de
   verdad.
2. Cada caso afirma además el destino como literal, y una implementación vacía no
   puede producirlo porque el doble de `redirect` lanza.
3. El camino feliz de T7 —su criterio 1.1— queda como contracaso vivo: una
   validación que rechaza todo satisface los tres casos de 1.4 y solo se descubre
   ahí. No hace falta escribirlo de nuevo; hace falta verificar que sigue en
   verde después de agregar la validación. Si lo tumba, la validación está mal.

**Criterios de aceptación (trazados desde requirements.md):**

- 1.4 — tres casos, uno por rama del criterio: correo vacío, correo malformado
  (sin `@`) y contraseña vacía. En los tres el intento se rechaza,
  `signInWithPassword` **no** se llamó y el cliente **ni siquiera se armó**:
  `createClient` tiene cero llamadas. Contar `createClient` en vez de solo
  `signInWithPassword` es lo que ata la aserción a «parsear primero» y no a
  «rechazar en algún punto».
- 1.4 — los tres rechazos aterrizan en `/acceso?intent=login&error=credenciales`,
  afirmado **como literal** y no comparándolo contra la constante importada, y esa
  dirección no contiene el correo ni la contraseña que el caso puso en el
  `FormData` — dos literales distintivos, para que la aserción no pueda pasar por
  coincidencia. Es el mismo criterio de escritura que T7 usa para 2.3.
- 1.4 — el `redirect` del rechazo por validación queda fuera de todo
  `try`/`catch`: `await expect(signIn(fd)).rejects.toThrow()` en los tres casos,
  igual que en T7. Envuelto, la navegación no ocurre y el visitante se queda
  mirando una pantalla que no reaccionó.
- 1.4 (el contracaso, que es lo que vuelve verificables los anteriores) — el caso
  feliz de T7 sigue en verde con la validación puesta: credenciales bien formadas
  llegan a `signInWithPassword` con exactamente `{ email, password }` y terminan
  en `/panel` pelado. Sin esta comprobación, una `signIn` que rechaza todo —o una
  vacía— cumple los tres criterios de arriba.

**Decision log:**

_(vacío hasta la ejecución)_

**Outcome:**

_(vacío hasta que la tarea esté terminada)_

## T9 — `/acceso` postea a la acción y muestra el error de la query

**Requisitos:** 2.1, 2.4, 2.5, 5.3, 5.4, 6.1
**Depende de:** T4, T5, T6, T7

**Por qué T8 no entra en la lista.** Esta tarea solo necesita que `signIn` exista
y sea asignable a `submitAction`, y eso lo entrega T7. La validación previa de T8
no la ejercita ningún caso de acá —la acción viaja mockeada, ver abajo—, así que
las dos tareas se pueden tomar en cualquier orden sin que ninguna vea rojo por
culpa de la otra. La dependencia declarada se confirma tal como estaba.

**Descripción:**

`app/acceso/page.tsx` pasa a ser el módulo que conecta la pantalla con el
servidor: `submitAction={signIn}` en lugar de `submitHref={PANEL_HREF}` —el
import de `PANEL_HREF` se va con él, porque esa propiedad era su único uso en el
archivo— y el mensaje de error leído de la query. La página se vuelve `async`,
porque en Next 15 `searchParams` llega como promesa.

**Qué valor de `error` muestra el mensaje, y qué pasa con cualquier otro (2.5).**
`design.md` describe solo el camino que el sistema produce y deja el hueco
abierto; esta tarea lo cierra por el lado estricto. El mensaje se renderiza si y
**solo si** el valor de `error` es exactamente el marcador que el propio sistema
emite. Cualquier otro caso no muestra nada: un valor distinto (`error=otra-cosa`),
el parámetro vacío (`error=`), y el parámetro repetido —que llega como arreglo y
no como cadena, de modo que la comparación contra una cadena lo descarta sola—.
Quien escribe `/acceso?error=x` a mano no tuvo un intento fallido, que es
justamente la condición de 2.5; una pantalla que le crea a la barra de
direcciones convierte la URL en un generador de mensajes de error ajenos.

Para no escribir el marcador dos veces, `lib/routes.ts` gana
`` export const LOGIN_ERROR_CODE = "credenciales"; `` y `LOGIN_ERROR_HREF` pasa a
derivarse de él —`` `${LOGIN_HREF}&error=${LOGIN_ERROR_CODE}` ``—. El valor
resultante no cambia, así que las aserciones literales de T7 y T8 siguen en
verde. La constante se agrega acá y no en T7 porque sola no puede fallar por sí
misma, y la regla de tamaño manda fusionar eso con la tarea que primero lo usa:
T9 es la única que necesita el código suelto, fuera de la dirección completa.

**La firma de `searchParams` se declara ancha y se estrecha después del
`await`.** `tsconfig.json` incluye `.next/types/**/*.ts`, donde Next genera la
comprobación de que las props de la ruta encajan con las que él le pasa; una
forma estrechada a mano (`{ error?: string }`) puede chocar ahí aunque
`tsc --noEmit` pase antes de que esos tipos existan. La forma segura es
`searchParams: Promise<Record<string, string | string[] | undefined>>`, y comparar
contra `LOGIN_ERROR_CODE` el valor ya leído.

**El montaje del test cambia entero, y hay una trampa medida.** Comprobado en
este worktree el 2026-08-18, con React 19.1.1 y `@testing-library/react` sobre
jsdom: `render(<AccesoPage />)` sobre un componente `async` **no lanza**.
Renderiza un contenedor **vacío** y deja un aviso en `stderr` («is an async Client
Component»). De ahí salen dos consecuencias opuestas:

1. Los casos que afirman **presencia** —las etiquetas, el `<h1>`, el subtítulo, el
   enlace de contraseña olvidada— se caen solos contra ese DOM vacío, que es el
   rojo correcto y el que obliga a rehacer el montaje.
2. Los casos que afirman **ausencia** pasarían en verde contra ese mismo DOM
   vacío, sin implementación de por medio. Es exactamente el caso de 2.5 de esta
   tarea. Por eso cada aserción negativa lleva al lado un ancla positiva: que el
   `<h1>` con `login.title` esté en pantalla en la misma corrida.

El montaje que sí funciona es invocar la función y esperar su resultado —
`render(await AccesoPage({ searchParams: Promise.resolve({}) }))`, comprobado en
verde en el mismo experimento—. Los diez `render(<AccesoPage />)` del archivo
pasan por ahí, así que conviene un helper `renderPage(searchParams = {})` en vez
de repetir la promesa diez veces. Es el primer componente `async` del proyecto:
ninguna página de `app/` lo era hasta ahora, y ningún test tenía este montaje.

**El doble de la acción, y por qué es obligatorio.** `vi.mock("./actions")` con
`signIn: vi.fn()`. Dos razones independientes:

- React no deja ver en el DOM a qué función apunta el formulario: escribe en
  `action` el centinela `javascript:throw new Error(…)` que T5 midió. La única
  forma de afirmar que la pantalla posteó **a `signIn`** es activar el control y
  ver a quién se llamó.
- Sin el doble, esa activación llamaría a la `signIn` de verdad, que sale a la red
  contra la instancia local desde un test unitario.

De paso, con el doble puesto `app/acceso/page.test.tsx` no carga
`lib/supabase/env` ni `@supabase/ssr`. El precio de eso es que el test **no**
prueba que el módulo quede en el grafo de compilación; esa mitad de 6.1 se
verifica corriendo el build, abajo.

**Acá 6.1 deja de ser un mecanismo y pasa a ser una protección, y por eso la
tarea lo traza.** T1 entrega un `lib/supabase/env` que lanza al importar, pero eso
no hace fallar ninguna compilación mientras nadie lo cargue: es la lección que
`lib/access-url.ts` ya dejó pagada en este repositorio. T9 es la primera tarea que
lo mete en el grafo que `next build` carga —`app/acceso/page.tsx` → `signIn` →
`lib/supabase/server` → `lib/supabase/env`—; la otra es T11, por el layout del
panel. **Comprobado empíricamente en este worktree el 2026-08-18**, sin esperar a
la implementación: se importó `lib/access-url` desde `app/acceso/page.tsx`, se
corrió `npm run build` sin la variable, y el build cayó en `Collecting page data`
con `Failed to collect page data for /acceso` y, como causa, el mensaje que nombra
la variable faltante. El mismo mecanismo, el mismo punto del build, la misma ruta.
La modificación se revirtió al terminar.

**Qué comentarios quedan mintiendo.** Dos bloques de `page.tsx`: el de `metadata`,
que justifica el `noindex` con «an access screen that does not authenticate», y el
del componente, que dice que nada acá autentica ni abre sesión y que lo que nunca
debe aparecer es un `<form>`. El `noindex` **se conserva** —estas pantallas siguen
sin publicarse— pero su razón cambia, y la nota sobre el `<form>` se invierte: el
que aparece ahora es seguro porque postea al servidor. Los comentarios se quitan
antes de la aserción por ausencia, así que ningún test los delata: hay que
acordarse a mano, como en T5 y T6.

**Por qué esta tarea no se parte en dos.** La implementación es una sola edición
de un solo archivo —la página se vuelve `async` para poder leer la query, y de esa
misma firma sale el `error`—, y las dos mitades comparten el helper de render que
hay que rehacer igual. Partirla obligaría a reescribir el mismo archivo de test
dos veces, que es exactamente el costo que T6 evitó ordenándose detrás de T5.

**Lo que esta tarea no toca.** `e2e/acceso.spec.ts` sigue describiendo la maqueta
—`expect(page.locator("form")).toHaveCount(0)` incluido— y se reescribe entero en
T13; hasta entonces queda en rojo contra el navegador, y eso es lo previsto.
`content/access.ts` no se toca: el texto lo declara T4, y `login.subtitle` sigue
tratando de usted por decisión explícita de `requirements.md`. `AccessScreen` no
se toca: sus dos propiedades nuevas ya existen tras T5 y T6.

**Criterios de aceptación (trazados desde requirements.md):**

- 5.3 — la pantalla renderiza un `<form>` que contiene los dos campos y el
  control, y el control es un `<button type="submit">`: `screen.queryByRole("link",
  { name: login.submitLabel })` es nulo. Reemplaza los dos casos que hoy afirman
  lo contrario —«renders no form at all» y el ancla a `PANEL_HREF`—, no se suma al
  lado de ellos. El caso «carries no field value in the destination», que mira el
  `href` de ese ancla, se va con ella: lo que 1.5 protege pasa a defenderlo CF-01
  de T13 contra un navegador de verdad.
- 5.3 — el formulario postea **a `signIn`** y no a otra cosa: con el doble de
  `./actions`, activar el control lo llama exactamente una vez, y el `FormData`
  con el que llega trae `email` y `password` con lo tecleado. Es el montaje que T5
  ya comprobó (`fireEvent.click` más `vi.waitFor`, porque la acción se invoca de
  forma asíncrona).
- 2.1 — con `{ error: "credenciales" }` en `searchParams`, el mensaje aparece
  dentro de la tarjeta.
- 2.4 — el texto que aparece es exactamente `access.login.errorMessage`,
  comparado por referencia al contenido y no contra un literal repetido en el
  test.
- 2.5 — sin `error` en la query **no existe el nodo** del mensaje, y tampoco
  existe con un valor distinto del marcador (`error=otra-cosa`) ni con el
  parámetro repetido, que llega como arreglo. Los tres casos afirman además, en la
  misma corrida, que el `<h1>` con `login.title` está en pantalla: sin esa ancla
  positiva, un render vacío los pasa a los tres sin implementación.
- 2.5 (mutación obligatoria) — renderizar el mensaje sin condicionarlo al valor
  debe tumbar **solo** esos tres casos. Sin verlo, el criterio no cuenta como
  verificado: la rama estricta es fácil de escribir de más y de menos.
- 5.4 — leídas las fuentes de `app/acceso/` **recorriendo el directorio** y
  salteando los archivos de test —hoy `page.tsx` y `actions.ts`, y lo que se
  agregue mañana—, y quitados los comentarios, no contienen `use client`,
  `useState`, `useEffect`, `addEventListener`, `onClick` ni `onSubmit`. Recorrer el
  directorio en vez de nombrar un archivo es lo que hace que la guardia siga
  valiendo cuando la carpeta crezca. Las dos aserciones heredadas sobre `fetch` y
  `cookies` se conservan: siguen siendo ciertas y sostienen la regla de `design.md`
  de que el único módulo que toca cookies de sesión es `lib/supabase/server`.
- 6.1 — con `SUPABASE_URL` retirada del entorno, `npm run build` **falla** y el
  mensaje nombra esa variable; repuesta, compila. Es una comprobación que se corre
  una vez y se anota en el Decision log, no un caso de Vitest: lo que se está
  afirmando es que el módulo quedó en el grafo de compilación, y eso solo lo dice
  el build. Reponer la variable a mano al terminar — `git checkout` no sirve para
  restaurar en un árbol con trabajo sin commitear.
- Los comentarios de `page.tsx` dejan de afirmar que la pantalla no autentica y
  que un `<form>` nunca debe aparecer acá; el `noindex` se conserva con su razón
  corregida.

**Decision log:**

_(vacío hasta la ejecución)_

**Outcome:**

_(vacío hasta que la tarea esté terminada)_

## T10 — `middleware.ts`: renovación del token de sesión

**Requisitos:** 3.2 (solo la mitad que el middleware posee; el reparto está más
abajo), 3.3
**Depende de:** T1, T3

T3 no aporta código a esta tarea —el middleware **no** importa
`lib/supabase/server.ts`, ver más abajo— pero sí las dependencias:
`@supabase/ssr` y `@supabase/supabase-js` no existen todavía en el proyecto
(comprobado el 2026-08-18: no figuran ni en `package.json`, ni en
`package-lock.json`, ni en `node_modules/@supabase/`, que solo trae la CLI), y
T3 es la tarea que las instala.

**Descripción:**

Crear `middleware.ts` **en la raíz del repositorio** —no hay `src/`— con
`config = { matcher: ["/panel/:path*"] }`. Arma un cliente de `@supabase/ssr`
con `createServerClient(supabaseEnv.url, supabaseEnv.publishableKey, { cookies:
{ getAll, setAll } })` sobre el pedido y la respuesta, llama a
`supabase.auth.getUser()` para forzar la renovación, y devuelve la respuesta con
las cookies renovadas escritas en ella.

**Por qué existe, comprobado y no supuesto.** `supabase/config.toml` fija
`jwt_expiry = 3600` (línea 167) y Next 15.5.23 prohíbe escribir cookies desde un
componente de servidor: `node_modules/next/dist/server/web/spec-extension/adapters/request-cookies.js`
lanza `ReadonlyRequestCookiesError` con «Cookies can only be modified in a Server
Action or Route Handler». Como el `setAll` de T3 se traga esa excepción a
propósito, sin este archivo la sesión renovada se descartaría en silencio y el
alumno quedaría afuera a la hora. La premisa de `design.md` es cierta contra la
versión instalada.

**No reutiliza el `createClient()` de T3, y no es duplicación.** Aquel escribe en
el almacén de cookies del pedido y traga el error cuando no puede; acá la
renovación tiene que viajar en la **respuesta** que el middleware devuelve, que
es un objeto que `lib/supabase/server.ts` ni ve. El adaptador de esta tarea se
arma sobre `request.cookies` / `response.cookies`, no sobre `next/headers`.
`lib/supabase/env` sí se comparte: la dirección y la clave salen de ahí, nunca de
un literal ni de un `process.env` leído en este módulo.

**El middleware no autoriza nada.** Solo refresca; la decisión de dejar pasar la
toma el layout (T11). El test afirma esa separación: sin sesión, el middleware
**no** redirige. A la inversa, esta tarea no debe adelantar nada de T11: no llama
a `redirect`, no mira rutas, no decide.

**Cómo se ve el rojo.** El montaje reusa la mitad de T3 que sirve acá y descarta
la otra: va el `vi.mock` de `@supabase/ssr`, y **no** el de `next/headers`, que
este módulo no importa. El `createServerClient` de mentira **captura el objeto
`cookies` que le pasan** y devuelve un cliente falso cuyo
`auth.getUser()` es `async` e invoca `setAll([{ name, value, options }])` antes
de resolver —que es lo que hace la librería de verdad cuando el token venció—.
El test llama al `middleware(request)` con un `NextRequest` armado a mano y mira
la respuesta que vuelve. `next/server` funciona en el entorno `node` de Vitest
sin configuración: comprobado el 2026-08-18 construyendo un `NextRequest` con
cabecera `cookie`, escribiendo en `response.cookies` y leyendo el `set-cookie`
resultante. No hace falta jsdom, así que **no** lleva la línea
`// @vitest-environment jsdom`.

Cuatro implementaciones equivocadas que ese montaje tumba, y por las que el rojo
no es tautológico: la que nunca llama a `getUser()` (nadie renueva); la que la
llama pero **sin `await`** (la respuesta vuelve antes de que corra `setAll`, y por
eso el doble tiene que ser asíncrono); la que arma la respuesta definitiva
*después* de `getUser()` y descarta lo que `setAll` escribió; y la que le entrega
a `getAll` algo que no son las cookies del pedido, con lo que la librería nunca
vería la sesión. La mutación que cierra la tarea es borrar la llamada a
`getUser()`: debe caer el caso de la cookie renovada, y solo ese.

**La trampa de la aserción negativa.** «Sin sesión no redirige» pasa en verde
contra un middleware que no hace nada —el mismo riesgo que midió T9 con los
componentes `async`—. Por eso ese caso no se afirma solo: en el mismo caso hay
que comprobar que el middleware **sí** recorrió el camino de renovación
(`getUser()` fue llamado) y que lo que devuelve es una respuesta de continuación
(`status` 200 y sin `location`), no un objeto cualquiera. Un `NextResponse.redirect`
se distingue sin ambigüedad: da 307 con `location` puesto.

**Qué mitad de 3.2 cubre esta tarea, y cuál no.** 3.2 dice «reconocer al
visitante en pedidos posteriores», y eso es un hecho de dos pedidos consecutivos
en un navegador: ningún test unitario honesto lo observa. Lo que el unitario sí
observa —y es lo único que el middleware posee— es el mecanismo: cuando la
librería entrega cookies renovadas, esas cookies viajan en la respuesta. La otra
mitad se ejercita de punta a punta y ya está escrita: `CP-01` de T13 aterriza en
`/panel` con la sesión abierta —si el pedido siguiente no la reconociera, la
guardia de T11 lo devolvería a `/acceso`— y T15 hace diez pedidos al panel
detrás de un único acceso. Por eso la tabla de cobertura lista 3.2 en T10, T13 y
T15. Es el mismo reparto que T5, T6 y T7.

**Lo que ningún test de este spec cubre:** el vencimiento real a los 3600
segundos. Playwright no espera una hora y esta feature no toca `jwt_expiry`. No
inventar un reloj falso ni bajar el vencimiento en `config.toml` para simularlo:
sería cambiar el diseño desde una tarea.

**Es el primer `middleware.ts` del proyecto.** Tres consecuencias, las tres
comprobadas el 2026-08-18 con un middleware de sonda:

1. **`npm run build` lo compila aparte, como bundle Edge** —aparece una línea
   `ƒ Middleware` en la salida— y las siete rutas siguen saliendo `○ Static`: el
   `matcher` deja la landing intacta y no le cuesta nada.
2. **No cierra 6.1, igual que T3.** El build **no evalúa** el módulo: con la
   sonda importando un archivo que lanza cuando falta `SUPABASE_URL`, y sin
   ningún `.env` presente, `npm run build` terminó en 0. En el bundle generado
   `process.env.SUPABASE_URL` queda como lectura en tiempo de ejecución, sin
   inlinear. El fallo por variable faltante se ve al pedir `/panel`, no al
   compilar; quienes meten `lib/supabase/env` en el grafo que el build **carga**
   siguen siendo T9 y T11.
3. **`tsconfig.json` ya lo cubre** (`include: ["**/*.ts"]`, y `exclude` solo
   `node_modules` y `e2e`), y `vitest.config.ts` toma un `middleware.test.ts` en
   la raíz sin tocar nada. No hay configuración que agregar.

El `matcher` `/panel/:path*` **incluye `/panel` a secas**, no solo sus subrutas:
la expresión regular que Next compila en `middleware-manifest.json` da verdadero
para `/panel`, `/panel/`, `/panel/modulos` y `/panel/a/b`, y falso para `/`,
`/acceso`, `/registro` y `/panelx`. Comprobado sobre el manifiesto generado.

**Verificación:** `npm run typecheck && npm test`. **No** `npm run test:e2e`:
`e2e/acceso.spec.ts` quedó en rojo al terminar T9 y sigue así hasta que T13 lo
reescriba.

**Criterios de aceptación (trazados desde requirements.md):**

- 3.2 — cuando la librería entrega cookies renovadas a través de `setAll`, esas
  cookies salen en la respuesta que el middleware devuelve: el `set-cookie` de la
  respuesta trae el nombre y el valor nuevos.
- 3.2 — el adaptador `getAll` devuelve las cookies del pedido entrante, que es
  como la librería descubre la sesión que tiene que renovar.
- 3.3 — el middleware consulta la sesión con `auth.getUser()`, que valida contra
  el servidor de autenticación; el test afirma que `auth.getSession()` no se
  llama. Es la misma exigencia que el layout de T11, en el otro punto donde el
  servidor consulta la sesión.
- El cliente se arma con `supabaseEnv.url` y `supabaseEnv.publishableKey` de T1:
  el doble de `createServerClient` afirma los dos primeros argumentos.
- Sin sesión, el middleware deja pasar el pedido en lugar de redirigirlo: la
  respuesta es de continuación (200, sin `location`) y aun así se llamó a
  `getUser()`, de modo que el caso no puede pasar contra un middleware inerte.
- `config.matcher` es exactamente `["/panel/:path*"]`. Es una aserción sobre un
  literal, no sobre comportamiento —la expresión regular la compila Next— y vale
  por lo que impide: que alguien lo acorte a `["/panel"]` y deje sin renovación a
  las pantallas que se agreguen debajo.

**Decision log:**

_(vacío hasta la ejecución)_

**Outcome:**

_(vacío hasta que la tarea esté terminada)_

## T11 — La guardia en `app/panel/layout.tsx`

**Requisitos:** 3.3 (solo el punto del layout; el reparto con T10 está más
abajo), 4.1, 4.2, 4.3, 4.4 (solo la mitad observable), 6.1
**Depende de:** T1, T3

Cada una por un motivo distinto. **T3** entrega `createClient()` y, con él, las
dos dependencias que el proyecto todavía no tiene: `@supabase/ssr` y
`@supabase/supabase-js` no figuran ni en `package.json` ni en
`node_modules/@supabase/`, que solo trae la CLI (comprobado el 2026-08-18). **T1**
entrega dos cosas que esta tarea consume por caminos separados: el módulo que
lanza al importar, que es lo que hace fallar la compilación cuando falta la
variable (6.1), y las dos entradas del bloque `test.env` de `vitest.config.ts`,
sin las cuales `app/panel/page.test.tsx` —que ya importa `./layout` para afirmar
su `metadata`— deja de cargar en cuanto el layout arrastre `lib/supabase/env`.

**No depende de T10**, aunque el diagrama de `design.md` los dibuje en fila. El
middleware renueva y el layout decide; sin middleware la guardia funciona igual y
lo único que se pierde es la renovación del token a la hora. Las dos tareas se
pueden tomar en cualquier orden.

**Descripción:**

Agregar la guardia al principio de `app/panel/layout.tsx`, antes de emitir
cualquier marcado:

```ts
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) redirect(LOGIN_HREF);
```

El layout pasa a ser `async`. `LOGIN_HREF` sale de `lib/routes.ts`, que ya lo
exporta; esta tarea no agrega ninguna constante.

`getUser()` y no `getSession()`: la segunda lee la cookie y le cree, y en el
servidor la cookie es entrada del usuario. En el layout y no en `page.tsx` porque
el layout es el chrome que toda pantalla futura del panel comparte.

**Qué mitad de 3.3 cubre esta tarea, y por qué no duplica a T10.** 3.3 pide
validar contra el servidor de autenticación **cada vez que el servidor consulta
la sesión**, y en este diseño hay exactamente dos puntos donde eso ocurre: el
middleware (T10) y este layout (T11). Ninguna de las dos tareas puede cubrir el
punto de la otra —son dos llamadas distintas, en dos módulos distintos, con dos
propósitos distintos— y el reparto no es decorativo: una guardia escrita con
`getSession()` pasaría 4.1 y 4.2 sin que un middleware correcto la salve, porque
la decisión de dejar pasar la toma este archivo. Por eso la tabla de cobertura
lista 3.3 en T10 y T11, con el punto de cada una anotado.

**Tres comentarios quedan mintiendo, y los tres se arreglan acá.** Ninguna otra
tarea los toca, porque es esta la que los vuelve falsos:

1. El bloque de `metadata` de `app/panel/layout.tsx`, que justifica el `noindex`
   con «nothing here authenticates (6.7)». El `noindex` **se conserva** —estas
   pantallas siguen sin publicarse— pero su razón cambia.
2. El comentario del componente en `app/panel/page.tsx`: «Nothing authenticates
   and nothing guards the route: 6.7 still holds… which are the same thing until
   there is a session to check».
3. El de `PANEL_HREF` en `lib/routes.ts`: «Still a mock: nothing guards it,
   because nothing authenticates».

Es el mismo trabajo a mano que T5, T6 y T9: los comentarios se quitan antes de
las aserciones por ausencia, así que ningún test los delata.

**Cómo se ve el rojo.** Archivo nuevo `app/panel/layout.test.tsx`, con
`// @vitest-environment jsdom` en la primera línea, porque renderiza. Dos dobles,
los dos con la convención que las tareas anteriores ya fijaron:

- `vi.mock("@/lib/supabase/server")` — `createClient` devuelve
  `{ auth: { getUser: vi.fn(), getSession: vi.fn() } }`. Cada caso decide si
  `getUser` resuelve `{ data: { user: { id: "…" } } }` o
  `{ data: { user: null } }`. Es el mismo doble de una capa arriba que usa T7, no
  el de `@supabase/ssr` que usa T3.
- `vi.mock("next/navigation")` — `redirect` **registra su argumento y después
  lanza**, como el de verdad (convención de T7). Que lance no es un detalle: es
  lo que hace observable que no se emitió contenido.

**La trampa del montaje, ya medida.** T9 comprobó en este worktree, con React
19.1.1 y `@testing-library/react` sobre jsdom, que `render(<Componente />)` sobre
un componente `async` **no lanza**: renderiza un contenedor **vacío** y deja un
aviso en `stderr`. Este layout va a ser `async`, así que la trampa es exactamente
la de acá: cualquier aserción de ausencia —«sin usuario no aparece la barra»—
pasaría en verde contra la nada, sin implementación de por medio. Dos
consecuencias obligatorias:

- El caso con usuario se monta invocando la función:
  `render(await PanelLayout({ children }))`. Nunca `render(<PanelLayout … />)`.
- El caso sin usuario no usa `render` en absoluto: como el doble de `redirect`
  lanza, se afirma `await expect(PanelLayout({ children })).rejects.toThrow()`
  más el argumento que quedó registrado. La ausencia de contenido se deduce del
  rechazo, no de un DOM vacío que también produciría un componente roto.

Cuatro implementaciones equivocadas que ese montaje tumba: la que redirige
siempre (cae el caso con usuario); la que nunca redirige o invierte la condición
(cae el caso sin usuario); la que consulta con `getSession()` (cae 3.3); y la que
mueve la guardia a `app/panel/page.tsx`, que deja este archivo de test entero en
rojo porque el layout ya no redirige.

**Verificación por mutación obligatoria**, dos veces, porque las dos direcciones
del error son fáciles de escribir: reemplazar la condición por `if (true)` debe
tumbar **solo** los casos con usuario, y borrar el `if` entero debe tumbar
**solo** los casos sin usuario. Si alguno de los dos grupos sigue verde, está
mirando un contenedor vacío y no la implementación.

**4.4 tiene una mitad observable y una que no lo es. No se finge la segunda.**
Lo que un test sí puede ver es que la guardia protege **el chrome y no una
pantalla**: con un `children` arbitrario que no tiene nada que ver con el panel,
sin usuario ese hijo no llega al documento y con usuario sí. Ese caso cae si
alguien mueve la guardia a `app/panel/page.tsx`, que es justamente la forma
equivocada que 4.4 existe para impedir. Lo que ningún test de este spec puede ver
es que la guardia alcance a pantallas que **todavía no existen**: eso es una
propiedad del anidamiento de rutas de Next, y afirmarla en Vitest sería testear
el framework, mientras que crear una pantalla de mentira debajo de `/panel` para
pedirla sería inventar producto desde una tarea. Tampoco hay una mitad de punta a
punta, porque no hay una segunda pantalla del panel que pedir. Es el mismo
reparto honesto que T10 hizo con 3.2: se cubre el mecanismo, se nombra lo que
queda afuera.

**Acá 6.1 vuelve a ser una protección, y esta tarea es la segunda que la cierra.**
T1 deja el mecanismo que lanza al importar, pero eso no hace fallar ninguna
compilación mientras nadie cargue el módulo. T9 mete `lib/supabase/env` en el
grafo por el lado de `/acceso`; esta tarea lo mete por el lado de `/panel`
(`app/panel/layout.tsx` → `lib/supabase/server` → `lib/supabase/env`).
**Comprobado en este worktree el 2026-08-18**, sin esperar a la implementación:
se importó `lib/access-url` —que lanza cuando le falta su variable— desde
`app/panel/layout.tsx` y, sin ningún `.env` presente, `npm run build` cayó en
`Collecting page data` con `Failed to collect configuration for /panel` y, como
causa, el mensaje que nombra la variable faltante. La comprobación se repitió con
el layout ya vuelto `async` y llamando a `cookies()` —es decir, con `/panel`
convertida en ruta dinámica— y el build falló igual: que la ruta deje de
prerrenderizarse no la saca del grafo que `next build` carga. Las dos
modificaciones se revirtieron.

**La ruta deja de ser estática, y es esperado.** En la misma corrida, con el
layout `async` llamando a `cookies()`, `/panel` pasó de `○ Static` a `ƒ Dynamic`
en la tabla de rutas del build; las otras seis siguieron `○ Static`. Es la
consecuencia directa de leer cookies por pedido y no hay nada que arreglar: un
panel que se prerrenderiza es un panel que no puede mirar la sesión.

**El costo en `e2e/panel.spec.ts`, que esta tarea deja pero no paga.** Ese
archivo hace diez `page.goto("/panel")` directos y con la guardia los diez
terminan en `/acceso`. Repararlo es T15, que ya lo tiene asignado junto con el
comentario de cabecera de esa suite. Esta tarea **no** lo toca: son dos ciclos
distintos y el segundo necesita que T13 exista primero.

**Verificación:** `npm run typecheck && npm test`, más la corrida única del build
para 6.1. **No** `npm run test:e2e`: `e2e/acceso.spec.ts` está en rojo desde T9 y
`e2e/panel.spec.ts` queda en rojo con esta tarea; los reparan T13 y T15.

**Criterios de aceptación (trazados desde requirements.md):**

- 4.1 — sin usuario, la guardia redirige al acceso: el `redirect` recibe
  `/acceso?intent=login` afirmado **como literal**, no comparado contra la
  constante importada, y la llamada al layout rechaza porque el doble lanza.
- 4.2 — con usuario, el layout resuelve y renderiza su chrome: `PanelTopBar`,
  `PanelSidebar` y el `children` que se le pasó están en el documento, y
  `redirect` no se llamó ni una vez. El montaje es
  `render(await PanelLayout({ children }))`.
- 4.3 — la decisión ocurre antes de emitir contenido: en el caso sin usuario la
  llamada rechaza y `render` nunca recibe un árbol, y en la misma corrida se
  afirma que `getUser` fue llamado exactamente una vez —el rechazo tiene que ser
  el del `redirect`, no el de un layout que se rompió antes de consultar—.
- 4.3 (la mitad estructural) — leída la fuente de `app/panel/layout.tsx` y
  quitados los comentarios, no contiene `use client`: la guardia corre en el
  servidor. Es el patrón por ausencia que el proyecto ya usa.
- 4.4 (la mitad observable) — la guardia protege el chrome y no una pantalla
  concreta: con un `children` arbitrario que no es el panel, sin usuario no llega
  al documento y con usuario sí. Lo que queda afuera —el alcance a pantallas que
  todavía no existen— está declarado arriba y no se afirma en ningún test.
- 4.2 y 4.4 (mutación obligatoria) — `if (true) redirect(…)` debe tumbar **solo**
  los casos con usuario; borrar el `if` debe tumbar **solo** los casos sin
  usuario. Sin las dos corridas, el criterio no cuenta como verificado.
- 3.3 — la sesión se consulta con `auth.getUser()`: el doble expone también
  `auth.getSession()` y el test afirma que **no se llamó**. No duplica el
  criterio homónimo de T10; el reparto de los dos puntos de consulta está
  explicado arriba.
- 6.1 — con `SUPABASE_URL` retirada del entorno, `npm run build` **falla** y el
  mensaje nombra esa variable; repuesta, compila. Es una comprobación de una sola
  corrida que se anota en el Decision log, no un caso de Vitest: lo que se afirma
  es que el módulo quedó en el grafo de compilación, y eso solo lo dice el build.
  Reponer la variable a mano al terminar — `git checkout` no restaura un árbol
  con trabajo sin commitear.
- `app/panel/page.test.tsx` sigue en verde. Importa `./layout` para afirmar su
  `metadata`, y desde esta tarea ese import arrastra `lib/supabase/server` y
  `lib/supabase/env`; si el archivo se cae al cargar, lo que falta son las dos
  variables del bloque `test.env` de T1.
- Los tres comentarios listados arriba dejan de afirmar que nada autentica y que
  nada guarda la ruta; el `noindex` de `metadata` se conserva con su razón
  corregida.

**Decision log:**

_(vacío hasta la ejecución)_

**Outcome:**

_(vacío hasta que la tarea esté terminada)_

## T12 — `globalSetup` de Playwright: la instancia local responde

**Requisitos:** 7.1
**Depende de:** T1

**Descripción:**

Agregar un `globalSetup` a `playwright.config.ts` que pida
`${SUPABASE_URL}/auth/v1/health` y, si no responde, aborte la suite con un
mensaje que nombre esa causa: la instancia local de Supabase no está arriba.

Lo que la tarea cambia **no es la velocidad del fallo, sino a qué apunta**. Hoy,
con Docker apagado, cada caso muere en un `expect` vencido a los 30 segundos que
señala la pantalla o la guardia —código sano— y no la instancia caída. Esa
sustitución de síntoma es todo el valor de T12, y es lo que sus criterios
afirman.

**El endpoint está verificado contra la instancia que corre hoy** (2026-08-17,
API en `http://127.0.0.1:55321`): `GET /auth/v1/health` devuelve `200` con
`{"version":"v2.195.0","name":"GoTrue",…}` y **no exige `apikey` ni
`Authorization`**. El diseño acertó; no hay que mandar la clave publicable. Con
nada escuchando en el puerto, `fetch` rechaza en vez de devolver una respuesta.

**Dónde vive el archivo, resuelto: fuera de `e2e/`.** `tsconfig.json` excluye
`e2e/`, de modo que un `globalSetup` ahí adentro quedaría sin `typecheck`. Fuera
de `e2e/` el `include` de `**/*.ts` lo alcanza —es el mismo motivo por el que
`playwright.config.ts`, que está en la raíz, ya se typechequea hoy—. Reparto:

- `lib/supabase/health.ts` — la función de chequeo, con su test en Vitest. Va en
  `lib/` porque es donde el proyecto pone los módulos con test propio, y así el
  `typecheck` y el `npm test` la cubren.
- `playwright.global-setup.ts` — en la raíz, el archivo que `globalSetup`
  nombra. Es la envoltura mínima: consigue la dirección, llama a la función y
  deja propagar. Nadie lo importa desde `app/`, así que no entra en el build de
  Next. La dirección sale de `supabaseEnv.url` (T1) y no de un
  `process.env.SUPABASE_URL` suelto —una dirección leída y validada en dos
  lugares termina discrepando consigo misma—; de ahí que T1 sea prerequisito
  real, y de ahí también la trampa del `.env` que sigue.

**El `globalSetup` corre DESPUÉS del `webServer`, no antes.** Verificado contra
la versión instalada (Playwright 1.56.1), por fuente y por corrida: en
`runner/tasks.js`, `createGlobalSetupTasks` empuja `createPluginSetupTasks(…)`
**antes** que `config.globalSetups`, y el `webServer` es uno de esos plugins
(`testRunner.js` hace `webServerPluginsForConfig(config).forEach(p =>
config.plugins.push(…))`). Una corrida de sonda lo confirmó: el comando del
`webServer` imprimió su línea 55 ms antes que el `globalSetup`. Tres
consecuencias que hay que aceptar tal cual:

1. **El aborto llega recién después del `npm run build && npx next start`
   completo.** No ahorra esos minutos; solo reemplaza el diagnóstico. No
   prometer en el mensaje ni en el commit que «falla rápido».
2. **La configuración faltante NO es asunto de T12.** Si falta `SUPABASE_URL`,
   el que falla es el build dentro del `webServer`, antes de que este chequeo
   exista para el pedido — y está bien: ese caso es 6.1, y lo cubren T1, T9 y
   T11. No agregar acá una validación de entorno que en la práctica nunca se
   alcanzaría.
3. Como el `webServer` ya levantó, el aborto tiene que ocurrir igual **antes de
   abrir el navegador y con cero casos corridos**; eso sí es observable y se
   afirma abajo.

**Trampa concreta: Playwright no carga `.env`.** Comprobado — `dotenv` no es
dependencia de `playwright` ni está instalado en el proyecto, y el runner no lee
ningún archivo de entorno. Next sí lo hace por su cuenta durante `build` y
`start`, así que el `.env` versionado por T1 alcanza a la aplicación pero **no
al proceso de Playwright**: ahí `process.env.SUPABASE_URL` llega `undefined`. Si
el `globalSetup` importa `lib/supabase/env` sin más, lo que se va a ver es el
error de T1 diciendo que falta la variable —el mensaje equivocado, justo el
defecto que esta tarea existe para evitar—. Sin agregar dependencias, que la
regla del proyecto desaconseja, `process.loadEnvFile()` de Node resuelve el
caso; está disponible y **tipado** en el `@types/node` instalado
(`process.d.ts`). Dos detalles comprobados de esa función: **no pisa** una
variable que ya venga del shell, y **lanza `ENOENT`** si el archivo no existe.
Elegir el camino y anotarlo en el Decision log.

**El ciclo TDD, y qué es acá un rojo honesto.** El entregable se parte en una
mitad con rojo real y una de cableado, igual que se resolvió en T11 para 6.1:

- **Rojo honesto (Vitest, `lib/supabase/health.test.ts`).** Con `fetch`
  mockeado: rechazo de red → la promesa rechaza y el mensaje nombra a la
  instancia local de Supabase y la dirección consultada; respuesta no-2xx →
  también rechaza; `200` → resuelve. El test se escribe antes y falla porque el
  módulo todavía no existe. **No** vale un test que lea `playwright.config.ts`
  buscando la subcadena `globalSetup`: eso es tautológico, y es exactamente el
  tipo de caso que T2 ya descartó.
- **Cableado (una sola corrida, al Decision log).** Que el `globalSetup` esté
  enchufado y realmente tumbe la suite no lo dice ningún caso de Vitest. Se
  comprueba una vez, a mano, y se anota: correr la suite con la variable
  apuntada a un puerto donde nada escucha —el shell le gana al `.env`, así que
  `SUPABASE_URL=http://127.0.0.1:59999 npx playwright test` basta— y ver el
  aborto con el mensaje, sin un solo caso ejecutado. Restaurar después
  simplemente no pasando la variable.

Detalles del armado: usar un **timeout** propio en el pedido
(`AbortSignal.timeout(…)`), o un Docker colgado —ni caído ni sano— deja el
`globalSetup` esperando para siempre. El mensaje va en **inglés**, como el resto
de los mensajes de error para quien desarrolla en este repositorio
(`lib/access-url.ts`, `lib/og-image.ts`); la regla del tuteo rige los textos de
interfaz, y este no lo es.

**Criterios de aceptación (trazados desde requirements.md):**

- 7.1 (la mitad con rojo) — la función de chequeo rechaza en los dos modos en
  que una instancia «no responde», y no solo en uno: `fetch` que rechaza (nada
  escuchando, Docker apagado) y respuesta con estado no-2xx (contenedor arriba,
  auth enfermo). En ambos el mensaje nombra a la instancia local de Supabase
  como la causa e incluye la dirección consultada.
- 7.1 (la mitad de cableado, una sola corrida) — con la variable apuntada a un
  puerto muerto, `npm run test:e2e` **aborta con ese mensaje y ejecuta cero
  casos**, sin abrir el navegador. Es la comprobación que se anota en el
  Decision log, no un caso de Vitest.
- 7.1 (la sustitución del síntoma, que es el punto de la tarea) — en esa misma
  corrida, el fallo **deja de ser** un `expect` vencido a los 30 segundos
  apuntando a `/acceso` o a la guardia del panel. Si la suite sigue llegando a
  correr casos y muriendo por timeout, la tarea no está hecha aunque el mensaje
  exista.
- Con la instancia arriba, la función resuelve y la suite arranca normalmente:
  el chequeo no introduce un fallo propio en el camino sano.
- El chequeo no manda `apikey` ni `Authorization` — verificado que el endpoint
  no los pide, y mandar la clave escondería un 401 detrás de un mensaje de
  instancia caída.
- `npm run typecheck` cubre los dos archivos nuevos, y eso se sostiene: ninguno
  quedó bajo `e2e/`.

**Nota sobre el estado de la suite en este tramo:** T9 ya dejó dicho que entre
T9 y T13 la suite de punta a punta queda en rojo, de modo que `npm run verify`
no vuelve a verde acá. La verificación de esta tarea es `npm run typecheck &&
npm test` más la corrida de sonda descrita arriba, cuyo aborto **es** el
resultado esperado.

**Decision log:**

_(vacío hasta la ejecución)_

**Outcome:**

_(vacío hasta que la tarea esté terminada)_

## T13 — `e2e/acceso.spec.ts` reescrito: CP-01, CF-01 y CF-02

**Requisitos:** 1.1, 1.2, 1.5, 2.1, 3.1, 3.2, 3.4, 4.1, 7.2, 7.3
**Depende de:** T2, T9, T11

**Precondición de entorno:** la instancia local tiene que estar arriba
(`supabase start`) y sembrada (`supabase db reset`, que aplica el `seed.sql` de
T2). No es una dependencia de otra tarea: es lo que vuelve ejecutable el ciclo,
porque los tres casos hablan con Supabase de verdad.

**Por qué T12 sale de la lista de dependencias.** Estaba listada y no es un
prerequisito real: el `globalSetup` de T12 no cambia una sola aserción de este
archivo, y los tres casos corren igual sin él. Lo único que aporta es que, con
Docker apagado, el fallo diga «la instancia no está arriba» en vez de un `expect`
vencido — comodidad de diagnóstico, no una capacidad que T13 consuma. Conviene
tomar T12 antes igual, porque el ejecutor de T13 es justamente quien va a chocar
con ese modo de fallo, pero si se toma después nada de acá se rehace.

**Descripción:**

Reescribir `e2e/acceso.spec.ts` entero. Hoy afirma exactamente lo contrario de lo
que la pantalla hace tras T9: busca `a[href="/panel"]`, exige `toHaveCount(0)`
sobre `form`, y comprueba que Enter dentro de un campo **no** navega. Es
reemplazo, no agregado.

Los tres casos, con los IDs en el título:

- `CP-01` — credenciales sembradas → aterriza en `/panel`, con la URL pelada, y
  la sesión queda en una cookie que el navegador no puede leer.
- `CF-01` — credenciales inválidas → sigue en `/acceso`, con el mensaje visible,
  sin cookie de sesión, y ni la contraseña ni el correo aparecen en la dirección.
- `CF-02` — `GET /panel` sin sesión → redirige a `LOGIN_HREF`.

**Las credenciales sembradas, y dónde se escriben.** La pregunta abierta 3 quedó
resuelta el 2026-08-17: `alumno@crypto-crime.test` con contraseña
`investigacion-2024`. Esos dos literales los necesitan cuatro archivos —
`supabase/seed.sql` (T2), y las tres specs de T13, T14 y T15—, así que hay que
decidir dónde viven antes de teclearlos en cada uno.

**El reparto: una copia en SQL y una en TypeScript, nunca más.** `seed.sql` no
puede importar nada —es SQL, y `supabase db reset` no le pasa parámetros—, de
modo que la segunda copia es inevitable; lo que sí se evita es la tercera y la
cuarta. Esta tarea crea `e2e/seeded-account.ts`:

```ts
/** The account `supabase/seed.sql` plants. Change it there first, then here. */
export const SEEDED_EMAIL = "alumno@crypto-crime.test";
export const SEEDED_PASSWORD = "investigacion-2024";
```

Lo importan `e2e/acceso.spec.ts` (acá), `e2e/no-javascript.spec.ts` (T14) y
`e2e/panel.spec.ts` (T15) por ruta relativa. Cuatro detalles del armado:

- **Va en `e2e/` y no en `lib/`.** En `lib/` quedaría dentro del grafo que
  `next build` puede alcanzar, y una credencial de prueba importable desde `app/`
  es un accidente esperando. El costo es que `tsconfig.json` excluye `e2e/` y el
  módulo no entra en `npm run typecheck` — aceptable, porque son dos constantes
  sin lógica y quienes lo consumen tampoco se typechequean.
- **No lo recoge Playwright como spec.** El `testMatch` por omisión pide
  `*.spec.ts` o `*.test.ts`; `seeded-account.ts` no encaja.
- **El comentario nombra `supabase/seed.sql` como la fuente.** Es lo que vuelve
  barato el único modo de deriva posible: si los dos archivos se separan, CP-01
  falla como «credenciales inválidas» —síntoma que se lee como defecto de código—
  y ese comentario es lo que manda a mirar el lugar correcto.
- **Se descartó un test de Vitest que compare los dos archivos.** No sería
  tautológico (compara dos fuentes independientes, que es lo que T2 objetaba),
  pero metería un import de `e2e/` dentro de la suite unitaria para cubrir una
  deriva que CP-01 ya detecta. No se agrega.

**Este archivo no tiene rojo natural, y hay que decirlo.** T13 llega después de
T9 y T11, así que la implementación ya existe: los tres casos pasan en la primera
corrida. Por la regla del proyecto, eso no cuenta como verificado, y acá no es un
caso límite sino la situación normal de la tarea entera. **Las tres mutaciones de
abajo son el entregable tanto como el archivo.** Cada una se revierte con Edit,
nunca con `git checkout`, que restaura HEAD y se come el trabajo sin commitear.

1. **Quitar `action={submitAction}` del `<form>` de la tercera rama de
   `AccessScreen.tsx`.** El formulario pasa a enviarse por GET contra la URL
   actual y los campos aparecen en la barra de direcciones. Deben ponerse en rojo
   CP-01, CF-01 y el caso de Enter, **por la aserción de URL** y no por un
   elemento que no se encuentra. Es la mutación que prueba que 1.5 está defendido
   de verdad.
2. **Hacer que `app/acceso/page.tsx` ignore `searchParams.error`** y nunca
   renderice el mensaje. Debe ponerse en rojo **solo** la mitad de CF-01 que mira
   el mensaje; CP-01 y CF-02 quedan verdes.
3. **Quitar el `if (!user) redirect(LOGIN_HREF)` de `app/panel/layout.tsx`.**
   Debe ponerse en rojo **solo** CF-02. Es la mitad que `design.md` pide
   comprobar; la otra mitad —una guardia que redirige siempre— la detecta CP-01,
   que dejaría de llegar al panel. El par CP-01/CF-02 es lo que encierra a la
   guardia por los dos lados, y por eso las dos mutaciones se corren.

**Lo que se conserva del archivo actual**, porque sigue siendo cierto y sigue
trazando al spec de la landing —**esos números son de
`docs/specs/2026-08-12-landing-publica/requirements.md`, no de este spec**: el
ajuste a pantalla angosta (7.8), las corridas de axe (9.5, 9.6), el recorrido por
teclado con anillo visible, el tamaño mínimo de los controles (7.6) y el
`noindex`. Tres ajustes sobre ese material:

- El caso «shows the card with both fields and the control» busca hoy
  `a[href="/panel"]`. Pasa a buscar `button[type="submit"]`, que es el control
  tras T5 y T9.
- Las corridas de axe se extienden al estado de error (`LOGIN_ERROR_HREF`): el
  mensaje es un nodo visual nuevo, y el contraste de `--error-text` que T6 mide
  con el test de tokens conviene verlo también en situ.
- El bloque «entered from the address the site links to» desaparece como bloque,
  pero su intención se absorbe: CP-01 entra por `LOGIN_HREF` —la dirección que el
  sitio realmente enlaza, no un `/acceso` pelado— y afirma que el panel al que
  llega renderizó, no solo que la URL cambió. Su helper
  `page.locator("main a").last()` se va: el control dejó de ser un ancla.

**Lo que se retira, y qué pasa con el caso de Enter.** Se van «the screen renders
no form» entero, el caso «lands on the dashboard with a bare address» (la versión
maqueta de CP-01) y el comentario de cabecera del archivo, que dice «It is UI
only: nothing authenticates». El caso «does not navigate on Enter inside a field»
**se invierte en vez de borrarse**: bajo el diseño nuevo Enter dentro de un campo
**debe** enviar el formulario, que es el envío implícito de HTML y depende de que
exista un `<button type="submit">`. Se conserva dentro del bloque de CF-01, con
las mismas credenciales inválidas: Enter aterriza en `LOGIN_ERROR_HREF` y la URL
sigue sin traer los campos. Así el caso defiende lo mismo que defendía antes
—que Enter no haga algo indebido— con el resultado esperado dado vuelta, y de
paso extiende 1.5 al camino de teclado. **No lleva ID**: los IDs son solo de los
tres casos del plan.

**Herencia de la nota de orden de T12, que acá se paga.** El `globalSetup` corre
DESPUÉS del `webServer`, así que cada corrida de esta suite paga el
`npm run build && npx next start` completo. T13 es donde eso duele: entre escribir
el archivo y las tres mutaciones son varias corridas. Tres mitigaciones medidas, y
ninguna elimina el costo:

- Acotar la corrida a un archivo —`npx playwright test e2e/acceso.spec.ts`— saltea
  las otras nueve specs, pero no el build.
- `reuseExistingServer` ya está en `!process.env.CI`, o sea `true` local: con un
  `npx next start --hostname 127.0.0.1 --port 3100` propio ya escuchando,
  Playwright no corre el comando del `webServer` y no compila. Sirve para iterar
  el texto de la spec, que es donde están casi todas las vueltas. **No sirve para
  las tres mutaciones**, que tocan código de `app/` y `components/`: ahí hay que
  recompilar y reiniciar ese servidor a mano.
- **No dejar un `next dev` corriendo mientras tanto:** la corrida de punta a punta
  le borra `.next` y el servidor de desarrollo queda sirviendo páginas sin
  estilos hasta que se lo reinicia.

**Qué queda en verde al terminar, sin exagerarlo.** T9 y T12 anotaron que entre
T9 y T13 la suite de punta a punta está en rojo. T13 devuelve al verde
**`e2e/acceso.spec.ts`**, y nada más: `e2e/panel.spec.ts` sigue rojo con sus diez
`page.goto("/panel")` contra la guardia de T11, y eso lo arregla T15. O sea que
`npm run test:e2e` —y con él `npm run verify`— **no vuelve a verde acá**. La
verificación de esta tarea es `npm run typecheck && npm test` más una corrida
verde de `npx playwright test e2e/acceso.spec.ts` más las tres mutaciones. El
resto de las specs no se toca: se comprobó que ninguna otra visita `/acceso` ni
`/panel` salvo `e2e/no-javascript.spec.ts`, que solo llega hasta `/acceso` y
sigue siendo cierta.

**Nota para el loop de `verify-implementation`, que se decide antes de
ejecutar.** Al cerrar la implementación, `plan-test-cases` deriva del spec tres
casos E2E y declara un archivo destino, y `generate-tests` lo escribe entero. Si
ese destino fuera `e2e/acceso.spec.ts`, la generación pisaría todo lo que este
archivo conserva del spec de la landing —axe, teclado, 44 px, pantalla angosta,
`noindex`—, que ningún plan de tres casos puede reproducir. **`plan-test-cases`
tiene que declarar otro archivo destino** (por ejemplo
`e2e/login-supabase.spec.ts`). El costo asumido es que los tres casos quedan
afirmados dos veces; la alternativa es perder cobertura. Que 7.3 obligue a tocar
`e2e/acceso.spec.ts` no cambia el reparto: acá se reescribe ese archivo, y el
loop escribe el suyo.

**Criterios de aceptación (trazados desde requirements.md):**

- 7.3 — no queda en el archivo ninguna afirmación que describa la maqueta:
  desaparecen el bloque `toHaveCount(0)` sobre `form`, el selector
  `a[href="/panel"]`, el caso de que Enter no navega y el comentario de cabecera
  que dice que nada acá autentica.
- 7.2 — los tres casos con ID en el título cubren el acceso exitoso (`CP-01`), el
  rechazado (`CF-01`) y el pedido al panel sin sesión (`CF-02`).
- 1.1 (llegar) — CP-01 entra por `LOGIN_HREF`, teclea `SEEDED_EMAIL` y
  `SEEDED_PASSWORD`, activa el control y aterriza en el panel:
  `new URL(page.url()).pathname` es exactamente `/panel` y su `.search` es
  exactamente la cadena vacía. La igualdad exacta del `search` es lo que prohíbe
  cualquier parámetro de más; un `not.toContain` pasa por vacío.
- 1.1 (abrir sesión) — 1.1 pide dos cosas, y la URL solo prueba una. Tras CP-01,
  `page.context().cookies()` trae al menos una cookie con nombre que empieza en
  `sb-`. Es la mitad «abrir una sesión» del criterio.
- 3.1 — esa misma cookie es la persistencia en el navegador que 3.1 pide, ahora
  observada contra un navegador real y no contra el doble de `@supabase/ssr` que
  usa T3.
- 3.4 — todas esas cookies traen `httpOnly: true`. Es la única observación de
  punta a punta de que los tokens no quedan al alcance del JavaScript del
  navegador.
- 3.2 — el pedido a `/panel` que sigue al acceso se atiende sin volver a pedir
  credenciales: CP-01 afirma que el `<h1>` del panel está en pantalla, no solo
  que la URL cambió. Una guardia que redirigiera siempre dejaría la URL en
  `/acceso` y este caso la delata.
- 1.2 (volver) — CF-01 teclea `SEEDED_EMAIL` con una contraseña que no es la
  sembrada, y termina en `/acceso`: `pathname` exactamente `/acceso` y `search`
  exactamente `?intent=login&error=credenciales`, que es `LOGIN_ERROR_HREF`.
- 1.2 (sin abrir sesión) — tras CF-01, `page.context().cookies()` **no** trae
  ninguna cookie cuyo nombre empiece en `sb-`. Sin esta aserción el criterio se
  cumpliría por aproximación: la URL sola no dice nada sobre la sesión.
- 1.5 — es el único lugar del proyecto donde este criterio se puede cerrar. T5
  midió que ningún test unitario sirve: en jsdom `window.location.search` queda
  vacío pase lo que pase, con implementación o sin ella. CF-01 lo afirma contra
  un navegador de verdad y por igualdad exacta del `search`, no por
  `not.toContain`. Además, la contraseña tecleada es un centinela distintivo y se
  afirma que no aparece en `page.url()` completo — esa segunda aserción es la
  legible; la que sostiene el criterio es la igualdad exacta.
- 1.5 (camino de teclado) — con los campos completos, Enter dentro del campo de
  contraseña envía el formulario y aterriza en `LOGIN_ERROR_HREF`, con el mismo
  `search` exacto. Es el caso de Enter invertido, sin ID.
- 2.1 — CF-01 afirma que el mensaje de error está visible en la tarjeta. El texto
  va como literal en la spec, igual que «Cerrar sesión» en `e2e/panel.spec.ts`;
  **este caso no verifica 2.4**, que es de T9 y compara contra
  `access.login.errorMessage` por referencia. Si alguien edita la copia, este test
  falla, y ese aviso es deseado.
- 4.1 — CF-02 pide `/panel` sin sesión y termina en `LOGIN_HREF`: `pathname`
  `/acceso` y `search` `?intent=login`. **Requiere un contexto sin cookies**, que
  es lo que Playwright da por omisión a cada caso; el caso no depende del orden
  respecto de CP-01.
- Las tres mutaciones se corrieron y tumbaron exactamente lo previsto —ni más ni
  menos casos que los listados arriba—, y las tres se revirtieron con Edit. Sin
  esto la tarea no está verificada: ninguno de los tres casos tiene rojo natural.
- `e2e/seeded-account.ts` existe, exporta los dos literales, nombra
  `supabase/seed.sql` en su comentario, y los literales de credenciales que hoy
  tiene la spec (`investigador@fiscalia.example`, `investigador@demo.example` y
  compañía) desaparecen del archivo.
- Lo conservado del spec de la landing sigue verde tal cual: pantalla angosta,
  axe en 1280 y 375 —ahora también sobre `LOGIN_ERROR_HREF`—, recorrido por
  teclado, 44 por 44 y `noindex`.

**Decision log:**

_(vacío hasta la ejecución)_

**Outcome:**

_(vacío hasta que la tarea esté terminada)_

## T14 — Cobertura del acceso sin JavaScript en `e2e/no-javascript.spec.ts`

**Requisitos:** 5.1, 5.2
**Depende de:** T13

**Precondición de entorno:** la instancia local tiene que estar arriba
(`supabase start`) y sembrada (`supabase db reset`, que aplica el `seed.sql` de
T2). Igual que en T13, no es dependencia de otra tarea: es lo que vuelve
ejecutable el ciclo, porque los dos casos hablan con Supabase de verdad.

**La pregunta abierta 3 ya no bloquea nada.** Esta entrada llegó a decir
«Bloqueada para ejecución: pregunta abierta 3 de `requirements.md`». Esa pregunta
se resolvió el 2026-08-17 —`alumno@crypto-crime.test`, contraseña
`investigacion-2024`— y su propia nota declara que desbloquea T2, T13, T14 y T15.
Acá no queda ninguna decisión pendiente, y además los dos literales **no se
teclean en este archivo**: se importan de `e2e/seeded-account.ts`, que crea T13.
Esa es la única razón por la que T14 depende de T13 y no de T9 y T11 a secas.

**Descripción:**

Agregar a `e2e/no-javascript.spec.ts` los dos casos del Requisito 5: completar un
inicio de sesión y llegar al panel, y ver el mensaje de un intento rechazado. Son
los dos únicos casos de todo el plan que prueban que la Server Action está en
mejora progresiva de verdad y no solo en teoría.

Va en el archivo que ya existe y no en uno nuevo, y eso está comprobado: el
archivo declara `test.use({ javaScriptEnabled: false })` a nivel de módulo, de
modo que los dos casos nuevos heredan el contexto sin script por el solo hecho de
escribirse ahí. Es exactamente su montaje.

**Es agregado, no reescritura.** A diferencia de T13, nada de lo que el archivo
afirma hoy deja de ser cierto tras T9 y T11. Su único caso que toca `/acceso`
—«the login control reaches the access screen with no scripting»— afirma la URL
`/acceso?intent=login` y que el campo de contraseña se ve; las dos cosas siguen
valiendo cuando el control pasa a ser un `<button type="submit">` dentro de un
`<form>`. Y ninguna de sus afirmaciones llega a `/panel`, así que la guardia de
T11 no lo toca. **Comprobarlo antes de dar la tarea por cerrada** en vez de darlo
por sentado: el archivo entero tiene que quedar verde, no solo los dos casos
nuevos.

**Los números del archivo son de dos specs distintos, y hay que separarlos.** Sus
bloques dicen 8.1, 8.2, 8.3, 8.4 y 8.5, que son de
`docs/specs/2026-08-12-landing-publica/requirements.md`. Los dos casos nuevos
trazan a 5.1 y 5.2 **de este spec**. Van en su propio `test.describe` que nombre
el spec —no un rótulo «5.1» suelto, que en este archivo se lee como un número de
la landing— y el comentario de cabecera, que hoy dice que la suite protege la
decisión de los `<details>` nativos, se extiende para nombrar también el acceso.

**Este archivo no tiene rojo natural, y por la misma razón que T13:** llega
después de T9, T11 y T13, así que la implementación ya existe y los dos casos
pasan en la primera corrida. Por la regla del proyecto eso no cuenta como
verificado, y acá hay un agravante: **no existe una mutación que ponga en rojo
solo a estos dos casos**, porque el diseño tiene un solo camino de envío —el
mismo `<form>` sirve al navegador con script y sin él—, de modo que todo lo que
rompe el camino sin script rompe también el camino con script que T13 ya cubre.
Eso no es un defecto del plan: es la consecuencia de que 5.1 y 5.2 se cumplan por
ausencia de un camino alternativo.

La mutación que sí corresponde correr es la regresión que estos dos casos existen
para atrapar: **convertir `AccessScreen` en componente de cliente** —agregarle
`"use client"` y reemplazar el envío nativo por un `onClick` que navegue por
script a `PANEL_HREF`—. Con script, la pantalla sigue andando y
`e2e/acceso.spec.ts` se queda en verde; sin script, no hay nada que envíe el
formulario y los dos casos nuevos caen. El rojo colateral esperado es la
afirmación por ausencia de `components/sections/AccessScreen.test.tsx`
(`not.toContain("use client")`), y es deseado: es la misma regresión vista de
forma estática, mientras estos dos casos la ven en un navegador de verdad. Se
revierte con Edit, nunca con `git checkout`, que restaura HEAD y se come el
trabajo sin commitear. Si al correrla el reparto de rojos no es ese, en el
Decision log se anota lo observado, no lo previsto.

**Cómo entran los dos casos, para que el resultado sea determinista.** Los dos
navegan a `LOGIN_HREF` —`/acceso?intent=login`, la dirección que el sitio
enlaza— y no a un `/acceso` pelado. Sin script el navegador postea de forma
nativa contra la URL en curso, así que entrar por la dirección correcta es lo que
hace que el destino del rechazo sea exactamente `LOGIN_ERROR_HREF` y no una
variante sin `intent`. Después la acción redirige, y la dirección final es la
misma que observan CP-01 y CF-01 de T13.

**Verificación.** `npm run typecheck && npm test` —que no cubren este archivo,
porque `tsconfig.json` excluye `e2e/` y Vitest no lo recoge, pero se corren igual
por la regla del proyecto— más una corrida verde de
`npx playwright test e2e/no-javascript.spec.ts`, más la mutación de arriba.
**`npm run test:e2e` sigue sin volver a verde acá:** `e2e/panel.spec.ts` continúa
rojo contra la guardia de T11 hasta T15, tal como anotaron T9, T12 y T13. Y vale
la misma advertencia de T13: no dejar un `next dev` corriendo mientras se itera,
porque la corrida de punta a punta le borra `.next`.

**Criterios de aceptación (trazados desde requirements.md):**

- 5.1 — con el script bloqueado, el caso entra por `LOGIN_HREF`, completa los
  campos con `SEEDED_EMAIL` y `SEEDED_PASSWORD` importados de
  `e2e/seeded-account.ts`, activa el `<button type="submit">` y aterriza en el
  panel: `new URL(page.url()).pathname` es exactamente `/panel` y su `.search` es
  exactamente la cadena vacía.
- 5.1 (llegar de verdad, no solo cambiar de dirección) — el `<h1>` del panel está
  en pantalla. El panel se renderiza entero en el servidor, así que sin script
  tiene que verse igual; afirmar solo la URL dejaría pasar un panel en blanco.
- 5.2 — con el script bloqueado, un intento con `SEEDED_EMAIL` y una contraseña
  que no es la sembrada termina en `LOGIN_ERROR_HREF` —`pathname` exactamente
  `/acceso` y `search` exactamente `?intent=login&error=credenciales`— y el
  mensaje de error está visible en la tarjeta.
- 5.2 (el texto) — va como literal en la spec, igual que en CF-01 de T13. **Este
  caso no verifica 2.4**, que es de T9 y compara contra
  `access.login.errorMessage` por referencia.
- Los dos casos nuevos viven en un `test.describe` propio que nombra este spec, y
  ningún rótulo suyo reusa la numeración 8.x de la landing que el resto del
  archivo ya ocupa.
- Ninguna credencial aparece como literal en este archivo: los dos valores se
  importan de `e2e/seeded-account.ts` por ruta relativa, como hacen T13 y T15.
- Los casos que el archivo ya tenía siguen verdes sin retocarlos: los `<details>`,
  la navegación por anclas, el recorrido de alta de tres pantallas, el control de
  acceso, el panel angosto y la degradación de `NavPanel`.
- La mutación se corrió, tumbó los dos casos nuevos dejando `e2e/acceso.spec.ts`
  en verde, y se revirtió con Edit. Sin esto la tarea no está verificada: ninguno
  de los dos casos tiene rojo natural.

**Decision log:**

_(vacío hasta la ejecución)_

**Outcome:**

_(vacío hasta que la tarea esté terminada)_

## T15 — `e2e/panel.spec.ts` entra con sesión antes de mirar el panel

**Requisitos:** 3.2, 4.2, 7.2
**Depende de:** T13

**Precondición de entorno:** la instancia local tiene que estar arriba
(`supabase start`) y sembrada (`supabase db reset`, que aplica el `seed.sql` de
T2). Igual que en T13 y T14, no es dependencia de otra tarea: es lo que vuelve
ejecutable el ciclo, porque el paso de acceso previo habla con Supabase de
verdad.

**La pregunta abierta 3 ya no bloquea nada.** Esta entrada llegó a decir
«Bloqueada para ejecución: pregunta abierta 3 de `requirements.md`». Esa pregunta
se resolvió el 2026-08-17 —`alumno@crypto-crime.test`, contraseña
`investigacion-2024`— y su propia nota declara que desbloquea T2, T13, T14 y T15.
Acá no queda ninguna decisión pendiente, y además los dos literales **no se
teclean en ningún archivo de esta tarea**: se importan de `e2e/seeded-account.ts`,
que crea T13. Esa es la única razón por la que T15 depende de T13 y no de T11 a
secas.

**Por qué 3.2 entra en la lista de requisitos.** La tabla de cobertura ya
atribuía a T15 «el pedido posterior reconocido» de 3.2, pero el encabezado de la
tarea solo declaraba 4.2 y 7.2. La traza era real y estaba a medio escribir: el
montaje de abajo abre la sesión **una sola vez** y después sirve once pedidos al
panel sin que nadie vuelva a teclear una credencial, que es exactamente lo que
3.2 pide. Se corrige el encabezado y la fila del Resumen de tareas; la tabla de
cobertura ya lo decía.

**Descripción:**

`e2e/panel.spec.ts` tiene hoy **diez `page.goto("/panel")` directos repartidos en
once casos** —el bloque de axe es un bucle sobre dos viewports, así que un solo
`goto` escrito corre dos veces—. Comprobado leyendo el archivo. Con la guardia de
T11 los once terminan en `/acceso` y el archivo entero se cae: no por un defecto,
sino porque describe un panel que ya no está abierto a cualquiera.

**La decisión que esta entrada dejaba abierta: `storageState` producido una vez
por corrida, no un `beforeEach` que complete el formulario en cada caso.** Las
dos alternativas funcionan y el `beforeEach` es más corto, pero hay un dato de
terreno que las separa: `supabase/config.toml:209` declara
`sign_in_sign_ups = 30`, o sea treinta pedidos de acceso cada cinco minutos por
dirección IP, y en la instancia local todos salen de la misma. Un `beforeEach`
pone **once** accesos por corrida de este archivo, contra el uno de
`storageState`. Sumados los ~3 de `e2e/acceso.spec.ts` (T13) y los 2 de
`e2e/no-javascript.spec.ts` (T14), una corrida completa pasa de ~6 a ~16, y dos
corridas seguidas dentro de la misma ventana de cinco minutos cruzan el límite —
que es justo lo que hace quien itera una spec, o quien deja `retries: 2` en CI.
El costo no es la lentitud sino el diagnóstico: al pasarse, GoTrue responde 429,
`signIn` no distingue ese error de una contraseña equivocada y redirige a
`LOGIN_ERROR_HREF`, de modo que el síntoma es «credenciales inválidas» sobre las
credenciales correctas. Es la misma clase de falla engañosa que el `globalSetup`
de T12 existe para evitar, y acá se evita eligiendo el montaje, sin código de
diagnóstico extra.

**El montaje, en tres archivos y una línea de `.gitignore`:**

1. **`e2e/auth.setup.ts`** — entra por `/acceso?intent=login` (la dirección que
   el sitio enlaza, escrita como literal, igual que en el resto de la suite: las
   specs de `e2e/` no importan `lib/routes`), completa los campos con
   `SEEDED_EMAIL` y `SEEDED_PASSWORD` de `e2e/seeded-account.ts`, activa el
   `button[type="submit"]`, espera `/panel` y guarda
   `page.context().storageState({ path })`. **Antes de guardar comprueba que hay
   al menos una cookie `sb-`** y, si no la hay, falla nombrando la cuenta
   sembrada y `supabase db reset`: sin eso el estado guardado saldría vacío y los
   once casos fallarían por redirección, apuntando a la guardia en vez de a la
   base sin sembrar.
2. **`playwright.config.ts`** — un proyecto `setup` con
   `testMatch: /auth\.setup\.ts/`, y `dependencies: ["setup"]` en el proyecto
   `chromium`. El `testMatch` por omisión pide `*.spec.ts` o `*.test.ts`, así que
   `auth.setup.ts` no lo recoge ningún otro proyecto, y `dependencies` hace que
   corra una vez por corrida incluso con `npx playwright test e2e/panel.spec.ts`.
   No toca `webServer`, `workers: 1` ni el `globalSetup` que agrega T12 —son
   claves distintas del mismo objeto—, y el orden que resulta es `webServer` →
   `globalSetup` → `setup` → `chromium`.
3. **`e2e/panel.spec.ts`** — `test.use({ storageState })` a nivel de módulo, y
   nada más: los once casos no cambian una aserción. **Solo este archivo lo
   declara**; el estado no entra en el `use` global, de modo que las demás specs
   siguen corriendo sin sesión, que es lo que varias de ellas afirman.
4. **`.gitignore`** — gana `e2e/.auth/`. El archivo guarda tokens de sesión
   vivos; que sean de una cuenta de prueba local no lo vuelve versionable.

**El bloque sin script no necesita nada aparte.** `test.use({ storageState })` a
nivel de módulo y `test.use({ javaScriptEnabled: false })` en el describe se
combinan: las cookies las inyecta el contexto, no el JavaScript de la página, así
que el caso «renders the whole dashboard anyway» sigue probando lo que probaba
—que el panel se dibuja entero sin script (8.1 de la landing)— y ahora además
detrás de la guardia.

**El caso de «Cerrar sesión» se conserva tal cual, y conviene decir por qué.**
Hoy afirma que el enlace lleva a `/acceso`, y eso sigue siendo cierto con sesión
abierta: nada en el diseño redirige al panel a quien ya entró. **No se le agrega
ninguna aserción sobre que la sesión termine**: cerrar sesión está explícitamente
fuera de alcance en `requirements.md`, el enlace no la cierra, y escribir acá un
test que lo exija sería planificar trabajo que este spec no tiene.

**El comentario de cabecera del archivo se corrige.** Dice «nothing
authenticates, nothing guards the route, and no control on it does anything». La
segunda cláusula deja de ser cierta con T11 y hay que reemplazarla: la ruta
**está** guardada, y la sesión con la que estos casos entran la abre
`e2e/auth.setup.ts`. Las otras dos siguen valiendo —el panel no autentica y sus
controles siguen sin hacer nada— y se conservan.

**Las otras dos specs que esta tarea manda revisar, revisadas acá.** Ninguna
afirmación de hoy llega a `/panel`: en `e2e/no-javascript.spec.ts` las apariciones
de «panel» son el `NavPanel` de la cabecera (`header details`), no la ruta, y su
único caso que toca el acceso se queda en `/acceso?intent=login`;
`e2e/registro.spec.ts` no nombra `/panel` en ninguna línea. **Pero después de T14
sí va a haber una:** el caso de 5.1 aterriza en `/panel`. **Esa no lleva
`storageState` ni paso de acceso previo, y agregárselo la invalidaría**, porque lo
que 5.1 afirma es justamente que la sesión se abre sola, sin script y sin ayuda.
Si T15 se toma después de T14, ese caso se deja como está.

**Rojo natural: sí, y es el único de los tres archivos de punta a punta que lo
tiene.** T13 y T14 llegan sobre implementación ya escrita y necesitan mutaciones;
acá la guardia de T11 ya dejó el archivo en rojo por su cuenta. **Hay que verlo
antes de escribir el arreglo**: correr `npx playwright test e2e/panel.spec.ts` y
observar los once casos fallando por redirección a `/acceso`, y recién entonces
montar el acceso previo. No hace falta ninguna mutación, y no porque se la
dispense: el ciclo se cierra solo por los dos lados. Sin sesión los once fallan
—eso ya se vio—, y con un `storageState` vacío o adulterado vuelven a fallar
igual, de modo que el verde no se puede conseguir sin una sesión de verdad.

**Verificación.** `npm run typecheck && npm test` —que no cubren estos archivos,
porque `tsconfig.json` excluye `e2e/` y Vitest no los recoge, pero se corren
igual por la regla del proyecto— más **`npm run test:e2e` completo, no solo este
archivo**. T9, T12, T13 y T14 anotaron que hasta acá la suite de punta a punta
sigue en rojo: **T15 es la tarea que la devuelve al verde**, y una corrida parcial
no lo demuestra. Vale la misma advertencia de T13 y T14: no dejar un `next dev`
corriendo mientras se itera, porque la corrida de punta a punta le borra `.next` y
el servidor de desarrollo queda sirviendo páginas sin estilos.

**Criterios de aceptación (trazados desde requirements.md):**

- 4.2 (se atiende normalmente) — los once casos del archivo vuelven a pasar sin
  que ninguna de sus aserciones cambie: el `<h1>`, los siete `li` del temario, el
  «35%», los cuatro estados en palabras, el ajuste a 375, axe en 1280 y 375, el
  recorrido por teclado, los 44 por 44 y el `noindex`.
- 4.2 (explícito, no incidental) — el primer caso agrega una aserción propia:
  tras `page.goto("/panel")`, `new URL(page.url()).pathname` es exactamente
  `/panel`. Sin ella el criterio se cumple de refilón; con ella el archivo afirma
  que el pedido **no** fue redirigido, que es lo que 4.2 dice.
- 3.2 — las credenciales se teclean en un solo lugar de toda la corrida,
  `e2e/auth.setup.ts`; `e2e/panel.spec.ts` no contiene ni un
  `input[type="password"]` ni ninguno de los dos literales, y aun así los once
  pedidos al panel se atienden. Es la observación de que la sesión sobrevive al
  pedido en que se abrió.
- 3.2 (la cookie es lo que la transporta) — el estado guardado trae al menos una
  cookie cuyo nombre empieza en `sb-`, comprobado por el propio
  `e2e/auth.setup.ts` antes de escribir el archivo. Es una guardia del montaje,
  no un caso con ID: no repite las aserciones de CP-01 sobre `httpOnly` ni sobre
  la URL pelada, que son de T13.
- 7.2 — el camino de acceso exitoso queda ejercitado también acá, sin duplicar
  CP-01: `e2e/auth.setup.ts` lo recorre entero contra Supabase de verdad, y este
  archivo mira el panel, no el acceso. Ninguno de sus once casos afirma nada
  sobre la pantalla de acceso.
- El comentario de cabecera ya no dice que nada guarda la ruta; nombra la guardia
  y de dónde sale la sesión.
- El caso de «Cerrar sesión» queda intacto y sin aserciones nuevas sobre el fin
  de la sesión, porque cerrar sesión está fuera de alcance.
- El bloque sin script conserva su `test.use({ javaScriptEnabled: false })` y
  pasa con la sesión inyectada por el contexto; no completa el formulario, que es
  el trabajo de T14.
- El proyecto `setup` corre una sola vez por corrida y ninguna otra spec declara
  `storageState`: `e2e/no-javascript.spec.ts` y `e2e/registro.spec.ts` siguen
  corriendo sin sesión, y el caso de 5.1 que agrega T14 conserva su acceso propio
  desde el formulario.
- `.gitignore` ignora `e2e/.auth/`, y `git status` queda limpio después de una
  corrida completa.
- `npm run test:e2e` termina en verde de punta a punta, por primera vez desde T9.

**Decision log:**

_(vacío hasta la ejecución)_

**Outcome:**

_(vacío hasta que la tarea esté terminada)_

## T16 — Acotar el criterio 6.7 en el spec de la landing

**Requisitos:** — (sección «Relación con el spec de la landing pública»)
**Depende de:** T9, T11

**Por qué depende de T9 y T11, y de ninguna otra.** La nota que esta tarea
escribe afirma un hecho del repositorio, no una intención: que `/acceso`
autentica y abre sesión, y que el panel consulta esa sesión. Ese hecho recién
existe cuando la pantalla postea a la acción (T9) y cuando la guardia del layout
lee la sesión antes de emitir contenido (T11) — los dos verbos que 6.7 prohíbe y
que esta feature revierte. Escribirla antes documentaría algo que todavía no
ocurre. T10 no entra: renovar el token es cómo se sostiene la sesión, no un hecho
nuevo que la nota tenga que declarar, y T11 tampoco depende de T10. T13, T14 y
T15 tampoco: son suites, ninguna cita 6.7 y ninguna cambia lo que la nota
describe.

**Dónde está el archivo, que no es donde parece.** El spec de la landing
**también está en este worktree** — comprobado el 2026-08-17: la ruta
`docs/specs/2026-08-12-landing-publica/requirements.md` existe acá, está
versionada, limpia respecto de HEAD, y su contenido es idéntico al del
repositorio principal salvo por el fin de línea (acá CRLF, allá LF;
`core.autocrlf=true` normaliza al commitear, así que el diff sale de tamaño
normal y no como archivo reescrito). **Se edita la copia del worktree**, que es
por donde el cambio viaja en la rama de esta feature. Editar la copia del
repositorio principal dejaría una modificación de documentación sobre `main`,
fuera del commit de la feature y en conflicto con ella al integrar.

**Descripción:**

Tarea de documentación, **sin ciclo TDD**. La excepción está acotada y vale la
pena decir por qué: 6.7 es un criterio del spec de **otra** feature, y un caso de
Vitest que abriera ese markdown y buscara `~~` sería tautológico — afirmaría
sobre un archivo donde uno acaba de escribir esa marca, que es el mismo defecto
por el que T2 rechaza su propio test de subcadenas — y ataría además la suite
unitaria de este repositorio a la redacción de un documento. La red de regresión
del tramo de 6.7 que **sigue vigente** ya existe y no la pone esta tarea: los
tres tests de `/registro` que afirman `querySelector("form")` nulo, el caso
«renders no form in either shape (6.7)» de `AccessScreen.test.tsx` que T5
conserva, y `e2e/registro.spec.ts`, que ninguna tarea de este spec toca. Lo que
sí aporta esta tarea son comprobaciones observables en vez de un veredicto de
lectura: están en los criterios de aceptación de abajo y cada una se corre con un
comando.

**Qué se edita, con el literal a la vista.** El criterio dice hoy, en dos líneas:

```
6.7. THE SYSTEM SHALL NO implementar autenticación, envío de códigos,
verificación de códigos, alta de cuentas, cobro ni gestión de sesión.
```

De sus seis prohibiciones, esta feature revierte **dos** — autenticación y
gestión de sesión — y **solo en `/acceso`**. Por eso el tachado es parcial y cae
sobre esos dos ítems, no sobre el criterio entero:

```
6.7. THE SYSTEM SHALL NO implementar ~~autenticación,~~ envío de códigos,
verificación de códigos, alta de cuentas, cobro ~~ni gestión de sesión~~.
**Acotado el <fecha de ejecución>** (ver la nota de abajo).
```

El patrón es el mismo de 6.4 y 6.5 — texto tachado, marcador en negrita, puntero
a la nota —; lo que cambia es la extensión, y por una razón concreta: tachar el
criterio entero le diría al lector que 6.7 ya no rige, cuando el repositorio lo
sigue citando en más de diez comentarios y tests para `/registro`, para el panel
y para los esquemas de contenido. Es el mismo argumento que sostiene el «no se
renumera»: una cita no puede quedar apuntando a texto muerto. La coma de
«autenticación,» entra en el tachado para que la enumeración siga leyéndose, y el
«ni» entra en el segundo por lo mismo. La fecha es la del día en que se ejecuta
la tarea, con el formato de las notas existentes (`2026-08-14`), no la del
encabezado del spec.

**La nota que ya existe se reemplaza, no se le agrega un párrafo.** El archivo
trae hoy, después de la lista de criterios y del párrafo «La numeración no se
reacomoda a propósito» — que cubre también a 6.7 y **se deja intacto** —, un
`**Nota sobre 6.7 — las pantallas son maquetas.**`. Tres de sus afirmaciones
dejan de ser ciertas y hay que corregirlas en el mismo lugar, no dejarlas
conviviendo con una nota nueva que las contradiga:

1. «`/acceso` y las tres de `/registro` son solo interfaz» — son tres, no cuatro.
2. «Las dos pantallas que tocan una contraseña —`/acceso` y
   `/registro/crear-cuenta`— cierran con un botón inerte» — `/acceso` cierra con
   el `<button type="submit">` de un formulario real (T5, T9).
3. «ninguna de las cuatro renderiza un `<form>`» — `/acceso` renderiza uno.

Lo que la nota nueva tiene que decir, y no más que eso:

- Qué revierte esta feature y dónde: desde el spec `2026-08-17-login-supabase`,
  `/acceso` verifica credenciales contra la instancia local de Supabase, abre
  sesión en cookies, y el panel la consulta antes de emitir contenido.
- Qué sigue prohibido y dónde: las tres pantallas de `/registro` siguen siendo
  maquetas — no envían el código, no lo verifican y no crean la cuenta —, y el
  cobro sigue fuera de alcance en todo el proyecto.
- **El argumento del GET se conserva, reencuadrado.** La nota de hoy explica que
  un formulario **sin `action`** se envía por GET y pondría la contraseña en la
  barra de direcciones, y de ahí en el historial, en los registros del servidor y
  en el `Referer` siguiente. Ese razonamiento no se cae: el `<form>` de `/acceso`
  postea a una Server Action, así que ningún campo se serializa en la URL (1.5).
  Es lo que ya argumenta la sección «Relación con el spec de la landing pública»
  de este spec, y la nota tiene que dejarlo escrito para que nadie lea el
  formulario nuevo como una violación de la nota vieja.
- El título de la nota deja de ser «las pantallas son maquetas», que como
  afirmación general pasó a ser falsa.

**Lo que esta tarea no toca, y por qué.** Ni `design.md` ni `tasks.md` del spec
de la landing. Aquel `tasks.md` tiene su T8 en `[x] Hecha` trazando 6.7, y una
tarea terminada con su Outcome es registro histórico: se lee como lo que era
cierto cuando se ejecutó, no se reescribe. Su `design.md` sí queda con una línea
envejecida — el árbol de rutas rotula `acceso/page.tsx` como «ingreso — maqueta
inerte (6.2, 6.7)» —; corregirlo es una decisión sobre el spec de otra feature
que esta tarea no toma, y se anota en el Decision log para que el usuario
decida. Tampoco se tocan 6.1 a 6.6 ni sus notas.

**Criterios de aceptación (trazados desde requirements.md):**

- El tachado es el del literal de arriba: en
  `docs/specs/2026-08-12-landing-publica/requirements.md` (la copia del
  worktree), `autenticación,` y `ni gestión de sesión` quedan entre `~~`, y los
  otros cuatro ítems del criterio — envío de códigos, verificación de códigos,
  alta de cuentas, cobro — quedan **sin tachar**. Un tachado del criterio entero
  no cumple este criterio.
- La numeración no cambia: `rg -n "^6\.\d" requirements.md` devuelve las mismas
  siete entradas, 6.1 a 6.7, antes y después. Se corre y se compara.
- El criterio lleva el marcador en negrita con la fecha y el puntero «(ver la
  nota de abajo)», igual que 6.4 y 6.5.
- Hay **una** nota de 6.7, no dos: `rg -c "Nota sobre 6\.7" requirements.md`
  devuelve `1`, y esa nota ya no contiene ninguna de las tres afirmaciones falsas
  listadas arriba — se comprueba buscando en el archivo `las cuatro`, `botón
  inerte` y `son solo interfaz`.
- La nota nombra las tres pantallas de `/registro` como el tramo que sigue
  vigente y conserva el argumento del formulario sin `action`, explicando que el
  `<form>` de `/acceso` sí lo tiene.
- El diff toca **un solo archivo**: en el worktree,
  `git status --short docs/specs/2026-08-12-landing-publica/` lista únicamente
  `requirements.md` modificado, y su `git diff` no incluye ninguna línea de 6.1 a
  6.6, del párrafo «La numeración no se reacomoda a propósito», ni de otra
  sección.
- Las citas de 6.7 que quedan en el código son coherentes con el criterio ya
  acotado: `rg -n "6\.7" --glob '!docs/**' --glob '!package-lock.json'` no debe
  devolver ningún comentario que afirme que `/acceso` o el panel no autentican —
  esos son los que T9 y T11 ya corrigieron, y esta comprobación es la que delata
  si alguno quedó afuera. Dos candidatos que ninguna otra tarea nombra y que hay
  que mirar de cerca: la cabecera de `components/sections/AccessScreen.tsx`
  («None of them authenticates, sends a code or opens a session: 6.7 forbids all
  of it») y la de `lib/content/schemas.ts` («Copy only. Nothing here
  authenticates…»). Si alguna quedó mintiendo, se corrige el comentario acá — es
  una línea y no hay test de por medio — y se registra en el Decision log.
- `npm run typecheck && npm test` sigue en verde. Es la verificación de toda
  tarea del proyecto y acá cumple una función precisa: una edición de
  documentación no puede mover la suite, y si la moviera sería porque se tocó un
  archivo que no correspondía.

**Decision log:**

_(vacío hasta la ejecución)_

**Outcome:**

_(vacío hasta que la tarea esté terminada)_
