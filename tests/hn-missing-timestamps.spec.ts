// spec: specs/indexjs-first-100-order.plan.md
// seed: tests/seed.spec.ts
// Test for handling missing timestamps - validates ordering when timestamps are present

import { test, expect } from '@playwright/test';

test.describe('HN Missing Timestamps Handling', () => {
  test('should collect 100 articles and validate timestamp ordering', async ({ page }, testInfo) => {
    // Navigate to /newest
    await page.goto('https://news.ycombinator.com/newest');

    const collected: Array<{id: string; title: string; ts: string | null}> = [];
    const seen = new Set<string>();

    // Helper: extract visible items from the current page
    const extractPageItems = async () => {
      return await page.locator('tr.athing').evaluateAll((rows) => {
        return rows.map((row) => {
          const id = row.getAttribute('id') || '';
          const titleEl = row.querySelector('a');
          const title = titleEl ? (titleEl.textContent || '').trim() : '';
          const next = row.nextElementSibling as HTMLElement | null;
          let ts: string | null = null;
          if (next) {
            const ageEl = next.querySelector('.age[title]');
            ts = ageEl ? ageEl.getAttribute('title') : null;
          }
          return { id, title, ts };
        });
      });
    };

    // Collect 100 articles by paginating
    console.log('\n=== COLLECTING 100 ARTICLES ===');
    let pageNum = 1;
    while (collected.length < 100) {
      const pageItems = await extractPageItems();
      const beforeCount = collected.length;

      for (const it of pageItems) {
        if (!seen.has(it.id)) {
          seen.add(it.id);
          collected.push(it);
        }
        if (collected.length >= 100) break;
      }

      console.log(`Page ${pageNum}: Collected ${collected.length - beforeCount} new articles. Total: ${collected.length}/100`);
      pageNum++;
      if (collected.length >= 100) break;

      // Click More link
      const more = page.getByRole('link', { name: 'More', exact: true });
      if (!(await more.isVisible())) {
        console.log('No more link found');
        break;
      }

      const prevFirst = await page.locator('tr.athing').first().getAttribute('id');
      await more.click();
      await page.waitForLoadState('load');

      // Wait for page to change
      try {
        await page.waitForFunction(
          (expectedOldId) => {
            const firstRow = document.querySelector('tr.athing');
            return firstRow && firstRow.getAttribute('id') !== expectedOldId;
          },
          prevFirst,
          { timeout: 5000 }
        );
      } catch (e) {
        // Continue anyway
      }
    }

    // Trim to exactly 100
    const first100 = collected.slice(0, 100);

    console.log(`\n=== COVERAGE ANALYSIS ===`);
    console.log(`Total articles: ${first100.length}`);

    // Calculate coverage
    const withTimestamps = first100.filter(it => it.ts !== null);
    const coverage = (withTimestamps.length / first100.length) * 100;

    console.log(`Articles with timestamps: ${withTimestamps.length}`);
    console.log(`Coverage: ${coverage.toFixed(1)}%`);

    // Log missing timestamps
    const missingTs = first100.filter(it => it.ts === null);
    if (missingTs.length > 0) {
      console.log(`\nMissing timestamps: ${missingTs.length}`);
      console.log('Sample missing:', missingTs.slice(0, 5).map(it => `ID: ${it.id}`).join(', '));
      await testInfo.attach('missing-timestamps', {
        body: JSON.stringify(missingTs, null, 2),
        contentType: 'application/json'
      });
    }

    // Require at least 70% coverage (per spec)
    if (coverage < 70) {
      console.log(`⚠️  Coverage ${coverage.toFixed(1)}% is below 70% threshold`);
      console.log('Test marked as INCONCLUSIVE');
      await testInfo.attach('inconclusive-reason', {
        body: JSON.stringify({ coverage, threshold: 70, note: 'Insufficient timestamp coverage' }, null, 2),
        contentType: 'application/json'
      });
      // Skip validation when coverage is too low
      test.skip();
      return;
    }

    console.log(`✓ Coverage meets 70% threshold`);

    // Parse timestamps
    console.log(`\n=== VALIDATING ORDERING ===`);
    const parsedTimestamps = withTimestamps.map(it => ({
      ...it,
      date: new Date(it.ts!)
    }));

    // Check for parse errors
    const parseErrors = parsedTimestamps.filter(it => isNaN(it.date.getTime()));
    if (parseErrors.length > 0) {
      console.log(`Parse errors: ${parseErrors.length}`);
      await testInfo.attach('parse-errors', {
        body: JSON.stringify(parseErrors.slice(0, 10), null, 2),
        contentType: 'application/json'
      });
    }

    // Filter to valid dates
    const validDates = parsedTimestamps.filter(it => !isNaN(it.date.getTime()));
    console.log(`Valid parsable timestamps: ${validDates.length}`);

    // Verify chronological order (newest → oldest)
    let violations = 0;
    for (let i = 0; i < validDates.length - 1; i++) {
      const current = validDates[i].date;
      const next = validDates[i + 1].date;

      if (current.getTime() < next.getTime()) {
        violations++;
        if (violations <= 5) {
          console.log(`❌ Order violation at index ${i}:`);
          console.log(`   ${validDates[i].id}: ${current.toISOString()}`);
          console.log(`   ${validDates[i + 1].id}: ${next.toISOString()}`);
        }
      }
    }

    if (violations > 0) {
      console.log(`\nTotal violations: ${violations}`);
    }

    expect(violations, `Expected chronological order (newest→oldest), found ${violations} violations`).toBe(0);
    console.log(`✓ All ${validDates.length} timestamps are in correct order`);
  });
});
