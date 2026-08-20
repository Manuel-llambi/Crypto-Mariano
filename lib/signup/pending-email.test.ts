import { beforeEach, describe, expect, it, vi } from "vitest";

/*
 * The same assembly as `lib/supabase/server.test.ts`: a make-believe cookie
 * store standing in for `next/headers`, recording what it is asked to write.
 *
 * A cookie attribute is invisible in rendered markup, so nothing above this
 * layer can assert `httpOnly` or the `path`. This is the only place those two
 * can be checked, which is why they are checked here rather than trusted.
 */
const store = {
  jar: new Map<string, string>(),
  recorded: [] as { name: string; value: string; options: Record<string, unknown> }[],
  get(name: string) {
    const value = this.jar.get(name);
    return value === undefined ? undefined : { name, value };
  },
  set(name: string, value: string, options: Record<string, unknown>) {
    this.recorded.push({ name, value, options });

    // A cookie written empty with `maxAge: 0` is how a deletion arrives, and
    // the jar has to behave accordingly or "clearing works" would be vacuous.
    if (value === "" || options.maxAge === 0) {
      this.jar.delete(name);
    } else {
      this.jar.set(name, value);
    }
  },
};

vi.mock("next/headers", () => ({ cookies: async () => store }));

import {
  PENDING_EMAIL_COOKIE,
  clearPendingEmail,
  readPendingEmail,
  setPendingEmail,
} from "./pending-email";

const EMAIL = "sentinela-correo@crypto-crime.test";

/** The options of the single write, whichever operation produced it. */
function lastOptions(): Record<string, unknown> {
  expect(store.recorded.length).toBeGreaterThan(0);
  return store.recorded[store.recorded.length - 1]!.options;
}

beforeEach(() => {
  store.jar.clear();
  store.recorded = [];
});

describe("holding the address while the visitor types the code", () => {
  // 4.1 — out of reach of anything running in the browser. Nothing there reads
  // it: both consumers are Server Actions.
  it("writes it httpOnly", async () => {
    await setPendingEmail(EMAIL);

    expect(lastOptions().httpOnly).toBe(true);
  });

  /*
   * The cookie is not sent anywhere else.
   *
   * `path` is also the trap of the whole module: deleting a cookie requires the
   * same path it was written with, so a `clearPendingEmail` that forgot it
   * would leave the cookie in place and 4.2 would silently not happen.
   */
  it("scopes it to the sign-up flow and nothing else", async () => {
    await setPendingEmail(EMAIL);

    expect(lastOptions().path).toBe("/registro");
  });

  it("uses the same attributes as the session cookies", async () => {
    await setPendingEmail(EMAIL);

    expect(lastOptions().sameSite).toBe("lax");
    // The code expires in an hour, so the address has no business outliving it.
    expect(lastOptions().maxAge).toBe(3600);
  });

  it("reads back what it wrote", async () => {
    await setPendingEmail(EMAIL);

    await expect(readPendingEmail()).resolves.toBe(EMAIL);
  });

  // 4.3 — this `undefined` is what the guard of step 2 asks about before it
  // renders anything.
  it("reads undefined when there is no cookie", async () => {
    await expect(readPendingEmail()).resolves.toBeUndefined();
  });
});

describe("discarding it once the code is verified (4.2)", () => {
  it("leaves nothing to read", async () => {
    await setPendingEmail(EMAIL);
    await clearPendingEmail();

    await expect(readPendingEmail()).resolves.toBeUndefined();
  });

  it("deletes with the path it wrote with, or the deletion does not happen", async () => {
    await setPendingEmail(EMAIL);
    store.recorded = [];

    await clearPendingEmail();

    expect(lastOptions().path).toBe("/registro");
  });
});

describe("the name of the cookie", () => {
  it("is declared once, and every operation uses it", async () => {
    await setPendingEmail(EMAIL);
    await clearPendingEmail();

    expect(PENDING_EMAIL_COOKIE).toBe("registro_correo");
    for (const write of store.recorded) {
      expect(write.name).toBe(PENDING_EMAIL_COOKIE);
    }
  });
});
