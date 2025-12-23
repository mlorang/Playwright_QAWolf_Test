// spec: specs/indexjs-first-100-order.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Hacker News /newest — First 100 ordering', () => {
  test('Happy path — first 100 are sorted newest→oldest', async ({ page }, testInfo) => {
    // 1. Open a fresh browser context and navigate to `https://news.ycombinator.com/newest`.
    await page.goto('https://news.ycombinator.com/newest');

    const collected: Array<{id: string; title: string; ts: string | null; outer: string}> = [];
    const seen = new Set<string>();

    // Helper: extract visible ts from the current page for each tr.athing
    const extractPageItems = async () => {
      return await page.locator('tr.athing').evaluateAll((rows) => {
        return rows.map((row) => {
          const id = row.getAttribute('id') || '';
          const titleEl = row.querySelector('a');
          const title = titleEl ? (titleEl.textContent || '').trim() : '';
          const next = row.nextElementSibling as HTMLElement | null;
          let tsEl: Element | null = null;
          if (next) {
            tsEl = next.querySelector('.age[title], a[title], span[title]');
          }
          const ts = tsEl ? tsEl.getAttribute('title') : null;
          return { id, title, ts, outer: tsEl ? tsEl.outerHTML : (next ? (next.outerHTML || '').slice(0, 300) : '') };
        });
      });
    };

    // 2. Repeatedly collect visible timestamps from `.age[title]` for `tr.athing` rows in page order, then click the visible `More` link, wait for the listing to change, and continue until EXACTLY 100 timestamps are collected or `More` disappears.
    let exhaustionAttempts = 0;
    while (collected.length < 100) {
      const pageItems = await extractPageItems();
      for (const it of pageItems) {
        if (!seen.has(it.id)) {
          seen.add(it.id);
          collected.push(it);
        }
        if (collected.length >= 100) break;
      }
      if (collected.length >= 100) break;

      const more = page.getByRole('link', { name: 'More', exact: true });
      if (!(await more.isVisible())) break;

      const prevFirst = await page.locator('tr.athing').first().getAttribute('id');
      await Promise.all([
        page.waitForLoadState('domcontentloaded'),
        more.click()
      ]);
      await expect(page.locator('tr.athing').first()).not.toHaveAttribute('id', prevFirst || '');

      // detect if this More click brought nothing new (page exhaustion scenario)
      const newPageIds = await page.locator('tr.athing').evaluateAll((els) => els.map((el) => (el as HTMLElement).getAttribute('id') || ''));
      const newlyAdded = newPageIds.some((id) => !pageItems.map(p => p.id).includes(id));
      if (!newlyAdded) {
        exhaustionAttempts += 1;
        if (exhaustionAttempts >= 3) {
          await testInfo.attach('last-page-html', { body: await page.content(), contentType: 'text/html' });
          await testInfo.attach('last-visible-ids', { body: JSON.stringify(newPageIds.slice(0, 30), null, 2), contentType: 'application/json' });
          break;
        }
      } else {
        exhaustionAttempts = 0;
      }
    }

    // 3. Trim the collected timestamps to 100 entries and convert each to a Date object.
    const first100 = collected.slice(0, 100);
    await testInfo.attach('collected-first-100', { body: JSON.stringify(first100, null, 2), contentType: 'application/json' });

    // Ensure we have 100 items and each has an authoritative `.age[title]` value
    const missingTs = first100.filter(it => !it.ts);
    if (missingTs.length) {
      await testInfo.attach('missing-timestamps', { body: JSON.stringify(missingTs, null, 2), contentType: 'application/json' });
      await testInfo.attach('page-html', { body: await page.content(), contentType: 'text/html' });
      expect(missingTs.length, `Expected 100 timestamps from .age[title], but ${missingTs.length} were missing`).toBe(0);
    }

    const dates = first100.map((it) => {
      const iso = it.ts!.split(/\s+/)[0];
      const d = new Date(iso);
      return { id: it.id, ts: it.ts, epoch: d.getTime(), iso };
    });

    const unparsable = dates.filter(d => !isFinite(d.epoch));
    if (unparsable.length) {
      await testInfo.attach('unparsable-timestamps', { body: JSON.stringify(unparsable, null, 2), contentType: 'application/json' });
      await testInfo.attach('page-html', { body: await page.content(), contentType: 'text/html' });
      expect(unparsable.length, `Found unparsable timestamps`).toBe(0);
    }

    // 4. Assert that for every i: Date[i] >= Date[i+1] (non-increasing order newest→oldest).
    for (let i = 0; i < dates.length - 1; i++) {
      const left = dates[i].epoch;
      const right = dates[i + 1].epoch;
      expect(left, `Order violation at index ${i}: id=${dates[i].id} (${dates[i].ts}) < id=${dates[i+1].id} (${dates[i+1].ts})`).toBeGreaterThanOrEqual(right);
    }
  });
});
