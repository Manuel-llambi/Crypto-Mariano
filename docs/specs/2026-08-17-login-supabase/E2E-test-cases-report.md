# Reporte de casos E2E — Acceso real contra Supabase local

**Spec:** `docs/specs/2026-08-17-login-supabase/`  ·  **Plan:** `docs/specs/2026-08-17-login-supabase/E2E-test-cases-plan.md`  ·  **Script:** `e2e/login-supabase.spec.ts`
**Comando:** `npx playwright test e2e/login-supabase.spec.ts --no-deps` (y una segunda corrida con `--repeat-each=2`)  ·  **Fecha:** 2026-08-18

## Resultado

| ID | Test | Estado | Culpa | Confianza |
|---|---|---|---|---|
| CP-01 | La sesión sigue valiendo al salir del panel y volver | Verde | — | Alta |
| CF-01 | Un correo vacío se rechaza como cualquier otro intento fallido | Verde | — (ver cobertura sospechosa) | Alta |
| CF-02 | Un `error` escrito a mano en la dirección no produce mensaje | Verde | — | Alta |

Tres verdes, cero rojos. Ningún veredicto de Código, de Test ni de Plan: no hay
fallo que atribuir. Lo que sí hay es una observación de cobertura sobre CF-01 y
otra sobre el alcance real de CP-01, las dos abajo.

## Salida de la corrida

Primera corrida, `npx playwright test e2e/login-supabase.spec.ts --no-deps`:

```
Running 3 tests using 1 worker

  ✓  1 [chromium] › e2e\login-supabase.spec.ts:58:7 › CP-01 — the session outlives leaving the dashboard and coming back › CP-01 still serves /panel after a detour through the landing (1.7s)
  ✓  2 [chromium] › e2e\login-supabase.spec.ts:118:7 › CF-01 — submitting with the email field left empty › CF-01 returns to the access screen with the shared message and no session (580ms)
  ✓  3 [chromium] › e2e\login-supabase.spec.ts:166:7 › CF-02 — an error parameter the system never emits › CF-02 shows the clean screen for an unknown value and for an empty one (430ms)

  3 passed (45.3s)
```

Segunda corrida, la misma con `--repeat-each=2`, para descartar dependencia de
orden, arrastre de cookies entre contextos y el límite de intentos de Supabase:

```
Running 6 tests using 1 worker
  ✓  1 … CP-01 … (1.9s)
  ✓  2 … CF-01 … (640ms)
  ✓  3 … CF-02 … (523ms)
  ✓  4 … CP-01 … (1.6s)
  ✓  5 … CF-01 … (636ms)
  ✓  6 … CF-02 … (459ms)

  6 passed (52.7s)
```

El `globalSetup` no abortó: la instancia local estaba arriba y sembrada, como
decía el contexto. El build previo emite dos advertencias —lockfiles múltiples
en `C:\Users\manue\package-lock.json` y `metadataBase` sin definir— que son
anteriores a este archivo y no las produce ninguno de los tres casos. El borrado
de `.next` que deja sin estilos a un `next dev` levantado es el comportamiento
conocido del repositorio, no un defecto.

## CP-01 — La sesión sigue valiendo al salir del panel y volver

**Qué se esperaba:** tras enviar credenciales sembradas, aterrizar en `/panel`
pelado; volver a `/panel` escribiendo la dirección después de pasar por `/` y
seguir adentro, con `<h1>` visible, sin campo de contraseña y con al menos una
cookie `sb-` en el contexto (3.2, con 1.1 y 3.1 de apoyo).

**Qué pasó:** verde en las dos corridas, sin reintentos. Las cinco aserciones
—`pathname`, `search` vacío, cookie `sb-`, `pathname` otra vez y conteo cero de
`input[type="password"]`— se cumplieron.

**Causa raíz:** no aplica. La cadena que sostiene el caso es
`app/acceso/actions.ts:88` (`redirect(PANEL_HREF)`), la escritura de cookies de
`lib/supabase/server.ts:35` y la guardia de `app/panel/layout.tsx:46-48`.

**Veredicto:** — (verde legítimo, con una salvedad de alcance).

**Recomendación:** ninguna sobre el archivo. Ver «Cobertura sospechosa»: la
segunda mitad del caso no distingue «la sesión sobrevivió» de «el panel no mira
nada».

## CF-01 — Un correo vacío se rechaza como cualquier otro intento fallido

**Qué se esperaba:** con el campo de correo vacío y una contraseña centinela,
aterrizar en `/acceso` con `search` exactamente `?intent=login&error=credenciales`,
ver el mensaje compartido y no obtener ninguna cookie `sb-` (1.4, con 2.1 y 2.3).

**Qué pasó:** verde. Se resuelve además la pregunta que el plan dejó abierta en
sus notas de implementación (líneas 145-151): **el envío sí llega al servidor y
no hizo falta ningún `noValidate`.** `components/ui/Field.tsx:34-41` renderiza el
`<input>` sin `required`, y la validación nativa de `type="email"` solo se aplica
a un valor no vacío; la prueba observable es que la dirección final trae
`error=credenciales`, marcador que únicamente emite el servidor
(`lib/routes.ts:27-29`).

**Causa raíz:** no aplica. El rechazo lo emite `app/acceso/actions.ts:57-59`
(`if (!credentials.success) redirect(LOGIN_ERROR_HREF)`), sobre el esquema de
`app/acceso/actions.ts:14-17`.

**Veredicto:** — (verde, pero probando menos de lo que su traza declara).

**Recomendación:** corregir la traza del plan, no el test. La fila del resumen
(`E2E-test-cases-plan.md:37`) atribuye este caso a 1.4, 2.1 y 2.3; lo que las
aserciones distinguen es 2.1 y 2.3. Ver la mutación exacta abajo. Alternativa si
se quiere que el archivo defienda 1.4 desde el navegador: no la hay — es el hueco
que el propio plan documenta en sus líneas 211-221, y la mitad que importa ya la
cierra `app/acceso/actions.test.ts` contando `createClient` en cero.

## CF-02 — Un `error` escrito a mano en la dirección no produce mensaje

**Qué se esperaba:** con `?intent=login&error=otra-cosa` y con
`?intent=login&error=`, cero nodos de mensaje, `<h1>` visible y campo de
contraseña visible (2.5).

**Qué pasó:** verde para las dos direcciones en la misma corrida.

**Causa raíz:** no aplica. El comportamiento lo sostiene
`app/acceso/page.tsx:59`: `const errorMessage = error === LOGIN_ERROR_CODE ? login.errorMessage : undefined;`,
y la ausencia del nodo —no un nodo vacío— la garantiza
`components/sections/AccessScreen.tsx:107`:
`{error === undefined ? null : <p className={styles.error}>{error}</p>}`.

**Veredicto:** — (verde y load-bearing; es el caso de los tres que más aprieta).

**Recomendación:** ninguna.

## Cobertura sospechosa

Tres observaciones. Las mutaciones están descritas, no ejecutadas.

**1. CF-01 no prueba 1.4, solo 2.1 y 2.3. Confianza alta.**
Mutación: en `app/acceso/actions.ts:15`, relajar `email: z.email()` a
`email: z.string()`. El correo vacío deja de ser rechazado por el esquema, llega
a `supabase.auth.signInWithPassword` en `app/acceso/actions.ts:75`, Supabase lo
rechaza, y `app/acceso/actions.ts:82` redirige **a la misma dirección**
`LOGIN_ERROR_HREF`. CF-01 seguiría verde con la validación desarmada. No es un
defecto del test: es la consecuencia de que 2.2 exija que los dos rechazos sean
indistinguibles, y el plan lo dice con todas las letras. Pero conviene que el
reporte lo repita, porque un verde en CF-01 no autoriza a tocar
`CredentialsSchema`.
Mutación que sí lo tumba, y que muestra qué defiende de verdad: quitar
`action={submitAction}` en `components/sections/AccessScreen.tsx:116`. El
formulario pasaría a enviarse por GET y la contraseña centinela terminaría en la
barra de direcciones; caerían las aserciones de `e2e/login-supabase.spec.ts:136`
y `:139`. Esa es la línea que CF-01 protege, y no es poca cosa.

**2. La segunda mitad de CP-01 no prueba que exista guardia. Confianza alta.**
Mutación: comentar `if (!user) { redirect(LOGIN_HREF); }` en
`app/panel/layout.tsx:46-48`. Con `/panel` abierto a cualquiera, las dos
aserciones de `pathname` (`e2e/login-supabase.spec.ts:72` y `:88`), el `<h1>` y
el conteo cero de contraseñas se cumplen igual. CP-01 seguiría verde. Que un
pedido posterior sea **verificado** está anclado únicamente en `CF-02` de
`e2e/acceso.spec.ts`, fuera de este archivo. Lo que CP-01 sí detecta es la
mutación complementaria: convertir en no-op el `store.set` de
`lib/supabase/server.ts:35`; sin cookie escrita cae la aserción de
`e2e/login-supabase.spec.ts:78` y, detrás, el regreso a `/panel`. Es decir, CP-01
prueba la persistencia de la sesión, no la vigilancia del panel. La traza a 3.2
es correcta solo mientras la guardia siga viva y probada en el otro archivo; si
alguien borra ese `CF-02` de `e2e/acceso.spec.ts`, este CP-01 no se entera.

**3. `[class*='error']` es un ancla por subcadena. Confianza media, severidad baja.**
Hoy no es ambigua: `components/sections/AccessScreen.tsx:107` es el único
`styles.error` del repositorio, y en el build recién compilado la única clase con
`error` en el nombre es `AccessScreen_error__06KxZ`
(`.next/static/css/731d4fa12caa4d76.css`); las apariciones de `--error-text` son
propiedades personalizadas y no matchean un selector de atributo `class`. El
riesgo es futuro: una clase nueva llamada `errorBoundary`, `errorless` o
parecida en cualquier componente que la pantalla renderice volvería falsamente
roja la aserción de `e2e/login-supabase.spec.ts:184` sin que 2.5 se haya roto. No
propongo cambiarlo ahora —una búsqueda por texto sería peor, por el motivo que el
plan explica— pero queda anotado como deuda de fragilidad.

## Decisiones para el usuario

**1. La traza de CF-01 en el plan sobreafirma.** `E2E-test-cases-plan.md:37`
declara «1.4, 2.1, 2.3»; lo verificable de punta a punta es 2.1 y 2.3. El plan ya
explica por qué en su propia prosa, así que la corrección es de una línea en la
tabla de resumen. Como no puedo escribir el plan, queda acá: decidí si preferís
que otro agente ajuste esa fila a «2.1, 2.3 (1.4 solo en `actions.test.ts`)» o
que se deje como está con esta nota como aclaración.

**2. Acoplamiento entre archivos que nadie declara.** CP-01 de este archivo hereda
su valor de que `CF-02` de `e2e/acceso.spec.ts` siga defendiendo la guardia de
`/panel`. Hoy eso no está escrito en ninguno de los dos. Si querés que el
acoplamiento sea visible, corresponde una línea de comentario en
`e2e/login-supabase.spec.ts` — cambio de otro agente, no mío.

**3. Nada que devolver a implementación.** No encontré ningún comportamiento del
producto que contradiga un criterio numerado del spec, y no emito ningún veredicto
de «Código»: no hay archivo ni línea que pueda citar en contra, porque no hay
fallo.
