import { beforeEach, describe, expect, it, vi } from "vitest";

/*
 * Two doubles, the same assembly as the two actions before this one. No cookie
 * module here, and that absence is the point: the account this writes to is the
 * one the session identifies, so there is nothing to look up (3.5).
 */
const { updateUser, createClient, redirect } = vi.hoisted(() => {
  const updateUser = vi.fn();

  return {
    updateUser,
    createClient: vi.fn(async () => ({ auth: { updateUser } })),
    redirect: vi.fn((destination: string): never => {
      throw new Error(`NEXT_REDIRECT:${destination}`);
    }),
  };
});

vi.mock("@/lib/supabase/server", () => ({ createClient }));
vi.mock("next/navigation", () => ({ redirect }));

import { setPassword } from "./actions";

const PASSWORD = "sentinela-contraseña-1234";

const WEAK = "/registro/crear-cuenta?error=debil";
const GENERIC = "/registro/crear-cuenta?error=error";

function form(password = PASSWORD): FormData {
  const formData = new FormData();
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

describe("a password Supabase accepts", () => {
  beforeEach(() => {
    updateUser.mockResolvedValue({ data: { user: {} }, error: null });
  });

  // 3.1 — the password is set on the account in session, and the visitor
  // arrives at the dashboard, which its guard lets through because there is a
  // session.
  it("sets it and lands on the dashboard", async () => {
    await expect(setPassword(form())).rejects.toThrow();

    expect(updateUser).toHaveBeenCalledTimes(1);
    expect(destination()).toBe("/panel");
  });

  /*
   * 3.5 — the whole security argument of this screen, in one assertion.
   *
   * `updateUser` is handed the password and nothing else. The account comes
   * from the session, so a posted address has no way to redirect the write to
   * somebody else's account — not because a check rejects it, but because no
   * code reads it.
   */
  it("hands Supabase the password and nothing else", async () => {
    await expect(setPassword(form())).rejects.toThrow();

    expect(updateUser).toHaveBeenCalledWith({ password: PASSWORD });
    expect(Object.keys(updateUser.mock.calls[0]![0])).toEqual(["password"]);
  });

  /*
   * The same claim from the other side: an address in the submission changes
   * nothing at all. This is what a check-then-compare implementation would fail
   * differently, and what an implementation reading the form would leak.
   */
  it("ignores an address posted alongside the password", async () => {
    const formData = form();
    formData.set("email", "otra-persona@crypto-crime.test");

    await expect(setPassword(formData)).rejects.toThrow();

    expect(updateUser).toHaveBeenCalledWith({ password: PASSWORD });
    expect(destination()).toBe("/panel");
  });

  // 3.6 — the password travels in the body of the request and appears in no
  // destination, which is what keeps it out of history, logs and referrers.
  it("carries the password nowhere", async () => {
    await expect(setPassword(form())).rejects.toThrow();

    expect(destination()).not.toContain(PASSWORD);
  });

  /*
   * 3.4 — one path, with no branch for an account that already existed.
   *
   * `updateUser` replaces whatever password was there, so there is nothing to
   * ask about. This is the criterion most likely to tempt someone into adding a
   * lookup, so the absence of one is asserted rather than assumed: only the
   * write is called, and only once.
   */
  it("asks nothing about the account before writing to it", async () => {
    await expect(setPassword(form())).rejects.toThrow();

    const client = await createClient.mock.results[0]!.value;
    expect(Object.keys(client.auth)).toEqual(["updateUser"]);
    expect(updateUser).toHaveBeenCalledTimes(1);
  });
});

/*
 * 3.2 — two reasons, and naming them is safe here.
 *
 * By this screen the visitor has already proved the mailbox is theirs, so there
 * is nothing left to hide, and a single vague message would leave them guessing
 * what to change. That is the opposite of steps 1 and 2, on purpose.
 *
 * `weak_password` is what the instance actually returns for a password shorter
 * than `minimum_password_length` — verified against it, alongside a 422 and the
 * message «Password should be at least 6 characters.»
 */
describe("a password Supabase refuses", () => {
  it("names the weak password as such", async () => {
    updateUser.mockResolvedValue({
      data: { user: null },
      error: { message: "Password should be at least 6 characters.", code: "weak_password" },
    });

    await expect(setPassword(form("abcde"))).rejects.toThrow();

    expect(destination()).toBe(WEAK);
    expect(destination()).not.toContain("abcde");
  });

  const generic: [string, () => void][] = [
    [
      "a refusal for any other reason",
      () =>
        updateUser.mockResolvedValue({
          data: { user: null },
          error: { message: "Session expired", code: "session_not_found" },
        }),
    ],
    [
      "a refusal with no code at all",
      () => updateUser.mockResolvedValue({ data: { user: null }, error: { message: "nope" } }),
    ],
    [
      "the instance being down",
      () =>
        // A throwing implementation, not `mockRejectedValue`: the latter builds
        // its rejected promise the moment it is arranged, and vitest reports
        // that as an unhandled rejection before the action ever runs.
        updateUser.mockImplementation(async () => {
          throw new Error("fetch failed");
        }),
    ],
  ];

  for (const [label, arrange] of generic) {
    describe(label, () => {
      // Wrapped so nothing is returned: vitest reads a function returned from
      // `beforeEach` as a teardown callback.
      beforeEach(() => {
        arrange();
      });

      it("falls back to the generic reason", async () => {
        await expect(setPassword(form())).rejects.toThrow();

        expect(destination()).toBe(GENERIC);
      });

      it("carries the password nowhere", async () => {
        await expect(setPassword(form())).rejects.toThrow();

        expect(destination()).not.toContain(PASSWORD);
      });
    });
  }
});

/*
 * 3.3 — the only rule this action imposes is «there is something here».
 *
 * The length lives in `supabase/config.toml` and belongs to the instance. A
 * minimum restated here would produce a second refusal for the same outcome,
 * and would go stale the day the policy changes. Same decision as
 * `CredentialsSchema` in the login spec.
 */
describe("what never reaches Supabase", () => {
  it("refuses an empty password without building a client", async () => {
    await expect(setPassword(form(""))).rejects.toThrow();

    expect(createClient).not.toHaveBeenCalled();
    expect(updateUser).not.toHaveBeenCalled();
    // Generic and not weak: nothing was judged, so nothing can be named.
    expect(destination()).toBe(GENERIC);
  });

  it("lets a short password through to be judged by the instance", async () => {
    updateUser.mockResolvedValue({ data: { user: {} }, error: null });

    await expect(setPassword(form("abc"))).rejects.toThrow();

    // Three characters is under any plausible policy, and it still gets asked.
    // Whether it is good enough is not this action's call.
    expect(updateUser).toHaveBeenCalledWith({ password: "abc" });
  });
});
