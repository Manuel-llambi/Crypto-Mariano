import { beforeEach, describe, expect, it, vi } from "vitest";

/*
 * The same assembly as `app/registro/actions.test.ts`, one module wider: this
 * step reads the pending address as well as clearing it.
 *
 * `redirect` records its argument and then throws, exactly as the real one
 * signals. A double that merely returned would leave a `redirect` wrongly
 * wrapped in a `try`/`catch` invisible.
 */
const { verifyOtp, createClient, redirect, readPendingEmail, clearPendingEmail } = vi.hoisted(
  () => {
    const verifyOtp = vi.fn();

    return {
      verifyOtp,
      createClient: vi.fn(async () => ({ auth: { verifyOtp } })),
      redirect: vi.fn((destination: string): never => {
        throw new Error(`NEXT_REDIRECT:${destination}`);
      }),
      readPendingEmail: vi.fn<() => Promise<string | undefined>>(),
      clearPendingEmail: vi.fn(async () => {}),
    };
  },
);

vi.mock("@/lib/supabase/server", () => ({ createClient }));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("@/lib/signup/pending-email", () => ({ readPendingEmail, clearPendingEmail }));

import { verifyCode } from "./actions";

const EMAIL = "sentinela-correo@crypto-crime.test";
const CODE = "424242";

const REJECTED = "/registro/codigo?error=codigo";
const EXPIRED = "/registro?intent=signup&error=vencido";

function form(code = CODE): FormData {
  const formData = new FormData();
  formData.set("code", code);
  return formData;
}

/** The single argument `redirect` was called with. */
function destination(): string {
  expect(redirect).toHaveBeenCalledTimes(1);
  return redirect.mock.calls[0]![0];
}

beforeEach(() => {
  vi.clearAllMocks();
  readPendingEmail.mockResolvedValue(EMAIL);
});

describe("a code Supabase accepts", () => {
  beforeEach(() => {
    verifyOtp.mockResolvedValue({ data: { session: {} }, error: null });
  });

  /*
   * 2.1 and 2.4 — the address comes from the cookie, never from the form.
   *
   * It is the only address that code is worth anything for, and taking it from
   * the submission would let anyone verify a code against an address of their
   * choosing. The check itself is delegated whole: nothing here compares,
   * stores or logs the code.
   */
  it("verifies the typed code against the address it was sent to", async () => {
    await expect(verifyCode(form())).rejects.toThrow();

    expect(verifyOtp).toHaveBeenCalledTimes(1);
    expect(verifyOtp).toHaveBeenCalledWith({ email: EMAIL, token: CODE, type: "email" });
  });

  // 4.2 — with a session open, the pending address has no further use.
  it("discards the pending address and moves to the account step", async () => {
    await expect(verifyCode(form())).rejects.toThrow();

    expect(clearPendingEmail).toHaveBeenCalledTimes(1);
    expect(destination()).toBe("/registro/crear-cuenta");
  });

  /*
   * 3.1 of the login spec, inherited: the session is written into the cookies of
   * this request by the client of `lib/supabase/server`, so using that client
   * and no other is what persists it.
   */
  it("uses the client of lib/supabase/server, once", async () => {
    await expect(verifyCode(form())).rejects.toThrow();

    expect(createClient).toHaveBeenCalledTimes(1);
  });

  // 2.5 — neither the code nor the address reaches the address bar.
  it("carries nothing in the destination", async () => {
    await expect(verifyCode(form())).rejects.toThrow();

    expect(destination()).not.toContain(CODE);
    expect(destination()).not.toContain(EMAIL);
  });
});

/*
 * 2.2 — the three ways a code fails are one refusal.
 *
 * Wrong, expired and already consumed arrive as different codes from Supabase,
 * and no branch here looks at them. An instance that is not there arrives as a
 * thrown exception and lands in the same place.
 */
describe("a code Supabase refuses", () => {
  const refusals: [string, () => void][] = [
    [
      "a wrong code",
      () =>
        verifyOtp.mockResolvedValue({
          data: { session: null },
          error: { message: "Token has expired or is invalid", code: "otp_expired" },
        }),
    ],
    [
      "a code already used",
      () =>
        verifyOtp.mockResolvedValue({
          data: { session: null },
          error: { message: "Token has expired or is invalid", code: "otp_expired" },
        }),
    ],
    [
      "the instance being down",
      () =>
        // A throwing implementation, not `mockRejectedValue`: the latter builds
        // its rejected promise the moment it is arranged, and vitest reports
        // that as an unhandled rejection before the action ever runs.
        verifyOtp.mockImplementation(async () => {
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

      it("returns to step 2 with the one marker it has", async () => {
        await expect(verifyCode(form())).rejects.toThrow();

        expect(destination()).toBe(REJECTED);
      });

      /*
       * The pending address survives a refusal, and that is the point.
       *
       * Clearing it here would send the next attempt to the expiry path, so one
       * mistyped digit would cost the visitor the code they already have.
       */
      it("keeps the pending address so another attempt is possible", async () => {
        await expect(verifyCode(form())).rejects.toThrow();

        expect(clearPendingEmail).not.toHaveBeenCalled();
      });

      it("carries neither the code nor the address back", async () => {
        await expect(verifyCode(form())).rejects.toThrow();

        expect(destination()).not.toContain(CODE);
        expect(destination()).not.toContain(EMAIL);
      });
    });
  }
});

/*
 * 2.3 — an empty field never reaches Supabase.
 *
 * "Supabase was not called" is true of an empty implementation, so each case
 * also asserts the destination as a literal, which an empty implementation
 * cannot produce because the `redirect` double throws.
 */
describe("a code that never reaches Supabase", () => {
  it("refuses an empty field without building a client", async () => {
    await expect(verifyCode(form(""))).rejects.toThrow();

    expect(createClient).not.toHaveBeenCalled();
    expect(verifyOtp).not.toHaveBeenCalled();
    expect(destination()).toBe(REJECTED);
  });

  it("ignores a surplus field rather than failing over it", async () => {
    verifyOtp.mockResolvedValue({ data: { session: {} }, error: null });

    const formData = form();
    formData.set("intent", "signup");

    await expect(verifyCode(formData)).rejects.toThrow();

    expect(destination()).toBe("/registro/crear-cuenta");
  });
});

/*
 * 4.3, on the submission rather than on the request.
 *
 * The cookie can expire between the moment the screen was painted and the
 * moment the form is sent. This is not a refusal: the visitor did nothing
 * wrong, there is simply nothing left to verify, so they land on step 1 with
 * the message that tells them to ask for a new code — not on step 2 with a
 * message saying their code was bad.
 */
describe("a submission with no pending address", () => {
  beforeEach(() => {
    readPendingEmail.mockResolvedValue(undefined);
  });

  it("sends the visitor back to step 1 to ask for a new code", async () => {
    await expect(verifyCode(form())).rejects.toThrow();

    expect(destination()).toBe(EXPIRED);
  });

  it("asks Supabase nothing, because there is nothing to ask about", async () => {
    await expect(verifyCode(form())).rejects.toThrow();

    expect(createClient).not.toHaveBeenCalled();
    expect(verifyOtp).not.toHaveBeenCalled();
  });

  /*
   * The expiry path takes precedence over an empty field, and deliberately.
   *
   * With no pending address the code is unusable whatever it says, so «ask for
   * a new one» is the only advice that helps. Telling them the code was invalid
   * would be true and useless.
   */
  it("says so even when the field was left empty", async () => {
    await expect(verifyCode(form(""))).rejects.toThrow();

    expect(destination()).toBe(EXPIRED);
  });
});
