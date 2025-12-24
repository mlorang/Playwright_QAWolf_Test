// spec: specs/indexjs-first-100-order.plan.md
// seed: tests/seed.spec.ts
// @ts-check

import { test, expect } from '@playwright/test';

test.describe('HN Reachability', () => {
  test('Fewer than 100 reachable — fail and report diagnostics', async ({ page }, testInfo) => {
    // 1. Navigate to https://news.ycombinator.com/newest
    await page.goto('https://news.ycombinator.com/newest');

    const collected: string[] = [];
    const seen = new Set<string>();
    const timestamps: { id: string; timestamp: string | null }[] = [];

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

    // 2. Attempt to collect 100 unique article ids by paginating until `a.morelink` disappears or no new ids appear after multiple iterations
    console.log('\n=== ATTEMPTING TO COLLECT 100 UNIQUE ARTICLE IDS ===');
    let exhaustionAttempts = 0;
    let pageNum = 1;
    const maxExhaustionAttempts = 3;

    while (collected.length < 100) {
      // Extract current page ids and timestamps
      const pageData = await page.locator('tr.athing').evaluateAll((els) =>
        els.map((el) => {
          const id = (el as HTMLElement).getAttribute('id') || '';
          // Find the timestamp in the next sibling row
          const nextRow = el.nextElementSibling;
          const ageElement = nextRow?.querySelector('.age');
          const timestamp = ageElement?.getAttribute('title') || null;
          return { id, timestamp };
        })
      );

      const pageIds = pageData.map((item) => item.id);
      const beforeCount = collected.length;
      appendUnseen(pageIds);
      const newCount = collected.length - beforeCount;
      const duplicates = pageIds.length - newCount;

      // Store timestamps for diagnostic purposes
      for (const item of pageData) {
        if (!timestamps.find((t) => t.id === item.id)) {
          timestamps.push(item);
        }
      }

      console.log(`Page ${pageNum}: Found ${pageIds.length} articles, ${newCount} new, ${duplicates} duplicates. Total: ${collected.length}/100`);
      pageNum++;

      if (collected.length >= 100) break;

      // Check if More link exists
      const more = page.getByRole('link', { name: 'More', exact: true });
      if (!(await more.isVisible())) {
        console.log('⚠️  No "More" link found - page exhausted');
        await testInfo.attach('exhaustion-reason', {
          body: 'No "More" link visible on page',
          contentType: 'text/plain',
        });
        break;
      }

      // Click 'More' to load next page
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
        // Timeout - page might not have changed
      }

      // Check if new ids appeared
      const newPageIds = await page.locator('tr.athing').evaluateAll((els) => els.map((el) => (el as HTMLElement).getAttribute('id') || ''));
      const newlyAdded = newPageIds.some((id) => !pageIds.includes(id));

      if (!newlyAdded) {
        exhaustionAttempts += 1;
        console.log(`⚠️  No new articles found (attempt ${exhaustionAttempts}/${maxExhaustionAttempts})`);

        if (exhaustionAttempts >= maxExhaustionAttempts) {
          console.log('⚠️  Page exhausted - no new articles after multiple attempts');
          await testInfo.attach('exhaustion-reason', {
            body: `No new articles appeared after ${maxExhaustionAttempts} pagination attempts`,
            contentType: 'text/plain',
          });
          break;
        }
      } else {
        exhaustionAttempts = 0; // reset
      }
    }

    // 3. If <100 unique ids found, fail the test and attach collected artifacts
    console.log('\n=== VERIFICATION ===');

    if (collected.length < 100) {
      console.log(`✗ Only collected ${collected.length} unique IDs (expected 100)`);
      console.log('\n=== COLLECTING DIAGNOSTICS ===');

      // Attach collected article IDs
      await testInfo.attach('collected-article-ids', {
        body: JSON.stringify(collected, null, 2),
        contentType: 'application/json',
      });

      // Attach timestamps
      await testInfo.attach('collected-timestamps', {
        body: JSON.stringify(timestamps, null, 2),
        contentType: 'application/json',
      });

      // Attach current page HTML
      await testInfo.attach('final-page-html', {
        body: await page.content(),
        contentType: 'text/html',
      });

      // Attach DOM snippet of last visible articles
      const lastVisibleArticles = await page.locator('tr.athing').evaluateAll((els) =>
        els.slice(0, 10).map((el) => {
          const id = (el as HTMLElement).getAttribute('id');
          const titleLink = el.querySelector('.titleline > a');
          const title = titleLink?.textContent || '';
          return { id, title, html: (el as HTMLElement).outerHTML.substring(0, 500) };
        })
      );
      await testInfo.attach('last-visible-articles-sample', {
        body: JSON.stringify(lastVisibleArticles, null, 2),
        contentType: 'application/json',
      });

      // Collect network request logs (if available)
      const performanceEntries = await page.evaluate(() => {
        const entries = performance.getEntriesByType('navigation');
        return entries.map((entry) => ({
          name: entry.name,
          duration: entry.duration,
          type: entry.entryType,
        }));
      });
      await testInfo.attach('network-navigation-logs', {
        body: JSON.stringify(performanceEntries, null, 2),
        contentType: 'application/json',
      });

      console.log('📎 Diagnostics attached to test report');
      console.log(`\nTest failed: Expected 100 unique articles, but only ${collected.length} were reachable`);

      // Fail the test with clear message
      expect(collected.length, `Expected 100 unique articles to be reachable, but only found ${collected.length}. Check attached diagnostics for details.`).toBe(100);
    } else {
      console.log(`✓ Successfully collected 100 unique article IDs`);
      console.log(`\nTest completed successfully!`);
      expect(collected.length).toBe(100);
    }
  });
});
