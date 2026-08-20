# Tareas — Alta de cuenta contra Supabase local

**Estado:** Ejecutado (2026-08-20)
**Fecha:** 2026-08-19
**Requisitos:** ./requirements.md
**Diseño:** ./design.md

## Resumen de tareas

| ID | Tarea | Requisitos | Estado |
|----|-------|------------|--------|
| T1 | Plantillas del correo con el código a la vista, y la instancia verificada | 7.1, 7.2, 7.3, 5.2, 9.6 | [x] Hecha |
| T2 | Textos de error de los tres pasos en `content/access.ts` y su esquema | 4.3, 8.1, 8.3 | [x] Hecha |
| T3 | `Field`: `name` opcional, `readOnly` y valor inicial | 3.5 | [x] Hecha |
| T4 | `lib/signup/pending-email.ts`: la cookie del correo pendiente | 4.1, 4.2, 4.3 | [x] Hecha |
| T5 | La acción `requestCode`: pide el código y retiene el correo | 1.1, 1.2, 1.3, 1.4, 1.5, 8.2 | [x] Hecha |
| T6 | `/registro` postea a `requestCode` y muestra su error | 6.2, 6.3, 6.4, 8.1, 9.5 | [x] Hecha |
| T7 | La acción `verifyCode`: comprueba el código y abre la sesión | 2.1, 2.2, 2.3, 2.4, 2.5, 4.2, 8.2 | [x] Hecha |
| T8 | `/registro/codigo`: guardia, formulario y error | 4.3, 4.5, 6.2, 6.3, 6.4, 8.1, 9.5 | [x] Hecha |
| T9 | La acción `setPassword`: fija la contraseña de la cuenta en sesión | 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 8.2 | [x] Hecha |
| T10 | `/registro/crear-cuenta`: guardia, eco de solo lectura, formulario y error | 3.5, 4.4, 6.2, 6.3, 6.4, 8.1, 9.5 | [x] Hecha |
| T11 | Sonda del buzón local en el `globalSetup`, y `e2e/mailbox.ts` | 9.3, 9.4 | [x] Hecha |
| T12 | `e2e/registro.spec.ts` reescrito: el alta completa y sus dos fallos | 5.1, 5.2, 9.1, 9.2, 9.3, 9.5, 9.6 | [x] Hecha |
| T13 | El alta entera sin JavaScript en `e2e/no-javascript.spec.ts` | 6.1, 6.2 | [x] Hecha |
| T14 | Tachar el criterio 6.7 en el spec de la landing | — (Relación con los specs anteriores) | [x] Hecha |

## Cobertura de requisitos

| Criterio | Tareas |
|---|---|
| 1.1 | T5 (la llamada), T12 (el correo llega de verdad) |
| 1.2 | T5 |
| 1.3 | T5 (un solo destino), T1 (las dos plantillas, para que ambos casos reciban código) |
| 1.4 | T5 |
| 1.5 | T5 (el destino no lleva el correo), T12 (observado en un navegador real) |
| 2.1 | T7, T12 |
| 2.2 | T7, T12 |
| 2.3 | T7 |
| 2.4 | T7 |
| 2.5 | T7, T12 |
| 3.1 | T9, T12 |
| 3.2 | T9 (el código de error), T10 (el mensaje en pantalla) |
| 3.3 | T9 |
| 3.4 | T9 (un solo camino, sin rama por cuenta previa), T12 (la segunda corrida) |
| 3.5 | T3 (el eco sin `name`), T9 (la cuenta sale de la sesión), T10 |
| 3.6 | T9, T10 (el `<form action>`), T12 |
| 4.1 | T4 |
| 4.2 | T4 (el borrado), T7 (quién lo dispara) |
| 4.3 | T2 (el texto que avisa que hay que pedir un código nuevo), T4 (leer devuelve `undefined`), T8 (la guardia), T12 |
| 4.4 | T10, T12 |
| 4.5 | T8 |
| 5.1 | T12 |
| 5.2 | T1 (`enable_confirmations` verificado), T12 |
| 6.1 | T13 |
| 6.2 | T6, T8, T10 (el mensaje se pinta desde el servidor), T13 |
| 6.3 | T6, T8, T10 |
| 6.4 | T6, T8, T10 (la afirmación por ausencia de `use client`) |
| 7.1 | T1 |
| 7.2 | T1 |
| 7.3 | T1 |
| 8.1 | T2 (los textos y el esquema), T6, T8, T10 (quién los consume) |
| 8.2 | T5, T7, T9 (cada acción agrega sus constantes) |
| 8.3 | T2 |
| 9.1 | T12 |
| 9.2 | T12 |
| 9.3 | T11 (el ayudante), T12 (lo ejerce) |
| 9.4 | T11 |
| 9.5 | T6, T8, T10 (los tres `page.test.tsx`), T12 (`e2e/registro.spec.ts`) |
| 9.6 | T1 (el límite de correos), T12 (la dirección fija y repetible) |

## Orden de ejecución

El orden a respetar es el de **Depende de**, no el numérico. T1, T2, T3, T4, T9
y T11 están libres y pueden tomarse en cualquier orden. De T5 en adelante la
cadena se estrecha, y T12 espera a que las tres pantallas estén conectadas.

**Dos tareas exigen la instancia levantada** (`supabase start` con la base
sembrada): T1, porque las respuestas que resuelve solo se leen contra la
instancia, y T11 por lo mismo. Conviene tomar T1 primero de todo: si el límite
de correos alcanza al buzón local, T12 muere en el tercer envío por una causa
que no tiene nada que ver con el código.

## T1 — Plantillas del correo con el código a la vista, y la instancia verificada

**Requisitos:** 7.1, 7.2, 7.3, 5.2, 9.6
**Depende de:** ninguno

**Descripción:**

Crear `supabase/templates/confirmation.html` y `supabase/templates/magic-link.html`
según el componente `supabase/templates/` de `design.md`, y declararlos en
`supabase/config.toml` bajo `[auth.email.template.confirmation]` y
`[auth.email.template.magic_link]`, cada uno con su `subject` y su
`content_path`.

**Dos archivos y no uno**: Supabase elige plantilla según el caso,
`confirmation` para una dirección sin cuenta previa y `magic_link` para una que
ya la tiene. Arreglar una sola deja sin código a la mitad de la gente, y 7.2
pide que las dos lo traigan. Ambas usan `{{ .Token }}` — no
`{{ .ConfirmationURL }}`, que es el enlace de la plantilla por defecto y que el
spec deja fuera de alcance.

**Los archivos son HTML versionado, no una decisión de diseño visual.** El
correo no tiene requisito de estética; tiene el requisito de que el código se
lea. Texto dentro de HTML alcanza.

**El `content_path` es la trampa, y el archivo de fábrica lo deletrea de dos
formas distintas**: el ejemplo comentado de `[auth.email.template.invite]` dice
`"./supabase/templates/invite.html"` y el de
`[auth.email.notification.password_changed]` dice
`"./templates/password_changed_notification.html"`. Si el prefijo queda mal, el
CLI no se queja: manda la plantilla por defecto, que trae un enlace y ningún
código. Ese es el fallo de 7.1 y es silencioso. De ahí que la verificación de
esta tarea tenga dos mitades.

**Test que falla primero:** una suite de vitest que lea `supabase/config.toml`
como texto y afirme que declara las dos entradas de plantilla, que los dos
`content_path` resueltos desde la raíz del repositorio apuntan a archivos que
existen, y que cada archivo contiene `{{ .Token }}`. Sin dependencia nueva: se
lee con `node:fs` y se compara con expresiones regulares, no hay que parsear
TOML. `lib/og-image.ts` es el molde de un guardián que afirma contra el disco.

Ese test es lo que sostiene 7.3 en el tiempo. La trampa real no es escribir las
plantillas: es que alguien renombre un archivo y el correo vuelva a salir con la
plantilla por defecto sin que nada se queje.

**Segunda mitad: la instancia levantada.** El test de arriba puede quedar verde
con un `content_path` que el CLI resuelve a otra cosa, así que la tarea no se
cierra sin ver un correo entregado de verdad. Y como eso exige `supabase start`
y mandar códigos, la misma sesión de trabajo contesta **dos de los tres
pendientes de verificar** de `design.md`. Por eso T1 va primera de todo, y por
eso esto no son tres ciclos TDD sino el paso de verificación de este: un solo
recorrido de tres correos responde las cuatro preguntas.

El recorrido, contra `/auth/v1/otp` y `/auth/v1/verify` de la instancia con la
clave publicable de `.env` — **no hace falta una línea del código de la app** —,
sobre una dirección de prueba desechable que **no sea
`alumno@crypto-crime.test`**, la cuenta de la que dependen
`e2e/acceso.spec.ts`, `e2e/panel.spec.ts` y `e2e/auth.setup.ts`. Los mensajes se
leen **a mano** en el buzón local (`[local_smtp]`, puerto `55324`); saber si es
Inbucket o Mailpit y escribir el lector programático es T11, acá solo hay que
abrirlo y mirar.

1. **Primer envío**, a una dirección sin cuenta previa: Supabase elige
   `confirmation`. El correo tiene que mostrar el código como texto (7.1). Si
   trae el enlace de fábrica, el `content_path` está mal resuelto: corregirlo
   hasta que el mensaje traiga el código.
2. **Verificar ese código** contra `/auth/v1/verify` y mirar que el usuario que
   vuelve tenga `email_confirmed_at` puesto —o consultarlo en `auth.users`—
   (5.2). Esto contesta el pendiente de **`auth.email.enable_confirmations =
   false`**: gobierna el alta con contraseña, y acá el código *es* la
   confirmación, así que lo esperable es que no haya nada que cambiar. Si
   `email_confirmed_at` no queda puesto, esto deja de ser una verificación y
   pasa a ser un hueco del diseño: **pararse y reportarlo**, no inventar un paso
   de confirmación que el spec no tiene.
3. **Segundo y tercer envío** a esa misma dirección, que ahora ya tiene cuenta y
   está confirmada: Supabase elige `magic_link`, y ese correo también tiene que
   traer el código (7.2). Los tres envíos juntos contestan el pendiente de
   **`auth.rate_limit.email_sent = 2`** (hoy, en el bloque `[auth.rate_limit]`).
   El comentario del propio archivo dice «Requires auth.email.smtp to be
   enabled», y acá el SMTP está comentado. Si los tres llegan, el límite no
   alcanza al buzón local: dejarlo como está y anotarlo en el Decision log, para
   que nadie vuelva a hacerse la pregunta. Si el tercero se rechaza, subirlo con
   un comentario que explique que es para que la suite de punta a punta pueda
   repetirse (9.6). **No confundirlo con `max_frequency = "1s"`**, que es otro
   botón: ese limita el intervalo entre dos envíos, no cuántos por hora.

Las respuestas 2 y 3 no dejan test propio: la primera es una afirmación sobre el
comportamiento de la instancia que solo un recorrido real sostiene, y la segunda
termina, si acaso, en un valor de `config.toml`. Quien las vuelve regresión es
T12, que hace el alta entera y después entra por `/acceso`.

**Criterios de aceptación (trazados desde requirements.md):**

- 7.1 — el correo que entrega la instancia contiene el código como texto
  legible, y no únicamente un enlace de confirmación; observado en el buzón, no
  solo declarado en el archivo.
- 7.2 — el código sale tanto para una dirección sin cuenta como para una que ya
  la tiene, porque las dos plantillas que Supabase puede elegir lo traen, y las
  dos se vieron llegar.
- 7.3 — las dos plantillas son archivos versionados del repositorio, declarados
  en `supabase/config.toml`, y el test falla si un `content_path` deja de
  apuntar a un archivo existente.
- 5.2 — verificado contra la instancia: verificar el código deja la dirección
  con `email_confirmed_at` puesto, sin ningún paso adicional. Si no lo deja, la
  tarea se detiene y se reporta.
- 9.6 — verificado contra la instancia: el límite de correos no impide tres
  envíos seguidos; si impide, queda subido en `config.toml` con su comentario.

**Decision log:**

- **El buzón local es Mailpit**, no Inbucket: `supabase_inbucket_CRYPTO-sinesitlo`
  corre la imagen `public.ecr.aws/supabase/mailpit:v1.30.2` y
  `http://127.0.0.1:55324` contesta con su interfaz. El nombre del contenedor
  conserva «inbucket» por herencia del CLI y es lo que despista. Eso contesta el
  tercer pendiente de `design.md` y desbloquea T11 antes de llegar a ella.
- **`content_path` va con el prefijo `./supabase/templates/…`**, el del ejemplo
  de `[auth.email.template.invite]`. Comprobado por donde importa: GoTrue arranca
  con `GOTRUE_MAILER_TEMPLATES_CONFIRMATION` y
  `GOTRUE_MAILER_TEMPLATES_MAGIC_LINK` apuntando a una URL que sirve Kong, y
  pedirla desde dentro del contenedor de autenticación devuelve los dos archivos
  del repositorio con su `{{ .Token }}`. Con el prefijo corto el CLI no habría
  dicho nada y habría mandado la plantilla de fábrica.
- **`auth.rate_limit.email_sent = 2` no alcanza al buzón local (9.6): queda como
  está.** Tres envíos seguidos a la misma dirección devolvieron `200` y los tres
  correos llegaron con código distinto (853585, 657785, 703299). El comentario
  del propio archivo lo anticipaba —«Requires auth.email.smtp to be enabled»— y
  el SMTP está comentado. No se subió el número: subirlo habría sido tocar
  configuración para un límite que no se ejerce.
- **`enable_confirmations = false` sí interviene, y a favor (5.2).** Deja
  `GOTRUE_MAILER_AUTOCONFIRM=true`, así que Supabase marca la dirección como
  confirmada al **crear** la fila, no al verificar el código:
  `email_confirmed_at` y `created_at` de `sonda-t1@crypto-crime.test` salieron
  con el mismo instante. Verificar el código devolvió `200` con sesión y la
  dirección confirmada, sin ningún paso adicional. No hay hueco de diseño que
  reportar y no se cambió nada.
- **Consecuencia de lo anterior, y es lo único que no se pudo observar tal como
  la tarea lo pedía:** como la cuenta nace confirmada, Supabase la trata como
  existente ya en el primer envío y elige **`magic_link` las tres veces**. La
  plantilla `confirmation` queda dormida con esta configuración. Se conserva
  igual, y no es adorno: es el otro camino que Supabase puede tomar el día que
  `enable_confirmations` se ponga en `true`, y 7.2 pide que las dos traigan el
  código. Que sirve se comprobó por el lado que se podía —Kong la entrega a
  GoTrue con su `{{ .Token }}`—, no por verla llegar al buzón.

**Outcome:**

Hecha. `supabase/templates/confirmation.html` y `supabase/templates/magic-link.html`
versionados y declarados en `supabase/config.toml` bajo
`[auth.email.template.confirmation]` y `[auth.email.template.magic_link]`, ambos
con `{{ .Token }}` y el mismo asunto — el asunto no distingue los dos casos por
la misma razón que las pantallas no los distinguen (1.3).

`supabase/templates.test.ts` es el guardián: ocho casos que leen el TOML como
texto, descartan las líneas comentadas —para no confundir una declaración con el
ejemplo de fábrica—, resuelven cada `content_path` desde la raíz del repositorio
y afirman que el archivo existe y contiene `{{ .Token }}`. Sin dependencia nueva.

Verificado contra la instancia, no solo declarado: el correo llegó a Mailpit con
el código legible como texto (7.1), tres veces seguidas (9.6), y verificarlo dejó
la dirección confirmada con sesión abierta (5.2). `config.toml` no cambió más que
las dos entradas de plantilla.

## T2 — Textos de error de los tres pasos en `content/access.ts` y su esquema

**Requisitos:** 4.3 (solo el texto), 8.1, 8.3
**Depende de:** ninguno

**Descripción:**

Agregar a `content/access.ts`, bajo `signup`, los textos que las tres pantallas
van a pintar cuando el intento se rechace, con la forma que fija `design.md`:

```ts
signup: {
  email:   { …, errorMessage: string, expiredMessage: string },
  code:    { …, errorMessage: string },
  account: { …, errorMessages: { weak: string; generic: string } },
}
```

Son **cinco textos**: dos en el paso 1, uno en el paso 2 y dos en el paso 3.

**Dos mensajes en el paso 3, y la asimetría con el paso 2 es deliberada:** en
los pasos 1 y 2 todo *rechazo* dice lo mismo porque distinguirlos filtraría qué
direcciones están registradas; en el paso 3 el visitante ya probó que el buzón
es suyo, no hay nada que ocultarle, y 3.2 pide nombrar el motivo. `weak` es el
rechazo de la política de contraseña de la instancia y `generic` es todo lo
demás.

**Los dos del paso 1 no son dos formas de decir lo mismo**, y por eso son dos
campos y no uno:

- `errorMessage` es el rechazo del propio paso 1 —correo vacío, malformado, o
  una instancia que no respondió— y no nombra la causa (1.2, 1.3, 1.4).
- `expiredMessage` es el texto de **4.3**: el visitante no se equivocó en nada,
  simplemente llegó al paso 2 sin correo pendiente y hay que devolverlo acá. El
  criterio pide volver al paso 1 **con un mensaje**, no en silencio, y ese
  mensaje tiene que decirle qué hacer: pedir un código nuevo. Aterrizan los dos
  en `/registro`, distinguidos por `?error=correo` y `?error=vencido`
  (`SIGNUP_ERROR_CODE` y `SIGNUP_EXPIRED_CODE` de `design.md`), así que si el
  texto fuera el mismo el criterio quedaría cumplido de mentira.

Extender `SignupEmailSchema`, `SignupCodeSchema` y `SignupAccountSchema` en
`lib/content/schemas.ts` con esos campos —`NonEmpty` los cinco, y
`errorMessages` como un `z.strictObject` de dos claves—. Los esquemas ya son
estrictos, así que un campo mal deletreado va a nombrarse solo.

**Tuteo** (8.3), como todo texto nuevo desde el 2026-08-13. Los dos que cubren
varias causas no pueden nombrar ninguna: `email.errorMessage` tiene que servir
igual para un correo malformado, para una instancia caída y para una dirección
que ya tiene cuenta (1.2, 1.3, 1.4), y `code.errorMessage` para un código
incorrecto, uno vencido y uno ya consumido (2.2).

**Test que falla primero:** en `lib/content/schemas.access.test.ts`, que el
esquema rechace un objeto de paso al que le falte su mensaje —los cinco, uno por
caso— y que el contenido real los traiga. Es la forma que ya tiene T4 del spec
de acceso para `login.errorMessage`. Un caso más, propio de esta tarea: que
`email.errorMessage` y `email.expiredMessage` **no sean el mismo texto**; es lo
único que impide cumplir 4.3 copiando el mensaje de al lado.

**Criterios de aceptación (trazados desde requirements.md):**

- 8.1 — los textos de error de los tres pasos viven en `content/access.ts` y los
  valida `AccessSchema`; ningún componente los deletrea.
- 8.3 — los cinco textos nuevos usan tuteo.
- 4.3 (solo el texto) — existe `email.expiredMessage`, distinto de
  `email.errorMessage`, y le indica al visitante que pida un código nuevo. Quién
  redirige con ese código es T7 y T8; quién lo pinta es T6.

**Decision log:**

- **Los cinco textos, en tuteo y sin nombrar causa donde no corresponde.**
  `email.errorMessage` cubre correo vacío, malformado, instancia caída y
  dirección ya registrada con una sola frase: nombrar cualquiera de esas cuatro
  delataría cuáles direcciones existen (1.3). `code.errorMessage` hace lo mismo
  con incorrecto, vencido y ya usado.
- **`expiredMessage` dice qué hacer, no qué salió mal**, porque en 4.3 no salió
  nada mal: «Tu solicitud caducó. Pide un código nuevo con tu email
  institucional.» El test que exige que los dos textos del paso 1 sean distintos
  es lo único que impide cumplir 4.3 copiando el mensaje de al lado, y es el
  caso que se vio en rojo primero.
- **`errorMessages` es un `z.strictObject` de dos claves y no un `record`.** Una
  tercera clave sería una tercera rama en la acción, y 3.2 pide exactamente
  estas dos.

**Outcome:**

Hecha. Los cinco textos viven en `content/access.ts` bajo `signup`, y
`SignupEmailSchema`, `SignupCodeSchema` y `SignupAccountSchema` los exigen en
`lib/content/schemas.ts`. Diecisiete casos en `lib/content/schemas.access.test.ts`
—seis en rojo antes de escribir el contenido—: que cada paso acepte el contenido
real, que rechace la ausencia de cada mensaje, que rechace uno vacío o de solo
espacios, que el paso 3 tenga exactamente dos motivos, y que los dos del paso 1
no sean el mismo texto.

## T3 — `Field`: `name` opcional, `readOnly` y valor inicial

**Requisitos:** 3.5 (solo el mecanismo)
**Depende de:** ninguno

**Descripción:**

`components/ui/Field.tsx` hoy exige `name` y no sabe pintar un campo de solo
lectura. El eco del paso 3 —la pregunta abierta que `requirements.md` cerró el
2026-08-19— necesita las tres cosas: `name` opcional, `readOnly`, y un valor
inicial que mostrar.

- **`name` opcional** es lo que hace que el navegador **no incluya el campo en
  el envío**. Es la pieza mecánica de 3.5: la cuenta a modificar la identifica
  la sesión, y un campo sin `name` no puede desviar la escritura a otra cuenta.
- **`readOnly`** y no `disabled`: un campo deshabilitado se saltea en la
  navegación por teclado y muchos lectores de pantalla no lo anuncian, con lo
  cual el eco dejaría de cumplir su única función, que es decirle al visitante a
  qué cuenta le está poniendo contraseña.
- El valor va como **`defaultValue`**, no como `value`: `value` sin `onChange`
  convierte el input en un componente controlado y React avisa por consola — y
  este es un componente de servidor, no tiene dónde poner el manejador.

**Lo que se pierde al volver `name` opcional** es el aviso del compilador para
un campo que sí tiene que enviarse: `<Field>` sin `name` deja de ser un error de
tipos y pasa a ser, en silencio, un campo que el navegador no serializa. Las
cuatro llamadas que ya existen —`/acceso`, `/registro`, `/registro/codigo` y
`/registro/crear-cuenta`— conservan el suyo, y de ahí el caso de regresión de
más abajo.

**Sin CSS nueva.** `Field.module.css` no gana ninguna regla. `design.md` dice
que nada visual cambia en estas pantallas y que esta feature no define color,
tipografía ni espaciado nuevos: el eco se ve igual que un campo editable a
propósito, y lo que lo distingue es que no se puede escribir en él, no que se
pinte distinto.

**Test que falla primero:** crear `components/ui/Field.test.tsx` (jsdom por
archivo, con `// @vitest-environment jsdom` en la primera línea, como el resto
de los tests de componente). Los casos: renderizado sin `name`, el input **no
tiene atributo `name`**; con `readOnly`, lo trae; el valor inicial aparece; y el
uso de siempre —con `name`, sin `readOnly`— sigue igual.

**Verificar por mutación** el caso del `name` ausente: es un criterio que se
cumple por ausencia y un test que nunca se vio en rojo no cuenta. Poner un
`name` fijo en el componente y comprobar que ese caso —y solo ese— cae.

**Criterios de aceptación (trazados desde requirements.md):**

- 3.5 (solo el mecanismo) — `Field` acepta que no se le pase `name`, y en ese
  caso el `<input>` **no lleva atributo `name`**: eso es lo que impide que el
  eco del paso 3 se serialice en el envío. Quién identifica la cuenta por la
  sesión es T9; quién monta el eco con este mecanismo es T10.
- Implicado por el diseño («El campo de correo del paso 3») — el campo de solo
  lectura se marca `readOnly` y nunca `disabled`, así que sigue alcanzable por
  teclado y anunciado por un lector de pantalla; sin eso el eco no cumple su
  única función.
- Implicado por el diseño — el valor a mostrar entra por `defaultValue`, con lo
  cual el input no queda controlado y React no avisa por consola.
- Regresión — las cuatro llamadas a `<Field>` que ya existen conservan su
  `name`, sus tests de pantalla siguen en verde y `npm run typecheck` también.

**Decision log:**

- **`name` opcional, `readOnly` y `value` como `defaultValue`**, las tres como
  las pide el diseño. `defaultValue` y no `value` porque un `value` sin
  `onChange` vuelve controlado al input y React avisa por consola — y estos son
  componentes de servidor, sin lugar donde poner el manejador.
- **El caso del `name` ausente pasó en verde sin implementación**, que es
  exactamente lo que la tarea anticipaba: pasar un `name` no declarado deja
  `undefined` y React ya omite el atributo. Verificado por mutación: con
  `name={name ?? "email"}` cayó ese caso **y solo ese** (1 de 4). Sin esa
  comprobación el test no habría probado nada.
- **`readOnly` y nunca `disabled`**, con un caso que afirma las dos cosas: un
  control deshabilitado se saltea en la navegación por teclado y muchos lectores
  de pantalla no lo anuncian, con lo cual el eco dejaría de cumplir su única
  función.
- **Sin CSS nueva**, como fija el diseño: `Field.module.css` no ganó ninguna
  regla.

**Outcome:**

Hecha. `components/ui/Field.tsx` acepta `name?`, `readOnly?` y `value?`, y
`components/ui/Field.test.tsx` cubre los cuatro casos, incluido el de regresión
que sostiene lo que se perdió al volver `name` opcional: el uso de siempre
—con `name`, sin `readOnly`, vacío— sigue igual. Las cuatro llamadas existentes
conservan su `name` y `npm run typecheck` queda limpio.

## T4 — `lib/signup/pending-email.ts`: la cookie del correo pendiente

**Requisitos:** 4.1, 4.2, 4.3
**Depende de:** ninguno

**Descripción:**

Crear el módulo que `design.md` describe, con exactamente esta superficie:

```ts
export const PENDING_EMAIL_COOKIE = "registro_correo";
export async function setPendingEmail(email: string): Promise<void>;
export async function readPendingEmail(): Promise<string | undefined>;
export async function clearPendingEmail(): Promise<void>;
```

Es el único lugar del proyecto que sabe cómo se llama esa cookie, cuánto dura y
con qué atributos se escribe. Los atributos que fija el diseño:

- **`httpOnly`** — es 4.1 literal: la dirección no puede quedar al alcance del
  JavaScript del navegador.
- **`sameSite: "lax"`** y **`secure` fuera de desarrollo**, igual que las
  cookies de sesión que `lib/supabase/server.ts` ya escribe.
- **`path: "/registro"`** — la cookie no se manda a ninguna otra pantalla. Ojo
  con la trampa: **borrar una cookie exige el mismo `path` con el que se
  escribió**, así que `clearPendingEmail` tiene que repetirlo o el borrado de
  4.2 no ocurre.
- **`maxAge` igual al vencimiento del código**, que `supabase/config.toml`
  declara en `auth.email.otp_expiry = 3600`. El número se copia con un
  comentario que diga de dónde sale; no hay forma de leer ese TOML desde acá.

**Test que falla primero:** `lib/signup/pending-email.test.ts`, con un doble de
`next/headers` —el mismo montaje que usa `lib/supabase/server.test.ts`— que
registre lo que se le pide escribir. Los casos: escribir pasa `httpOnly: true` y
`path: "/registro"`; leer devuelve lo escrito; leer sin cookie devuelve
`undefined`; borrar deja `undefined` y usa el mismo `path`.

**Verificar por mutación** el caso de `httpOnly`: sacar el atributo y comprobar
que cae ese caso y solo ese. Un atributo de cookie no se ve en el DOM
renderizado, que es exactamente la situación que el proyecto ya tiene anotada.

**Criterios de aceptación (trazados desde requirements.md):**

- 4.1 — el correo pendiente viaja en una cookie inaccesible al JavaScript del
  navegador.
- 4.2 — existe la operación que la descarta, y borra de verdad (el `path`
  coincide).
- 4.3 — leer sin cookie devuelve `undefined`, que es lo que la guardia de T8 va
  a consultar.

**Decision log:**

- **`maxAge = 3600`, copiado de `auth.email.otp_expiry` con el comentario que
  dice de dónde sale.** No hay forma de leer ese TOML desde `lib/`, así que la
  copia es el piso; lo que evita que se desincronice en silencio es el
  comentario, no un mecanismo.
- **`PATH` es una constante compartida por la escritura y el borrado.** Es la
  trampa que la tarea señalaba: borrar una cookie exige el mismo `path` con el
  que se escribió, y un `clearPendingEmail` que lo olvidara dejaría 4.2 sin
  ocurrir. Hay un caso que afirma justamente eso.
- **El borrado escribe vacío con `maxAge: 0`** en lugar de llamar a un `delete`
  por nombre: el vencimiento es lo que le dice al navegador que la descarte, y
  así el borrado pasa por el mismo objeto de atributos que la escritura.
- **Verificado por mutación el `httpOnly`**: sacándolo cayó ese caso y solo ese
  (1 de 8). Un atributo de cookie no se ve en el DOM renderizado, así que este
  test es el único lugar del proyecto donde 4.1 se puede afirmar.

**Outcome:**

Hecha. `lib/signup/pending-email.ts` expone exactamente la superficie del
diseño y es el único módulo que sabe cómo se llama la cookie, cuánto dura y con
qué atributos se escribe. Ocho casos en `lib/signup/pending-email.test.ts` con
un doble de `next/headers` calcado del de `lib/supabase/server.test.ts`.

## T5 — La acción `requestCode`: pide el código y retiene el correo

**Requisitos:** 1.1, 1.2, 1.3, 1.4, 1.5, 8.2
**Depende de:** T4

**Descripción:**

Crear `app/registro/actions.ts` con `"use server"` en la primera línea y

```ts
export async function requestCode(formData: FormData): Promise<never>;
```

calcada de `app/acceso/actions.ts`, que es el molde: validar con Zod, llamar a
Supabase dentro de un `try` que envuelve **solo** la llamada de red, y redirigir
siempre desde fuera de todo `try`.

- `RequestSchema = z.strictObject({ email: z.email() })`. Leer el campo con un
  acceso explícito —`formData.get("email")`— y no con `Object.fromEntries`: con
  `strictObject`, un campo de más en el formulario haría fallar el alta por algo
  que no tiene nada que ver con el correo.
- Fallo de validación → `redirect(SIGNUP_ERROR_HREF)` **sin consultar a
  Supabase** (1.2). `safeParse` y no `parse`, para que el fallo sea un valor y
  el `redirect` quede fuera de cualquier `catch`.
- `signInWithOtp({ email, options: { shouldCreateUser: true } })`.
  **`shouldCreateUser: true` es la mitad de 1.3**: sin él, una dirección sin
  cuenta recibiría un rechazo y una con cuenta un éxito, y la pantalla estaría
  enumerando qué direcciones existen.
- Error o excepción → `redirect(SIGNUP_ERROR_HREF)`, el mismo destino, sin
  distinguir la causa (1.4).
- Éxito → `await setPendingEmail(email)` y `redirect(SIGNUP_CODE_HREF)`.
- **Ningún destino lleva el correo** (1.5).

Agregar a `lib/routes.ts` (8.2), derivadas de las constantes que ya existen para
que dos deletreos de la misma ruta no puedan discrepar:

```ts
export const SIGNUP_ERROR_CODE = "correo";
export const SIGNUP_ERROR_HREF = `${SIGNUP_HREF}&error=${SIGNUP_ERROR_CODE}`;
```

El `&` y no el `?` porque `SIGNUP_HREF` ya trae `?intent=signup`.

**Test que falla primero:** `app/registro/actions.test.ts`, calcada de
`app/acceso/actions.test.ts`: dobles de `@/lib/supabase/server`,
`next/navigation` y `@/lib/signup/pending-email` armados dentro de `vi.hoisted`,
con un `redirect` que **lanza**, porque un doble que solo retornara dejaría
invisible un `redirect` mal metido en un `try`. Un caso por fila de la tabla de
errores del diseño, más el caso feliz, más la afirmación de que el destino nunca
contiene lo tecleado.

**Verificar por mutación** ese último: meter el correo en el destino y comprobar
que cae solo ese caso.

**Criterios de aceptación (trazados desde requirements.md):**

- 1.1 — un correo bien formado dispara el envío del código y lleva a
  `/registro/codigo`, creando la cuenta si no existía.
- 1.2 — un correo vacío o malformado vuelve a `/registro` con error **sin haber
  llamado a Supabase** (el doble no registra llamada).
- 1.3 — el destino y el camino son idénticos exista o no la cuenta.
- 1.4 — un rechazo o una excepción de Supabase terminan en el mismo destino que
  cualquier otro fallo.
- 1.5 — ni el éxito ni el rechazo llevan la dirección en el destino.
- 8.2 — la dirección de fallo y su código viven en `lib/routes.ts`.

**Decision log:**

- **Calcada de `app/acceso/actions.ts`**, con la misma disciplina: `safeParse`,
  el `try` envolviendo solo la llamada de red, y los tres `redirect` fuera de
  todo `try` porque `redirect` señala lanzando y un `catch` se lo comería.
- **`setPendingEmail` va después de la llamada, no antes.** Retener la dirección
  para un envío que falló sería mentir sobre lo que hay: el paso 2 verificaría
  contra una dirección a la que nunca salió un código.
- **Un caso propio para el campo de más.** Leer con `formData.get("email")` y no
  con `Object.fromEntries` es lo que evita que un `intent` en el formulario haga
  fallar el alta por algo que no tiene que ver con el correo; el caso lo afirma
  en vez de dejarlo en el comentario.
- **Verificado por mutación** el destino que no lleva el correo: metiéndolo en la
  URL cayó ese caso junto a los tres que afirman el destino literal — el
  esperado, y ninguno de los negativos quedó verde.

**Outcome:**

Hecha. `app/registro/actions.ts` con `requestCode`, y `SIGNUP_ERROR_CODE` /
`SIGNUP_ERROR_HREF` derivadas de `SIGNUP_HREF` en `lib/routes.ts` (8.2).
Diecisiete casos en `app/registro/actions.test.ts`: el feliz con
`shouldCreateUser: true` afirmado explícitamente, las dos filas de la tabla de
errores, tres formas de correo malformado que no llegan a construir cliente, el
campo de más, y el par que muestra que una dirección con cuenta y una sin cuenta
terminan en el mismo lugar.

## T6 — `/registro` postea a `requestCode` y muestra su error

**Requisitos:** 6.2, 6.3, 6.4, 8.1, 9.5
**Depende de:** T2, T5

**Descripción:**

`app/registro/page.tsx` deja de ser maqueta. Cambia lo mínimo:

- `submitHref={SIGNUP_CODE_HREF}` pasa a `submitAction={requestCode}`.
  `AccessScreen` ya tiene ese tercer modo desde el spec de acceso, así que
  **nada visual cambia** y no se define ningún color, tipografía ni espaciado
  nuevo.
- La página pasa a ser `async` y recibe `searchParams`, con la misma forma ancha
  que `app/acceso/page.tsx` declara —`Promise<Record<string, string | string[] |
  undefined>>`— y por la misma razón: `tsconfig.json` incluye `.next/types/**`,
  donde Next genera la comprobación de props de ruta, y una forma angostada a
  mano choca ahí aunque `tsc --noEmit` pase antes de que esos tipos existan.
- `error === SIGNUP_ERROR_CODE ? access.signup.email.errorMessage : undefined`.
  La comparación es exacta: un valor distinto, uno vacío, o el parámetro
  repetido —que llega como arreglo y falla la comparación contra un string—
  significan que nadie tuvo un intento rechazado.
- Actualizar el comentario del módulo, que hoy explica que la pantalla no envía
  nada porque 6.7 lo prohíbe. Deja de ser cierto.

**Invertir `app/registro/page.test.tsx` (9.5).** No se rompe por accidente: se
da vuelta a propósito. Lo que hoy afirma «no hay `<form>` ni `<button>`» y busca
un `link` con el rótulo del control pasa a afirmar que hay un `<form>`, que su
control es un `<button type="submit">`, y que ya no hay ancla con ese rótulo.
Los casos que no hablan de la maqueta —la etiqueta asociada al campo, el único
campo, el `noindex`— se dejan como están.

**Conservar la afirmación por ausencia** de `use client`, `useState`,
`useEffect`, `addEventListener`, `IntersectionObserver` y `onClick` sobre el
fuente (6.4). Ojo con la trampa que ya costó una vez en T17 de la landing: **un
comentario que menciona la palabra prohibida hace fallar el test**, así que hay
que quitar comentarios antes de afirmar.

Dos casos nuevos: con `?error=correo` el mensaje de `content/access.ts` aparece
(6.2, 8.1); sin él, no hay nodo de error en absoluto.

**Criterios de aceptación (trazados desde requirements.md):**

- 6.2 — con el parámetro de error presente, el mensaje está en el HTML que el
  servidor emite, sin script de por medio.
- 6.3 — el envío es un `<form>` que postea a la Server Action, no una navegación
  por script.
- 6.4 — el fuente no contiene ninguna de las marcas de componente de cliente.
- 8.1 — el texto sale de `content/access.ts`; la página no lo deletrea.
- 9.5 — las afirmaciones que describían la maqueta quedaron reemplazadas, no
  eliminadas.

**Decision log:**

- **La pantalla pinta dos mensajes, no uno.** `?error=correo` trae
  `email.errorMessage` y `?error=vencido` trae `email.expiredMessage`, que es
  donde aterriza la guardia de 4.3. Si la página solo conociera el primero, el
  criterio quedaría cumplido a medias: la redirección ocurriría y el visitante no
  vería nada.
- **Los tests se invirtieron, no se borraron.** «No hay `<form>` ni `<button>`»
  pasó a afirmar el `<form>` y el `<button type="submit">`, y se agregó que ya
  **no** existe ancla con el rótulo del control — que la maqueta se haya ido, y
  no solo que el formulario esté.
- **La afirmación por ausencia recorre el directorio** en lugar de nombrar un
  archivo, así que ahora alcanza también a `actions.ts` y seguirá alcanzando a lo
  que se agregue. Se quitan comentarios antes de afirmar, por la trampa de T17 de
  la landing.
- **Un caso nuevo de regresión por T3:** que el campo de correo conserve su
  `name`. Volver `name` opcional quitó el aviso del compilador, y esta es la
  pantalla donde el correo **sí** tiene que viajar.

**Outcome:**

Hecha. `app/registro/page.tsx` pasa `submitAction={requestCode}`, es `async` y
recibe `searchParams` con la forma ancha que exige `.next/types/**`. Quince
casos en `app/registro/page.test.tsx`, con el doble de la acción que hace falta
porque React escribe un centinela `javascript:throw …` en el `action` del
formulario y el DOM no puede decir a qué función postea.

## T7 — La acción `verifyCode`: comprueba el código y abre la sesión

**Requisitos:** 2.1, 2.2, 2.3, 2.4, 2.5, 4.2, 8.2
**Depende de:** T4

**Descripción:**

Crear `app/registro/codigo/actions.ts` con

```ts
export async function verifyCode(formData: FormData): Promise<never>;
```

Misma disciplina que T5. Lo propio de este paso:

- `VerifySchema = z.strictObject({ code: z.string().min(1) })`. Campo vacío →
  `redirect(SIGNUP_CODE_ERROR_HREF)` sin consultar a Supabase (2.3).
- **El correo sale de `readPendingEmail()`, nunca del formulario**: es la única
  dirección para la que ese código vale.
- `verifyOtp({ email, token, type: "email" })`. **La comprobación se delega
  entera** (2.4): la acción no compara el código, no lo guarda y no lo registra.
- Éxito → la sesión la escriben en cookies los adaptadores de
  `lib/supabase/server.ts`, sin que esta acción tenga que hacer nada; después
  `await clearPendingEmail()` (4.2) y `redirect(SIGNUP_ACCOUNT_HREF)`.
- Rechazo o excepción → `redirect(SIGNUP_CODE_ERROR_HREF)`, **un solo mensaje
  para los tres casos** de 2.2 (incorrecto, vencido, ya consumido), y sin abrir
  sesión.
- **Ningún destino lleva el código ni el correo** (2.5).

**Caso que la tabla de errores de `design.md` no lista, y hay que decidir acá:**
un pedido a la acción **sin correo pendiente** —cookie vencida entre que se
pintó la pantalla y se envió el formulario—. Redirige a `SIGNUP_HREF`, sin
código de error, que es exactamente lo que hace la guardia de 4.3: el visitante
no hizo nada mal, simplemente ya no hay nada que verificar. Es una consecuencia
directa de 4.3, no un criterio nuevo; queda anotado por si alguien lo busca en
la tabla del diseño y no lo encuentra.

Agregar a `lib/routes.ts` (8.2):

```ts
export const SIGNUP_CODE_ERROR_CODE = "codigo";
export const SIGNUP_CODE_ERROR_HREF = `${SIGNUP_CODE_HREF}?error=${SIGNUP_CODE_ERROR_CODE}`;
```

Acá sí `?`, porque `SIGNUP_CODE_HREF` no trae parámetros.

**Test que falla primero:** `app/registro/codigo/actions.test.ts`, mismo montaje
de dobles que T5. Casos: el feliz —`verifyOtp` recibe el correo de la cookie y
el código del formulario, la cookie se borra, el destino es
`/registro/crear-cuenta`—; código vacío sin llamada a Supabase; rechazo;
excepción; sin correo pendiente; y que ningún destino contenga el código.

**Criterios de aceptación (trazados desde requirements.md):**

- 2.1 — el código correcto abre sesión y lleva a `/registro/crear-cuenta`.
- 2.2 — los tres modos de fallo terminan en el mismo destino, sin sesión.
- 2.3 — el campo vacío se rechaza sin consultar a Supabase.
- 2.4 — la acción no compara ni retiene el código: solo se lo pasa a Supabase.
- 2.5 — ningún destino contiene el código ni el correo pendiente.
- 4.2 — verificado el código, el correo pendiente se descarta.
- 8.2 — la dirección de fallo y su código viven en `lib/routes.ts`.

**Decision log:**

- **La guardia de la cookie corre antes de validar el campo, y es una decisión.**
  Sin correo pendiente el código no se puede comprobar contra nada, diga lo que
  diga: «pedí uno nuevo» es el único consejo que sirve, y rechazar primero el
  campo diría algo cierto e inútil. Hay un caso que fija ese orden —campo vacío
  *y* cookie ausente aterrizan en el vencimiento.
- **El destino de ese caso es `SIGNUP_EXPIRED_HREF`, no `SIGNUP_HREF` pelado.**
  La descripción de esta tarea decía «sin código de error», pero `design.md` y
  T2 piden lo contrario y 4.3 lo dice literal: «con un mensaje». Un
  `SIGNUP_HREF` sin marcador dejaría `expiredMessage` sin nadie que lo pinte y
  el criterio cumplido de mentira. Se siguió el diseño.
- **La cookie sobrevive a un rechazo**, y hay un caso por cada forma de rechazo
  que lo afirma. Borrarla ahí mandaría el siguiente intento al camino del
  vencimiento, así que un dígito mal tecleado le costaría al visitante el código
  que ya tiene en el buzón.
- **La acción no compara nada** (2.4): le pasa el código a `verifyOtp` y ninguna
  rama mira el `code` del error, que es lo que hace que incorrecto, vencido y ya
  usado sean indistinguibles.

**Outcome:**

Hecha. `app/registro/codigo/actions.ts` con `verifyCode`, y
`SIGNUP_CODE_ERROR_CODE` / `SIGNUP_CODE_ERROR_HREF` en `lib/routes.ts` — con `?`
y no `&`, porque el paso 2 no es entrada del flujo y no declara intención.
Dieciocho casos en `app/registro/codigo/actions.test.ts`.

## T8 — `/registro/codigo`: guardia, formulario y error

**Requisitos:** 4.3, 4.5, 6.2, 6.3, 6.4, 8.1, 9.5
**Depende de:** T2, T7

**Descripción:**

`app/registro/codigo/page.tsx` deja de ser maqueta, con lo mismo que T6
—`submitAction={verifyCode}`, `searchParams`, el mensaje pintado solo cuando el
parámetro vale exactamente `SIGNUP_CODE_ERROR_CODE`— más una pieza que las otras
dos pantallas no tienen del mismo modo:

**La guardia corre en la página, antes de renderizar** (4.3), no en la acción.
`await readPendingEmail()`; si es `undefined`, `redirect(SIGNUP_HREF)` antes de
emitir cualquier marca. Es el mismo lugar y la misma forma que la guardia de
`app/panel/layout.tsx`.

**El control de reenvío no cambia** (4.5): sigue siendo el `FieldAction` que
apunta a `SIGNUP_HREF`, y ahí es donde el visitante puede pedir otro código.
Reenviar sin moverse de pantalla está declarado fuera de alcance, así que esta
tarea **no** agrega una cuarta acción. El test que hoy afirma ese enlace se
conserva tal cual: no describe la maqueta, describe una decisión vigente.

**Invertir `app/registro/codigo/page.test.tsx` (9.5):** lo que hoy afirma «no
hay `<form>` ni `<button>`» y busca un `link` con el rótulo `Verificar` pasa a
afirmar el `<form>` y el `<button type="submit">`. Conservar el campo `text` con
`inputMode="numeric"` —un código es una cadena de dígitos, y `number` traería
spinner, agrupación por configuración regional y pérdida del cero inicial— y la
afirmación por ausencia de `use client` sobre el fuente, con la precaución de
los comentarios.

Casos nuevos: sin correo pendiente la página redirige (4.3, con un doble de
`readPendingEmail` y otro de `redirect`); con `?error=codigo` aparece el mensaje
de `content/access.ts` (6.2, 8.1).

**Criterios de aceptación (trazados desde requirements.md):**

- 4.3 — un pedido sin correo pendiente termina en `/registro`, y la redirección
  ocurre antes de que se emita marca alguna.
- 4.5 — el control de reenvío lleva al paso 1.
- 6.2 — el mensaje de error viene en el HTML del servidor.
- 6.3 — el envío es un `<form>` que postea.
- 6.4 — el fuente no contiene marcas de componente de cliente.
- 8.1 — el texto sale de `content/access.ts`.
- 9.5 — las afirmaciones de la maqueta quedaron reemplazadas.

**Decision log:**

- **La guardia vive en la página y se prueba con un `redirect` que lanza.** Es
  lo que distingue «redirige» de «redirige antes de emitir marca»: si corriera
  tarde, el render terminaría y el caso resolvería en vez de rechazar. Hay
  además un caso que afirma que no quedó ni encabezado ni campo.
- **El control de reenvío y su test se conservaron tal cual.** No describen la
  maqueta: describen una decisión vigente (4.5), y reenviar sin moverse de
  pantalla sigue fuera de alcance. No se agregó una cuarta acción.
- **Se conservó también el campo `text` con `inputMode="numeric"`**, con su
  caso: un código es una cadena de dígitos, y `number` traería spinner,
  agrupación por configuración regional y pérdida del cero inicial.

**Outcome:**

Hecha. `app/registro/codigo/page.tsx` con la guardia de 4.3, `submitAction={verifyCode}`
y el mensaje pintado solo cuando el parámetro vale exactamente el marcador.
Diecisiete casos en `app/registro/codigo/page.test.tsx`, con tres dobles: la
acción, `readPendingEmail` y `redirect`.

## T9 — La acción `setPassword`: fija la contraseña de la cuenta en sesión

**Requisitos:** 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 8.2
**Depende de:** ninguno

**Descripción:**

Crear `app/registro/crear-cuenta/actions.ts` con

```ts
export async function setPassword(formData: FormData): Promise<never>;
```

- `PasswordSchema = z.strictObject({ password: z.string().min(1) })`. **No
  restata la política de contraseña de Supabase** (3.3): un largo mínimo acá
  solo produciría un segundo rechazo para el mismo resultado, y uno que se
  desincroniza el día que `minimum_password_length` cambie en `config.toml`. Es
  la misma decisión que ya tomó `CredentialsSchema`.
- **Lee únicamente `password` del formulario** (3.5). La cuenta la identifica la
  sesión, vía `updateUser({ password })`. Que el eco del paso 3 no tenga `name`
  ya evita que viaje, pero la acción no depende de eso: aunque llegara una
  dirección posteada, no hay código que la lea.
- Éxito → `redirect(PANEL_HREF)` (3.1).
- Rechazo por contraseña débil → destino con el código `weak`; cualquier otro
  rechazo, excepción, o contraseña vacía → destino con el código `generic`
  (3.2). Distinguir el motivo acá es seguro y deseable: el visitante ya probó
  que el buzón es suyo, no hay nada que ocultarle, y un mensaje genérico lo deja
  adivinando qué corregir.
- **Un solo camino, sin rama por cuenta previa** (3.4): la acción no consulta si
  la cuenta ya existía; `updateUser` reemplaza la contraseña anterior si la
  había. Vale la pena un caso de test que afirme que no hay tal consulta, porque
  es el criterio que más tienta a agregar una.
- La contraseña no aparece en ningún destino (3.6).

Cómo se reconoce el rechazo por débil: `updateUser` devuelve un `AuthError` con
`code`, y el que corresponde es `weak_password`. **Comprobarlo contra la
instancia** antes de fijar la comparación —una contraseña de cinco caracteres
contra `minimum_password_length = 6`— y anotar en el Decision log lo que
devuelve de verdad. Si no hay forma estable de distinguirlo, todo va a `generic`
y eso es un hueco a reportar, no algo a inventar.

Agregar a `lib/routes.ts` (8.2), extendiendo lo que fija el diseño con las dos
direcciones derivadas, para que la acción no deletree la ruta:

```ts
export const SIGNUP_ACCOUNT_ERROR_CODES = { weak: "debil", generic: "error" } as const;
```

más las dos direcciones `${SIGNUP_ACCOUNT_HREF}?error=<código>`.

**Test que falla primero:** `app/registro/crear-cuenta/actions.test.ts`, mismo
montaje de dobles. Casos: el feliz; contraseña vacía sin llamada a Supabase;
rechazo por débil con su código; rechazo por otra causa con `generic`;
excepción; que `updateUser` reciba **solo** la contraseña; y que ningún destino
contenga la contraseña.

**Verificar por mutación** ese último y el de «solo la contraseña».

**Criterios de aceptación (trazados desde requirements.md):**

- 3.1 — una contraseña que Supabase acepta queda fijada y el visitante llega a
  `/panel`.
- 3.2 — el rechazo vuelve a `/registro/crear-cuenta` con el código que nombra el
  motivo.
- 3.3 — la acción no impone reglas propias de largo ni de composición.
- 3.4 — no hay rama por cuenta preexistente; el mismo camino la reemplaza.
- 3.5 — la cuenta sale de la sesión; el formulario solo aporta la contraseña.
- 3.6 — la contraseña viaja en el cuerpo y no aparece en ningún destino.
- 8.2 — los códigos y las direcciones viven en `lib/routes.ts`.

**Decision log:**

- **`weak_password` comprobado contra la instancia, no supuesto.** Una
  contraseña de cinco caracteres contra `minimum_password_length = 6` devuelve
  `422` con `{"error_code":"weak_password","msg":"Password should be at least 6
  characters."}`, y `@supabase/auth-js` 2.112.3 mapea `error_code` a `.code`
  (`dist/main/lib/fetch.js`). La comparación quedó fijada contra esa constante.
- **Una contraseña vacía va a `generic` y nunca a `weak`.** No se juzgó nada, así
  que no hay nada que nombrar: llamarla «demasiado débil» sería que esta acción
  invente un veredicto que solo la instancia puede emitir.
- **Hallazgo, y afecta al alta como recuperación:** Supabase también rechaza con
  `422 same_password` una contraseña **idéntica a la vigente**. Cae en `generic`,
  que es honesto y consistente con 3.3 —la política es de la instancia—, pero
  significa que quien use el alta para recuperar acceso y teclee su contraseña de
  siempre va a leer «No pudimos guardar tu contraseña». Queda anotado; no se
  agregó una rama para eso porque 3.2 pide dos motivos y este spec no lo lista.
- **Verificado por mutación dos veces.** Leyendo el correo del formulario cayeron
  los tres casos de 3.5; metiendo la contraseña en el destino cayeron los tres de
  3.6. Ninguna de las dos dejó la suite verde.

**Outcome:**

Hecha. `app/registro/crear-cuenta/actions.ts` con `setPassword`, y
`SIGNUP_ACCOUNT_ERROR_CODES` más sus dos direcciones derivadas en `lib/routes.ts`.
Catorce casos en `app/registro/crear-cuenta/actions.test.ts`, incluido el que
afirma que el cliente construido expone **solo** `updateUser`: es la forma de
decir que no hay consulta previa por cuenta preexistente (3.4), que es el
criterio que más tienta a agregar una.

## T10 — `/registro/crear-cuenta`: guardia, eco de solo lectura, formulario y error

**Requisitos:** 3.5, 4.4, 6.2, 6.3, 6.4, 8.1, 9.5
**Depende de:** T2, T3, T9

**Descripción:**

`app/registro/crear-cuenta/page.tsx` deja de ser maqueta. Es la pantalla que más
cambia de las tres:

- **Guardia antes de renderizar** (4.4): `createClient()` y `getUser()` —nunca
  `getSession()`, que le cree a la cookie—; sin usuario, `redirect(SIGNUP_HREF)`
  antes de emitir marca. Misma forma que `app/panel/layout.tsx`.
- **El campo de correo pasa a ser eco de solo lectura**: mismo `Field`, con el
  valor que devolvió `getUser()` —la misma llamada que la guardia ya hizo, así
  que el eco no cuesta un viaje extra—, `readOnly` y **sin `name`**. Se conserva
  porque sin él la pantalla pediría una contraseña sin decir para quién, y no se
  deja editable porque un campo que se puede cambiar y que el servidor ignora es
  una mentira sobre lo que hace la pantalla.
- El campo de contraseña se queda igual, con `autoComplete="new-password"`.
- `submitAction={setPassword}` en lugar del botón inerte, `searchParams`, y el
  mensaje que corresponde al código recibido: `weak` y `generic` mapean a los
  dos textos de `account.errorMessages`; cualquier otro valor, a ninguno.

**Invertir `app/registro/crear-cuenta/page.test.tsx` (9.5):** lo que hoy afirma
«no hay `<form>`» y «el control es `type="button"` sin destino» pasa a afirmar
el `<form action>` y el `<button type="submit">`. Actualizar también el
comentario del módulo, que hoy explica que el control es inerte porque no hay
backend.

Casos nuevos: sin sesión la página redirige (4.4); el campo de correo **no tiene
atributo `name`** y sí `readonly`, y muestra el correo de la sesión (3.5); con
cada uno de los dos códigos aparece su mensaje (6.2, 8.1); el fuente sigue sin
marcas de cliente (6.4).

**Verificar por mutación** el caso del `name` ausente en la página, además del
que T3 hizo sobre el componente: son dos afirmaciones distintas —que `Field`
sepa omitirlo, y que esta pantalla lo omita— y solo la segunda protege 3.5 acá.

**Criterios de aceptación (trazados desde requirements.md):**

- 3.5 — el eco no se envía: el input no tiene `name`, y el valor que muestra
  sale de la sesión.
- 4.4 — un pedido sin sesión vigente termina en `/registro`, antes de emitir
  marca.
- 6.2 — los dos mensajes de error vienen en el HTML del servidor.
- 6.3 — el envío es un `<form>` que postea.
- 6.4 — el fuente no contiene marcas de componente de cliente.
- 8.1 — los dos textos salen de `content/access.ts`.
- 9.5 — las afirmaciones de la maqueta quedaron reemplazadas.

**Decision log:**

- **El eco sale de la misma llamada que la guardia.** `getUser()` se llama una
  vez y su respuesta sirve para dejar pasar y para pintar la dirección, así que
  mostrarla no cuesta un viaje extra.
- **`getUser()` y nunca `getSession()`**, con un caso que lo afirma por la
  superficie del cliente construido: el segundo le cree a la cookie, y en el
  servidor una cookie es entrada del visitante.
- **Verificado por mutación el `name` ausente en esta pantalla**, aparte del que
  T3 hizo sobre el componente: poniéndole `name="email"` al eco cayeron dos
  casos —el del atributo y el que afirma que el envío lleva **solo**
  `password`—, que son las dos caras de 3.5. Solo el segundo prueba que el
  criterio se cumple de punta a punta.
- **El test del envío afirma `[...formData.keys()]` completo** y no solo que
  `email` sea nulo: una clave de más quedaría invisible si se preguntara campo por
  campo.

**Outcome:**

Hecha. `app/registro/crear-cuenta/page.tsx` con la guardia de 4.4, el eco de
solo lectura sin `name`, `submitAction={setPassword}` y los dos mensajes.
Veinte casos en `app/registro/crear-cuenta/page.test.tsx`.

## T11 — Sonda del buzón local en el `globalSetup`, y `e2e/mailbox.ts`

**Requisitos:** 9.3, 9.4
**Depende de:** ninguno

**Descripción:**

Esta es la tarea que resuelve el **tercer pendiente de verificar** de
`design.md`: si el buzón local es Inbucket o Mailpit. La API para listar
mensajes cambió entre uno y otro y nada se puede escribir sin saberlo. Dato de
terreno: `supabase/config.toml` declara el bloque como `[local_smtp]` con
`port = 55324`, que es el nombre que el CLI usa desde que reemplazó Inbucket —
pero eso es un indicio, no la respuesta. **Mirar qué corre de verdad** (el
contenedor levantado, y qué contesta `http://127.0.0.1:55324`) antes de escribir
una línea.

Dos piezas, que van juntas porque la segunda necesita saber lo mismo que la
primera:

**1. `e2e/mailbox.ts`** — el ayudante que `design.md` describe:

```ts
export const MAILBOX_URL: string;          // 127.0.0.1:55324, literal estático
export const SIGNUP_ADDRESS: string;       // dirección fija de prueba
export async function readLatestCode(address: string): Promise<string>;
```

**Literales estáticos, sin `.env`**, por la misma razón que
`e2e/seeded-account.ts`: Playwright no lee ese archivo ni puede importar
TypeScript dinámicamente.

`SIGNUP_ADDRESS` tiene que ser **distinta de la cuenta sembrada**
(`alumno@crypto-crime.test`), o la prueba de alta le cambiaría la contraseña a
la cuenta de la que dependen `e2e/acceso.spec.ts`, `e2e/panel.spec.ts` y
`e2e/auth.setup.ts`. Es un efecto colateral silencioso: esas suites empezarían a
fallar por «credenciales inválidas» sobre credenciales correctas.

`readLatestCode` tiene que leer **el último** correo de esa dirección, no el
primero: 9.6 pide que la prueba se pueda repetir sin preparar la base, y a la
segunda corrida el buzón ya tiene el código de la primera.

**2. `lib/mailbox/health.ts`** con `assertMailboxIsUp(baseUrl)`, calcada de
`lib/supabase/health.ts`: `fetch` con `AbortSignal.timeout`, y un error que
**nombre el buzón** y diga cómo levantarlo. Vive en `lib/` y no en `e2e/` por lo
mismo que la otra: `tsconfig.json` excluye `e2e/`, así que un módulo con lógica
ahí nunca se comprobaría de tipos ni se podría probar con vitest.

`playwright.global-setup.ts` la llama después de `assertSupabaseIsUp`,
pasándole `MAILBOX_URL` importado de `e2e/mailbox.ts` —igual que hoy le pasa
`supabaseEnv.url` a la otra—. Ojo: ese `import` arrastra `e2e/mailbox.ts` dentro
de lo que `tsc` comprueba aunque el directorio esté excluido, porque `exclude`
solo gobierna qué archivos son raíz, no qué se sigue desde una raíz. Es una
mejora, no un problema; anotarlo.

**Test que falla primero:** `lib/mailbox/health.test.ts`, calcada de
`lib/supabase/health.test.ts`: un `fetch` doble que no responde, uno que
responde con estado de error, y uno sano.

**`readLatestCode` no tiene test de vitest** y no se le va a inventar uno: vive
en `e2e/`, habla con un servicio que solo existe con Docker arriba, y quien lo
ejerce de verdad es T12. Esta tarea cierra 9.4 con un test; 9.3 queda abierta
hasta que T12 corra.

**Verificar por mutación** la sonda: apuntar `MAILBOX_URL` a un puerto muerto y
comprobar que `npm run test:e2e` aborta con el mensaje del buzón y **cero casos
ejecutados**, no con una suite entera en rojo. Es el mismo comportamiento que
T12 del spec de acceso dejó para la instancia.

**Criterios de aceptación (trazados desde requirements.md):**

- 9.3 — existe el ayudante que lee el código del buzón; ni la suite ni la
  configuración lo conocen de antemano.
- 9.4 — con el buzón caído, la suite de punta a punta aborta con un mensaje que
  nombra esa causa.

**Decision log:**

- **Es Mailpit**, y era el tercer pendiente de `design.md`. El contenedor se
  llama `supabase_inbucket_CRYPTO-sinesitlo` por herencia del CLI pero corre
  `public.ecr.aws/supabase/mailpit:v1.30.2`. Mirado antes de escribir una línea,
  como pedía la tarea: el nombre del contenedor era el indicio equivocado.
- **`readLatestCode` usa `/api/v1/search?query=to:<dirección>`**, que devuelve el
  más reciente primero — lo que 9.6 exige, porque en la segunda corrida el buzón
  ya tiene el código de la primera. Sondea hasta 10 s porque el envío es
  asíncrono: la acción vuelve apenas Supabase acepta el pedido, y el mensaje
  aterriza un instante después.
- **Lee la parte de texto plano antes que la HTML**: la HTML envuelve los dígitos
  en marcas y una etiqueta suelta entre ellos rompería la expresión regular.
- **La sonda pregunta por `/api/v1/info` y no por `/`.** La raíz la sirve un
  servidor de archivos estáticos y contestaría 200 con la API rota, que es
  justamente el caso que esta sonda existe para separar de un defecto.
- **Verificado por mutación:** con `MAILBOX_URL` apuntando a 55399,
  `npm run test:e2e` aborta en el `globalSetup` con «The local mailbox is not
  answering at http://127.0.0.1:55399…» y **cero casos ejecutados**, no con una
  suite entera en rojo.
- **Confirmado el efecto secundario que la tarea anticipaba:** importar
  `e2e/mailbox.ts` desde `playwright.global-setup.ts` mete ese archivo en lo que
  `tsc` comprueba aunque `tsconfig.json` excluya el directorio, porque `exclude`
  gobierna qué archivos son raíz y no qué se sigue desde una raíz.

**Outcome:**

Hecha. `lib/mailbox/health.ts` con `assertMailboxIsUp`, sus cuatro casos en
`lib/mailbox/health.test.ts`, `e2e/mailbox.ts` con `MAILBOX_URL`,
`SIGNUP_ADDRESS`, `readLatestCode` y —agregados en T12— `freshPassword` y
`respectSendFrequency`. `playwright.global-setup.ts` llama a la sonda después de
`assertSupabaseIsUp`: primero la instancia, porque un Docker apagado se lleva las
dos y la instancia es lo más útil que te pueden decir.

## T12 — `e2e/registro.spec.ts` reescrito: el alta completa y sus dos fallos

**Requisitos:** 5.1, 5.2, 9.1, 9.2, 9.3, 9.5, 9.6
**Depende de:** T6, T8, T10, T11

**Descripción:**

`e2e/registro.spec.ts` hoy describe las maquetas: camina los tres pasos por
ancla y afirma que crear la cuenta «no lleva a ninguna parte». Todo eso deja de
ser cierto y se reemplaza (9.5).

Los tres casos que `design.md` pide que existan, con los identificadores que el
proyecto usa en los títulos:

- **CP-01 — el alta completa.** Ir a `/registro`, teclear `SIGNUP_ADDRESS`,
  enviar; leer el código del buzón con `readLatestCode` (9.3); teclearlo y
  enviar; elegir una contraseña y enviar; aterrizar en `/panel`. Y después
  **descartar las cookies del contexto y volver a entrar por `/acceso`** con esa
  dirección y esa contraseña, que es lo que cierra 5.1 — y de paso 5.2, porque
  una dirección sin confirmar no podría iniciar sesión.
- **CF-01 — un código incorrecto.** Pedir el código, teclear uno que no es, y
  aterrizar en `/registro/codigo?error=codigo` **exacto**: sin el código y sin
  el correo en la barra de direcciones (2.5).
- **CF-02 — un paso sin su precondición.** Ir directo a `/registro/crear-cuenta`
  sin sesión y terminar en `/registro` (4.4). El mismo caso vale para
  `/registro/codigo` sin correo pendiente (4.3).

Cuidados concretos, todos ya pagados en este repositorio:

- **La dirección de prueba es fija y la corrida no prepara la base** (9.6). La
  segunda corrida encuentra la cuenta que dejó la primera y, por 3.4, hace
  exactamente lo mismo: le fija la contraseña de nuevo. Si la suite necesitara
  `supabase db reset` entre corridas, 9.6 no se cumplió.
- **El límite de peticiones de Supabase se disfraza de credenciales inválidas.**
  Ya está anotado para el acceso —30 inicios cada 5 minutos— y acá se suma el de
  correos enviados, que es lo que T1 verificó. Un fallo intermitente en la
  tercera corrida seguida es esa causa, no un defecto.
- **`workers: 1` sigue siendo a propósito**; esta suite no lo cambia.
- `tsconfig.json` excluye `e2e/`, así que `npm run typecheck` **no** cubre este
  archivo. La única verificación es `npm run test:e2e`, con Docker arriba.

**Los casos que no describen la maqueta se conservan**: los cuatro que corren
sobre las tres pantallas —desbordamiento horizontal a 375 px, accesibilidad con
axe a los dos anchos, área mínima de 44 por 44 px, y `noindex`— siguen valiendo
tal cual. Con una salvedad: `/registro/codigo` y `/registro/crear-cuenta` ahora
redirigen sin precondición, así que esos cuatro casos necesitan llegar a las
pantallas **con** su precondición cumplida, o van a estar midiendo `/registro`
tres veces sin que nada lo delate.

**Criterios de aceptación (trazados desde requirements.md):**

- 9.1 — un alta completa cubierta de punta a punta, que termina iniciando sesión
  en `/acceso` con las credenciales recién creadas.
- 9.2 — un código incorrecto y un pedido a un paso sin su precondición, cada uno
  con su caso.
- 9.3 — el código se lee del buzón durante la prueba; no está en la suite ni en
  la configuración.
- 9.5 — ninguna afirmación de la maqueta sobrevive.
- 9.6 — la suite corre dos veces seguidas sin preparar la base entre corridas.
- 5.1 — las credenciales creadas sirven para entrar por `/acceso`.
- 5.2 — no hizo falta ningún paso adicional de confirmación.

**Decision log:**

- **Dos límites de Supabase aparecieron en la primera corrida completa, y solo
  uno era el que la tarea anticipaba.**
  - **`max_frequency = "1s"`** (`GOTRUE_SMTP_MAX_FREQUENCY` en el contenedor) es
    el que muerde: dos envíos a la misma dirección dentro de un segundo devuelven
    `429 over_email_send_rate_limit` con «For security purposes, you can only
    request this after **0** seconds» — la espera restante redondeada, que es por
    qué se lee como cero y parece un disparate. La acción lo convierte en
    `?error=correo` como cualquier otro rechazo (1.4), o sea que en pantalla es
    indistinguible de un correo malformado. Se resolvió **esperando** en
    `respectSendFrequency`, no reintentando: un reintento se tragaría también un
    rechazo genuino, y toda la gracia de las afirmaciones de destino es que un
    rechazo se vea.
  - **`email_sent = 2` sigue sin morder**, como T1 verificó. Los dos son botones
    distintos y la tarea advertía justamente de no confundirlos; la advertencia
    apuntaba al otro.
- **Hallazgo que rompía 9.6 y no estaba previsto: Supabase rechaza una contraseña
  idéntica a la vigente** (`422 same_password`). Con una constante, el alta
  funcionaba una sola vez: la segunda corrida —y ya dentro de la primera, porque
  `e2e/no-javascript.spec.ts` recorre el mismo alta antes— se rechazaba por un
  motivo ajeno al flujo. `freshPassword(label)` devuelve una contraseña que esa
  cuenta nunca tuvo, y eso **es** 9.6: la dirección sigue fija, no hace falta
  `supabase db reset`, y 3.4 hace que varíar la contraseña salga gratis porque el
  paso 3 reemplaza la que hubiera.
- **Tres defectos del propio test, encontrados corriéndolo:**
  - `waitForURL("**/registro/codigo**")` resolvía **antes** del envío, porque la
    página ya estaba en esa ruta. Se pasó a esperar el marcador
    (`/error=codigo/`), que es lo único que solo existe después del viaje.
  - El chequeo de 44×44 px empezó a contar el input oculto que React mete en todo
    `<form action>` para llevar el identificador de la acción. No es un objetivo
    —nadie puede apuntarle— así que se excluyen los `input[type="hidden"]`.
  - `meta[name="robots"]` pasó a resolver a dos elementos en una pantalla
    alcanzada por redirección tras un post, porque Next lleva la metadata al
    `body` en esa navegación. Se afirma sobre **todas** las declaraciones en vez
    de sobre una: pedir la primera dejaría que una segunda discrepara.
- **Los cuatro casos compartidos ahora llegan con su precondición**, y `arrive`
  comprueba que la redirección no ocurrió igual. Sin esa comprobación un `reach`
  roto dejaría los doce midiendo `/registro` en silencio.
- **9.6 verificado de verdad:** la suite se corrió dos veces seguidas sin tocar la
  base, verde las dos.

**Outcome:**

Hecha. `e2e/registro.spec.ts` reescrito: CP-01 hace el alta entera, lee el código
del buzón, aterriza en `/panel`, **descarta las cookies** y vuelve a entrar por
`/acceso` con esas credenciales (5.1, y 5.2 con él, porque una dirección sin
confirmar no podría iniciar sesión); CF-01 teclea un código que no es y aterriza
en `/registro/codigo?error=codigo` exacto; CF-02 pide los dos pasos sin su
precondición. Ninguna afirmación de la maqueta sobrevivió (9.5). 32 casos verdes
entre este archivo y el de T13, dos corridas seguidas.

## T13 — El alta entera sin JavaScript en `e2e/no-javascript.spec.ts`

**Requisitos:** 6.1, 6.2
**Depende de:** T10, T11

**Descripción:**

Agregar a `e2e/no-javascript.spec.ts` —la suite que ya corre con
`test.use({ javaScriptEnabled: false })`— el recorrido completo del alta: los
tres pasos hasta `/panel`, con el código leído del buzón igual que en T12.

Es el mismo lugar y la misma forma que el spec de acceso usó para su Requisito
5, y el motivo de que viva acá y no en `e2e/registro.spec.ts` es que el contexto
sin script se declara por archivo.

Un segundo caso para 6.2: enviar el paso 1 con una dirección malformada y
comprobar que el mensaje de error **está en la página** con el script bloqueado.
Es lo que prueba que el mensaje viaja en el HTML del servidor y no lo pinta
nadie después.

Esta es la suite que sostiene la promesa más vieja del proyecto —la landing
entera funciona sin JavaScript— extendida al alta. Si alguna vez alguien
convierte una de las tres pantallas en componente de cliente, los tests de T6,
T8 y T10 lo van a ver en el fuente y este lo va a ver en el navegador.

**Criterios de aceptación (trazados desde requirements.md):**

- 6.1 — el alta entera se completa con el script bloqueado, del primer paso al
  panel.
- 6.2 — un paso rechazado muestra su mensaje con el script bloqueado.

**Decision log:**

- **`a@b` y no `no-es-una-direccion`, y esa diferencia es lo que hace posible el
  caso.** El campo es `type="email"`, así que la validación del propio navegador
  se niega a enviar algo sin `@` y el pedido nunca sale: no habría nada que el
  servidor rechazara, y el test moría esperando una navegación que no ocurría.
  `a@b` conforma al navegador —que solo pide `algo@algo`— y lo rechaza
  `z.email()`, que quiere un dominio de verdad. Así el viaje ocurre y el mensaje
  vuelve del servidor, que es exactamente lo que 6.2 quiere probar.
- **El recorrido por anclas del bloque 8.3 se reemplazó, no se borró.** Describía
  la maqueta; ahora afirma que el control de inscripción llega al paso 1 y que
  ahí hay un `<button type="submit">`. El recorrido completo se hace abajo,
  contra la instancia.
- **La contraseña también sale de `freshPassword`**, con etiqueta propia: este
  archivo corre **antes** que `e2e/registro.spec.ts` en el orden alfabético de
  Playwright, así que con una constante compartida el alta con script se
  encontraba la contraseña ya puesta y era la que fallaba con `same_password`.

**Outcome:**

Hecha. Dos casos nuevos en `e2e/no-javascript.spec.ts`, dentro del contexto
`javaScriptEnabled: false` que el archivo ya declara: el alta entera de los tres
pasos hasta `/panel` con el código leído del buzón (6.1), y un paso rechazado que
muestra su mensaje con el script bloqueado (6.2). Son los dos únicos casos del
plan que prueban que las tres Server Actions son mejora progresiva de hecho y no
de intención.

## T14 — Tachar el criterio 6.7 en el spec de la landing

**Requisitos:** — (sección «Relación con los specs anteriores»)
**Depende de:** T6, T8, T10

**Descripción:**

Tachar el criterio 6.7 **entero** en
`docs/specs/2026-08-12-landing-publica/requirements.md`, con una nota que remita
a este spec. Hoy está tachado a medias: el spec de acceso revirtió dos de sus
seis prohibiciones —autenticar y gestionar sesión— y dejó vivas las tres del
alta: enviar el código, verificarlo y crear la cuenta. Esta feature revierte
esas tres, así que del criterio no queda nada en pie.

**Sin renumerar nada**, igual que se hizo con 6.4 y 6.5: el código, los tests y
los tres `tasks.md` citan esos números, y correrlos convertiría cada cita en una
referencia a otro criterio.

Es la única tarea sin ciclo TDD, y por lo mismo que T16 del spec de acceso: el
artefacto que cambia es un documento. Su verificación es que la suite completa
—`npm run typecheck && npm test && npm run test:e2e`— siga en verde, porque
ninguna afirmación depende del texto tachado.

Va **al final** y no al principio: mientras las tres pantallas sigan siendo
maquetas, tachar 6.7 lo dejaría diciendo algo que el código todavía no hace.

**Criterios de aceptación (trazados desde requirements.md):**

- Sección «Relación con los specs anteriores»: 6.7 queda tachado entero, con una
  nota que remite a `docs/specs/2026-08-19-registro-supabase/`.
- La numeración del resto de los criterios de la landing no cambia.

**Decision log:**

- **Tachado entero, con la nota reescrita en dos tiempos** para que se lea cuál
  spec levantó qué: `2026-08-17-login-supabase` levantó autenticación y gestión
  de sesión solo en `/acceso`, y este levanta las tres del alta. De las seis
  prohibiciones no queda ninguna en pie; el cobro sigue fuera de alcance por
  decisión propia y ya no por este criterio.
- **Sin renumerar nada**, igual que con 6.4 y 6.5.
- **El argumento del formulario se conservó y se reencuadró.** La regla nunca fue
  «sin `<form>`»: es que un formulario **sin `action`** se envía por GET y
  pondría la contraseña en la barra de direcciones. Las cuatro pantallas postean
  a una Server Action, así que lo respetan las cuatro.
- **Se corrigieron además los comentarios de módulo que habían quedado
  mintiendo**, y no estaban en la tarea: `components/sections/AccessScreen.tsx`
  decía que las tres de `/registro` no envían nada y no llevan `<form>`,
  `lib/content/schemas.ts` que quedaban inertes, y `app/acceso/page.tsx` y
  `app/panel/layout.tsx` que el alta seguía siendo maqueta. Un comentario falso
  al lado del código es peor que ninguno.

**Outcome:**

Hecha. El criterio 6.7 queda tachado entero en
`docs/specs/2026-08-12-landing-publica/requirements.md`, con la nota que remite a
`docs/specs/2026-08-19-registro-supabase/`, y la numeración del resto sin tocar.

Su verificación es la del repositorio completo, y está: `npm run verify` en
verde de punta a punta — `typecheck`, 555 casos de vitest, `next build`, y 143
casos de Playwright.
