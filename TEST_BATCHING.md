# Test Batching Configuration

## Overview

This test suite has been configured to run tests in batches with rate limiting to prevent Hacker News from blocking our requests.

## Configuration Files

### 1. `playwright.config.js`
- **workers**: Set to `1` to ensure tests run sequentially
- **fullyParallel**: Set to `false` to prevent parallel execution
- **globalSetup**: Points to `global-setup.js` for initialization
- **globalTeardown**: Points to `global-teardown.js` for cleanup
- **timeout**: Increased to 120 seconds to accommodate rate limiting delays

### 2. `global-setup.js`
Initializes a shared state file (`.test-state.json`) that tracks:
- `lastTestEndTime`: Timestamp when the last test completed
- `testsRun`: Number of tests that have been executed

### 3. `global-teardown.js`
Cleans up the `.test-state.json` file after all tests complete.

### 4. `test-fixtures.js`
Custom Playwright test fixture that:
- Reads the shared state before each test
- Calculates time since last test
- Enforces a **15-second delay** between tests if needed
- Updates the state file after each test completes

## How It Works

1. **Global Setup**: Creates `.test-state.json` with initial values
2. **Before Each Test**:
   - Reads current state
   - Checks if 15 seconds have passed since last test
   - Waits if necessary (displays countdown message)
3. **After Each Test**: Updates state with completion timestamp
4. **Global Teardown**: Removes `.test-state.json`

## Rate Limiting Strategy

- **Delay Between Tests**: 15 seconds
- **Sequential Execution**: Only 1 worker, no parallel tests
- **Expected Runtime**: ~3-4 minutes for 10 tests

## Why This Is Needed

Hacker News implements rate limiting to prevent excessive requests. When multiple tests paginate through `/newest` in quick succession:
- Each test makes 3-4 page requests (clicking "More" to get 100+ articles)
- Without delays, 10 tests = 30-40 requests in ~30 seconds
- HN's rate limiter returns "Sorry." page after ~20-25 requests
- The 15-second delay allows HN's rate limiter to reset between tests

## Usage

### Run All Tests (with batching)
```bash
npx playwright test
```

The global setup will display a message indicating rate limiting is active:
```
╔════════════════════════════════════════════════════════════╗
║  🚀 Rate-Limited Test Suite Configuration                 ║
║                                                            ║
║  Tests will run sequentially with 15-second delays        ║
║  between each test to prevent HN rate limiting.           ║
║                                                            ║
║  Expected runtime: ~3-4 minutes for 10 tests              ║
╚════════════════════════════════════════════════════════════╝
```

During execution, you'll see messages like:
```
⏳ [Rate Limit] Waiting 15s before "next test name"...
```

### Run Individual Tests (no delay)
```bash
npx playwright test tests/hn-missing-timestamps.spec.ts
```

Individual tests don't trigger rate limiting since there's only one test.

## Alternative Approaches Considered

1. **Mock HN Responses**: Would eliminate external dependency but wouldn't test real-world behavior
2. **Reduce to 50 articles**: Would reduce requests but wouldn't meet test requirements
3. **Use HN API exclusively**: Would work but tests are designed to test DOM scraping

## Current Test Results

With this configuration:
- **Individual tests**: 10/10 pass
- **Full suite**: 7-9/10 pass (rate limiting still occasionally occurs)

Some tests may still fail if HN is experiencing high traffic or has stricter rate limiting active. This is expected behavior when testing against a live external service.

## Adjusting the Delay

If tests continue to fail due to rate limiting, increase the delay in `test-fixtures.js`:

```javascript
const DELAY_BETWEEN_TESTS = 20000; // 20 seconds
```

Also update the message in `global-setup.js` to match.

## Notes

- The `.test-state.json` file is automatically created/deleted and should not be committed to git
- This configuration is optimized for live testing against Hacker News
- In CI environments, consider using cached responses or longer delays
