# Requisitos — Acceso real contra Supabase local

**Estado:** Aprobado
**Fecha:** 2026-08-17
**Autor:** Manuel

## Introducción

Hoy `/acceso` es una maqueta: recoge un correo y una contraseña, no mira ninguno
de los dos, y camina a `/panel` pase lo que pase. `/panel`, a su vez, se abre
escribiendo la dirección, porque no hay sesión que consultar. Esta feature
convierte esa maqueta en un acceso real contra la instancia local de Supabase:
las credenciales se verifican, la sesión se persiste, y el panel deja de estar
abierto a cualquiera que conozca la ruta.

El alcance es deliberadamente una sola mitad del problema. El alta de cuentas
—las tres pantallas de `/registro`— sigue siendo maqueta, y las cuentas con las
que se entra se crean por siembra de la base. Conectar el alta es un spec
posterior; abrir los dos frentes a la vez sería mezclar dos subsistemas.

Esta feature **revierte parcialmente el criterio 6.7 del spec de la landing**,
que prohibía autenticar y gestionar sesión. Ver "Relación con el spec de la
landing pública", más abajo.

## Glosario

- **Sesión** — el par de tokens que Supabase emite al verificar credenciales, y
  que identifica al visitante en pedidos posteriores sin volver a pedírselas.
- **Guardia** — la verificación del lado del servidor que decide si un pedido a
  una pantalla del panel se atiende o se redirige al acceso.
- **Siembra** — el archivo SQL versionado que deja la base local con las cuentas
  necesarias para trabajar y para correr las pruebas.
- **Instancia local** — la pila de Supabase que `supabase start` levanta en esta
  máquina, no un proyecto alojado.
- **Clave publicable** — la clave de Supabase pensada para viajar al cliente, en
  oposición a la clave secreta, que otorga permisos administrativos.

## Requisitos

### Requisito 1 — Verificación de credenciales

**Historia de usuario:** Como alumno inscripto, quiero entrar con mi correo y mi
contraseña, para llegar a mi panel y que nadie más pueda hacerlo por mí.

**Criterios de aceptación:**

1.1. WHEN el visitante envía el formulario de acceso con credenciales que
corresponden a una cuenta existente THE SYSTEM SHALL abrir una sesión y llevarlo
a `/panel`.

1.2. IF las credenciales no corresponden a ninguna cuenta existente THEN THE
SYSTEM SHALL devolver al visitante a `/acceso` sin abrir sesión.

1.3. THE SYSTEM SHALL delegar la verificación de las credenciales en la
instancia local de Supabase, sin comparar contraseñas por cuenta propia.

1.4. IF el correo está vacío o malformado, o la contraseña está vacía, THEN THE
SYSTEM SHALL rechazar el intento sin consultar a Supabase.

1.5. THE SYSTEM SHALL transmitir la contraseña únicamente en el cuerpo de la
petición, y nunca en la barra de direcciones.

### Requisito 2 — Respuesta ante un acceso rechazado

**Historia de usuario:** Como alumno que se equivocó al teclear, quiero entender
que el intento falló y poder repetirlo, sin que el sitio le revele a un tercero
qué correos están registrados.

**Criterios de aceptación:**

2.1. WHEN un intento de acceso es rechazado THE SYSTEM SHALL mostrar un mensaje
de error en `/acceso`.

2.2. THE SYSTEM SHALL usar el mismo mensaje para credenciales inválidas y para
una cuenta que no existe.

2.3. THE SYSTEM SHALL NO incluir el correo ni la contraseña tecleados en la
dirección a la que devuelve al visitante.

2.4. THE SYSTEM SHALL declarar el texto del mensaje en `content/access.ts`,
validado por su esquema, como cualquier otro texto de interfaz del proyecto.

2.5. WHILE `/acceso` se muestra sin un intento fallido previo THE SYSTEM SHALL
NO mostrar el mensaje de error.

### Requisito 3 — Persistencia de la sesión

**Historia de usuario:** Como alumno que ya entró, quiero seguir dentro al
navegar entre pantallas, para no tener que autenticarme en cada pedido.

**Criterios de aceptación:**

3.1. WHEN se abre una sesión THE SYSTEM SHALL persistirla en cookies del
navegador.

3.2. WHILE la sesión está vigente THE SYSTEM SHALL reconocer al visitante en
pedidos posteriores sin volver a pedirle credenciales.

3.3. THE SYSTEM SHALL validar la sesión contra el servidor de autenticación cada
vez que la consulta desde el servidor, sin dar por buena la cookie por el solo
hecho de estar presente.

3.4. THE SYSTEM SHALL NO exponer los tokens de sesión al código JavaScript del
navegador.

### Requisito 4 — Guardia del panel

**Historia de usuario:** Como alumno, quiero que mi panel no se abra escribiendo
la dirección, para que la sesión signifique algo.

**Criterios de aceptación:**

4.1. IF llega un pedido a una pantalla del panel sin sesión vigente THEN THE
SYSTEM SHALL redirigirlo a `/acceso`.

4.2. WHEN llega un pedido a una pantalla del panel con sesión vigente THE SYSTEM
SHALL atenderlo normalmente.

4.3. THE SYSTEM SHALL realizar la verificación en el servidor, antes de emitir
cualquier contenido del panel.

4.4. THE SYSTEM SHALL aplicar la guardia en el chrome compartido del panel, de
modo que alcance también a las pantallas que se agreguen debajo de `/panel` más
adelante.

### Requisito 5 — Sin JavaScript propio

**Historia de usuario:** Como visitante con el script bloqueado, quiero poder
iniciar sesión igual, porque el resto del sitio ya funciona así.

**Criterios de aceptación:**

5.1. WHERE JavaScript no está disponible THE SYSTEM SHALL permitir completar un
inicio de sesión y llegar al panel.

5.2. WHERE JavaScript no está disponible THE SYSTEM SHALL mostrar el mensaje de
error de un intento rechazado.

5.3. THE SYSTEM SHALL implementar el envío como un formulario que postea al
servidor, sin navegación por script.

5.4. THE SYSTEM SHALL mantener `NavPanel` como el único componente de cliente
del proyecto.

### Requisito 6 — Configuración y cuentas de trabajo

**Historia de usuario:** Como quien clona el repositorio, quiero saber en el
acto qué me falta configurar y con qué cuenta entrar, para no perseguir errores
en tiempo de ejecución.

**Criterios de aceptación:**

6.1. IF falta la dirección de la instancia de Supabase o su clave publicable
THEN THE SYSTEM SHALL fallar la compilación indicando cuál de las dos falta.

6.2. THE SYSTEM SHALL declarar la cuenta de trabajo y de pruebas en un archivo
de siembra versionado, reproducible al reiniciar la base.

6.3. THE SYSTEM SHALL NO usar la clave secreta de Supabase en el código de la
aplicación.

### Requisito 7 — Verificación

**Historia de usuario:** Como quien corre la suite, quiero que un entorno mal
preparado se distinga de un defecto del código, para no diagnosticar el problema
equivocado.

**Criterios de aceptación:**

7.1. IF la instancia local de Supabase no responde cuando arranca la suite de
punta a punta THEN THE SYSTEM SHALL abortarla con un mensaje que nombre esa
causa.

7.2. THE SYSTEM SHALL cubrir de punta a punta el acceso exitoso, el acceso
rechazado y el pedido al panel sin sesión.

7.3. THE SYSTEM SHALL reemplazar las afirmaciones de `e2e/acceso.spec.ts` que
hoy describen la maqueta.

## Relación con el spec de la landing pública

Esta feature toca dos requisitos del spec `2026-08-12-landing-publica`, y en
ninguno de los dos casos se renumera nada: el código, los tests y `tasks.md`
citan esos números.

**6.7 queda superado para `/acceso`.** Decía que el sistema no implementaría
autenticación ni gestión de sesión, y describía cinco pantallas inertes. A
partir de este spec, `/acceso` autentica y abre sesión. **El resto de 6.7 sigue
vigente**: las tres pantallas de `/registro` continúan siendo maquetas, no
envían el código, no lo verifican y no crean la cuenta. Corresponde tachar 6.7
en su archivo con una nota que acote su alcance, tal como se hizo con 6.4 y 6.5.

**8.x se extiende, no se rompe.** El Requisito 5 de este spec es la continuación
de aquel: el acceso sigue funcionando sin JavaScript. El `<form>` que aparece en
`/acceso` no contradice la nota de 6.7 —que prohibía un formulario **sin
`action`**, porque se envía por GET y pondría la contraseña en la barra de
direcciones— sino que la respeta: este formulario postea al servidor.

## Fuera de alcance

- **El alta de cuentas.** Las tres pantallas de `/registro` siguen siendo
  maquetas; nada envía ni verifica códigos ni crea cuentas.
- **Cerrar sesión.** No hay control para salir; se limpian las cookies a mano.
- **Recuperar la contraseña.** `forgotHref` sigue apuntando a
  `/recuperar-acceso`, que no existe.
- **Datos reales en el panel.** Sigue leyendo `content/panel.ts` y
  `content/program.ts`; la sesión no cambia lo que muestra.
- **Roles, permisos y políticas de acceso a datos.** No hay tablas propias
  todavía.
- **Supabase alojado.** Solo la instancia local; publicar es una decisión
  aparte, y sigue vigente que estas pantallas no deben publicarse.
- **Límites de intentos propios.** Rige el que la instancia de Supabase ya
  aplica; no se agrega lógica encima.

## Preguntas abiertas

- ~~**¿Se versiona un `.env` con las claves de demo de la instancia local?**~~
  **Resuelta el 2026-08-17: sí, se versiona un `.env`.** Las claves de la
  instancia local son públicas e idénticas en cualquier máquina, así que
  versionarlas no expone nada y mantiene vigente el valor del proyecto de que
  «no hace falta configurar nada para compilar»: quien clona corre
  `npm run build` y anda. `.env.local` sigue gitignoreado y sobrescribe al
  anterior, que es por donde entraría una instancia alojada el día que exista.
  Afecta a 6.1.
- ~~**¿En qué registro verbal va el mensaje de error?**~~ **Resuelta el
  2026-08-17: tuteo, y solo en el texto nuevo.** Es la regla que el proyecto
  cerró el 2026-08-13 para todo texto nuevo de interfaz. El subtítulo de `login`
  **no se toca**: sigue tratando de usted, porque corregirlo es una decisión de
  copia que no le pertenece a esta feature.

  **Deuda que esto deja abierta, a propósito:** la tarjeta de `/acceso` va a
  tratar de usted en el subtítulo y de tú en el mensaje de error, a pocos
  centímetros de distancia. La incoherencia ya estaba anotada como pendiente
  antes de este spec; esta feature la hace más visible sin resolverla.
- ~~**¿Qué cuenta siembra 6.2?**~~ **Resuelta el 2026-08-17:**
  `alumno@crypto-crime.test`, contraseña `investigacion-2024`. El dominio `.test`
  está reservado por la RFC 2606, de modo que la dirección no puede registrarse
  ni recibir correo por accidente, y el nombre dice de qué proyecto es. Los dos
  literales quedan versionados en `supabase/seed.sql` y los comparten
  `e2e/acceso.spec.ts` y `e2e/panel.spec.ts`. Afecta a 6.2, y desbloquea la
  ejecución de T2, T13, T14 y T15.
