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
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: `npm run build && npx next start --hostname ${HOST} --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    // The build runs first, so this waits for a compile, not just a boot.
    timeout: 240_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
