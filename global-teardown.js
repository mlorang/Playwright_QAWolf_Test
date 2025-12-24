// @ts-check
/**
 * Global teardown for Playwright tests
 * Cleans up state file
 */

const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, '.test-state.json');

module.exports = async () => {
  // Clean up state file
  if (fs.existsSync(STATE_FILE)) {
    fs.unlinkSync(STATE_FILE);
  }

  console.log('\n✨ Global teardown: Cleaned up test state\n');
};
