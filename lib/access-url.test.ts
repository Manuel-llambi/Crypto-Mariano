import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const BASE = "https://app.cryptocrime.academy/acceso";

const original = process.env.NEXT_PUBLIC_ACCESS_URL;

/** Imports the module fresh, so the import-time validation runs every time. */
async function loadWith(value: string | undefined) {
  if (value === undefined) {
    delete process.env.NEXT_PUBLIC_ACCESS_URL;
  } else {
    process.env.NEXT_PUBLIC_ACCESS_URL = value;
  }
  vi.resetModules();
  return import("./access-url");
}

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  if (original === undefined) {
    delete process.env.NEXT_PUBLIC_ACCESS_URL;
  } else {
    process.env.NEXT_PUBLIC_ACCESS_URL = original;
  }
  vi.resetModules();
});

describe("accessUrl", () => {
  // 6.1, 6.2 — the intent is what tells the access screen which flow to open.
  it("appends the signup intent", async () => {
    const { accessUrl } = await loadWith(BASE);
    expect(accessUrl("signup")).toBe(`${BASE}?intent=signup`);
  });

  it("appends the login intent", async () => {
    const { accessUrl } = await loadWith(BASE);
    expect(accessUrl("login")).toBe(`${BASE}?intent=login`);
  });

  // 6.4 — the address is configuration, not a literal in the code.
  it("builds on the configured address", async () => {
    const { accessUrl } = await loadWith("https://otro.example/entrar");
    expect(accessUrl("login")).toBe("https://otro.example/entrar?intent=login");
  });

  it("keeps a query the configured address already carries", async () => {
    const { accessUrl } = await loadWith(`${BASE}?ref=landing`);
    expect(accessUrl("signup")).toBe(`${BASE}?ref=landing&intent=signup`);
  });

  it("replaces an intent the configured address already carries", async () => {
    const { accessUrl } = await loadWith(`${BASE}?intent=login`);
    expect(accessUrl("signup")).toBe(`${BASE}?intent=signup`);
  });
});

// 6.5 — a missing or malformed address stops the build, it does not degrade.
describe("configuration validation at import time", () => {
  it("throws when the variable is absent", async () => {
    await expect(loadWith(undefined)).rejects.toThrow();
  });

  it("throws when the variable is empty", async () => {
    await expect(loadWith("")).rejects.toThrow();
  });

  it("throws when the variable is only whitespace", async () => {
    await expect(loadWith("   ")).rejects.toThrow();
  });

  it("throws when the variable is not a URL", async () => {
    await expect(loadWith("app.cryptocrime.academy/acceso")).rejects.toThrow();
  });

  it("names the variable in the failure", async () => {
    await expect(loadWith(undefined)).rejects.toThrow(/NEXT_PUBLIC_ACCESS_URL/);
  });
});

// 6.7 — the module builds a string and nothing else.
describe("public surface", () => {
  it("exports accessUrl and nothing more", async () => {
    const loaded = await loadWith(BASE);
    expect(Object.keys(loaded).filter((key) => key !== "default")).toEqual(["accessUrl"]);
  });
});
