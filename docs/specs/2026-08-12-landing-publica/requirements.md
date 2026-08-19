# Requisitos — Landing pública de Crypto Crime Academy

**Estado:** Aprobado
**Fecha:** 2026-08-12
**Autor:** Manuel

## Introducción

Crypto Crime Academy necesita un sitio público de una sola página que presente
su curso de investigación de criptoactivos a un público profesional —
fuerzas del orden, profesionales legales, equipos de cumplimiento e
investigadores forenses — y lo conduzca a inscribirse.

La página cumple tres funciones: explicar para quién es el curso y con qué
rigor está construido, exponer el temario con su estado real de disponibilidad,
y derivar al visitante a la pantalla de acceso. No gestiona cuentas, no cobra y
no aloja el curso: su único compromiso con el resto del producto es un enlace
saliente.

El valor está en la credibilidad. El público objetivo evalúa evidencia para
vivir, y detecta la exageración. Por eso el sitio prioriza afirmaciones
verificables, contenido siempre vigente y funcionamiento impecable por sobre
cualquier artificio.

## Glosario

- **Módulo** — unidad del temario del curso. Tiene un código de expediente, un
  título y un estado.
- **Código de expediente** — identificador visible de un módulo con el formato
  `EXP-NN` (`EXP-00`, `EXP-01`, …). Refleja la posición del módulo en el temario.
- **Estado del módulo** — `disponible` (ya publicado) o `próximamente` (anunciado
  pero no publicado). Son excluyentes.
- **Resumen del módulo** — texto que se revela al desplegar un módulo disponible.
- **Adelanto del módulo** — texto siempre visible de un módulo en estado
  próximamente. No se despliega.
- **Pantalla de acceso** — pantalla externa a esta feature donde el visitante
  ingresa su correo y recibe un código de verificación. Fuera de alcance.
- **Sección navegable** — sección de la página que es destino de al menos un
  enlace de ancla del encabezado o del pie.
- **Archivo de contenido** — archivo versionado del repositorio que contiene los
  textos y datos de una sección.

## Requisitos

### Requisito 1 — Estructura y navegación de la página

**Historia de usuario:** Como visitante profesional, quiero recorrer la página
por secciones desde el encabezado, para llegar rápido a lo que necesito evaluar
sin leerla entera.

**Criterios de aceptación:**

1.1. THE SYSTEM SHALL renderizar una única página que contenga, en este orden:
encabezado, hero, audiencia, metodología, actualizaciones, programa, prueba
social, preguntas frecuentes, cierre y pie.

1.2. THE SYSTEM SHALL asignar a cada sección navegable un identificador único y
estable que sirva de destino de ancla.

1.3. WHEN el visitante activa un enlace de navegación THE SYSTEM SHALL desplazar
la vista hasta la sección correspondiente dejando el título de esa sección
completamente visible por debajo del encabezado fijo.

1.4. WHILE el visitante se desplaza por la página THE SYSTEM SHALL mantener el
encabezado fijo en el borde superior de la ventana.

1.5. IF un enlace de ancla del encabezado o del pie apunta a un identificador
que no existe en la página THEN THE SYSTEM SHALL fallar la compilación
indicando el enlace y el identificador ausente.

1.6. THE SYSTEM SHALL resaltar un ítem de navegación únicamente mientras el
puntero está sobre él, sin reflejar la posición de desplazamiento.

1.7. WHERE el visitante declara preferencia por movimiento reducido THE SYSTEM
SHALL llevarlo a la sección sin desplazamiento animado.

### Requisito 2 — Contenido versionado y validado

**Historia de usuario:** Como editor del sitio, quiero que el contenido viva en
archivos del repositorio y se valide automáticamente, para que un error de
edición no llegue nunca a producción.

**Criterios de aceptación:**

2.1. THE SYSTEM SHALL obtener todo el contenido de archivos versionados del
repositorio, sin realizar peticiones de red ni en compilación ni en ejecución.

2.2. THE SYSTEM SHALL validar cada archivo de contenido contra un esquema
declarado en el momento de importarlo.

2.3. IF un archivo de contenido no satisface su esquema THEN THE SYSTEM SHALL
fallar la compilación indicando archivo, campo y motivo del rechazo.

2.4. THE SYSTEM SHALL exigir exactamente 4 perfiles de audiencia, 2 bloques de
metodología, 3 sellos de confianza y 2 métricas destacadas.

2.5. THE SYSTEM SHALL exigir al menos un módulo, al menos una actualización y al
menos una pregunta frecuente.

2.6. THE SYSTEM SHALL almacenar la fecha de cada actualización en formato ISO y
derivar de ella el texto que se muestra.

2.7. THE SYSTEM SHALL presentar las actualizaciones de la más reciente a la más
antigua, sin depender del orden en que estén escritas en el archivo.

2.8. THE SYSTEM SHALL rechazar en compilación cualquier texto de contenido que
esté vacío o compuesto solo de espacios.

### Requisito 3 — Valores derivados del programa

**Historia de usuario:** Como editor del sitio, quiero que los números del
programa se calculen solos, para que no puedan contradecir al temario.

**Criterios de aceptación:**

3.1. THE SYSTEM SHALL derivar el código de expediente de cada módulo de su
posición en el temario, con el formato `EXP-NN` y dos dígitos.

3.2. THE SYSTEM SHALL derivar la cantidad de módulos anunciada del largo de la
lista de módulos.

3.3. THE SYSTEM SHALL derivar la duración total anunciada sumando los minutos de
video de los módulos en estado disponible, excluyendo los de estado
próximamente.

3.4. IF un archivo de contenido declara explícitamente un código de expediente,
una cantidad de módulos o una duración total THEN THE SYSTEM SHALL fallar la
compilación.

3.5. WHEN la duración total derivada es cero THE SYSTEM SHALL omitir el dato de
duración en vez de anunciar cero.

3.6. THE SYSTEM SHALL expresar la duración total en horas y minutos.

### Requisito 4 — Temario del programa

**Historia de usuario:** Como visitante, quiero ver qué módulos ya puedo cursar y
cuáles todavía no, para saber qué estoy comprando hoy.

**Criterios de aceptación:**

4.1. THE SYSTEM SHALL asignar a cada módulo exactamente uno de dos estados
excluyentes: disponible o próximamente.

4.2. WHERE un módulo está en estado próximamente THE SYSTEM SHALL mostrar de
forma permanente su etiqueta de estado y su adelanto, sin ofrecer control de
despliegue.

4.3. WHERE un módulo está disponible y tiene resumen THE SYSTEM SHALL mostrarlo
como bloque desplegable cerrado por omisión, con control de despliegue visible.

4.4. WHERE un módulo está disponible y no tiene resumen THE SYSTEM SHALL
mostrarlo sin control de despliegue.

4.5. WHEN el visitante despliega un módulo THE SYSTEM SHALL conservar abiertos
los módulos que ya estaban desplegados.

4.6. IF un módulo en estado próximamente declara minutos de video o resumen THEN
THE SYSTEM SHALL fallar la compilación.

4.7. IF un módulo en estado disponible no declara minutos de video THEN THE
SYSTEM SHALL fallar la compilación.

4.8. THE SYSTEM SHALL mostrar el temario en el orden en que los módulos están
declarados.

### Requisito 5 — Preguntas frecuentes

**Historia de usuario:** Como visitante, quiero resolver mis dudas habituales sin
escribir un correo, para decidir por mi cuenta.

**Criterios de aceptación:**

5.1. THE SYSTEM SHALL mostrar cada pregunta como bloque desplegable cerrado por
omisión.

5.2. WHEN el visitante despliega una pregunta THE SYSTEM SHALL conservar
abiertas las que ya estaban desplegadas.

5.3. IF una pregunta frecuente carece de enunciado o de respuesta THEN THE
SYSTEM SHALL fallar la compilación.

### Requisito 6 — Derivación a las pantallas de acceso

**Historia de usuario:** Como visitante decidido, quiero pasar del sitio al
proceso de inscripción en un clic, para no perder el impulso.

**Criterios de aceptación:**

6.1. WHEN el visitante activa un control de inscripción THE SYSTEM SHALL
llevarlo a la pantalla de alta indicando la intención de alta.

6.2. WHEN el visitante activa el control de inicio de sesión THE SYSTEM SHALL
llevarlo a la pantalla de acceso indicando la intención de ingreso.

6.3. THE SYSTEM SHALL implementar ambos controles como enlaces de hipertexto
estándar, sin navegación por script.

6.4. ~~THE SYSTEM SHALL obtener la dirección base de la pantalla de acceso de
la configuración del proyecto.~~ **Superado el 2026-08-14** (ver la nota de
abajo).

6.5. ~~IF la dirección base de la pantalla de acceso falta o no es una URL
válida THEN THE SYSTEM SHALL fallar la compilación.~~ **Superado el
2026-08-14** (ver la nota de abajo).

6.6. THE SYSTEM SHALL usar la misma forma verbal en los tres controles de
inscripción de la página.

6.7. THE SYSTEM SHALL NO implementar ~~autenticación,~~ envío de códigos,
verificación de códigos, alta de cuentas, cobro ~~ni gestión de sesión~~.
**Acotado el 2026-08-18** (ver la nota de abajo).

**Nota sobre 6.4 y 6.5 — los destinos dejaron de ser externos (2026-08-14).**
Ambos criterios existían porque la pantalla de acceso vivía fuera de esta
aplicación y solo conocíamos su dirección. Ya no: el ingreso se implementó en
`/acceso` el 2026-08-14 y el alta, ese mismo día, en las tres pantallas de
`/registro`. Los cinco controles apuntan hoy a rutas internas declaradas en
`lib/routes.ts`, de modo que no hay dirección base que configurar ni que
validar. `NEXT_PUBLIC_ACCESS_URL` y `lib/access-url.ts` siguen en el
repositorio pero **ya no los importa ningún componente**; retirarlos es una
decisión aparte, y hasta que se tome la variable no rompe ninguna compilación
porque el módulo que la lee no se carga.

La numeración no se reacomoda a propósito: el código, los tests y `tasks.md`
citan estos números, y renumerar convertiría cada cita en una referencia falsa.

**Nota sobre 6.7 — qué se revirtió y qué sigue vigente (2026-08-18).** Desde el
spec `2026-08-17-login-supabase`, `/acceso` verifica las credenciales contra la
instancia local de Supabase, abre sesión en cookies, y el panel la consulta
antes de emitir contenido. Eso levanta dos de las seis prohibiciones del
criterio —autenticación y gestión de sesión— y **solo en esa pantalla**.

El resto sigue en pie. Las tres pantallas de `/registro` son solo interfaz: no
envían el código, no lo verifican y no crean la cuenta, y el control de cada
paso intermedio es un ancla que avanza pase lo que pase, incluso sin haber
escrito nada. `/registro/crear-cuenta` cierra con un botón inerte. El cobro
sigue fuera de alcance en todo el proyecto.

**El argumento del formulario se conserva, reencuadrado.** Ninguna de las tres
pantallas de `/registro` renderiza un `<form>`, y eso no es un detalle de
estilo: un formulario **sin `action`** se envía por GET y pondría la contraseña
en la barra de direcciones, y de ahí en el historial, en los registros del
servidor y en el `Referer` del pedido siguiente. El `<form>` que sí aparece en
`/acceso` no contradice ese razonamiento sino que lo respeta: postea a una
Server Action, así que ningún campo se serializa en la dirección (1.5 del spec
de acceso).

### Requisito 7 — Adaptación a pantallas angostas

**Historia de usuario:** Como visitante que llega desde el teléfono, quiero leer
y navegar el sitio cómodamente, para no tener que abrirlo después en una
computadora.

**Criterios de aceptación:**

7.1. THE SYSTEM SHALL adaptar el diseño en los anchos de 640, 768 y 1024
píxeles, partiendo del diseño para pantalla angosta.

7.2. WHERE el ancho de la ventana es menor a 1024 píxeles THE SYSTEM SHALL
mantener visibles el nombre del sitio y el control de inscripción, y agrupar el
resto de la navegación en un panel desplegable cerrado por omisión.

7.3. WHEN el visitante activa un enlace de ancla desde el panel de navegación
THE SYSTEM SHALL cerrar el panel.

7.4. WHERE el ancho de la ventana es menor a 768 píxeles THE SYSTEM SHALL apilar
el hero presentando el texto y su llamado a la acción antes del panel visual.

7.5. WHERE el ancho de la ventana es menor a 1024 píxeles THE SYSTEM SHALL
reducir la grilla de perfiles de audiencia a dos columnas, y a una sola por
debajo de 768 píxeles.

7.6. THE SYSTEM SHALL ofrecer un área activable de al menos 44 por 44 píxeles en
todo control interactivo.

7.7. THE SYSTEM SHALL escalar el titular del hero de forma continua con el ancho
de la ventana, sin saltos entre puntos de quiebre.

7.8. THE SYSTEM SHALL evitar el desplazamiento horizontal de la página en todo
ancho de ventana igual o mayor a 320 píxeles.

### Requisito 8 — Funcionamiento sin JavaScript

**Historia de usuario:** Como visitante en una red restringida o con el script
bloqueado, quiero que el sitio siga siendo utilizable, para poder evaluar el
curso igual.

**Criterios de aceptación:**

8.1. WHERE JavaScript no está disponible THE SYSTEM SHALL permitir desplegar y
cerrar los módulos del temario y las preguntas frecuentes.

8.2. WHERE JavaScript no está disponible THE SYSTEM SHALL mantener operativos
los enlaces de ancla de la navegación.

8.3. WHERE JavaScript no está disponible THE SYSTEM SHALL mantener operativos
los controles de inscripción e inicio de sesión.

8.4. WHERE JavaScript no está disponible THE SYSTEM SHALL permitir abrir el
panel de navegación de pantallas angostas.

8.5. THE SYSTEM SHALL limitar la degradación sin JavaScript al cierre automático
del panel de navegación descrito en 7.3.

### Requisito 9 — Accesibilidad

**Historia de usuario:** Como visitante que usa lector de pantalla o navega por
teclado, quiero acceder a todo el contenido, para evaluar el curso en igualdad
de condiciones.

**Criterios de aceptación:**

9.1. THE SYSTEM SHALL declarar el español como idioma del documento.

9.2. THE SYSTEM SHALL presentar un único encabezado de primer nivel y una
jerarquía de encabezados sin saltos de nivel.

9.3. THE SYSTEM SHALL ocultar a las tecnologías de asistencia los iconos
puramente decorativos.

9.4. THE SYSTEM SHALL alcanzar una relación de contraste mínima de 4.5:1 en
texto normal y de 3:1 en texto grande y en elementos de interfaz.

9.5. THE SYSTEM SHALL hacer operable por teclado todo control interactivo, con
indicador de foco visible.

9.6. IF una auditoría automatizada de accesibilidad detecta una violación sobre
la página renderizada THEN THE SYSTEM SHALL fallar la integración continua.

### Requisito 10 — Metadatos y rutas

**Historia de usuario:** Como responsable de difusión, quiero que compartir el
enlace produzca una tarjeta de aspecto profesional, para que el sitio se
presente bien antes de que alguien lo abra.

**Criterios de aceptación:**

10.1. THE SYSTEM SHALL declarar título, descripción y dirección canónica del
documento.

10.2. THE SYSTEM SHALL declarar los metadatos de vista previa para redes
sociales, incluyendo una imagen de vista previa.

10.3. IF la imagen de vista previa no existe en el repositorio THEN THE SYSTEM
SHALL fallar la compilación.

10.4. WHEN se solicita una ruta que no existe THE SYSTEM SHALL responder con
código 404 y una página que conserve encabezado y pie y ofrezca un enlace al
inicio.

## Fuera de alcance

- El comportamiento de las pantallas de acceso y de alta: generación y envío del
  código, verificación, expiración, limitación de intentos, creación de la
  cuenta y sesión. Es un subsistema aparte con su propio spec. Desde el
  2026-08-14 la **interfaz** de esas pantallas sí vive en este repositorio
  (`/acceso` y las tres de `/registro`), pero como maqueta inerte: sin
  requisitos numerados propios, y sin publicar hasta que exista el backend.
- Cobro, precios y facturación. La página no menciona importes.
- Sección propia de testimonios. El ítem de navegación apunta a prueba social.
- Sistema de gestión de contenidos, panel de edición o previsualización.
- Internacionalización. El sitio es solo en español.
- Selector de tema claro/oscuro.
- Blog, buscador, área de alumno y cualquier ruta más allá del inicio y del 404.
- Formulario de newsletter. En el pie es un enlace, no un formulario.
- Analítica y seguimiento.

## Preguntas abiertas

Ninguna de estas bloquea el diseño ni la implementación, pero todas bloquean la
publicación:

- ¿Qué contenido se revela al desplegar los módulos `EXP-00` y `EXP-01`? Hasta
  que exista, se muestran sin control de despliegue según 4.4.
- ¿Cuáles son las respuestas de las preguntas frecuentes? El mockup solo define
  los enunciados.
- ¿Qué afiliaciones reales ocupan los tres sellos de confianza? Hoy son
  marcadores de posición del diseño.
- ¿Qué respalda las métricas «5000+ investigadores» y «120+ agencias»? Con este
  público, una cifra que no se pueda sostener es un riesgo de credibilidad.
- Los adelantos de `EXP-02` a `EXP-06` arrancan con el marcador `[REVISAR]` y
  necesitan redacción final.
- ¿Qué imagen se usa como vista previa para redes? Sin ella no compila (10.3).
- ~~¿La paleta navy/crema/dorado cumple 9.4?~~ **Resuelto en `design.md`.**
  Medido sobre blanco: navy `#16213c` 15.95:1 pasa; dorado `#98773e` 4.16:1 y
  gris `#76777e` 4.46:1 **fallan** 9.4 para texto. El diseño conserva el dorado
  en bordes y decoración (supera el 3:1 de elementos de interfaz) y usa
  `#7d6234` donde el dorado es texto; el gris pasa a `#616267`. Queda pendiente
  re-verificar ambos contra el valor definitivo del crema, que baja los ratios
  alrededor de un 8 %.
- ¿El ítem de navegación conserva la etiqueta «Testimonios» o pasa a
  «Confianza»? Hoy anuncia voces y entrega cifras.
- ¿Qué forma verbal se unifica en los tres CTA: «Inscribite» o «Inscríbete»?
