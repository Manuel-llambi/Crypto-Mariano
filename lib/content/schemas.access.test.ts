import { describe, expect, it } from "vitest";

import { access } from "@/content/access";

import {
  AccessSchema,
  LoginSchema,
  SignupAccountSchema,
  SignupCodeSchema,
  SignupEmailSchema,
} from "./schemas";

/**
 * The access schemas, which were the only ones of the project without a test of
 * their own.
 *
 * The copy of the four transactional screens is validated like every other
 * string here, and 2.4 asks the rejection message to be one of them.
 */

/** A well formed `login` block, to be spoiled one field at a time. */
function login(): Record<string, unknown> {
  return { ...access.login };
}

describe("LoginSchema", () => {
  it("accepts the login block of the real content", () => {
    expect(LoginSchema.safeParse(access.login).success).toBe(true);
  });

  // 2.4 — the message is declared as content, so the schema is what makes its
  // absence an error rather than an empty node on the screen.
  it("rejects a login block with no errorMessage", () => {
    const withoutMessage = login();
    delete withoutMessage.errorMessage;

    const result = LoginSchema.safeParse(withoutMessage);

    expect(result.success).toBe(false);
    expect(JSON.stringify(result.error?.issues)).toContain("errorMessage");
  });

  it("rejects an empty errorMessage", () => {
    expect(LoginSchema.safeParse({ ...login(), errorMessage: "" }).success).toBe(false);
  });

  // `NonEmpty` trims before it measures, so spaces are not a message.
  it("rejects an errorMessage of whitespace only", () => {
    expect(LoginSchema.safeParse({ ...login(), errorMessage: "   " }).success).toBe(false);
  });

  /*
   * One message, not one per kind of failure.
   *
   * 2.2 asks invalid credentials and a non-existent account to be
   * indistinguishable. The action is what makes the two paths meet, but a
   * second field here would be the invitation to split them again.
   */
  it("declares a single message", () => {
    const keys = Object.keys(LoginSchema.shape).filter((key) => /error/i.test(key));

    expect(keys).toEqual(["errorMessage"]);
  });
});

describe("AccessSchema", () => {
  it("accepts the real content", () => {
    expect(AccessSchema.safeParse(access).success).toBe(true);
  });

  it("rejects a surplus field on login", () => {
    const spoiled = { ...access, login: { ...access.login, extra: "de más" } };

    expect(AccessSchema.safeParse(spoiled).success).toBe(false);
  });
});

/**
 * The five messages the three sign-up steps show when an attempt is refused.
 *
 * They are declared as content like every other string (8.1), so the schema is
 * what turns a missing one into a build failure rather than an empty node on a
 * screen nobody looks at until it matters.
 */
describe("the sign-up steps declare their refusals", () => {
  /** A well formed step block, to be spoiled one field at a time. */
  const steps = [
    ["email", SignupEmailSchema, ["errorMessage", "expiredMessage"]],
    ["code", SignupCodeSchema, ["errorMessage"]],
    ["account", SignupAccountSchema, ["errorMessages"]],
  ] as const;

  for (const [step, schema, fields] of steps) {
    describe(step, () => {
      it("accepts the real content", () => {
        expect(schema.safeParse(access.signup[step]).success).toBe(true);
      });

      for (const field of fields) {
        it(`rejects a block with no ${field}`, () => {
          const spoiled: Record<string, unknown> = { ...access.signup[step] };
          delete spoiled[field];

          const result = schema.safeParse(spoiled);

          expect(result.success).toBe(false);
          expect(JSON.stringify(result.error?.issues)).toContain(field);
        });
      }
    });
  }

  it("rejects an empty message on any step", () => {
    expect(SignupEmailSchema.safeParse({ ...access.signup.email, errorMessage: "" }).success).toBe(
      false,
    );
    expect(SignupCodeSchema.safeParse({ ...access.signup.code, errorMessage: "  " }).success).toBe(
      false,
    );
  });

  /*
   * 3.2 — two messages on step 3, and the asymmetry with step 2 is deliberate.
   *
   * On steps 1 and 2 every refusal says the same thing, because telling them
   * apart would leak which addresses are registered. By step 3 the visitor has
   * already proved the mailbox is theirs, so naming the cause costs nothing and
   * saves them from guessing what to fix.
   */
  it("gives step 3 exactly the two reasons, and no more", () => {
    const result = SignupAccountSchema.safeParse({
      ...access.signup.account,
      errorMessages: { ...access.signup.account.errorMessages, otro: "de más" },
    });

    expect(result.success).toBe(false);
    expect(Object.keys(access.signup.account.errorMessages).sort()).toEqual(["generic", "weak"]);
  });

  /*
   * 4.3 — the one assertion that cannot be satisfied by copying the message
   * next door.
   *
   * The two step 1 messages answer different questions. `errorMessage` is a
   * rejection of what was typed; `expiredMessage` is for someone who did
   * nothing wrong and simply arrived at step 2 with no pending address. The
   * criterion asks for a message that says to ask for a new code, so if the two
   * texts were the same the requirement would be met on paper only.
   */
  it("says something different when the pending address is gone", () => {
    const { errorMessage, expiredMessage } = access.signup.email;

    expect(expiredMessage).not.toBe(errorMessage);
    expect(expiredMessage).toMatch(/código/i);
  });
});
