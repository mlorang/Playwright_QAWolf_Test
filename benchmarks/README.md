# Performance Benchmarks

This directory contains performance benchmarks for measuring the speed and efficiency of operations in the Hacker News test suite.

## Overview

The benchmark suite includes:

1. **Page Load Benchmarks** - Measure how quickly HN pages load and render
2. **Data Collection Benchmarks** - Measure the performance of article collection and extraction
3. **Benchmark Reporter** - View and compare benchmark results over time

## Running Benchmarks

### Run All Benchmarks

```bash
npm run bench
```

### Run Specific Benchmarks

```bash
# Page load benchmarks only
npm run bench:page-load

# Data collection benchmarks only
npm run bench:data-collection
```

## Viewing Results

### Summary Report

View a summary of the latest benchmark results:

```bash
npm run bench:report
```

Example output:
```
============================================================
BENCHMARK RESULTS SUMMARY
============================================================

Timestamp: 12/24/2025, 3:45:00 PM

------------------------------------------------------------

newestPageLoad:
  Count:   5
  Average: 1234.56ms
  Median:  1200.00ms
  Min:     1100.00ms
  Max:     1400.00ms
  P95:     1350.00ms
  P99:     1380.00ms
```

### Detailed Report

View run-by-run details:

```bash
npm run bench:report:detailed
```

### HTML Report

View an interactive HTML report with visual charts (generated automatically after each benchmark run):

```bash
npm run bench:report:html
```

This opens the Playwright HTML report in your browser, showing:
- Test pass/fail status
- Total duration for each benchmark
- Timeline of test execution
- Screenshots/traces (if enabled)

### Compare Results

Compare results across multiple benchmark runs to track performance trends:

```bash
npm run bench:compare
```

### List All Results

See all available benchmark result files:

```bash
npm run bench:list
```

## Benchmark Details

### Page Load Benchmarks

Located in: `page-load.spec.js`

Tests:
- **Benchmark: /newest page load** - Measures time to load and render the /newest page
- **Benchmark: /news (front page) load** - Measures time to load the front page
- **Benchmark: First Contentful Paint** - Measures paint timing metrics

Each test runs 5 iterations by default to provide statistical accuracy.

### Data Collection Benchmarks

Located in: `data-collection.spec.js`

Tests:
- **Benchmark: Collect first 30 articles** - Measures time to collect 30 articles including pagination
- **Benchmark: Single page article extraction** - Measures DOM extraction performance
- **Benchmark: Pagination performance** - Measures time to click "More" and load next page

Each test runs 3 iterations by default (fewer due to longer operation times).

## Understanding Results

### Metrics Explained

- **Mean/Average**: The average time across all iterations
- **Median**: The middle value (less affected by outliers)
- **Min/Max**: The fastest and slowest runs
- **P95/P99**: 95th and 99th percentile (useful for identifying performance outliers)

### Performance Metrics Collected

For page load tests, additional browser performance metrics are captured:
- **First Paint (FP)**: When the first pixel is rendered
- **First Contentful Paint (FCP)**: When the first content element is rendered
- **DOM Interactive**: When the DOM is ready for interaction
- **Transfer Size**: Total bytes transferred over the network

## Result Files

Benchmark results are automatically saved to `benchmarks/results/` with timestamps:

```
benchmarks/results/
├── page-load-benchmark-2025-12-24T15-45-00-123Z.json
├── data-collection-benchmark-2025-12-24T15-46-30-456Z.json
└── ...
```

Each result file contains:
- Timestamp of the run
- Raw results from each iteration
- Statistical summary (min, max, mean, median, p95, p99)

## Customizing Benchmarks

### Adjusting Iteration Count

Edit the benchmark files and modify the `ITERATIONS` constant:

```javascript
const ITERATIONS = 10; // Run each test 10 times
```

### Adding New Benchmarks

Create a new `.spec.js` file in the `benchmarks/` directory following this pattern:

```javascript
const { test } = require('@playwright/test');
const { BenchmarkTimer, saveBenchmarkResults } = require('./utils');

test.describe('My Custom Benchmarks', () => {
  const results = {};

  test('Benchmark: My custom test', async () => {
    const runs = [];

    for (let i = 0; i < 5; i++) {
      const timer = new BenchmarkTimer('my-test');
      timer.start();

      // Your test code here

      const duration = timer.end();
      runs.push({ iteration: i + 1, duration });
    }

    results.myTest = runs;
  });

  test.afterAll(async () => {
    await saveBenchmarkResults(results, 'my-custom-benchmark');
  });
});
```

## Best Practices

1. **Run benchmarks in isolation** - Close other applications to reduce noise
2. **Multiple iterations** - More iterations = more accurate statistics
3. **Consistent environment** - Run on the same machine/network for comparisons
4. **Track trends** - Use `npm run bench:compare` to monitor performance over time
5. **CI Integration** - Consider running benchmarks in CI to catch performance regressions

## Utilities

The `utils.js` module provides helpful utilities:

- `BenchmarkTimer` - High-precision timing with marks/checkpoints
- `measurePagePerformance()` - Extract browser performance metrics
- `calculateStats()` - Compute statistical measures
- `formatMs()` - Format milliseconds for display
- `saveBenchmarkResults()` - Save results to JSON files

## Troubleshooting

### Benchmarks are slow or timing out

The benchmarks hit the live Hacker News site and are subject to:
- Network latency
- HN server response times
- Rate limiting

If you encounter issues, try:
- Running during off-peak hours
- Reducing iteration counts
- Increasing timeout in playwright.config.js

### Results vary widely

Some variance is normal for live site testing. To reduce variance:
- Increase iteration count for better statistical accuracy
- Focus on median rather than mean
- Use P95/P99 to identify outliers

## Questions?

For more information, see:
- [Playwright Performance Testing](https://playwright.dev/docs/test-timeouts)
- [Web Performance APIs](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
