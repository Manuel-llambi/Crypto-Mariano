// @vitest-environment jsdom
import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/*
 * Three doubles.
 *
 * The action, because React writes a `javascript:throw …` sentinel into a
 * form's `action` attribute and the DOM cannot say which function it posts to —
 * activating the control is the only way, and without the double that would
 * reach the local Supabase instance from a unit test.
 *
 * `createClient`, because the guard of 4.4 asks it who the visitor is, and that
 * same answer is what the echo shows. And `redirect`, which throws exactly as
 * the real one signals, so a guard that ran *after* emitting markup would show
 * up as a resolved render instead of a rejected one.
 */
const { getUser, createClient, setPassword, redirect } = vi.hoisted(() => {
  const getUser = vi.fn<() => Promise<{ data: { user: { email?: string } | null } }>>();

  return {
    getUser,
    createClient: vi.fn(async () => ({ auth: { getUser } })),
    setPassword: vi.fn<(formData: FormData) => Promise<void>>(async () => {}),
    redirect: vi.fn((destination: string): never => {
      throw new Error(`NEXT_REDIRECT:${destination}`);
    }),
  };
});

vi.mock("@/lib/supabase/server", () => ({ createClient }));
vi.mock("./actions", () => ({ setPassword }));
vi.mock("next/navigation", () => ({ redirect }));

import CrearCuentaPage, { metadata } from "./page";
import { access } from "@/lib/content";
import { SIGNUP_ACCOUNT_ERROR_CODES } from "@/lib/routes";

afterEach(cleanup);

const SESSION_EMAIL = "alumno@crypto-crime.test";

beforeEach(() => {
  vi.clearAllMocks();
  getUser.mockResolvedValue({ data: { user: { email: SESSION_EMAIL } } });
});

const { account } = access.signup;

/*
 * The page is `async` now. `render(<CrearCuentaPage />)` on an async component
 * does not throw — it renders an *empty* container and warns on stderr — so
 * every case invokes the function and renders what it resolves to. That empty
 * container is why every negative assertion sits next to an anchor.
 */
async function renderPage(searchParams: Record<string, string | string[]> = {}) {
  return render(await CrearCuentaPage({ searchParams: Promise.resolve(searchParams) }));
}

/**
 * 3.5 — the address on screen is an echo, and an echo is not a field.
 *
 * These three assertions are the visible half of the criterion; the other half
 * is in `actions.test.ts`, where the action is shown to read only the password.
 * They are separate claims: `Field` knowing how to omit a `name` is T3, and this
 * screen actually omitting it is what protects 3.5 here.
 */
describe("the address is an echo of the session", () => {
  it("is not part of the submission, because it carries no name", async () => {
    await renderPage();

    const field = screen.getByLabelText(account.emailLabel);

    expect(field.hasAttribute("name")).toBe(false);
    // The anchor: an empty container would satisfy the line above on its own.
    expect(field.tagName).toBe("INPUT");
  });

  /*
   * `readOnly` and never `disabled`: a disabled control is skipped by keyboard
   * navigation and often goes unannounced by a screen reader, which would
   * defeat the only purpose the echo has — saying which account is getting the
   * password.
   */
  it("is read-only rather than disabled, so it stays reachable", async () => {
    await renderPage();

    const field = screen.getByLabelText(account.emailLabel);

    expect(field.hasAttribute("readonly")).toBe(true);
    expect(field.hasAttribute("disabled")).toBe(false);
  });

  it("shows the address the session reports, not one that was typed", async () => {
    getUser.mockResolvedValue({ data: { user: { email: "otra-persona@crypto-crime.test" } } });

    await renderPage();

    expect((screen.getByLabelText(account.emailLabel) as HTMLInputElement).value).toBe(
      "otra-persona@crypto-crime.test",
    );
  });

  // The password is the one thing that does travel, so it keeps its `name`.
  it("submits the password under a name", async () => {
    await renderPage();

    expect(screen.getByLabelText(account.passwordLabel).getAttribute("name")).toBe("password");
  });

  /**
   * `new-password`, not `current-password`: this is what tells a password
   * manager to offer to generate one rather than fill an account that has none.
   */
  it("tells the password manager the account is a new one", async () => {
    await renderPage();

    expect(screen.getByLabelText(account.passwordLabel).getAttribute("autocomplete")).toBe(
      "new-password",
    );
  });

  it("uses no placeholder in place of a label", async () => {
    const { container } = await renderPage();

    for (const input of container.querySelectorAll("input")) {
      expect(input.getAttribute("placeholder")).toBeNull();
      expect(input.id).not.toBe("");
    }
  });
});

/**
 * 6.3 — the screen posts to the server.
 *
 * This is the assertion that was inverted. It used to say there was no `<form>`
 * at all and that the control was an inert `type="button"` with no destination
 * — true while the screen created nothing, and false now. The form is safe
 * because it has an action: a form with *none* submits by GET and would put the
 * password in the query string, and from there into browser history, server
 * logs and the referrer of the next request.
 */
describe("the screen posts to the password action", () => {
  it("wraps the fields and the control in a form with a submit button", async () => {
    const { container } = await renderPage();

    const form = container.querySelector("form");
    expect(form).not.toBeNull();
    expect(form!.querySelectorAll("input")).toHaveLength(2);

    const control = screen.getByRole("button", { name: account.submitLabel });
    expect(control.getAttribute("type")).toBe("submit");
    expect(screen.queryByRole("link", { name: account.submitLabel })).toBeNull();
  });

  /*
   * The whole point, seen from the browser: submitting carries the password and
   * *not* the address, because the echo has no name to be serialised under.
   */
  it("posts the password alone, leaving the echo behind", async () => {
    await renderPage();

    fireEvent.change(screen.getByLabelText(account.passwordLabel), {
      target: { value: "una-contraseña-larga" },
    });

    fireEvent.click(screen.getByRole("button", { name: account.submitLabel }));

    await vi.waitFor(() => expect(setPassword).toHaveBeenCalledTimes(1));

    const formData = setPassword.mock.calls[0]![0];
    expect(formData.get("password")).toBe("una-contraseña-larga");
    expect(formData.get("email")).toBeNull();
    expect([...formData.keys()]).toEqual(["password"]);
  });

  /*
   * 6.4 — `NavPanel` stays the only client component of the project. Comments
   * are stripped first: a comment that merely mentions a forbidden word would
   * fail this, which cost a cycle in T17 of the landing.
   */
  it("ships no JavaScript of its own, and touches no cookie directly", () => {
    const dir = resolve(process.cwd(), "app/registro/crear-cuenta");
    const sources = readdirSync(dir)
      .filter((name) => /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name))
      .map((name) => readFileSync(join(dir, name), "utf8"))
      .map((text) => text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, ""));

    expect(sources.length).toBeGreaterThan(1);

    for (const source of sources) {
      expect(source).not.toContain("use client");
      expect(source).not.toContain("useState");
      expect(source).not.toContain("useEffect");
      expect(source).not.toContain("addEventListener");
      expect(source).not.toContain("IntersectionObserver");
      expect(source).not.toContain("onClick");
      expect(source).not.toContain("onSubmit");
      expect(source).not.toContain("fetch");
      // Session cookies are `lib/supabase/server`'s business alone, and this
      // screen goes through it rather than around it.
      expect(source).not.toContain("cookies");
    }
  });
});

/**
 * 4.4 — no session, no screen.
 *
 * The guard runs in the page, before any markup is emitted, which the throwing
 * `redirect` double is what proves: if it ran late, the render would complete
 * and this would resolve instead of reject.
 */
describe("the guard", () => {
  beforeEach(() => {
    getUser.mockResolvedValue({ data: { user: null } });
  });

  it("sends a visitor with no session back to step 1", async () => {
    await expect(renderPage()).rejects.toThrow();

    expect(redirect).toHaveBeenCalledTimes(1);
    expect(redirect.mock.calls[0]![0]).toBe("/registro?intent=signup");
  });

  it("emits no markup on the way out", async () => {
    await expect(renderPage()).rejects.toThrow();

    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
    expect(screen.queryByLabelText(account.passwordLabel)).toBeNull();
  });

  /*
   * `getUser()` and never `getSession()`. The second reads the cookie and takes
   * its word for it, and on the server a cookie is input from the visitor.
   */
  it("asks the authentication server rather than believing the cookie", async () => {
    await expect(renderPage()).rejects.toThrow();

    const client = await createClient.mock.results[0]!.value;
    expect(Object.keys(client.auth)).toEqual(["getUser"]);
  });
});

describe("the two messages", () => {
  // Every negative case carries this anchor: against the empty container of a
  // mis-mounted async component, a null lookup passes without implementation.
  function expectTheScreenRendered() {
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(account.title);
  }

  // 6.2 and 8.1 — both texts come from content, by reference, and both are in
  // the HTML the server emits, with no script in between.
  it("names a weak password when that is what happened", async () => {
    await renderPage({ error: SIGNUP_ACCOUNT_ERROR_CODES.weak });

    expect(screen.getByText(account.errorMessages.weak)).not.toBeNull();
    expect(screen.queryByText(account.errorMessages.generic)).toBeNull();
  });

  it("falls back to the generic text for the generic marker", async () => {
    await renderPage({ error: SIGNUP_ACCOUNT_ERROR_CODES.generic });

    expect(screen.getByText(account.errorMessages.generic)).not.toBeNull();
    expect(screen.queryByText(account.errorMessages.weak)).toBeNull();
  });

  it("renders no message node without a marker", async () => {
    const { container } = await renderPage();

    expectTheScreenRendered();
    expect(container.querySelector("[class*='error']")).toBeNull();
  });

  it("renders no message for a value that is neither marker", async () => {
    const { container } = await renderPage({ error: "otra-cosa" });

    expectTheScreenRendered();
    expect(container.querySelector("[class*='error']")).toBeNull();
  });

  // A repeated parameter arrives as an array, so a comparison against a string
  // discards it on its own.
  it("renders no message for a repeated parameter", async () => {
    const { container } = await renderPage({
      error: [SIGNUP_ACCOUNT_ERROR_CODES.weak, SIGNUP_ACCOUNT_ERROR_CODES.weak],
    });

    expectTheScreenRendered();
    expect(container.querySelector("[class*='error']")).toBeNull();
  });
});

describe("the rest of the screen", () => {
  it("presents the title as the only first level heading", async () => {
    await renderPage();

    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]!.textContent).toBe(account.title);
  });

  it("shows the subtitle and the protocol note", async () => {
    await renderPage();

    expect(screen.getByText(account.subtitle)).not.toBeNull();
    expect(screen.getByText(account.protocol)).not.toBeNull();
  });
});

describe("metadata", () => {
  it("asks search engines not to index the screen", () => {
    const robots = metadata.robots as { index?: boolean; follow?: boolean };

    expect(robots.index).toBe(false);
    expect(robots.follow).toBe(false);
  });
});
