import { beforeEach, describe, expect, it, vi } from "vitest";

/*
 * The first `vi.mock` of the repository, so the assembly is spelled out: T7 and
 * T11 mock this very module one layer up, and they inherit the convention.
 *
 * Two doubles. `next/headers` returns a make-believe cookie store that records
 * every `set`; `@supabase/ssr` returns a `createServerClient` that captures the
 * `cookies` adapter it is handed instead of building a client. The test then
 * calls that adapter by hand — there is no network to exercise here.
 */

interface Recorded {
  name: string;
  value: string;
  options: Record<string, unknown>;
}

const store = {
  entries: [] as { name: string; value: string }[],
  recorded: [] as Recorded[],
  throwOnSet: false,
  getAll() {
    return this.entries;
  },
  set(name: string, value: string, options: Record<string, unknown>) {
    if (this.throwOnSet) {
      // What Next does when cookies are written from a Server Component.
      throw new Error("Cookies can only be modified in a Server Action or Route Handler");
    }
    this.recorded.push({ name, value, options });
  },
};

vi.mock("next/headers", () => ({ cookies: async () => store }));

interface CookieAdapter {
  getAll: () => { name: string; value: string }[];
  setAll: (list: { name: string; value: string; options?: Record<string, unknown> }[]) => void;
}

let captured: { url: string; key: string; cookies: CookieAdapter } | undefined;

vi.mock("@supabase/ssr", () => ({
  createServerClient: (url: string, key: string, options: { cookies: CookieAdapter }) => {
    captured = { url, key, cookies: options.cookies };
    return { captured: true };
  },
}));

import { createClient } from "./server";

/** Builds the client and hands back the adapter the library was given. */
async function adapter(): Promise<CookieAdapter> {
  await createClient();
  return captured!.cookies;
}

beforeEach(() => {
  store.entries = [];
  store.recorded = [];
  store.throwOnSet = false;
  captured = undefined;
});

describe("the client", () => {
  it("is built with the two settings of lib/supabase/env", async () => {
    await createClient();

    expect(captured!.url).toBe("http://127.0.0.1:55321");
    expect(captured!.key).toBe("sb_publishable_test_key");
  });
});

describe("the cookie adapter", () => {
  // 3.1 — the session is written into the cookie store of the request in flight.
  it("writes name, value and the options the library sent", async () => {
    const cookies = await adapter();

    cookies.setAll([
      {
        name: "sb-access-token",
        value: "un-token",
        options: { path: "/", maxAge: 3600, sameSite: "lax" },
      },
    ]);

    expect(store.recorded).toHaveLength(1);
    expect(store.recorded[0]!.name).toBe("sb-access-token");
    expect(store.recorded[0]!.value).toBe("un-token");
    expect(store.recorded[0]!.options).toMatchObject({
      path: "/",
      maxAge: 3600,
      sameSite: "lax",
    });
  });

  it("reads back whatever the store holds", async () => {
    store.entries = [{ name: "sb-access-token", value: "un-token" }];

    const cookies = await adapter();

    expect(cookies.getAll()).toEqual([{ name: "sb-access-token", value: "un-token" }]);
  });

  /*
   * 3.4 — the two cases enter from the opposite side on purpose.
   *
   * Handing the adapter `{ httpOnly: true }` would leave an implementation that
   * merely forwards the options green without having forced anything. These two
   * fail unless the flag is imposed.
   */
  it("adds httpOnly when the library sent no such option", async () => {
    const cookies = await adapter();

    cookies.setAll([{ name: "sb-access-token", value: "un-token", options: { path: "/" } }]);

    expect(store.recorded[0]!.options.httpOnly).toBe(true);
  });

  it("overrides httpOnly: false — it forces, it does not fill in", async () => {
    const cookies = await adapter();

    cookies.setAll([
      { name: "sb-access-token", value: "un-token", options: { path: "/", httpOnly: false } },
    ]);

    expect(store.recorded[0]!.options.httpOnly).toBe(true);
  });

  // Next forbids writing cookies from a Server Component. There the client is
  // only reading, so the refusal is not an error the request should die of.
  it("swallows the refusal of a read-only context", async () => {
    store.throwOnSet = true;
    const cookies = await adapter();

    expect(() =>
      cookies.setAll([{ name: "sb-access-token", value: "un-token", options: {} }]),
    ).not.toThrow();
  });
});
