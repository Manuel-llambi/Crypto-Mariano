import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { supabaseEnv } from "@/lib/supabase/env";

/**
 * Keeps the session token fresh on every dashboard request (3.2).
 *
 * `supabase/config.toml` sets `jwt_expiry = 3600`, and Next forbids writing
 * cookies from a Server Component — the `setAll` of `lib/supabase/server`
 * swallows that refusal on purpose. Without this file the renewed session would
 * therefore be discarded in silence and the student would be locked out after
 * an hour.
 *
 * It does not reuse `createClient()` of `lib/supabase/server`, and that is not
 * duplication: that one writes into the cookie store of the request, whereas
 * the renewal here has to travel in the *response* this function returns, an
 * object that module never sees. What is shared is `lib/supabase/env`: the
 * address and the key come from there, never from a literal.
 *
 * It authorises nothing. It refreshes, and the layout of `/panel` decides who
 * gets in — no route is inspected here and nothing is redirected.
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  /*
   * The response is built first and handed to `setAll`, so whatever the library
   * renews is written into the object that is actually returned. Building it
   * after `getUser()` would throw those cookies away.
   */
  const response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseEnv.url, supabaseEnv.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(list) {
        for (const { name, value, options } of list) {
          // 3.4 — imposed here for the same reason as in `lib/supabase/server`:
          // nothing in the browser reads these, so page scripts have no
          // business reaching them.
          response.cookies.set(name, value, { ...options, httpOnly: true });
        }
      },
    },
  });

  // 3.3 — `getUser()` validates against the authentication server. Awaited, so
  // the renewal it triggers is written before the response leaves.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  // `/panel/:path*` matches `/panel` itself as well as everything under it, so
  // screens added to the dashboard later are covered without touching this.
  matcher: ["/panel/:path*"],
};
