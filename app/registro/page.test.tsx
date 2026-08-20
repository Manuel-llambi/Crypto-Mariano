// @vitest-environment jsdom
import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/*
 * The action travels as a double, and it has to.
 *
 * React writes a `javascript:throw …` sentinel into the `action` attribute of a
 * form, so the DOM cannot say which function the form posts to. Activating the
 * control and seeing who was called is the only way to assert it. Without the
 * double that activation would call the real `requestCode`, which goes out to
 * the local Supabase instance from a unit test.
 */
const { requestCode } = vi.hoisted(() => ({
  requestCode: vi.fn<(formData: FormData) => Promise<void>>(async () => {}),
}));

vi.mock("./actions", () => ({ requestCode }));

import RegistroPage, { metadata } from "./page";
import { access } from "@/lib/content";
import { SIGNUP_ERROR_CODE, SIGNUP_EXPIRED_CODE } from "@/lib/routes";

afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
});

const { email } = access.signup;

/*
 * The page is `async` now, because Next 15 hands `searchParams` over as a
 * promise. `render(<RegistroPage />)` on an async component does not throw — it
 * renders an *empty* container and warns on stderr — so every case invokes the
 * function and renders what it resolves to. That empty container is also why
 * every negative assertion below sits next to a positive anchor.
 */
async function renderPage(searchParams: Record<string, string | string[]> = {}) {
  return render(await RegistroPage({ searchParams: Promise.resolve(searchParams) }));
}

describe("the screen asks for one thing", () => {
  it("associates the e-mail field with its label", async () => {
    await renderPage();

    const field = screen.getByLabelText(email.emailLabel);

    expect(field.tagName).toBe("INPUT");
    expect(field.getAttribute("type")).toBe("email");
    expect(field.getAttribute("autocomplete")).toBe("email");
  });

  /** The step exists to collect an address. A second field would be a second question. */
  it("collects the address and nothing else", async () => {
    const { container } = await renderPage();

    const inputs = [...container.querySelectorAll("input")];
    expect(inputs).toHaveLength(1);
    expect(container.querySelector('input[type="password"]')).toBeNull();
  });

  it("uses no placeholder in place of a label", async () => {
    const { container } = await renderPage();

    for (const input of container.querySelectorAll("input")) {
      expect(input.getAttribute("placeholder")).toBeNull();
      expect(input.id).not.toBe("");
    }
  });

  /*
   * The address has to be part of the submission, so it keeps its `name`.
   *
   * This is the regression that pays for `name` becoming optional on `Field`:
   * a forgotten one is no longer a type error, only a field the browser quietly
   * leaves out.
   */
  it("submits the address under a name", async () => {
    await renderPage();

    expect(screen.getByLabelText(email.emailLabel).getAttribute("name")).toBe("email");
  });
});

/**
 * 6.3 — the screen posts to the server.
 *
 * The form is what lets the browser submit on its own, with no script, and it
 * is safe because it has an action: a form with *none* submits by GET and would
 * put the address in the query string, and from there into browser history,
 * server logs and the referrer of the next request.
 *
 * This is the assertion that was inverted. It used to say there was no `<form>`
 * and no `<button>`, and that the control was an anchor to the next step — true
 * while the screen was a mock-up, and false now.
 */
describe("the screen posts to the request action", () => {
  it("wraps the field and the control in a form with a submit button", async () => {
    const { container } = await renderPage();

    const form = container.querySelector("form");
    expect(form).not.toBeNull();
    expect(form!.querySelectorAll("input")).toHaveLength(1);

    const control = screen.getByRole("button", { name: email.submitLabel });
    expect(control.getAttribute("type")).toBe("submit");
    // The anchor the mock-up used is gone, not merely unused.
    expect(screen.queryByRole("link", { name: email.submitLabel })).toBeNull();
  });

  it("posts to requestCode, carrying the typed address in the body", async () => {
    await renderPage();

    fireEvent.change(screen.getByLabelText(email.emailLabel), {
      target: { value: "alumno@crypto-crime.test" },
    });

    fireEvent.click(screen.getByRole("button", { name: email.submitLabel }));

    await vi.waitFor(() => expect(requestCode).toHaveBeenCalledTimes(1));

    expect(requestCode.mock.calls[0]![0].get("email")).toBe("alumno@crypto-crime.test");
  });

  /*
   * 6.4 — `NavPanel` stays the only client component of the project.
   *
   * The directory is walked rather than a file named, so the guard keeps
   * holding as `app/registro/` grows. Comments are stripped first: a comment
   * that merely mentions a forbidden word would fail this, which cost a cycle
   * in T17 of the landing.
   */
  it("ships no JavaScript of its own, and touches no cookie directly", () => {
    const dir = resolve(process.cwd(), "app/registro");
    const sources = readdirSync(dir)
      .filter((name) => /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name))
      .map((name) => readFileSync(join(dir, name), "utf8"))
      .map((text) => text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, ""));

    expect(sources.length).toBeGreaterThan(1);

    for (const code of sources) {
      expect(code).not.toContain("use client");
      expect(code).not.toContain("useState");
      expect(code).not.toContain("useEffect");
      expect(code).not.toContain("addEventListener");
      expect(code).not.toContain("IntersectionObserver");
      expect(code).not.toContain("onClick");
      expect(code).not.toContain("onSubmit");
      expect(code).not.toContain("fetch");
      // The cookie of the pending address is `lib/signup/pending-email`'s
      // business, and the session cookies are `lib/supabase/server`'s. Nothing
      // here reaches around either.
      expect(code).not.toContain("cookies");
    }
  });
});

/**
 * The two messages this screen shows, and how strictly the address is believed.
 *
 * A message appears if and only if the value is exactly a marker the system
 * itself emits. Anyone typing `?error=x` by hand had no failed attempt.
 */
describe("the messages", () => {
  // Every negative case carries this anchor: against the empty container of a
  // mis-mounted async component, a null lookup passes without implementation.
  function expectTheScreenRendered() {
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(email.title);
  }

  // 6.2 and 8.1 — the text is the one declared in content, by reference, and it
  // is in the HTML the server emits, with no script in between.
  it("shows the refusal message for the refusal marker", async () => {
    await renderPage({ error: SIGNUP_ERROR_CODE });

    expect(screen.getByText(email.errorMessage)).not.toBeNull();
  });

  /*
   * 4.3 — a different message, because a different thing happened.
   *
   * Whoever lands here with this marker did nothing wrong; they arrived at
   * step 2 with no pending address. Showing them the refusal text would meet
   * the criterion on paper and mislead them in practice.
   */
  it("shows the expiry message for the expiry marker", async () => {
    await renderPage({ error: SIGNUP_EXPIRED_CODE });

    expect(screen.getByText(email.expiredMessage)).not.toBeNull();
    expect(screen.queryByText(email.errorMessage)).toBeNull();
  });

  it("renders no message node at all without a marker", async () => {
    const { container } = await renderPage();

    expectTheScreenRendered();
    expect(container.querySelector("[class*='error']")).toBeNull();
  });

  it("renders no message for a value that is not a marker", async () => {
    const { container } = await renderPage({ error: "otra-cosa" });

    expectTheScreenRendered();
    expect(container.querySelector("[class*='error']")).toBeNull();
  });

  // A repeated parameter arrives as an array, so a comparison against a string
  // discards it on its own.
  it("renders no message for a repeated parameter", async () => {
    const { container } = await renderPage({ error: [SIGNUP_ERROR_CODE, SIGNUP_ERROR_CODE] });

    expectTheScreenRendered();
    expect(container.querySelector("[class*='error']")).toBeNull();
  });
});

describe("the rest of the screen", () => {
  it("presents the title as the only first level heading", async () => {
    await renderPage();

    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]!.textContent).toBe(email.title);
  });

  it("shows the subtitle and the protocol note", async () => {
    await renderPage();

    expect(screen.getByText(email.subtitle)).not.toBeNull();
    expect(screen.getByText(email.protocol)).not.toBeNull();
  });
});

// The flow works now, but it has no business in a search result until the rest
// of the product is ready to be published.
describe("metadata", () => {
  it("asks search engines not to index the screen", () => {
    const robots = metadata.robots as { index?: boolean; follow?: boolean };

    expect(robots.index).toBe(false);
    expect(robots.follow).toBe(false);
  });
});
