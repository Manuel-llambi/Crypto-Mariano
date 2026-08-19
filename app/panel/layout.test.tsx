// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/*
 * The doubles follow the convention the sign-in action set: one layer above the
 * cookie adapter, and a `redirect` that records its argument and then throws,
 * exactly as the real one signals. That it throws is what makes "no content was
 * emitted" observable.
 */
const { createClient, getUser, getSession, redirect } = vi.hoisted(() => {
  const getUser = vi.fn();
  const getSession = vi.fn();

  return {
    getUser,
    getSession,
    createClient: vi.fn(async () => ({ auth: { getUser, getSession } })),
    redirect: vi.fn((destination: string): never => {
      throw new Error(`NEXT_REDIRECT:${destination}`);
    }),
  };
});

vi.mock("@/lib/supabase/server", () => ({ createClient }));
vi.mock("next/navigation", () => ({ redirect }));

import PanelLayout from "./layout";

afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
});

/**
 * An arbitrary child, deliberately nothing to do with the dashboard.
 *
 * 4.4 asks the guard to sit on the shared chrome rather than on a screen. This
 * child is what makes that observable: move the guard into
 * `app/panel/page.tsx` and it starts reaching the document without a session.
 */
const child = <p>Contenido cualquiera del panel</p>;

function withUser() {
  getUser.mockResolvedValue({ data: { user: { id: "un-usuario" } } });
}

function withoutUser() {
  getUser.mockResolvedValue({ data: { user: null } });
}

describe("a request with a live session", () => {
  beforeEach(withUser);

  // 4.2 — it is served normally, chrome and all. Mounted by invoking the
  // function: `render(<PanelLayout />)` on an async component renders an empty
  // container instead of throwing, and every assertion would be meaningless.
  it("renders the chrome and the screen it was given", async () => {
    render(await PanelLayout({ children: child }));

    expect(screen.getByText("Contenido cualquiera del panel")).not.toBeNull();
    expect(screen.getByRole("banner")).not.toBeNull();
    expect(screen.getByRole("navigation")).not.toBeNull();
    expect(redirect).not.toHaveBeenCalled();
  });
});

describe("a request with no session", () => {
  beforeEach(withoutUser);

  /*
   * 4.1 and 4.3 — the decision happens before any content is emitted.
   *
   * No `render` here at all: the call rejects because the `redirect` double
   * throws, so the absence of content follows from the rejection rather than
   * from an empty container, which a broken layout would produce too.
   */
  it("is redirected to the access screen before anything is emitted", async () => {
    await expect(PanelLayout({ children: child })).rejects.toThrow();

    expect(redirect).toHaveBeenCalledTimes(1);
    expect(redirect).toHaveBeenCalledWith("/acceso?intent=login");
    // The rejection has to be the redirect, not a layout that broke before it
    // ever asked.
    expect(getUser).toHaveBeenCalledTimes(1);
  });

  // 4.4 — the guard covers the chrome, so an arbitrary child never arrives.
  it("keeps the child out of the document", async () => {
    await expect(PanelLayout({ children: child })).rejects.toThrow();

    expect(screen.queryByText("Contenido cualquiera del panel")).toBeNull();
  });
});

describe("how the session is consulted", () => {
  // 3.3 — `getUser()` validates against the authentication server. `getSession()`
  // reads the cookie and believes it, and on the server a cookie is user input.
  it("asks the authentication server, never just the cookie", async () => {
    withUser();

    render(await PanelLayout({ children: child }));

    expect(getUser).toHaveBeenCalledTimes(1);
    expect(getSession).not.toHaveBeenCalled();
  });

  // 4.3, structurally: the guard runs on the server.
  it("is a server component", () => {
    const source = readFileSync(resolve(process.cwd(), "app/panel/layout.tsx"), "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/.*$/gm, "");

    expect(source).not.toContain("use client");
  });
});

describe("metadata", () => {
  it("asks search engines not to index the dashboard", async () => {
    const { metadata } = await import("./layout");
    const robots = metadata.robots as { index?: boolean; follow?: boolean };

    expect(robots.index).toBe(false);
    expect(robots.follow).toBe(false);
  });
});
