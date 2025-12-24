const { test, expect, chromium } = require('@playwright/test');
const { BenchmarkTimer, measurePagePerformance, formatMs, saveBenchmarkResults } = require('./utils');

/**
 * Page Load Performance Benchmarks
 *
 * Measures how quickly different HN pages load and render
 */

test.describe('Page Load Performance Benchmarks', () => {
  const ITERATIONS = 5; // Number of runs per benchmark
  const results = {};

  test('Benchmark: /newest page load', async () => {
    const runs = [];

    for (let i = 0; i < ITERATIONS; i++) {
      const browser = await chromium.launch();
      const context = await browser.newContext();
      const page = await context.newPage();

      const timer = new BenchmarkTimer('newest-page-load');
      timer.start();

      await page.goto('https://news.ycombinator.com/newest');
      await page.waitForSelector('tr.athing');

      const duration = timer.end();
      const perfMetrics = await measurePagePerformance(page);

      runs.push({
        iteration: i + 1,
        duration,
        perfMetrics,
        url: page.url()
      });

      console.log(`  Run ${i + 1}/${ITERATIONS}: ${formatMs(duration)}`);

      await browser.close();
    }

    results.newestPageLoad = runs;

    // Log summary
    const durations = runs.map(r => r.duration);
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);

    console.log(`\nSummary for /newest page load:`);
    console.log(`  Average: ${formatMs(avg)}`);
    console.log(`  Min: ${formatMs(min)}`);
    console.log(`  Max: ${formatMs(max)}`);
  });

  test('Benchmark: /news (front page) load', async () => {
    const runs = [];

    for (let i = 0; i < ITERATIONS; i++) {
      const browser = await chromium.launch();
      const context = await browser.newContext();
      const page = await context.newPage();

      const timer = new BenchmarkTimer('news-page-load');
      timer.start();

      await page.goto('https://news.ycombinator.com/news');
      await page.waitForSelector('tr.athing');

      const duration = timer.end();
      const perfMetrics = await measurePagePerformance(page);

      runs.push({
        iteration: i + 1,
        duration,
        perfMetrics,
        url: page.url()
      });

      console.log(`  Run ${i + 1}/${ITERATIONS}: ${formatMs(duration)}`);

      await browser.close();
    }

    results.newsPageLoad = runs;

    // Log summary
    const durations = runs.map(r => r.duration);
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);

    console.log(`\nSummary for /news page load:`);
    console.log(`  Average: ${formatMs(avg)}`);
    console.log(`  Min: ${formatMs(min)}`);
    console.log(`  Max: ${formatMs(max)}`);
  });

  test('Benchmark: First Contentful Paint', async () => {
    const runs = [];

    for (let i = 0; i < ITERATIONS; i++) {
      const browser = await chromium.launch();
      const context = await browser.newContext();
      const page = await context.newPage();

      await page.goto('https://news.ycombinator.com/newest');
      await page.waitForSelector('tr.athing');

      const perfMetrics = await measurePagePerformance(page);

      runs.push({
        iteration: i + 1,
        duration: perfMetrics.firstContentfulPaint, // Use FCP as the primary metric
        firstPaint: perfMetrics.firstPaint,
        firstContentfulPaint: perfMetrics.firstContentfulPaint,
        domInteractive: perfMetrics.domInteractive
      });

      console.log(`  Run ${i + 1}/${ITERATIONS}: FCP=${formatMs(perfMetrics.firstContentfulPaint)}`);

      await browser.close();
    }

    results.paintTiming = runs;

    // Log summary
    const fcpValues = runs.map(r => r.firstContentfulPaint);
    const avg = fcpValues.reduce((a, b) => a + b, 0) / fcpValues.length;
    const min = Math.min(...fcpValues);
    const max = Math.max(...fcpValues);

    console.log(`\nSummary for First Contentful Paint:`);
    console.log(`  Average: ${formatMs(avg)}`);
    console.log(`  Min: ${formatMs(min)}`);
    console.log(`  Max: ${formatMs(max)}`);
  });

  test.afterAll(async () => {
    // Save all results to file
    const filepath = await saveBenchmarkResults(results, 'page-load-benchmark');
    console.log(`\n✓ Benchmark results saved to: ${filepath}`);
  });
});
