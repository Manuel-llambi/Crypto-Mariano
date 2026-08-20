import { beforeEach, describe, expect, it, vi } from "vitest";

/*
 * The same three doubles as `app/acceso/actions.test.ts`, plus the cookie
 * module: this file does not care how the address is stored, only that it is,
 * and where the visitor lands.
 *
 * `redirect` records its argument and then throws, exactly as the real one
 * signals. A double that merely returned would leave a `redirect` wrongly
 * wrapped in a `try`/`catch` invisible, and every assertion below depends on
 * the navigation actually happening.
 */
const { signInWithOtp, createClient, redirect, setPendingEmail } = vi.hoisted(() => {
  const signInWithOtp = vi.fn();

  return {
    signInWithOtp,
    createClient: vi.fn(async () => ({ auth: { signInWithOtp } })),
    redirect: vi.fn((destination: string): never => {
      throw new Error(`NEXT_REDIRECT:${destination}`);
    }),
    setPendingEmail: vi.fn(async () => {}),
  };
});

vi.mock("@/lib/supabase/server", () => ({ createClient }));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("@/lib/signup/pending-email", () => ({ setPendingEmail }));

import { requestCode } from "./actions";

const EMAIL = "sentinela-correo@crypto-crime.test";

const REJECTED = "/registro?intent=signup&error=correo";

function form(email = EMAIL): FormData {
  const formData = new FormData();
  formData.set("email", email);
  return formData;
}

/** The single argument `redirect` was called with. */
function destination(): string {
  expect(redirect).toHaveBeenCalledTimes(1);
  return redirect.mock.calls[0]![0];
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("a request Supabase accepts", () => {
  beforeEach(() => {
    signInWithOtp.mockResolvedValue({ data: {}, error: null });
  });

  /*
   * 1.1 and 1.3 — `shouldCreateUser: true` is half the criterion.
   *
   * Without it an address with no account would be refused and one with an
   * account accepted, and the screen would be answering the question of which
   * addresses are registered.
   */
  it("asks Supabase for a code, creating the account if there was none", async () => {
    await expect(requestCode(form())).rejects.toThrow();

    expect(signInWithOtp).toHaveBeenCalledTimes(1);
    expect(signInWithOtp).toHaveBeenCalledWith({
      email: EMAIL,
      options: { shouldCreateUser: true },
    });
  });

  it("holds on to the address and moves to the code step", async () => {
    await expect(requestCode(form())).rejects.toThrow();

    expect(setPendingEmail).toHaveBeenCalledTimes(1);
    expect(setPendingEmail).toHaveBeenCalledWith(EMAIL);
    expect(destination()).toBe("/registro/codigo");
  });

  // 1.5 — the address travels in a cookie, never in the address bar, which
  // reaches history, server logs and the referrer of the next request.
  it("carries nothing the visitor typed in the destination", async () => {
    await expect(requestCode(form())).rejects.toThrow();

    expect(destination()).not.toContain(EMAIL);
    expect(destination()).not.toContain("@");
  });
});

/*
 * 1.4 — every refusal is the same refusal.
 *
 * A rejected send and an instance that is not there arrive differently — one as
 * an `{ error }`, the other as a thrown exception — and no branch of the action
 * tells them apart.
 */
describe("a request Supabase refuses", () => {
  const refusals: [string, () => void][] = [
    [
      "a rejected send",
      () =>
        signInWithOtp.mockResolvedValue({
          data: {},
          error: { message: "Error sending magic link", code: "unexpected_failure" },
        }),
    ],
    [
      "the instance being down",
      () =>
        // A throwing implementation, not `mockRejectedValue`: the latter builds
        // its rejected promise the moment it is arranged, and vitest reports
        // that as an unhandled rejection before the action ever runs.
        signInWithOtp.mockImplementation(async () => {
          throw new Error("fetch failed");
        }),
    ],
  ];

  for (const [label, arrange] of refusals) {
    describe(label, () => {
      // Wrapped so nothing is returned: vitest reads a function returned from
      // `beforeEach` as a teardown callback.
      beforeEach(() => {
        arrange();
      });

      it("returns to step 1 with the same marker as any other failure", async () => {
        await expect(requestCode(form())).rejects.toThrow();

        expect(destination()).toBe(REJECTED);
      });

      // Nothing was sent, so there is nothing to come back to.
      it("holds on to no address", async () => {
        await expect(requestCode(form())).rejects.toThrow();

        expect(setPendingEmail).not.toHaveBeenCalled();
      });

      it("carries the address nowhere", async () => {
        await expect(requestCode(form())).rejects.toThrow();

        expect(destination()).not.toContain(EMAIL);
      });
    });
  }
});

/*
 * 1.2 — what never reaches Supabase at all.
 *
 * "Supabase was not called" is true of an empty implementation, so on its own
 * it proves nothing. Each case also asserts the destination as a literal, which
 * an empty implementation cannot produce because the `redirect` double throws,
 * and the happy path above stays green, which an over-eager validation breaks.
 */
describe("a request that never reaches Supabase", () => {
  const malformed: [string, FormData][] = [
    ["an empty address", form("")],
    ["an address with no @", form("sentinela-correo-sin-arroba")],
    ["an address with no domain", form("sentinela@")],
  ];

  for (const [label, formData] of malformed) {
    describe(label, () => {
      it("is refused without a client ever being built", async () => {
        await expect(requestCode(formData)).rejects.toThrow();

        // Counting `createClient` and not only `signInWithOtp` ties this to
        // "parse first" rather than to "refuse somewhere".
        expect(createClient).not.toHaveBeenCalled();
        expect(signInWithOtp).not.toHaveBeenCalled();
        expect(setPendingEmail).not.toHaveBeenCalled();
      });

      it("lands where every other refusal lands", async () => {
        await expect(requestCode(formData)).rejects.toThrow();

        expect(destination()).toBe(REJECTED);
      });
    });
  }

  // The field is read one by one rather than with `Object.fromEntries`: with a
  // strict schema, a surplus field would fail the sign-up for a reason that has
  // nothing to do with the address.
  it("ignores a surplus field rather than failing over it", async () => {
    signInWithOtp.mockResolvedValue({ data: {}, error: null });

    const formData = form();
    formData.set("intent", "signup");

    await expect(requestCode(formData)).rejects.toThrow();

    expect(destination()).toBe("/registro/codigo");
  });
});

/*
 * 1.3 — the path is the same whether or not the account existed.
 *
 * There is nothing to assert about "the account existed" because the action
 * never learns it: Supabase answers the same way in both cases, and this pair
 * is what shows that no branch depends on it.
 */
describe("who decides", () => {
  it("takes an existing address and a new one to the same place", async () => {
    signInWithOtp.mockResolvedValue({ data: {}, error: null });
    await expect(requestCode(form("ya-tiene-cuenta@crypto-crime.test"))).rejects.toThrow();
    expect(destination()).toBe("/registro/codigo");

    vi.clearAllMocks();

    signInWithOtp.mockResolvedValue({ data: {}, error: null });
    await expect(requestCode(form("nunca-vista@crypto-crime.test"))).rejects.toThrow();
    expect(destination()).toBe("/registro/codigo");
  });
});
