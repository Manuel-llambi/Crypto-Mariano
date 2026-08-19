import { describe, expect, it } from "vitest";

import { access } from "@/content/access";

import { AccessSchema, LoginSchema } from "./schemas";

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
