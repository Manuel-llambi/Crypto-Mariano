import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/*
 * 7.3 — the templates are versioned files, and they stay wired up.
 *
 * Writing the two templates is the easy half. The half that rots is the
 * wiring: `content_path` is spelled two different ways in the factory file —
 * `"./supabase/templates/invite.html"` under `[auth.email.template.invite]` and
 * `"./templates/password_changed_notification.html"` under
 * `[auth.email.notification.password_changed]` — and when the prefix is wrong
 * the CLI does not complain. It quietly sends the built-in template, which
 * carries a confirmation link and no code at all. That is the failure of 7.1,
 * and it is silent.
 *
 * So this reads the TOML as text rather than parsing it: a line scan and
 * `node:fs` need no new dependency, and the shape of the file is stable enough
 * that a parser would buy nothing. `lib/og-image.ts` is the mould — a guard
 * that asserts against the disk.
 */

const REPO_ROOT = resolve(process.cwd());
const CONFIG = readFileSync(resolve(REPO_ROOT, "supabase/config.toml"), "utf8");

/**
 * The two templates Supabase can choose between, and why both are here.
 *
 * `confirmation` goes to an address with no account yet; `magic_link` to one
 * that already has one. Fixing only one of them leaves half the visitors
 * without a code, and 7.2 asks both to carry it.
 */
const TEMPLATES = [
  ["auth.email.template.confirmation", "an address with no account yet"],
  ["auth.email.template.magic_link", "an address that already has an account"],
] as const;

/**
 * The lines under a TOML table header, up to the next one.
 *
 * Commented lines are dropped first, which is what makes the difference between
 * a declaration and the factory example that merely shows one.
 */
function tableBody(table: string): string[] | undefined {
  const lines = CONFIG.split(/\r?\n/).filter((line) => !line.trimStart().startsWith("#"));
  const start = lines.indexOf(`[${table}]`);

  if (start === -1) {
    return undefined;
  }

  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => line.trimStart().startsWith("["));

  return end === -1 ? rest : rest.slice(0, end);
}

/** The value of a key declared under a table, or `undefined` if there is none. */
function declaredValue(table: string, key: string): string | undefined {
  const body = tableBody(table);

  if (body === undefined) {
    return undefined;
  }

  for (const line of body) {
    const match = new RegExp(`^\\s*${key}\\s*=\\s*"([^"]+)"`).exec(line);

    if (match !== null) {
      return match[1];
    }
  }

  return undefined;
}

describe.each(TEMPLATES)("the template for %s", (table) => {
  it("is declared in supabase/config.toml, uncommented", () => {
    expect(declaredValue(table, "content_path")).toBeDefined();
  });

  it("declares a subject as well", () => {
    expect(declaredValue(table, "subject")).toBeDefined();
  });

  /*
   * The one that catches a rename. The path is resolved from the repository
   * root, which is where the CLI resolves it from, so a prefix that drifts to
   * `./templates/…` fails here instead of silently sending the default.
   */
  it("points at a file that exists, resolved from the repository root", () => {
    const path = declaredValue(table, "content_path");
    expect(path).toBeDefined();

    const stats = statSync(resolve(REPO_ROOT, path!), { throwIfNoEntry: false });

    expect(stats?.isFile()).toBe(true);
  });

  // 7.1 — the code as readable text. `{{ .ConfirmationURL }}` is what the
  // built-in template sends, and following a link is out of scope here.
  it("shows the code itself and not only a confirmation link", () => {
    const html = readFileSync(resolve(REPO_ROOT, declaredValue(table, "content_path")!), "utf8");

    expect(html).toContain("{{ .Token }}");
  });
});
