import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const URL_VALUE = "http://127.0.0.1:55321";
const KEY_VALUE = "sb_publishable_local_demo_key";

const originalUrl = process.env.SUPABASE_URL;
const originalKey = process.env.SUPABASE_PUBLISHABLE_KEY;

function set(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}

/** Imports the module fresh, so the import-time validation runs every time. */
async function loadWith(url: string | undefined, key: string | undefined) {
  set("SUPABASE_URL", url);
  set("SUPABASE_PUBLISHABLE_KEY", key);
  vi.resetModules();
  return import("./env");
}

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  set("SUPABASE_URL", originalUrl);
  set("SUPABASE_PUBLISHABLE_KEY", originalKey);
  vi.resetModules();
});

// 6.1 — a missing or malformed setting stops the build, it does not degrade.
describe("configuration validation at import time", () => {
  it("throws when the address is absent, naming it", async () => {
    await expect(loadWith(undefined, KEY_VALUE)).rejects.toThrow(/SUPABASE_URL/);
  });

  it("throws when the key is absent, naming it", async () => {
    await expect(loadWith(URL_VALUE, undefined)).rejects.toThrow(/SUPABASE_PUBLISHABLE_KEY/);
  });

  // Naming the one that is missing is what separates "which of the two" from a
  // generic "configuration is missing".
  it("does not name the setting that is present", async () => {
    await expect(loadWith(undefined, KEY_VALUE)).rejects.toThrow(
      expect.not.stringContaining("SUPABASE_PUBLISHABLE_KEY"),
    );
    await expect(loadWith(URL_VALUE, undefined)).rejects.toThrow(
      expect.not.stringContaining("SUPABASE_URL:"),
    );
  });

  it("throws when the address is present but malformed", async () => {
    await expect(loadWith("127.0.0.1:55321", KEY_VALUE)).rejects.toThrow(/SUPABASE_URL/);
  });

  it("throws when the key is present but empty", async () => {
    await expect(loadWith(URL_VALUE, "")).rejects.toThrow(/SUPABASE_PUBLISHABLE_KEY/);
  });
});

describe("supabaseEnv", () => {
  it("exposes the two settings once both are well formed", async () => {
    const { supabaseEnv } = await loadWith(URL_VALUE, KEY_VALUE);
    expect(supabaseEnv).toEqual({ url: URL_VALUE, publishableKey: KEY_VALUE });
  });

  // 6.3 — the module reads the two public settings and nothing else.
  it("exports supabaseEnv and nothing more", async () => {
    const loaded = await loadWith(URL_VALUE, KEY_VALUE);
    expect(Object.keys(loaded).filter((key) => key !== "default")).toEqual(["supabaseEnv"]);
  });
});

// 6.3 — no privileged credential is read anywhere in the application sources.
// The DOM cannot tell this case apart, so the assertion reads the files.
describe("privileged credentials are absent from the sources", () => {
  const FORBIDDEN = ["SERVICE_ROLE", "SERVICE_KEY", "SECRET_KEY", "service_role"];

  function sourcesUnder(dir: string): string[] {
    const found: string[] = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        found.push(...sourcesUnder(path));
        continue;
      }
      if (!/\.tsx?$/.test(entry.name) || /\.test\.tsx?$/.test(entry.name)) {
        continue;
      }
      found.push(path);
    }
    return found;
  }

  it("mentions no privileged key anywhere under app, components or lib", () => {
    const offenders = ["app", "components", "lib"]
      .flatMap(sourcesUnder)
      .filter((path) => {
        const source = readFileSync(path, "utf8");
        return FORBIDDEN.some((token) => source.includes(token));
      });

    expect(offenders).toEqual([]);
  });
});
