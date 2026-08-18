import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
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
    exclude: ["node_modules/**", ".next/**", "e2e/**"],
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
