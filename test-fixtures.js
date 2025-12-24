// @ts-check
/**
 * Custom test fixtures for rate-limited HN testing
 * Ensures tests respect rate limits by adding delays between test files
 */

const base = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, '.test-state.json');
const DELAY_BETWEEN_TESTS = 15000; // 15 seconds between test files

/**
 * Reads the shared state file
 */
function readState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }
  } catch (e) {
    // Ignore errors
  }
  return { lastTestEndTime: 0, testsRun: 0 };
}

/**
 * Writes to the shared state file
 * @param {{ lastTestEndTime: number, testsRun: number }} state
 */
function writeState(state) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state));
  } catch (e) {
    // Ignore errors
  }
}

/**
 * Custom test fixture that enforces rate limiting
 */
exports.test = base.test.extend({
  page: async ({ page }, use, testInfo) => {
    // Before test: Check if we need to wait
    const state = readState();
    const now = Date.now();
    const timeSinceLastTest = now - state.lastTestEndTime;

    if (state.testsRun > 0 && timeSinceLastTest < DELAY_BETWEEN_TESTS) {
      const waitTime = DELAY_BETWEEN_TESTS - timeSinceLastTest;
      const testName = testInfo.title;
      console.log(`\n⏳ [Rate Limit] Waiting ${Math.round(waitTime/1000)}s before "${testName}"...\n`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    // Run the test
    await use(page);

    // After test: Update state
    const newState = {
      lastTestEndTime: Date.now(),
      testsRun: state.testsRun + 1
    };
    writeState(newState);

    // Add a small buffer after each test completes
    console.log(`✓ Test ${state.testsRun + 1} completed. Preparing for next test...`);
  }
});

exports.expect = base.expect;
