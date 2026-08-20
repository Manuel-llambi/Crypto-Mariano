// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Field } from "./Field";

afterEach(cleanup);

const LABEL = "Email institucional";

/**
 * The three things step 3 of signing up needs from this component, and the
 * regression that keeps the other four callers honest.
 *
 * All three exist for one criterion, 3.5: the account being given a password is
 * the one the session identifies, so the address on screen is an echo and must
 * not be part of what the browser sends.
 */
describe("a field that is only an echo", () => {
  /*
   * The mechanical half of 3.5, and the reason `name` had to become optional.
   *
   * A control with no `name` is not serialised into the submission at all —
   * that is the HTML rule doing the work, not a check on the server. It is why
   * a posted address cannot redirect the write to somebody else's account.
   */
  it("omits the name attribute entirely when none is given", () => {
    const { container } = render(<Field id="email" label={LABEL} type="email" />);

    const input = container.querySelector("input")!;

    expect(input.hasAttribute("name")).toBe(false);
    // The anchor: without it, a component that rendered nothing would pass.
    expect(screen.getByLabelText(LABEL)).toBe(input);
  });

  /*
   * `readOnly` and never `disabled`.
   *
   * A disabled control is skipped by keyboard navigation and many screen
   * readers do not announce it, so the echo would stop doing the only thing it
   * is there for: saying which account is getting the password.
   */
  it("is read-only rather than disabled, so it stays reachable", () => {
    render(<Field id="email" label={LABEL} type="email" readOnly />);

    const input = screen.getByLabelText(LABEL);

    expect(input.hasAttribute("readonly")).toBe(true);
    expect(input.hasAttribute("disabled")).toBe(false);
  });

  /*
   * `defaultValue` and not `value`: a `value` with no `onChange` makes the
   * input controlled and React complains on the console — and this is a server
   * component, with nowhere to put a handler.
   */
  it("shows the value it was given", () => {
    render(<Field id="email" label={LABEL} type="email" value="alumno@crypto-crime.test" readOnly />);

    expect((screen.getByLabelText(LABEL) as HTMLInputElement).value).toBe(
      "alumno@crypto-crime.test",
    );
  });
});

/**
 * The regression that pays for making `name` optional.
 *
 * What is lost is the compiler complaining about a field that does have to be
 * sent: `<Field>` with no `name` stops being a type error and becomes, quietly,
 * a field the browser does not serialise. The four callers that already exist
 * each keep theirs, and this is what says so.
 */
describe("an ordinary field still behaves as it did", () => {
  it("carries its name, is writable, and starts empty", () => {
    render(<Field id="email" name="email" label={LABEL} type="email" autoComplete="email" />);

    const input = screen.getByLabelText(LABEL) as HTMLInputElement;

    expect(input.getAttribute("name")).toBe("email");
    expect(input.hasAttribute("readonly")).toBe(false);
    expect(input.value).toBe("");
    expect(input.getAttribute("autocomplete")).toBe("email");
  });
});
