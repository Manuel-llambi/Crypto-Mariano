# Requisitos — Alta de cuenta contra Supabase local

**Estado:** Aprobado
**Fecha:** 2026-08-19
**Autor:** Manuel

## Introducción

Las tres pantallas de `/registro` son maquetas. La primera recoge un correo y lo
deja atrás, la segunda avanza con cualquier código —o sin ninguno—, y la tercera
termina en un botón que no hace nada. Se puede recorrer el alta entera sin que
exista una cuenta al final.

Esta feature las conecta con la instancia local de Supabase: el paso 1 envía un
código de verificación a la dirección tecleada, el paso 2 lo verifica, y el paso
3 fija la contraseña de la cuenta. Al terminar, el alumno puede entrar por
`/acceso` con esas credenciales, que es lo que cierra el círculo con el spec
anterior.

El orden de las tres pantallas se conserva tal como está dibujado, y eso obliga a
una decisión que conviene tener a la vista desde el principio: **la cuenta nace
antes de que exista la contraseña.** Supabase crea la fila del usuario en el
momento de enviar el código, y la sesión se abre al verificarlo, de modo que el
paso 3 no crea una cuenta sino que le fija la clave a una que ya está viva.

De ahí se desprende la segunda decisión: **el paso 3 fija la contraseña exista o
no la cuenta de antes.** Una sola regla —probar el buzón, elegir una clave— en
lugar de dos caminos. Como efecto lateral, el alta funciona también como
recuperación de contraseña.

Esta feature **revierte por completo el criterio 6.7 del spec de la landing**.
Ver "Relación con los specs anteriores", más abajo.

## Glosario

- **Código de verificación** — la secuencia numérica que Supabase envía por
  correo y que prueba que el visitante controla ese buzón.
- **Buzón local** — el servidor de correo de prueba que la instancia local
  levanta; los correos no salen a Internet y se leen por HTTP.
- **Correo pendiente** — la dirección tecleada en el paso 1, retenida por el
  servidor mientras el visitante teclea el código.
- **Sesión** — el par de tokens que Supabase emite, aquí al verificar el código y
  no al comprobar una contraseña.
- **Alta completa** — el recorrido de los tres pasos terminado con una
  contraseña fijada.
- **Instancia local** — la pila de Supabase que `supabase start` levanta en esta
  máquina, no un proyecto alojado.

## Requisitos

### Requisito 1 — Envío del código de verificación

**Historia de usuario:** Como visitante que quiere inscribirse, quiero recibir un
código en mi correo, para probar que esa dirección es mía antes de tener cuenta.

**Criterios de aceptación:**

1.1. WHEN el visitante envía el paso 1 con una dirección de correo bien formada
THE SYSTEM SHALL pedirle a la instancia local de Supabase que envíe un código de
verificación a esa dirección, creando la cuenta si todavía no existe, y llevarlo
a `/registro/codigo`.

1.2. IF la dirección está vacía o malformada THEN THE SYSTEM SHALL rechazar el
intento sin consultar a Supabase y devolver al visitante a `/registro` con un
mensaje de error.

1.3. THE SYSTEM SHALL responder de la misma forma exista o no una cuenta con esa
dirección, sin revelar cuál de los dos casos ocurrió.

1.4. IF Supabase no responde o rechaza el envío THEN THE SYSTEM SHALL devolver al
visitante a `/registro` con un mensaje de error, sin distinguir la causa.

1.5. THE SYSTEM SHALL NO incluir la dirección tecleada en la dirección a la que
redirige, ni en el éxito ni en el rechazo.

### Requisito 2 — Verificación del código

**Historia de usuario:** Como visitante que recibió el código, quiero teclearlo y
que el sitio lo compruebe, para que el paso siguiente solo esté al alcance de
quien controla ese buzón.

**Criterios de aceptación:**

2.1. WHEN el visitante envía el paso 2 con el código que Supabase emitió para el
correo pendiente THE SYSTEM SHALL abrir una sesión y llevarlo a
`/registro/crear-cuenta`.

2.2. IF el código es incorrecto, está vencido o ya fue consumido THEN THE SYSTEM
SHALL devolver al visitante a `/registro/codigo` sin abrir sesión, con un único
mensaje de error para los tres casos.

2.3. IF el campo del código llega vacío THEN THE SYSTEM SHALL rechazar el intento
sin consultar a Supabase.

2.4. THE SYSTEM SHALL delegar la comprobación del código en Supabase, sin
compararlo por cuenta propia ni retenerlo.

2.5. THE SYSTEM SHALL NO incluir el código ni el correo pendiente en la dirección
a la que devuelve al visitante.

### Requisito 3 — Fijación de la contraseña

**Historia de usuario:** Como visitante que ya probó su buzón, quiero elegir una
contraseña, para poder volver a entrar sin depender del correo.

**Criterios de aceptación:**

3.1. WHEN el visitante envía el paso 3 con una contraseña que Supabase acepta THE
SYSTEM SHALL fijarla en la cuenta de la sesión vigente y llevarlo a `/panel`.

3.2. IF Supabase rechaza la contraseña THEN THE SYSTEM SHALL devolver al visitante
a `/registro/crear-cuenta` con un mensaje que indique el motivo del rechazo.

3.3. THE SYSTEM SHALL delegar en Supabase la política de contraseña, sin imponer
reglas propias de largo ni de composición.

3.4. THE SYSTEM SHALL fijar la contraseña también cuando la cuenta ya existía,
reemplazando la anterior.

3.5. THE SYSTEM SHALL identificar la cuenta a modificar por la sesión abierta en
el paso 2, y nunca por una dirección recibida del formulario.

3.6. THE SYSTEM SHALL transmitir la contraseña únicamente en el cuerpo de la
petición, y nunca en la barra de direcciones.

### Requisito 4 — Continuidad entre las tres pantallas

**Historia de usuario:** Como visitante que avanza paso a paso, quiero que el
sitio recuerde lo necesario entre pantallas y me devuelva al principio si llego a
una que todavía no me corresponde.

**Criterios de aceptación:**

4.1. THE SYSTEM SHALL transportar el correo pendiente del paso 1 al paso 2 en una
cookie inaccesible al JavaScript del navegador.

4.2. WHEN el código queda verificado THE SYSTEM SHALL descartar el correo
pendiente.

4.3. IF llega un pedido a `/registro/codigo`, o un envío de su formulario, sin
correo pendiente THEN THE SYSTEM SHALL redirigirlo a `/registro` con un mensaje
que le indique pedir un código nuevo.

4.4. IF llega un pedido a `/registro/crear-cuenta` sin sesión vigente THEN THE
SYSTEM SHALL redirigirlo a `/registro`.

4.5. WHEN el visitante usa el control de reenvío del paso 2 THE SYSTEM SHALL
llevarlo al paso 1, desde donde puede pedir otro código.

### Requisito 5 — Acceso posterior con las credenciales creadas

**Historia de usuario:** Como alumno recién inscripto, quiero entrar por «Iniciar
sesión» con el correo y la contraseña que acabo de elegir, para que el alta haya
servido de algo.

**Criterios de aceptación:**

5.1. WHEN un alta se completa THE SYSTEM SHALL dejar la cuenta en condiciones de
iniciar sesión en `/acceso` con ese correo y esa contraseña.

5.2. THE SYSTEM SHALL dejar la dirección confirmada al verificar el código, sin
exigir al visitante ningún paso adicional de confirmación.

### Requisito 6 — Sin JavaScript propio

**Historia de usuario:** Como visitante con el script bloqueado, quiero poder
inscribirme igual, porque el resto del sitio ya funciona así.

**Criterios de aceptación:**

6.1. WHERE JavaScript no está disponible THE SYSTEM SHALL permitir completar el
alta entera, desde el primer paso hasta el panel.

6.2. WHERE JavaScript no está disponible THE SYSTEM SHALL mostrar el mensaje de
error de cualquiera de los tres pasos rechazados.

6.3. THE SYSTEM SHALL implementar los tres envíos como formularios que postean al
servidor, sin navegación por script.

6.4. THE SYSTEM SHALL mantener `NavPanel` como el único componente de cliente del
proyecto.

### Requisito 7 — El correo que recibe el visitante

**Historia de usuario:** Como visitante, quiero que el correo traiga el código a
la vista, para poder teclearlo en la pantalla donde estoy.

**Criterios de aceptación:**

7.1. THE SYSTEM SHALL enviar un correo que contenga el código como texto legible,
y no únicamente un enlace de confirmación.

7.2. THE SYSTEM SHALL enviar ese código tanto para una dirección sin cuenta como
para una que ya la tiene.

7.3. THE SYSTEM SHALL declarar las plantillas de ese correo en archivos
versionados del repositorio, junto a la configuración de la instancia.

### Requisito 8 — Textos, rutas y registro verbal

**Historia de usuario:** Como quien mantiene el proyecto, quiero que los textos y
las direcciones nuevas vivan donde ya viven los demás, para que nada quede suelto
en un componente.

**Criterios de aceptación:**

8.1. THE SYSTEM SHALL declarar los textos de error de los tres pasos en
`content/access.ts`, validados por su esquema.

8.2. THE SYSTEM SHALL declarar las direcciones y los códigos de error en
`lib/routes.ts`.

8.3. THE SYSTEM SHALL usar tuteo en todo texto de interfaz que esta feature
agregue.

### Requisito 9 — Verificación

**Historia de usuario:** Como quien corre la suite, quiero que el alta esté
cubierta de punta a punta y que un entorno mal preparado se distinga de un
defecto del código.

**Criterios de aceptación:**

9.1. THE SYSTEM SHALL cubrir de punta a punta un alta completa que termine
iniciando sesión en `/acceso` con las credenciales recién creadas.

9.2. THE SYSTEM SHALL cubrir de punta a punta un código incorrecto y un pedido a
un paso sin su precondición.

9.3. THE SYSTEM SHALL leer el código del buzón local durante la prueba, sin
conocerlo de antemano ni fijarlo por configuración.

9.4. IF el buzón local no responde cuando arranca la suite de punta a punta THEN
THE SYSTEM SHALL abortarla con un mensaje que nombre esa causa.

9.5. THE SYSTEM SHALL reemplazar las afirmaciones de las suites de `/registro`
que hoy describen las maquetas, incluidas las que exigen la ausencia de
formulario.

9.6. THE SYSTEM SHALL permitir repetir la prueba de punta a punta sobre la misma
dirección sin preparar la base entre corridas.

## Relación con los specs anteriores

**6.7 del spec de la landing queda superado por completo.** El spec de acceso
revirtió dos de sus seis prohibiciones —autenticar y gestionar sesión— y dejó
vivas las tres del alta: enviar el código, verificarlo y crear la cuenta. Esta
feature revierte esas tres. Corresponde tachar 6.7 entero en su archivo con una
nota que remita a este spec, tal como se hizo con 6.4 y 6.5, y sin renumerar
nada: el código, los tests y `tasks.md` citan esos números.

**La nota sobre el `<form>` sigue vigente y esta feature la respeta.** Aquella
nota no prohibía el formulario sino el formulario **sin `action`**, que se envía
por GET y pone lo tecleado en la barra de direcciones. Los tres formularios que
esta feature agrega postean a una Server Action, igual que el de `/acceso`.

**8.x se extiende, no se rompe.** El Requisito 6 de este spec continúa el
Requisito 5 del spec de acceso y el Requisito 8 de la landing: el alta entera
funciona con el script bloqueado.

**El Requisito 5 se apoya en el spec de acceso y no lo modifica.** `/acceso` ya
verifica credenciales; lo que esta feature agrega es una segunda forma de que
esas credenciales existan, además de la siembra.

## Fuera de alcance

- **Cerrar sesión.** Sigue sin haber control para salir; las cookies se limpian a
  mano. Lo hereda de la feature anterior.
- **Una pantalla propia de recuperación de contraseña.** `/recuperar-acceso`
  sigue sin existir y `forgotHref` sigue apuntando ahí. Que el alta permita fijar
  una contraseña nueva sobre una cuenta existente es un efecto lateral del
  criterio 3.4, no una pantalla de recuperación.
- **Reenviar el código sin volver al paso 1.** El control de reenvío lleva al
  primer paso, que es lo más simple que funciona (4.5).
- **Verificación por enlace.** El correo trae un código para teclear; no se
  implementa el camino de hacer clic.
- **Reglas propias de contraseña.** Rige la política de la instancia (3.3).
- **Límites de intentos propios.** Rige el que Supabase ya aplica.
- **Supabase alojado.** Solo la instancia local. Estas pantallas siguen sin
  poder publicarse.
- **Datos reales en el panel.** Sigue leyendo `content/panel.ts` y
  `content/program.ts`; la cuenta nueva no cambia lo que muestra.
- **Corregir el registro verbal del texto existente.** El subtítulo de `login` y
  los textos de `content/methodology.ts` siguen tratando de usted; 8.3 solo
  alcanza al texto nuevo.

## Preguntas abiertas

- **¿El límite de dos correos por hora alcanza al buzón local?**
  `auth.rate_limit.email_sent = 2` en `config.toml`, y el comentario del propio
  archivo dice que ese límite aplica cuando hay un SMTP de verdad configurado.
  Si alcanza al buzón local, la suite de punta a punta muere en el tercer envío y
  hay que subirlo. Se verifica contra la instancia antes de tocar nada. Afecta a
  9.1 y 9.6.
- **¿Interviene `enable_confirmations` en este camino?** Hoy está en `false`. Ese
  interruptor gobierna el alta con contraseña, y aquí el código es la
  confirmación, así que probablemente no haya nada que cambiar. Se verifica.
  Afecta a 5.2.
- **¿El buzón local es Inbucket o Mailpit?** Las versiones nuevas del CLI de
  Supabase reemplazaron uno por el otro y la API para listar mensajes no es la
  misma. Se mira qué corre de verdad antes de escribir el ayudante. Afecta a 9.3
  y 9.4.
- ~~**¿La pantalla 3 conserva el campo de correo?**~~ **Resuelta el 2026-08-19:
  se conserva como eco de solo lectura, y deja de enviarse.** Muestra el valor
  que devuelve `getUser()` —la misma llamada que la guardia de 4.4 ya hace—,
  marcado `readOnly` y **sin atributo `name`**, de modo que el navegador no lo
  incluye en el envío. Se descartó retirarlo porque la pantalla quedaría pidiendo
  una contraseña sin decir para quién, y se descartó dejarlo editable porque un
  campo que se puede cambiar y que el servidor ignora es una mentira sobre lo que
  hace la pantalla. Cuesta volver opcional el `name` de `Field`. Afecta a 3.5.
