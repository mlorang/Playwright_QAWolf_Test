const { test, expect, chromium } = require('@playwright/test');
const { BenchmarkTimer, formatMs, saveBenchmarkResults } = require('./utils');

/**
 * Data Collection Performance Benchmarks
 *
 * Measures how quickly we can collect and process article data
 */

test.describe('Data Collection Performance Benchmarks', () => {
  const ITERATIONS = 3; // Fewer iterations for longer operations
  const results = {};

  test('Benchmark: Collect first 30 articles', async () => {
    const runs = [];

    for (let i = 0; i < ITERATIONS; i++) {
      const browser = await chromium.launch();
      const context = await browser.newContext();
      const page = await context.newPage();

      const timer = new BenchmarkTimer('collect-30-articles');
      timer.start();

      await page.goto('https://news.ycombinator.com/newest');
      timer.mark('page-loaded');

      const collected = [];
      const seen = new Set();
      const targetCount = 30;

      while (collected.length < targetCount) {
        const pageItems = await page.locator('tr.athing').evaluateAll((rows) => {
          return rows.map((row) => {
            const id = row.getAttribute('id') || '';
            const titleEl = row.querySelector('a');
            const title = titleEl ? (titleEl.textContent || '').trim() : '';
            return { id, title };
          });
        });

        for (const it of pageItems) {
          if (!seen.has(it.id)) {
            seen.add(it.id);
            collected.push(it);
          }
          if (collected.length >= targetCount) break;
        }

        if (collected.length >= targetCount) break;

        const more = page.getByRole('link', { name: 'More', exact: true });
        if (!(await more.isVisible())) break;

        await more.click();
        await page.waitForLoadState('load');
      }

      timer.mark('data-collected');
      const duration = timer.end();

      runs.push({
        iteration: i + 1,
        duration,
        articlesCollected: collected.length,
        marks: timer.marks
      });

      console.log(`  Run ${i + 1}/${ITERATIONS}: ${formatMs(duration)} (${collected.length} articles)`);

      await browser.close();
    }

    results.collect30Articles = runs;

    // Log summary
    const durations = runs.map(r => r.duration);
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);

    console.log(`\nSummary for collecting 30 articles:`);
    console.log(`  Average: ${formatMs(avg)}`);
    console.log(`  Min: ${formatMs(min)}`);
    console.log(`  Max: ${formatMs(max)}`);
  });

  test('Benchmark: Single page article extraction', async () => {
    const runs = [];

    for (let i = 0; i < ITERATIONS; i++) {
      const browser = await chromium.launch();
      const context = await browser.newContext();
      const page = await context.newPage();

      await page.goto('https://news.ycombinator.com/newest');
      await page.waitForSelector('tr.athing');

      const timer = new BenchmarkTimer('extract-articles');
      timer.start();

      const items = await page.locator('tr.athing').evaluateAll((rows) => {
        return rows.map((row) => {
          const id = row.getAttribute('id') || '';
          const titleEl = row.querySelector('a');
          const title = titleEl ? (titleEl.textContent || '').trim() : '';
          const next = row.nextElementSibling;
          let tsEl = null;
          if (next) {
            tsEl = next.querySelector('.age[title], a[title], span[title]');
          }
          const ts = tsEl ? tsEl.getAttribute('title') : null;
          return { id, title, ts };
        });
      });

      const duration = timer.end();

      runs.push({
        iteration: i + 1,
        duration,
        itemsExtracted: items.length
      });

      console.log(`  Run ${i + 1}/${ITERATIONS}: ${formatMs(duration)} (${items.length} items)`);

      await browser.close();
    }

    results.singlePageExtraction = runs;

    // Log summary
    const durations = runs.map(r => r.duration);
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);

    console.log(`\nSummary for single page extraction:`);
    console.log(`  Average: ${formatMs(avg)}`);
    console.log(`  Min: ${formatMs(min)}`);
    console.log(`  Max: ${formatMs(max)}`);
  });

  test('Benchmark: Pagination performance', async () => {
    const runs = [];

    for (let i = 0; i < ITERATIONS; i++) {
      const browser = await chromium.launch();
      const context = await browser.newContext();
      const page = await context.newPage();

      await page.goto('https://news.ycombinator.com/newest');
      await page.waitForSelector('tr.athing');

      const timer = new BenchmarkTimer('pagination');
      timer.start();

      const more = page.getByRole('link', { name: 'More', exact: true });

      if (await more.isVisible()) {
        const prevFirst = await page.locator('tr.athing').first().getAttribute('id');
        await more.click();
        await page.waitForLoadState('load');

        // Wait for page to change
        await page.waitForFunction(
          (expectedOldId) => {
            const firstRow = document.querySelector('tr.athing');
            return firstRow && firstRow.getAttribute('id') !== expectedOldId;
          },
          prevFirst,
          { timeout: 5000 }
        ).catch(() => {});
      }

      const duration = timer.end();

      runs.push({
        iteration: i + 1,
        duration
      });

      console.log(`  Run ${i + 1}/${ITERATIONS}: ${formatMs(duration)}`);

      await browser.close();
    }

    results.pagination = runs;

    // Log summary
    const durations = runs.map(r => r.duration);
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);

    console.log(`\nSummary for pagination:`);
    console.log(`  Average: ${formatMs(avg)}`);
    console.log(`  Min: ${formatMs(min)}`);
    console.log(`  Max: ${formatMs(max)}`);
  });

  test.afterAll(async () => {
    // Save all results to file
    const filepath = await saveBenchmarkResults(results, 'data-collection-benchmark');
    console.log(`\n✓ Benchmark results saved to: ${filepath}`);
  });
});
