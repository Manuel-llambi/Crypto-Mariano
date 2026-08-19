import { beforeEach, describe, expect, it, vi } from "vitest";

/*
 * Two doubles, one layer above the ones of `lib/supabase/server.test.ts`: this
 * file does not care how a cookie is written, only who decides and where the
 * visitor lands.
 *
 * `redirect` records its argument and then throws, exactly as the real one
 * signals. That matters: a double that merely returned would leave a `redirect`
 * wrongly wrapped in a `try`/`catch` invisible, and the whole point of the
 * placement assertions below is that the navigation actually happens.
 */

// `vi.mock` is hoisted above every ordinary declaration of the file, so the
// doubles it closes over have to be built inside `vi.hoisted` to exist by then.
const { signInWithPassword, createClient, redirect } = vi.hoisted(() => {
  const signInWithPassword = vi.fn();

  return {
    signInWithPassword,
    createClient: vi.fn(async () => ({ auth: { signInWithPassword } })),
    redirect: vi.fn((destination: string): never => {
      throw new Error(`NEXT_REDIRECT:${destination}`);
    }),
  };
});

vi.mock("@/lib/supabase/server", () => ({ createClient }));
vi.mock("next/navigation", () => ({ redirect }));

import { signIn } from "./actions";

const EMAIL = "sentinela-correo@crypto-crime.test";
const PASSWORD = "sentinela-contraseña-1234";

const REJECTED = "/acceso?intent=login&error=credenciales";

function credentials(email = EMAIL, password = PASSWORD): FormData {
  const formData = new FormData();
  formData.set("email", email);
  formData.set("password", password);
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

describe("a sign-in Supabase accepts", () => {
  beforeEach(() => {
    signInWithPassword.mockResolvedValue({ data: { session: {} }, error: null });
  });

  // 1.1 — the credentials go through untouched, and the landing is the panel.
  it("hands Supabase exactly the two fields and lands on the dashboard", async () => {
    await expect(signIn(credentials())).rejects.toThrow();

    expect(signInWithPassword).toHaveBeenCalledTimes(1);
    expect(signInWithPassword).toHaveBeenCalledWith({ email: EMAIL, password: PASSWORD });
    expect(destination()).toBe("/panel");
  });

  // 3.1 — the client comes from `lib/supabase/server` and nowhere else. Using
  // the one bound to the cookies of the request is what persists the session.
  it("uses the client of lib/supabase/server, once", async () => {
    await expect(signIn(credentials())).rejects.toThrow();

    expect(createClient).toHaveBeenCalledTimes(1);
  });
});

describe("a sign-in Supabase refuses", () => {
  /*
   * 2.2 — three shapes of refusal, one destination.
   *
   * Invalid credentials, an account that does not exist (a different message
   * and a different code), and the instance being down, which arrives as a
   * thrown exception rather than as an `{ error }`. No branch of the action
   * looks at the code to choose where to go, so nothing downstream can tell the
   * three apart — which is what stops the screen from revealing who is
   * registered.
   */
  const refusals: [string, () => void][] = [
    [
      "invalid credentials",
      () =>
        signInWithPassword.mockResolvedValue({
          data: { session: null },
          error: { message: "Invalid login credentials", code: "invalid_credentials" },
        }),
    ],
    [
      "an account that does not exist",
      () =>
        signInWithPassword.mockResolvedValue({
          data: { session: null },
          error: { message: "User not found", code: "user_not_found" },
        }),
    ],
    [
      "the instance being down",
      () =>
        // A throwing implementation, not `mockRejectedValue`: the latter builds
        // its rejected promise the moment it is arranged, and vitest reports
        // that as an unhandled rejection before the action ever runs.
        signInWithPassword.mockImplementation(async () => {
          throw new Error("fetch failed");
        }),
    ],
  ];

  for (const [label, arrange] of refusals) {
    describe(label, () => {
      // Wrapped so nothing is returned: vitest reads a function returned from
      // `beforeEach` as a teardown callback, and `mockImplementation` hands the
      // mock itself back — which would then be *called* after every case.
      beforeEach(() => {
        arrange();
      });

      // 1.2 — back to the access screen, and no session opened. Also 2.2: the
      // literal is the same for all three.
      it("returns to the access screen, always the same address", async () => {
        // The rejection is the redirect signalling. If the implementation had
        // wrapped it in the `try` that guards the network call, this resolves
        // instead and the navigation never happens.
        await expect(signIn(credentials())).rejects.toThrow();

        expect(destination()).toBe(REJECTED);
      });

      // 2.3 — nothing the visitor typed travels in the address.
      it("carries neither the e-mail nor the password back", async () => {
        await expect(signIn(credentials())).rejects.toThrow();

        expect(destination()).not.toContain(EMAIL);
        expect(destination()).not.toContain(PASSWORD);
      });
    });
  }
});

/*
 * 1.4 — what never reaches Supabase at all.
 *
 * "Supabase was not called" is true of an empty implementation, so on its own
 * it proves nothing. Three things keep the cycle honest: the starting point is
 * the action of T7, which called Supabase unconditionally; each case also
 * asserts the destination as a literal, which an empty implementation cannot
 * produce because the `redirect` double throws; and the happy path above stays
 * green, which is what an over-eager validation would break.
 */
describe("a sign-in that never reaches Supabase", () => {
  const malformed: [string, FormData][] = [
    ["an empty e-mail", credentials("", PASSWORD)],
    ["an e-mail with no @", credentials("sentinela-correo-sin-arroba", PASSWORD)],
    ["an empty password", credentials(EMAIL, "")],
  ];

  for (const [label, formData] of malformed) {
    describe(label, () => {
      it("is refused without a client ever being built", async () => {
        await expect(signIn(formData)).rejects.toThrow();

        // Counting `createClient` and not only `signInWithPassword` is what
        // ties the assertion to "parse first" rather than to "refuse somewhere".
        expect(createClient).not.toHaveBeenCalled();
        expect(signInWithPassword).not.toHaveBeenCalled();
      });

      it("lands on the same address as any other refusal, carrying nothing", async () => {
        await expect(signIn(formData)).rejects.toThrow();

        expect(destination()).toBe(REJECTED);
        expect(destination()).not.toContain(EMAIL);
        expect(destination()).not.toContain(PASSWORD);
      });
    });
  }
});

/*
 * 1.3 — the decision belongs to Supabase, not to this action.
 *
 * Same e-mail, same password, opposite destinations: the only thing that
 * changed between the two runs is what Supabase answered. That pair is the
 * proof, not an assertion about the text of the source.
 */
describe("who decides", () => {
  it("sends identical credentials to opposite destinations", async () => {
    signInWithPassword.mockResolvedValue({ data: { session: {} }, error: null });
    await expect(signIn(credentials())).rejects.toThrow();
    expect(destination()).toBe("/panel");

    vi.clearAllMocks();

    signInWithPassword.mockResolvedValue({
      data: { session: null },
      error: { message: "Invalid login credentials" },
    });
    await expect(signIn(credentials())).rejects.toThrow();
    expect(destination()).toBe(REJECTED);
  });
});
