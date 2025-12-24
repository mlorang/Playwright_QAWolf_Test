// @ts-check
/**
 * Global setup for Playwright tests
 * Creates a shared rate limiting mechanism to prevent HN from blocking our requests
 */

const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, '.test-state.json');

module.exports = async () => {
  // Initialize state file
  fs.writeFileSync(STATE_FILE, JSON.stringify({
    lastTestEndTime: 0,
    testsRun: 0
  }));

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  🚀 Rate-Limited Test Suite Configuration                 ║');
  console.log('║                                                            ║');
  console.log('║  Tests will run sequentially with 15-second delays        ║');
  console.log('║  between each test to prevent HN rate limiting.           ║');
  console.log('║                                                            ║');
  console.log('║  Expected runtime: ~3-4 minutes for 10 tests              ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
};
