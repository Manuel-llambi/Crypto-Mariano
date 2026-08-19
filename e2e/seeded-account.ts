/**
 * The account `supabase/seed.sql` plants. Change it there first, then here.
 *
 * SQL cannot import anything and `supabase db reset` passes no parameters, so
 * one copy in SQL and one in TypeScript is the floor. This is that second copy,
 * and `e2e/acceso.spec.ts`, `e2e/no-javascript.spec.ts`, `e2e/panel.spec.ts`
 * and `e2e/auth.setup.ts` all import it rather than typing the literals again.
 *
 * If the two files ever drift, CP-01 fails as «invalid credentials» — a symptom
 * that reads like a defect in the code. This comment is what sends whoever sees
 * it to the right place.
 *
 * It lives in `e2e/` and not in `lib/`: in `lib/` it would sit inside the graph
 * `next build` can reach, and a test credential importable from `app/` is an
 * accident waiting to happen. The cost is that `tsconfig.json` excludes `e2e/`,
 * so this file is not typechecked — two constants with no logic.
 */
export const SEEDED_EMAIL = "alumno@crypto-crime.test";
export const SEEDED_PASSWORD = "investigacion-2024";
