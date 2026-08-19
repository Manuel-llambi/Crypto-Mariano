# Plan de casos E2E — Acceso real contra Supabase local

**Spec:** `docs/specs/2026-08-17-login-supabase/`
**Archivo destino en `e2e/`:** `login-supabase.spec.ts`
**Estado:** Borrador
**Fecha:** 2026-08-18

## Alcance

Estos tres casos cubren los tramos del spec que **ninguna suite de `e2e/` mira
hoy**: que la sesión sobreviva a la navegación, que un intento malformado se
rechace, y que la pantalla no le crea a la barra de direcciones.

**El archivo destino no es `e2e/acceso.spec.ts`, y es deliberado.** T13 reescribió
ese archivo y conserva material del spec de la landing —axe en dos anchos y sobre
el estado de error, recorrido por teclado, 44 por 44, pantalla angosta,
`noindex`— que un plan de tres casos no puede reproducir. Generar sobre él lo
pisaría entero. El archivo nuevo convive al lado.

**Qué queda afuera porque ya está cubierto, y dónde:**

| Camino | Dónde ya vive |
|---|---|
| Acceso exitoso con las credenciales sembradas | `e2e/acceso.spec.ts`, `CP-01` |
| Contraseña equivocada → mensaje, sin cookie de sesión | `e2e/acceso.spec.ts`, `CF-01` |
| `GET /panel` sin sesión → `/acceso?intent=login` | `e2e/acceso.spec.ts`, `CF-02` |
| Envío con Enter dentro del campo de contraseña | `e2e/acceso.spec.ts`, caso sin ID |
| `httpOnly` en las cookies de sesión | `e2e/acceso.spec.ts`, `CP-01` |
| Acceso y mensaje de error con el script bloqueado | `e2e/no-javascript.spec.ts`, 5.1 y 5.2 |
| El panel atendido con sesión, once casos | `e2e/panel.spec.ts` |

## Resumen

| ID | Título | Tipo | Traza |
|---|---|---|---|
| CP-01 | La sesión sigue valiendo al salir del panel y volver | Camino feliz | 3.2, 1.1, 3.1 |
| CF-01 | Un correo vacío se rechaza como cualquier otro intento fallido | Fallo | 2.1, 2.3 (1.4 solo como estado de partida — ver abajo) |
| CF-02 | Un `error` escrito a mano en la dirección no produce mensaje | Fallo | 2.5 |

---

## CP-01 — La sesión sigue valiendo al salir del panel y volver

**Tipo:** Camino feliz
**Traza:** 3.2 — WHILE la sesión está vigente THE SYSTEM SHALL reconocer al
visitante en pedidos posteriores sin volver a pedirle credenciales. Con 1.1
(abrir sesión y llegar al panel) y 3.1 (persistirla en cookies) como apoyo.

**Por qué no duplica a `CP-01` de `e2e/acceso.spec.ts`.** Aquel afirma el pedido
en el que la sesión **se abre**: teclea, envía, aterriza. Este afirma los pedidos
**posteriores**, que es literalmente lo que 3.2 enuncia y lo único que un solo
aterrizaje no puede demostrar. `e2e/panel.spec.ts` tampoco lo cubre: entra con un
`storageState` inyectado por el contexto, sin haber recorrido nunca el
formulario, así que no observa que la sesión abierta por el acceso sobreviva.

**Precondiciones**

- La instancia local de Supabase arriba (`supabase start`) y sembrada
  (`supabase db reset`, que aplica `supabase/seed.sql`).
- Contexto de navegador **sin cookies**, que es lo que Playwright da por omisión
  a cada caso. El caso no debe declarar `storageState`.
- Viewport ancho, 1280 por 900.

**Pasos**

1. Navegar a `/acceso?intent=login`, la dirección que el sitio enlaza.
2. Completar el campo de correo con el valor sembrado y el de contraseña con el
   suyo, los dos importados de `e2e/seeded-account.ts`.
3. Activar el control de envío y esperar a aterrizar en el panel.
4. Navegar a la portada, `/`, que es una ruta pública fuera del panel.
5. Volver a navegar a `/panel`, esta vez escribiendo la dirección.

**Resultado esperado**

- Tras el paso 3, la dirección es exactamente `/panel` y su `search` es
  exactamente la cadena vacía.
- Tras el paso 5, la dirección **sigue siendo** exactamente `/panel`: el segundo
  pedido no fue redirigido al acceso. Es la aserción que sostiene 3.2.
- Tras el paso 5, el `<h1>` del panel está en pantalla. Sin esto, un panel en
  blanco pasaría la aserción de dirección.
- En ningún momento posterior al paso 3 aparece el campo de contraseña: no se
  volvió a pedir ninguna credencial.
- El contexto trae al menos una cookie cuyo nombre empieza en `sb-` (3.1).

**Notas de implementación**

- Los dos literales se importan de `e2e/seeded-account.ts` por ruta relativa
  (`SEEDED_EMAIL`, `SEEDED_PASSWORD`). **No teclearlos en este archivo.**
- Los campos se toman por `input[type="email"]` e `input[type="password"]`, y el
  control por `button[type="submit"]`, que es lo que la pantalla renderiza desde
  T5 y T9.
- Esperar el aterrizaje con un patrón que apunte a `/panel`; **no** usar un glob
  que ya matchee la dirección de partida.
- La ausencia del campo de contraseña se afirma con un conteo cero sobre
  `input[type="password"]`, no con una espera que venza.

---

## CF-01 — Un correo vacío se rechaza como cualquier otro intento fallido

**Tipo:** Fallo
**Traza:** 2.1 (mostrar el mensaje) y 2.3 (no incluir lo tecleado en la
dirección), sobre el estado de partida que 1.4 describe — un correo vacío.

**1.4 NO cuenta como trazado por este caso, y la tabla de resumen se corrigió
para decirlo.** Lo comprobó el healer con la mutación exacta: relajando
`email: z.email()` a `z.string()` en `app/acceso/actions.ts:18`, el correo vacío
llega a Supabase, Supabase lo rechaza, y `app/acceso/actions.ts:85` redirige a la
**misma** `LOGIN_ERROR_HREF`. El caso sigue verde con la validación desarmada, de
modo que no la defiende. No es un defecto que se pueda arreglar acá: es la
consecuencia directa de que 2.2 exija que los dos rechazos sean
indistinguibles. Quien defiende 1.4 es `app/acceso/actions.test.ts`, contando
`createClient` en cero. Lo que este caso sí defiende, comprobado por mutación, es
la dirección: quitar `action={submitAction}` de
`components/sections/AccessScreen.tsx:116` lo tumba, porque el formulario pasaría
a GET y la contraseña terminaría en la barra de direcciones.

**Por qué es un fallo del spec y no uno inventado.** 1.4 lo define palabra por
palabra, y `app/acceso/actions.ts` lo implementa con `CredentialsSchema` antes de
armar el cliente. Ninguna spec de `e2e/` lo ejercita: `CF-01` de
`e2e/acceso.spec.ts` manda un correo **válido** con la contraseña equivocada, que
es el otro camino, el que sí llega a Supabase.

**Lo que este caso NO puede afirmar, y hay que decirlo.** «Sin consultar a
Supabase» no es observable desde un navegador: la única diferencia con un rechazo
de credenciales es que no hubo pedido de red, y eso ya lo afirma
`app/acceso/actions.test.ts` contando `createClient` en cero. Acá se afirma lo
observable: que el intento se rechaza, que aterriza en la misma dirección que
cualquier otro rechazo, y que no arrastra nada de lo tecleado.

**Precondiciones**

- La instancia local arriba y sembrada, igual que CP-01.
- Contexto sin cookies.
- Viewport ancho.

**Pasos**

1. Navegar a `/acceso?intent=login`.
2. Dejar el campo de correo **vacío**.
3. Completar el campo de contraseña con un centinela distintivo, una cadena que
   no aparezca en ninguna otra parte de la página.
4. Activar el control de envío.

**Resultado esperado**

- La dirección final tiene `pathname` exactamente `/acceso` y `search`
  exactamente `?intent=login&error=credenciales`. La igualdad exacta es lo que
  prohíbe cualquier parámetro de más; un «contiene» pasa por casualidad.
- El mensaje de error está visible dentro de la tarjeta. Es el **mismo** texto
  que ve quien se equivoca de contraseña: 1.4 no gana un mensaje propio.
- La dirección completa **no contiene** el centinela del paso 3 (2.3).
- El contexto **no** trae ninguna cookie cuyo nombre empiece en `sb-`: un intento
  rechazado no abre sesión.

**Notas de implementación**

- El campo de correo es `type="email"`, así que el navegador podría bloquear el
  envío por su propia validación nativa. **Comprobarlo al escribir el caso:** si
  el envío no llega al servidor, dejarlo escrito en el reporte en vez de forzarlo
  con `noValidate`, que sería cambiar la implementación desde un test. La
  alternativa dentro del mismo criterio es un correo **malformado pero no vacío**
  que el navegador acepte y `z.email()` rechace.
- El texto del mensaje va como literal, igual que en `e2e/acceso.spec.ts`. Este
  caso **no** verifica 2.4; eso lo hace `app/acceso/page.test.tsx` comparando
  contra `access.login.errorMessage` por referencia.
- Esperar con un patrón que apunte a `error=credenciales`, nunca con
  `**/acceso**`: el formulario postea a la dirección en la que ya está y ese glob
  resuelve antes de la redirección.

---

## CF-02 — Un `error` escrito a mano en la dirección no produce mensaje

**Tipo:** Fallo
**Traza:** 2.5 — WHILE `/acceso` se muestra sin un intento fallido previo THE
SYSTEM SHALL NO mostrar el mensaje de error.

**Por qué es un fallo y no una variante del camino feliz.** El estado de partida
es una dirección inválida: alguien llegó con un parámetro que el sistema nunca
emitió. El comportamiento previsto es degradar mostrando la pantalla limpia, no
fallar ni mostrar un mensaje ajeno. Una pantalla que le cree a la barra de
direcciones convierte la URL en un generador de mensajes de error para terceros.

**Precondiciones**

- Contexto sin cookies. **No hace falta la instancia de Supabase para el
  comportamiento en sí**, pero la suite entera la exige por el `globalSetup`.
- Viewport ancho.

**Pasos**

1. Navegar a `/acceso?intent=login&error=otra-cosa`, un valor que el sistema
   nunca produce.
2. Observar la tarjeta.
3. Navegar a `/acceso?intent=login&error=`, con el parámetro presente y vacío.
4. Observar la tarjeta.

**Resultado esperado**

- En los dos casos, el mensaje de error **no aparece**: no existe el nodo, no
  basta con que esté vacío.
- En los dos casos, y en la misma corrida, el `<h1>` con el título de la pantalla
  **sí** está en pantalla. Sin esa ancla positiva, una página que no renderizó
  nada pasaría las dos aserciones negativas sin implementación de por medio.
- En los dos casos, el campo de contraseña está visible: la pantalla es usable,
  no degradó a nada.

**Notas de implementación**

- La ausencia del mensaje se afirma contra el **elemento**, buscándolo por su
  clase de módulo CSS con un selector de subcadena, no con una búsqueda por
  texto: un párrafo vacío pasaría un `queryByText` nulo sin cumplir el criterio.
- El título se toma por su rol de encabezado de nivel 1, no por un literal.
- No agregar un tercer sub-caso con el parámetro repetido: eso llega como arreglo
  y ya está cubierto en `app/acceso/page.test.tsx`, donde se puede construir el
  `searchParams` a mano.

---

## Huecos de spec detectados

- **1.4 no es observable de punta a punta en su mitad más específica.** El
  criterio dice «sin consultar a Supabase», y desde un navegador un rechazo por
  validación y uno por credenciales son indistinguibles — que es exactamente lo
  que 2.2 pide que sean. La mitad que importa la cubre `app/acceso/actions.test.ts`
  contando `createClient` en cero. No es un defecto del spec: es una consecuencia
  de que 1.4 y 2.2 tiren en direcciones opuestas, y conviene que quede escrito.
- ~~**El spec no dice qué pasa con un correo que el navegador rechaza antes de
  enviar.**~~ **Resuelto al ejecutar (2026-08-18):** el envío con el correo vacío
  **sí llega al servidor**. `components/ui/Field.tsx` no emite `required`, y la
  validación nativa de `type="email"` solo actúa sobre un valor no vacío. No hizo
  falta `noValidate` ni tocar la implementación.
- **La segunda mitad de CP-01 no prueba que exista guardia**, y conviene que
  quede escrito. Lo comprobó el healer: comentando
  `if (!user) redirect(LOGIN_HREF)` en `app/panel/layout.tsx:46-48`, un `/panel`
  abierto a cualquiera satisface igual las dos aserciones de `pathname`, el `<h1>`
  y el conteo cero de campos de contraseña. Lo que CP-01 sí prueba es que la
  sesión **persiste** —cae si se anula `store.set` en
  `lib/supabase/server.ts:35`—. Que el panel vigile lo ancla `CF-02` de
  `e2e/acceso.spec.ts`, y hasta ahora ese acoplamiento no estaba escrito en
  ninguno de los dos archivos.
