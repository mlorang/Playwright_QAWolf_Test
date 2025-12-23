// @ts-check
const { defineConfig, devices } = require('@playwright/test');

const isCI = !!process.env.CI;

/**
 * Live-site tests (Hacker News) intentionally run with
 * conservative settings in CI to reduce flake caused by
 * external data mutation, timing variance, and pagination.
 */
module.exports = defineConfig({
  testDir: './tests',

  // Safety rails
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,

  // Reporting
  reporter: isCI ? 'html' : 'line',

  use: {
    trace: isCI ? 'on-first-retry' : 'off',
    screenshot: isCI ? 'only-on-failure' : 'off',
    video: 'off',
    // Add a small action timeout for stability
    actionTimeout: 10000,
  },

  // Single browser on purpose (external live site)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
