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
 * double that activation would call the real `signIn`, which goes out to the
 * local Supabase instance from a unit test.
 */
const { signIn } = vi.hoisted(() => ({
  signIn: vi.fn<(formData: FormData) => Promise<void>>(async () => {}),
}));

vi.mock("./actions", () => ({ signIn }));

import AccesoPage, { metadata } from "./page";
import { access } from "@/lib/content";
import { LOGIN_ERROR_CODE } from "@/lib/routes";

afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
});

/*
 * The page is `async` now, because Next 15 hands `searchParams` over as a
 * promise. `render(<AccesoPage />)` on an async component does not throw — it
 * renders an *empty* container and warns on stderr — so every case invokes the
 * function and renders what it resolves to. That empty container is also why
 * every negative assertion below sits next to a positive anchor.
 */
async function renderPage(searchParams: Record<string, string | string[]> = {}) {
  return render(await AccesoPage({ searchParams: Promise.resolve(searchParams) }));
}

describe("the fields are properly labelled", () => {
  for (const [name, type] of [
    ["emailLabel", "email"],
    ["passwordLabel", "password"],
  ] as const) {
    it(`associates the ${type} field with its label`, async () => {
      await renderPage();

      const label = access.login[name];
      const field = screen.getByLabelText(label);

      expect(field.tagName).toBe("INPUT");
      expect(field.getAttribute("type")).toBe(type);
    });
  }

  /**
   * A placeholder is not a label: it disappears the moment someone types, and
   * assistive technology does not announce it as the field's name.
   */
  it("uses no placeholder in place of a label", async () => {
    const { container } = await renderPage();

    for (const input of container.querySelectorAll("input")) {
      expect(input.getAttribute("placeholder")).toBeNull();
      expect(input.id).not.toBe("");
    }
  });

  it("tells the password manager which field is which", async () => {
    await renderPage();

    expect(screen.getByLabelText(access.login.emailLabel).getAttribute("autocomplete")).toBe(
      "email",
    );
    expect(screen.getByLabelText(access.login.passwordLabel).getAttribute("autocomplete")).toBe(
      "current-password",
    );
  });
});

/**
 * 5.3 — the screen posts to the server.
 *
 * The form is what lets the browser submit on its own, with no script, and it
 * is safe because it has an action: a form with *none* submits by GET and puts
 * every field into the query string, and from there into browser history,
 * server logs and the referrer of the next request.
 */
describe("the screen posts to the sign-in action", () => {
  it("wraps the fields and the control in a form with a submit button", async () => {
    const { container } = await renderPage();

    const form = container.querySelector("form");
    expect(form).not.toBeNull();
    expect(form!.querySelectorAll("input")).toHaveLength(2);

    const control = screen.getByRole("button", { name: access.login.submitLabel });
    expect(control.getAttribute("type")).toBe("submit");
    expect(screen.queryByRole("link", { name: access.login.submitLabel })).toBeNull();
  });

  it("posts to signIn, carrying the typed fields in the body", async () => {
    await renderPage();

    fireEvent.change(screen.getByLabelText(access.login.emailLabel), {
      target: { value: "alumno@crypto-crime.test" },
    });
    fireEvent.change(screen.getByLabelText(access.login.passwordLabel), {
      target: { value: "una-contraseña" },
    });

    fireEvent.click(screen.getByRole("button", { name: access.login.submitLabel }));

    await vi.waitFor(() => expect(signIn).toHaveBeenCalledTimes(1));

    const formData = signIn.mock.calls[0]![0];
    expect(formData.get("email")).toBe("alumno@crypto-crime.test");
    expect(formData.get("password")).toBe("una-contraseña");
  });

  /*
   * 5.4 — `NavPanel` stays the only client component of the project.
   *
   * The directory is walked rather than a file named, so the guard keeps
   * holding as `app/acceso/` grows.
   */
  it("ships no JavaScript of its own, and touches no cookie", () => {
    const dir = resolve(process.cwd(), "app/acceso");
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
      expect(code).not.toContain("onClick");
      expect(code).not.toContain("onSubmit");
      expect(code).not.toContain("fetch");
      // The one module allowed to touch session cookies is
      // `lib/supabase/server`, and nothing here reaches around it.
      expect(code).not.toContain("cookies");
    }
  });
});

/**
 * The error message, and how strictly the address is believed.
 *
 * The message appears if and only if the value of `error` is exactly the marker
 * the system itself emits. Anyone typing `/acceso?error=x` by hand had no
 * failed attempt, which is precisely the condition of 2.5 — a screen that
 * believes the address bar turns the URL into a generator of other people's
 * error messages.
 */
describe("the error message", () => {
  // Every negative case carries this anchor: against the empty container of a
  // mis-mounted async component, a null lookup passes without implementation.
  function expectTheScreenRendered() {
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(access.login.title);
  }

  // 2.1 and 2.4 — the text is the one declared in content, by reference.
  it("shows the declared message when the marker is present", async () => {
    await renderPage({ error: LOGIN_ERROR_CODE });

    expect(screen.getByText(access.login.errorMessage)).not.toBeNull();
  });

  it("renders no message node without an error (2.5)", async () => {
    const { container } = await renderPage();

    expectTheScreenRendered();
    expect(container.querySelector("[class*='error']")).toBeNull();
  });

  it("renders no message for a value that is not the marker", async () => {
    const { container } = await renderPage({ error: "otra-cosa" });

    expectTheScreenRendered();
    expect(container.querySelector("[class*='error']")).toBeNull();
  });

  // A repeated parameter arrives as an array, so a comparison against a string
  // discards it on its own.
  it("renders no message for a repeated parameter", async () => {
    const { container } = await renderPage({ error: [LOGIN_ERROR_CODE, LOGIN_ERROR_CODE] });

    expectTheScreenRendered();
    expect(container.querySelector("[class*='error']")).toBeNull();
  });
});

describe("the rest of the screen", () => {
  it("presents the title as the only first level heading", async () => {
    await renderPage();

    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]!.textContent).toBe(access.login.title);
  });

  it("offers the forgotten password link with a real destination", async () => {
    await renderPage();

    const link = screen.getByRole("link", { name: access.login.forgotLabel });
    expect(link.getAttribute("href")).toBe(access.login.forgotHref);
    expect(link.getAttribute("href")).not.toBe("#");
  });

  it("shows the subtitle and the protocol note", async () => {
    await renderPage();

    expect(screen.getByText(access.login.subtitle)).not.toBeNull();
    expect(screen.getByText(access.login.protocol)).not.toBeNull();
  });

  it("suppresses navigation: the bar carries the brand and no links", async () => {
    const { container } = await renderPage();

    expect(container.querySelector("header")).not.toBeNull();
    expect(container.querySelectorAll("header a")).toHaveLength(0);
    expect(container.querySelector("nav")).toBeNull();
  });

  it("hides the decorative grid from assistive technology (9.3)", async () => {
    const { container } = await renderPage();

    const decoration = container.querySelector("main > [aria-hidden='true']");
    expect(decoration).not.toBeNull();
    expect(decoration!.textContent).toBe("");
  });
});

// These screens are not to be published while the sign-up flow is a mock-up.
describe("metadata", () => {
  it("asks search engines not to index the screen", () => {
    const robots = metadata.robots as { index?: boolean; follow?: boolean };

    expect(robots.index).toBe(false);
    expect(robots.follow).toBe(false);
  });
});
