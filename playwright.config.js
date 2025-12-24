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

  // Global setup/teardown for rate limiting
  globalSetup: require.resolve('./global-setup.js'),
  globalTeardown: require.resolve('./global-teardown.js'),

  // Safety rails
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: 1, // Always run tests serially to avoid HN rate limiting
  fullyParallel: false, // Run tests sequentially

  // Reporting
  reporter: isCI ? 'html' : 'line',

  // Timeout settings - increase for rate-limited tests
  timeout: 120000, // 2 minutes per test (includes rate limiting delays)

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
