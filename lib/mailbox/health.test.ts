import { afterEach, describe, expect, it, vi } from "vitest";

import { assertMailboxIsUp } from "./health";

const URL_UNDER_TEST = "http://127.0.0.1:55324";

afterEach(() => {
  vi.unstubAllGlobals();
});

/*
 * 9.4 — an unprepared environment has to look different from a defect.
 *
 * The same shape as `lib/supabase/health.test.ts`, and for the same reason. The
 * sign-up suite reads the verification code out of the local mailbox, so a
 * mailbox that is not there makes every one of its cases die on an expired
 * `expect` pointing at the code screen — healthy code, wrong diagnosis.
 *
 * "Not answering" has two shapes and both are covered: nothing listening at
 * all, which makes `fetch` reject, and a container that is up with a sick
 * service, which answers with a non-2xx status.
 */
describe("the mailbox health check", () => {
  it("resolves when the mailbox answers 2xx", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 200 })));

    await expect(assertMailboxIsUp(URL_UNDER_TEST)).resolves.toBeUndefined();
  });

  it("asks the API rather than the web interface", async () => {
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await assertMailboxIsUp(URL_UNDER_TEST);

    const [url] = fetchMock.mock.calls[0] as unknown as [string];
    // The root path serves the single-page interface, which answers 200 from a
    // static file server too. The API is what the helper actually depends on.
    expect(url).toBe(`${URL_UNDER_TEST}/api/v1/info`);
  });

  it("rejects when nothing is listening, naming the mailbox and the address", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("fetch failed");
      }),
    );

    // Naming the mailbox is the whole point: «Supabase is down» would send
    // whoever reads it to the wrong container.
    await expect(assertMailboxIsUp(URL_UNDER_TEST)).rejects.toThrow(/mailbox/i);
    await expect(assertMailboxIsUp(URL_UNDER_TEST)).rejects.toThrow(URL_UNDER_TEST);
  });

  it("rejects on a non-2xx answer, naming the mailbox and the address", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("nope", { status: 503 })));

    await expect(assertMailboxIsUp(URL_UNDER_TEST)).rejects.toThrow(/mailbox/i);
    await expect(assertMailboxIsUp(URL_UNDER_TEST)).rejects.toThrow(URL_UNDER_TEST);
  });
});
