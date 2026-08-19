/**
 * Loads `.env` into this process, and does it as a side effect on import.
 *
 * Playwright reads no `.env` of its own — `dotenv` is not a dependency of the
 * runner and is not installed here — so the file Next reads during `build` and
 * `start` never reaches the runner. `process.loadEnvFile()` closes that gap
 * without adding a dependency.
 *
 * It is a module of its own rather than a couple of lines inside
 * `playwright.global-setup.ts` because of evaluation order: ESM runs an
 * imported module before the body of the importer, so this has to be imported
 * *above* `lib/supabase/env`, which validates its two settings the moment it
 * loads. A dynamic `import()` would order it correctly too, but Playwright's TS
 * transform does not reach a path resolved at runtime.
 *
 * `loadEnvFile` does not overwrite a variable that already came from the shell,
 * which is what lets a run point the health check at a dead port.
 */
try {
  process.loadEnvFile();
} catch {
  // No `.env` in the tree. The shell may still carry the settings, and if it
  // does not, `lib/supabase/env` is what says which one is missing.
}
