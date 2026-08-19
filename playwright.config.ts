import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

/**
 * `127.0.0.1`, never `localhost`.
 *
 * On Windows `localhost` resolves to `::1` first while `next start` binds IPv4,
 * so the browser hangs on a port nothing is listening on — intermittently, which
 * is worse than never working. Pinning both the server and the client to the
 * same interface removes the race.
 */
const HOST = "127.0.0.1";
const BASE_URL = `http://${HOST}:${PORT}`;

/**
 * End-to-end configuration.
 *
 * These specs run against the **production build**, not the dev server. Several
 * of the criteria they cover only hold there: without JavaScript (Requisito 8)
 * the dev server still ships its own client runtime, and the metadata guard of
 * 10.3 only runs while building.
 *
 * The port is not 3000 on purpose, so a dev server left running does not get
 * mistaken for the build under test.
 */
export default defineConfig({
  testDir: "./e2e",

  /*
   * Aborts the run when the local Supabase instance is down (7.1).
   *
   * It runs *after* the web server, because Playwright pushes its plugin setup
   * tasks ahead of `globalSetups` and the web server is one of those plugins.
   * So this does not save the build — it replaces a suite of expired `expect`s
   * pointing at healthy code with one message naming the real cause.
   */
  globalSetup: "./playwright.global-setup.ts",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",

  /**
   * One worker.
   *
   * With Playwright's default of one worker per core, five Chromium instances
   * started here and none of them ever fired `load`: every spec timed out on
   * `page.goto` against a server that answered `curl` in 70 ms. One worker runs
   * the whole suite in about five seconds, so the parallelism buys nothing here.
   * Raise it only after watching a full green run at the higher number.
   */
  workers: 1,

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },

  projects: [
    /*
     * Signs in once per run and saves the session for `e2e/panel.spec.ts`.
     *
     * The default `testMatch` only picks up `*.spec.ts` and `*.test.ts`, so no
     * other project collects `auth.setup.ts`; `dependencies` is what makes it
     * run even for `npx playwright test e2e/panel.spec.ts`. The resulting order
     * is webServer → globalSetup → setup → chromium.
     */
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
    },
  ],

  webServer: {
    /*
     * CI builds in its own step, so rebuilding here would double the slowest
     * part of the run for nothing. Locally the build is chained, so a single
     * `npm run test:e2e` always tests current code.
     */
    command: process.env.CI
      ? `npx next start --hostname ${HOST} --port ${PORT}`
      : `npm run build && npx next start --hostname ${HOST} --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    // The build runs first, so this waits for a compile, not just a boot.
    timeout: 240_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
