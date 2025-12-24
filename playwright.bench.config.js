// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Benchmark configuration
 * - No rate limiting (benchmarks create their own browser instances)
 * - No retries (we want raw performance data)
 * - Longer timeout for benchmark iterations
 */
module.exports = defineConfig({
  testDir: './benchmarks',

  // No global setup/teardown for benchmarks
  // Each benchmark manages its own browser instances

  // Benchmark-specific settings
  forbidOnly: false,
  retries: 0, // No retries - we want accurate timing
  workers: 1, // Run benchmarks sequentially
  fullyParallel: false,

  // Reporting - use both list (for console) and HTML (for visual report)
  reporter: [
    ['list'], // Detailed console output while running
    ['html', { outputFolder: 'playwright-report/benchmarks', open: 'never' }], // HTML report in separate folder
  ],

  // Timeout settings - benchmarks can take longer
  timeout: 300000, // 5 minutes per benchmark test

  use: {
    trace: 'off',
    screenshot: 'off',
    video: 'off',
    actionTimeout: 30000,
  },

  // Single browser
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
