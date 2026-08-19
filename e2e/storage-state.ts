/**
 * Where `e2e/auth.setup.ts` writes the session and `e2e/panel.spec.ts` reads it.
 *
 * A module of its own because Playwright refuses to let a spec import a test
 * file, and `auth.setup.ts` is one — so the constant cannot live beside the
 * setup that produces it. Spelling the path twice was the alternative, and a
 * path spelled twice eventually disagrees with itself.
 *
 * The directory is gitignored: the file holds live session tokens, and a local
 * test account does not make them versionable.
 */
export const STORAGE_STATE = "e2e/.auth/student.json";
