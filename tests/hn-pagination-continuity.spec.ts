// spec: specs/indexjs-first-100-order.plan.md
// seed: tests/seed.spec.ts
// @ts-check

import { test, expect } from '@playwright/test';

test.describe('HN Pagination continuity', () => {
  test('Pagination continuity — duplicates across pages should not prevent reaching 100', async ({ page }, testInfo) => {
    // 1. Open a fresh browser context and navigate to `https://news.ycombinator.com/newest`
    await page.goto('https://news.ycombinator.com/newest');

    const collected: string[] = [];
    const seen = new Set<string>();

    // Helper: append unseen ids preserving order
    const appendUnseen = (ids: string[]) => {
      for (const id of ids) {
        if (!seen.has(id)) {
          seen.add(id);
          collected.push(id);
          if (collected.length >= 100) return;
        }
      }
    };

    // Collector loop: click visible "More" and gather until 100 unique ids are collected
    // 2. Collect unique article ids by repeatedly: evaluate visible `tr.athing` ids in page order,
    //    click the visible `More` link, wait for DOM update; continue until 100 unique ids are collected or `More` disappears.
    console.log('\n=== COLLECTING UNIQUE IDS ===');
    let exhaustionAttempts = 0;
    let pageNum = 1;
    while (collected.length < 100) {
      // Extract current page ids (step comment)
      // Extract the tr.athing ids from the current page
      const pageIds = await page.locator('tr.athing').evaluateAll((els) => els.map((el) => (el as HTMLElement).getAttribute('id') || ''));
      const beforeCount = collected.length;
      appendUnseen(pageIds);
      const newCount = collected.length - beforeCount;
      const duplicates = pageIds.length - newCount;
      console.log(`Page ${pageNum}: Found ${pageIds.length} articles, ${newCount} new, ${duplicates} duplicates. Total: ${collected.length}/100`);
      pageNum++;
      if (collected.length >= 100) break;

      const more = page.getByRole('link', { name: 'More', exact: true });
      if (!(await more.isVisible())) {
        // No More link → page exhaustion
        console.log('⚠️  No "More" link found - page exhausted');
        break;
      }

      // Click 'More' to load next 30 (step comment)
      const prevFirst = await page.locator('tr.athing').first().getAttribute('id');
      await more.click();
      // Wait for navigation to complete and elements to reload
      await page.waitForLoadState('load');
      // Wait until the first article ID is different (page has changed)
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
        // If timeout, page might not have changed - continue anyway
      }

      // After clicking, get new ids and detect whether new ids appeared
      const newPageIds = await page.locator('tr.athing').evaluateAll((els) => els.map((el) => (el as HTMLElement).getAttribute('id') || ''));
      const newlyAdded = newPageIds.some((id) => !pageIds.includes(id));
      if (!newlyAdded) {
        exhaustionAttempts += 1;
        // 3. For each `More` click, assert that either new ids were observed or the collector detected page exhaustion after multiple attempts.
        if (exhaustionAttempts >= 3) {
          // consider page exhausted; break and capture diagnostics via testInfo attachments
          await testInfo.attach('last-page-html', { body: await page.content(), contentType: 'text/html' });
          await testInfo.attach('last-visible-ids', { body: JSON.stringify(newPageIds.slice(0, 30), null, 2), contentType: 'application/json' });
          break;
        }
      } else {
        exhaustionAttempts = 0; // reset
      }
    }

    // 4. After collection, assert that exactly 100 unique ids were collected. If fewer, capture diagnostics: DOM snippets, last visible ids, and reason for exhaustion.
    // Verification
    console.log('\n=== VERIFICATION ===');
    if (collected.length === 100) {
      console.log(`✓ Successfully collected 100 unique article IDs`);
      console.log(`\nTest completed successfully!`);
    } else {
      console.log(`✗ Only collected ${collected.length} unique IDs (expected 100)`);
    }
    expect(collected.length, `expected 100 unique ids, got ${collected.length}`).toBe(100);
  });
});