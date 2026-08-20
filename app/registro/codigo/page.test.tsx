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
 * activating the control is the only way to assert it, and without the double
 * that would reach the local Supabase instance from a unit test.
 *
 * `readPendingEmail`, because the guard of 4.3 reads it before rendering, and
 * `redirect`, which throws exactly as the real one signals so a guard that ran
 * *after* emitting markup would be visible.
 */
const { verifyCode, readPendingEmail, redirect } = vi.hoisted(() => ({
  verifyCode: vi.fn<(formData: FormData) => Promise<void>>(async () => {}),
  readPendingEmail: vi.fn<() => Promise<string | undefined>>(),
  redirect: vi.fn((destination: string): never => {
    throw new Error(`NEXT_REDIRECT:${destination}`);
  }),
}));

vi.mock("./actions", () => ({ verifyCode }));
vi.mock("@/lib/signup/pending-email", () => ({ readPendingEmail }));
vi.mock("next/navigation", () => ({ redirect }));

import RegistroCodigoPage, { metadata } from "./page";
import { access } from "@/lib/content";
import { SIGNUP_CODE_ERROR_CODE, SIGNUP_HREF } from "@/lib/routes";

afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
  readPendingEmail.mockResolvedValue("alumno@crypto-crime.test");
});

const { code } = access.signup;

/*
 * The page is `async` now. `render(<RegistroCodigoPage />)` on an async
 * component does not throw — it renders an *empty* container and warns on
 * stderr — so every case invokes the function and renders what it resolves to.
 * That empty container is why every negative assertion sits next to an anchor.
 */
async function renderPage(searchParams: Record<string, string | string[]> = {}) {
  return render(await RegistroCodigoPage({ searchParams: Promise.resolve(searchParams) }));
}

describe("the code field", () => {
  it("is associated with its label", async () => {
    await renderPage();

    const field = screen.getByLabelText(code.codeLabel);

    expect(field.tagName).toBe("INPUT");
    expect(field.getAttribute("autocomplete")).toBe("one-time-code");
  });

  /**
   * `text`, not `number`. A verification code is a string of digits: `number`
   * brings a spinner, locale grouping and the silent loss of a leading zero.
   * `inputMode` is what gets the numeric keypad without any of that.
   */
  it("is text with a numeric keypad, never a number input", async () => {
    await renderPage();

    const field = screen.getByLabelText(code.codeLabel);

    expect(field.getAttribute("type")).toBe("text");
    expect(field.getAttribute("inputmode")).toBe("numeric");
  });

  it("asks for the code and nothing else", async () => {
    const { container } = await renderPage();

    expect([...container.querySelectorAll("input")]).toHaveLength(1);
    expect(container.querySelector('input[type="password"]')).toBeNull();
  });

  /*
   * The code has to be part of the submission, so it keeps its `name`. This is
   * the regression that pays for `name` becoming optional on `Field`.
   */
  it("submits the code under a name", async () => {
    await renderPage();

    expect(screen.getByLabelText(code.codeLabel).getAttribute("name")).toBe("code");
  });
});

/**
 * 6.3 — the screen posts to the server.
 *
 * This is the assertion that was inverted. It used to say there was no `<form>`
 * and no `<button>`, and that the control was an anchor that advanced whatever
 * was typed — true while the screen was a mock-up, and false now.
 */
describe("the screen posts to the verification action", () => {
  it("wraps the field and the control in a form with a submit button", async () => {
    const { container } = await renderPage();

    const form = container.querySelector("form");
    expect(form).not.toBeNull();
    expect(form!.querySelectorAll("input")).toHaveLength(1);

    const control = screen.getByRole("button", { name: code.submitLabel });
    expect(control.getAttribute("type")).toBe("submit");
    // The anchor the mock-up used is gone, not merely unused.
    expect(screen.queryByRole("link", { name: code.submitLabel })).toBeNull();
  });

  it("posts to verifyCode, carrying the typed code in the body", async () => {
    await renderPage();

    fireEvent.change(screen.getByLabelText(code.codeLabel), { target: { value: "424242" } });
    fireEvent.click(screen.getByRole("button", { name: code.submitLabel }));

    await vi.waitFor(() => expect(verifyCode).toHaveBeenCalledTimes(1));

    expect(verifyCode.mock.calls[0]![0].get("code")).toBe("424242");
  });

  /*
   * 6.4 — `NavPanel` stays the only client component of the project. Comments
   * are stripped first: a comment that merely mentions a forbidden word would
   * fail this, which cost a cycle in T17 of the landing.
   */
  it("ships no JavaScript of its own, and touches no cookie directly", () => {
    const dir = resolve(process.cwd(), "app/registro/codigo");
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
      // The cookie is `lib/signup/pending-email`'s business, and this screen
      // goes through it rather than around it.
      expect(source).not.toContain("cookies");
    }
  });
});

/**
 * 4.3 — no pending address, no screen.
 *
 * The guard runs in the page rather than in the action because a request that
 * merely *arrives* here has nothing to show. It has to happen before any markup
 * is emitted, which the throwing `redirect` double is what proves: if the guard
 * ran late, the render would complete and this would resolve instead of reject.
 */
describe("the guard", () => {
  beforeEach(() => {
    readPendingEmail.mockResolvedValue(undefined);
  });

  it("sends the visitor back to step 1 with the message to ask again", async () => {
    await expect(renderPage()).rejects.toThrow();

    expect(redirect).toHaveBeenCalledTimes(1);
    expect(redirect.mock.calls[0]![0]).toBe("/registro?intent=signup&error=vencido");
  });

  it("emits no markup on the way out", async () => {
    await expect(renderPage()).rejects.toThrow();

    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
    expect(screen.queryByLabelText(code.codeLabel)).toBeNull();
  });
});

/**
 * 4.5 — the way to get another code.
 *
 * This one was *not* inverted, and deliberately: it does not describe the
 * mock-up, it describes a decision that is still in force. Resending without
 * leaving the screen is out of scope, so step 1 stays the place that sends.
 */
describe("the way back", () => {
  it("offers a link to step 1 to ask for another code", async () => {
    await renderPage();

    const resend = screen.getByRole("link", { name: code.resendLabel });

    expect(resend.getAttribute("href")).toBe(SIGNUP_HREF);
    expect(resend.getAttribute("href")).not.toBe("#");
  });
});

describe("the message", () => {
  // Every negative case carries this anchor: against the empty container of a
  // mis-mounted async component, a null lookup passes without implementation.
  function expectTheScreenRendered() {
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(code.title);
  }

  // 6.2 and 8.1 — the text comes from content, by reference, and it is in the
  // HTML the server emits, with no script in between.
  it("shows the declared message when the marker is present", async () => {
    await renderPage({ error: SIGNUP_CODE_ERROR_CODE });

    expect(screen.getByText(code.errorMessage)).not.toBeNull();
  });

  it("renders no message node without a marker", async () => {
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
    const { container } = await renderPage({
      error: [SIGNUP_CODE_ERROR_CODE, SIGNUP_CODE_ERROR_CODE],
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
    expect(headings[0]!.textContent).toBe(code.title);
  });

  it("shows the subtitle and the protocol note", async () => {
    await renderPage();

    expect(screen.getByText(code.subtitle)).not.toBeNull();
    expect(screen.getByText(code.protocol)).not.toBeNull();
  });
});

describe("metadata", () => {
  it("asks search engines not to index the screen", () => {
    const robots = metadata.robots as { index?: boolean; follow?: boolean };

    expect(robots.index).toBe(false);
    expect(robots.follow).toBe(false);
  });
});
