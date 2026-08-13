---
name: planning-task
description: "Trigger: crear tasks.md, iterar tasks.md, planificar tareas del spec, retomar planeación, bootstrap de tareas. Convierte un requirements.md y design.md ya aprobados en un tasks.md 100% convergido, lanzando el subagente planner en modo bootstrap y luego una tarea por invocación hasta que todas obtengan veredicto CRITERIA MET."
license: Apache-2.0
metadata:
  version: "1.0"
---

## Contrato de activación

Cargar este skill cuando haya que crear o re-converger el `tasks.md` de un spec — como Fase 3 de `/specify`, después de un cambio en `requirements.md`/`design.md`, o para retomar una planeación que quedó a mitad. Requiere que `requirements.md` y `design.md` ya estén aprobados en la carpeta del spec.

## Reglas duras

- Nunca editar `tasks.md` a mano: toda escritura pasa por el subagente `planner` (`.claude/agents/planner.md`, Agent tool, `subagent_type: "planner"`).
- Un solo planner en modo `bootstrap` cuando `tasks.md` no existe o no tiene ninguna tarea todavía — nunca más de uno para el borrador inicial.
- A partir de ahí, una tarea por invocación, siempre secuencial — nunca en paralelo: todas comparten el mismo `tasks.md` y una escritura concurrente lo corrompe.
- Decision log y Outcome de cada tarea quedan vacíos: se completan en la ejecución TDD, no en esta fase.
- Meta de salida: **100%** de las tareas con veredicto `CRITERIA MET` de esta sesión — una convergencia parcial no cierra el skill.

## Puertas de decisión

| Situación | Acción |
|---|---|
| No hay `requirements.md`/`design.md` aprobados en la carpeta | Parar y derivar a `/specify` o `/brainstorming` primero |
| No existe `tasks.md`, o existe sin tareas | Lanzar un planner en modo `bootstrap`; releer `tasks.md` para obtener los IDs reales que creó |
| Hay tareas con veredicto pendiente | Encolar cada ID del Resumen de tareas y lanzar un planner en modo `T<n>` por invocación |
| Veredicto `NEEDS ITERATION` | Reinvocar el planner para la misma tarea con el `SIGUIENTE` que indicó el veredicto anterior |
| `NEEDS ITERATION` 3 veces seguidas para la misma tarea | Dejar de iterarla y exponer el hallazgo al usuario — señal de un hueco estructural en el spec, no de una tarea difícil |
| El veredicto divide una tarea o reporta tareas nuevas | Agregarlas a la cola: todavía no convergieron |
| El planner reporta un hallazgo que solo el usuario puede resolver | Pausar el loop, preguntar, y recién ahí reinvocar esa tarea con la respuesta |
| Todas las tareas en `CRITERIA MET` | Presentar `tasks.md` convergido para aprobación del usuario |

## Pasos de ejecución

1. Confirmar que la carpeta de spec (`docs/specs/<fecha>-<feature>/`) tiene `requirements.md` y `design.md` aprobados.
2. Leer `tasks.md` si existe. Si no existe o no tiene tareas, lanzar el planner en modo `bootstrap`.
3. Armar la cola de trabajo con cada ID pendiente del Resumen de tareas.
4. Iterar la cola secuencialmente: un planner por tarea hasta `CRITERIA MET`, aplicando las puertas de decisión de arriba (reinvocación, escalamiento a 3 intentos, tareas nuevas por división).
5. No terminar hasta que el 100% de las tareas tenga veredicto `CRITERIA MET` de esta sesión.

## Contrato de salida

Reportar el estado final de `tasks.md` (100% convergido, o qué tarea/hallazgo sigue bloqueando y qué debe decidir el usuario) y la ruta de la carpeta del spec. Con `tasks.md` aprobado por el usuario, el alcance de este skill termina — la ejecución TDD que completa Decision log y Outcome no es parte de este skill.

## Referencias

- `.claude/agents/planner.md` — contrato del subagente que crea e itera `tasks.md` (modos `bootstrap` y `T<n>`, formato de veredicto).
- `.claude/skills/specify/assets/tasks-template.md` — estructura de `tasks.md` que usa el planner en modo bootstrap.
- `.claude/skills/specify/SKILL.md` — flujo completo de spec (requirements → design → tasks); este skill cubre solo la fase de tasks.
