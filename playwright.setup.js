// @ts-check
/**
 * Playwright setup file
 * Adds rate limiting delays between tests to prevent HN from blocking requests
 */

const { test } = require('@playwright/test');

const DELAY_BETWEEN_TESTS = 8000; // 8 seconds
let lastTestEndTime = 0;

test.beforeEach(async () => {
  const now = Date.now();
  const timeSinceLastTest = now - lastTestEndTime;

  if (lastTestEndTime > 0 && timeSinceLastTest < DELAY_BETWEEN_TESTS) {
    const waitTime = DELAY_BETWEEN_TESTS - timeSinceLastTest;
    console.log(`⏳ Rate limiting: Waiting ${Math.round(waitTime/1000)}s before next test...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
});

test.afterEach(async () => {
  lastTestEndTime = Date.now();
});
