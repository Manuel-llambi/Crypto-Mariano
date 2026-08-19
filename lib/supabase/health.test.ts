import { afterEach, describe, expect, it, vi } from "vitest";

import { assertSupabaseIsUp } from "./health";

const URL_UNDER_TEST = "http://127.0.0.1:55321";

afterEach(() => {
  vi.unstubAllGlobals();
});

/*
 * 7.1 — an unprepared environment has to look different from a defect.
 *
 * "Not answering" has two shapes and both have to be covered: nothing listening
 * at all, which makes `fetch` reject, and a container that is up with a sick
 * auth service, which answers with a non-2xx status. A check that only handled
 * the first would let the second reach the specs, where it would surface as an
 * expired `expect` pointing at the access screen — the wrong diagnosis, which
 * is the whole thing this exists to prevent.
 */
describe("the health check", () => {
  it("resolves when the instance answers 2xx", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 200 })));

    await expect(assertSupabaseIsUp(URL_UNDER_TEST)).resolves.toBeUndefined();
  });

  it("asks for the health endpoint and sends no key", async () => {
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await assertSupabaseIsUp(URL_UNDER_TEST);

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit | undefined];
    expect(url).toBe(`${URL_UNDER_TEST}/auth/v1/health`);
    // The endpoint asks for neither, and sending a key would hide a 401 behind
    // a message about the instance being down.
    expect(JSON.stringify(init?.headers ?? {})).not.toMatch(/apikey|authorization/i);
  });

  it("rejects when nothing is listening, naming the cause and the address", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("fetch failed");
      }),
    );

    await expect(assertSupabaseIsUp(URL_UNDER_TEST)).rejects.toThrow(/local Supabase/i);
    await expect(assertSupabaseIsUp(URL_UNDER_TEST)).rejects.toThrow(URL_UNDER_TEST);
  });

  it("rejects on a non-2xx answer, naming the cause and the address", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("nope", { status: 503 })));

    await expect(assertSupabaseIsUp(URL_UNDER_TEST)).rejects.toThrow(/local Supabase/i);
    await expect(assertSupabaseIsUp(URL_UNDER_TEST)).rejects.toThrow(URL_UNDER_TEST);
  });
});
