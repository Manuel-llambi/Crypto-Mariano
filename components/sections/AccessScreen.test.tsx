// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AccessScreen } from "./AccessScreen";

afterEach(cleanup);

const source = readFileSync(resolve(process.cwd(), "components/sections/AccessScreen.tsx"), "utf8");

interface Options {
  submitHref?: string;
  submitAction?: (formData: FormData) => Promise<void>;
  error?: string;
  children?: ReactNode;
}

function renderScreen({ submitHref, submitAction, error, children }: Options = {}) {
  return render(
    <AccessScreen
      siteName="Crypto Crime Academy"
      title="Un título"
      subtitle="Un subtítulo"
      protocol="Protocolo: PRUEBA"
      submitLabel="Continuar"
      submitHref={submitHref}
      submitAction={submitAction}
      error={error}
    >
      {children ?? <input aria-label="Un campo" />}
    </AccessScreen>,
  );
}

/**
 * The three shapes of the control, and the reason they are three.
 *
 * A screen that posts to the server gets a `<form>` with a submit button. A
 * screen that only advances gets an anchor, which the browser follows on its
 * own. A screen that is the end of the road gets a button that does nothing.
 *
 * The form is safe precisely because it has an action: a form with none submits
 * by GET and puts every field into the query string, which is how a password
 * reaches browser history, server logs and the referrer of the next request.
 * The two shapes without an action are the two that must never grow a `<form>`.
 */
describe("the submit control", () => {
  it("is an anchor to the next step when the screen advances", () => {
    renderScreen({ submitHref: "/registro/codigo" });

    const control = screen.getByRole("link", { name: "Continuar" });
    expect(control.tagName).toBe("A");
    expect(control.getAttribute("href")).toBe("/registro/codigo");
  });

  it("is an inert button when the screen leads nowhere", () => {
    renderScreen();

    const control = screen.getByRole("button", { name: "Continuar" });
    expect(control.getAttribute("type")).toBe("button");
    expect(screen.queryByRole("link", { name: "Continuar" })).toBeNull();
  });

  // The two shapes with no action are the ones 6.7 still covers: the three
  // screens of `/registro` stay mock-ups and must not grow a form.
  it("renders no form in either action-less shape (6.7)", () => {
    const withHref = renderScreen({ submitHref: "/registro/codigo" });
    expect(withHref.container.querySelector("form")).toBeNull();
    cleanup();

    const withoutHref = renderScreen();
    expect(withoutHref.container.querySelector("form")).toBeNull();
  });
});

// 5.3 — the third shape, the one `/acceso` uses: a form that posts.
describe("the submit control that posts", () => {
  it("puts the fields and the control inside a form", () => {
    const { container } = renderScreen({ submitAction: vi.fn(async () => {}) });

    const form = container.querySelector("form");
    expect(form).not.toBeNull();
    expect(form!.querySelector("input")).not.toBeNull();

    const control = screen.getByRole("button", { name: "Continuar" });
    expect(control.getAttribute("type")).toBe("submit");
    expect(form!.contains(control)).toBe(true);
    expect(screen.queryByRole("link", { name: "Continuar" })).toBeNull();
  });

  /*
   * 1.5 — the fields travel in the body, and this is where that is observable.
   *
   * Nothing is asserted about `method` or the `action` attribute: React writes
   * a `javascript:throw …` sentinel into `action` and leaves `method` unset,
   * because the real markup comes from the server renderer of a Server Action,
   * which this test does not run. What the FormData proves instead is that the
   * fields ended up inside the form — which is the only reason they are in the
   * body rather than in the address bar.
   */
  it("calls the action once, with the typed fields in the body", async () => {
    const submitAction = vi.fn<(formData: FormData) => Promise<void>>(async () => {});

    renderScreen({
      submitAction,
      children: (
        <>
          <input aria-label="Correo" name="email" defaultValue="alguien@ejemplo.test" />
          <input aria-label="Contraseña" name="password" defaultValue="una-contraseña" />
        </>
      ),
    });

    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    await vi.waitFor(() => expect(submitAction).toHaveBeenCalledTimes(1));

    const formData = submitAction.mock.calls[0]![0];
    expect(formData.get("email")).toBe("alguien@ejemplo.test");
    expect(formData.get("password")).toBe("una-contraseña");
  });
});

describe("the error message", () => {
  const MESSAGE = "No pudimos verificar tus credenciales.";

  // 2.1 — the half of the criterion that lives in the component. Producing the
  // text is the page's job, and seeing it in a browser is CF-01's.
  it("shows the text it is given, inside the card", () => {
    renderScreen({ error: MESSAGE });

    expect(screen.getByText(MESSAGE)).not.toBeNull();
  });

  // Read before typing again: that is the whole reason for the position.
  it("precedes the fields in document order", () => {
    const { container } = renderScreen({ error: MESSAGE });

    const message = container.querySelector("[class*='error']")!;
    const field = container.querySelector("input")!;

    expect(message.compareDocumentPosition(field) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  /*
   * 2.5 — with no error there is no node at all.
   *
   * Not merely an empty one: an unconditional `<p>{error}</p>` leaves an empty
   * paragraph in the DOM, and a null `queryByText` would sail past it. The
   * assertion goes against the element, not against the text.
   */
  it("does not exist at all without an error", () => {
    const { container } = renderScreen();

    expect(container.querySelector("[class*='error']")).toBeNull();
  });

  // The message is already in the document when the page loads — a full server
  // round trip brought it — so there is no change to announce.
  it("declares neither role=alert nor a live region", () => {
    const { container } = renderScreen({ error: MESSAGE });

    expect(container.querySelector("[role='alert']")).toBeNull();
    expect(container.querySelector("[aria-live]")).toBeNull();
  });
});

describe("the card", () => {
  it("presents the title as the only first level heading", () => {
    renderScreen();

    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]!.textContent).toBe("Un título");
  });

  it("shows the subtitle and the protocol note", () => {
    renderScreen();

    expect(screen.getByText("Un subtítulo")).not.toBeNull();
    expect(screen.getByText("Protocolo: PRUEBA")).not.toBeNull();
  });

  it("renders the fields it is given", () => {
    renderScreen();

    expect(screen.getByLabelText("Un campo")).not.toBeNull();
  });

  it("suppresses navigation: the bar carries the brand and no links", () => {
    const { container } = renderScreen();

    expect(container.querySelector("header")).not.toBeNull();
    expect(container.querySelectorAll("header a")).toHaveLength(0);
    expect(container.querySelector("nav")).toBeNull();
  });

  it("hides the decorative grid from assistive technology (9.3)", () => {
    const { container } = renderScreen();

    const decoration = container.querySelector("main > [aria-hidden='true']");
    expect(decoration).not.toBeNull();
    expect(decoration!.textContent).toBe("");
  });
});

// 8.1 — the four screens that share this card ship no JavaScript of their own.
it("wires no handler and opens no session", () => {
  const code = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

  expect(code).not.toContain("use client");
  expect(code).not.toContain("onSubmit");
  expect(code).not.toContain("onClick");
  expect(code).not.toContain("useState");
  expect(code).not.toContain("fetch");
  expect(code).not.toContain("cookies");
});
