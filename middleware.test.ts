import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

/*
 * Half of the assembly of `lib/supabase/server.test.ts`, and only half: this
 * module does not import `next/headers`, so that double is not here.
 *
 * The fake `createServerClient` captures the `cookies` adapter it is handed and
 * returns a client whose `auth.getUser()` is asynchronous and calls `setAll`
 * before it resolves — which is what the real library does when the token has
 * expired. Making it asynchronous is deliberate: it is what catches an
 * implementation that calls `getUser()` without awaiting it.
 */

interface CookieAdapter {
  getAll: () => { name: string; value: string }[];
  setAll: (list: { name: string; value: string; options?: Record<string, unknown> }[]) => void;
}

const { state, createServerClient, getUser, getSession } = vi.hoisted(() => {
  const state: { captured?: { url: string; key: string; cookies: CookieAdapter }; renew: boolean } =
    { renew: true };

  const getUser = vi.fn(async () => {
    if (state.renew) {
      state.captured!.cookies.setAll([
        { name: "sb-access-token", value: "renovado", options: { path: "/" } },
      ]);
    }
    return { data: { user: state.renew ? { id: "un-usuario" } : null } };
  });

  const getSession = vi.fn();

  return {
    state,
    getUser,
    getSession,
    createServerClient: vi.fn(
      (url: string, key: string, options: { cookies: CookieAdapter }) => {
        state.captured = { url, key, cookies: options.cookies };
        return { auth: { getUser, getSession } };
      },
    ),
  };
});

vi.mock("@supabase/ssr", () => ({ createServerClient }));

import { config, middleware } from "./middleware";

function request(cookie?: string): NextRequest {
  return new NextRequest("http://127.0.0.1:3100/panel", {
    headers: cookie === undefined ? undefined : { cookie },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  state.captured = undefined;
  state.renew = true;
});

describe("renewing the session token", () => {
  // 3.2 — the mechanism the middleware owns: renewed cookies leave in the
  // response. Recognising the visitor across two requests is a fact of a real
  // browser, and CP-01 and the dashboard suite are where that is observed.
  it("carries the cookies the library renewed out in the response", async () => {
    const response = await middleware(request("sb-access-token=viejo"));

    expect(response.headers.get("set-cookie")).toContain("sb-access-token=renovado");
  });

  it("hands the library the cookies of the incoming request", async () => {
    await middleware(request("sb-access-token=viejo"));

    expect(state.captured!.cookies.getAll()).toEqual([
      { name: "sb-access-token", value: "viejo" },
    ]);
  });

  // 3.3 — `getUser()` validates against the authentication server. `getSession()`
  // reads the cookie and believes it, and on the server the cookie is input.
  it("asks the authentication server, never just the cookie", async () => {
    await middleware(request("sb-access-token=viejo"));

    expect(getUser).toHaveBeenCalledTimes(1);
    expect(getSession).not.toHaveBeenCalled();
  });

  it("builds the client with the two settings of lib/supabase/env", async () => {
    await middleware(request());

    expect(state.captured!.url).toBe("http://127.0.0.1:55321");
    expect(state.captured!.key).toBe("sb_publishable_test_key");
  });
});

/*
 * The middleware authorises nothing. It refreshes; the layout decides.
 *
 * "Without a session it does not redirect" is green against a middleware that
 * does nothing at all, so the case also asserts that the renewal path was
 * actually walked and that what comes back is a continuation — a
 * `NextResponse.redirect` is unmistakable: 307 with `location` set.
 */
describe("the middleware does not authorise", () => {
  it("lets a request with no session through, having still asked", async () => {
    state.renew = false;

    const response = await middleware(request());

    expect(getUser).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });
});

describe("the matcher", () => {
  // A literal assertion, and it earns its place by what it prevents: shortening
  // it to `["/panel"]` would leave every future screen under the dashboard
  // without renewal.
  it("covers the dashboard and everything under it", () => {
    expect(config.matcher).toEqual(["/panel/:path*"]);
  });
});
