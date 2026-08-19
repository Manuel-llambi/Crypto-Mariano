import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
      // `next/font/local` is rewritten by Next's SWC plugin at build time, so
      // outside a Next build it resolves to something that is not callable and
      // every test that imports `app/layout.tsx` fails on import. The stub
      // returns the shape the layout consumes; see the file for why nothing is
      // asserted through it.
      "next/font/local": fileURLToPath(
        new URL("./test/next-font-local.ts", import.meta.url),
      ),
    },
  },
  // tsconfig says `jsx: "preserve"` because Next does its own transform. Vitest
  // has no Next pipeline, so it needs the automatic runtime spelled out — with
  // the classic one, every component test fails on `React is not defined`.
  esbuild: {
    jsx: "automatic",
  },
  test: {
    include: ["**/*.test.ts", "**/*.test.tsx"],
    // Declaring `exclude` replaces vitest's defaults rather than adding to
    // them, so every directory to skip has to be spelled out here.
    //
    // `**/node_modules/**`, not `node_modules/**`: the unprefixed form only
    // matches the one at the root. A git worktree checked out inside the
    // project brings its own, and then React resolves twice — the hook
    // dispatcher comes back null and every component test dies on `useRef`.
    // `.claude/**` covers the worktrees themselves, whose test files are real
    // and would otherwise be collected a second time from a stale commit.
    exclude: ["**/node_modules/**", ".next/**", "e2e/**", ".claude/**"],
    // Any component that links to the access screen imports `lib/access-url`,
    // which throws at import time when this is missing. A fixed test address
    // keeps those imports working; `lib/access-url.test.ts` still overrides it
    // per case to cover the rejections of 6.5.
    env: {
      NEXT_PUBLIC_ACCESS_URL: "https://acceso.test/acceso",
      // Every module that talks to Supabase imports `lib/supabase/env`, which
      // throws at import time when either of these is missing. The address is
      // the local instance declared in `supabase/config.toml`;
      // `lib/supabase/env.test.ts` still overrides both per case to cover the
      // rejections of 6.1.
      SUPABASE_URL: "http://127.0.0.1:55321",
      SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test_key",
    },
  },
});
