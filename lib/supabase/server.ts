import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { supabaseEnv } from "./env";

/**
 * The Supabase client bound to the cookies of the request in flight.
 *
 * The one module of the project that touches session cookies. Everything that
 * needs a session — the sign-in action, the dashboard guard — goes through
 * here, so there is a single place where the storage of a token is decided.
 *
 * The address and the key come from `lib/supabase/env`, never from a literal
 * and never from a `process.env` read in this file: a setting validated in two
 * places eventually disagrees with itself.
 */
export async function createClient(): Promise<SupabaseClient> {
  const store = await cookies();

  return createServerClient(supabaseEnv.url, supabaseEnv.publishableKey, {
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll(list) {
        try {
          for (const { name, value, options } of list) {
            /*
             * 3.4 — `httpOnly` is imposed on whatever the library sent, asked
             * for or not. Nothing in the browser reads these cookies: every
             * consumer runs on the server, so putting the tokens out of reach
             * of page scripts costs nothing and removes a whole class of theft.
             */
            store.set(name, value, { ...options, httpOnly: true });
          }
        } catch {
          /*
           * Next refuses cookie writes from a Server Component. In that context
           * the client is only reading, so the refusal is expected and the
           * request carries on. The renewal that would have been written is
           * what `middleware.ts` exists to carry instead.
           */
        }
      },
    },
  });
}
