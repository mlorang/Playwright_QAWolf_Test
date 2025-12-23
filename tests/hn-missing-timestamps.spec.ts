// spec: specs/indexjs-first-100-order.plan.md
// seed: tests/seed.spec.ts
// Authoritative per-item timestamp harvest + coverage-based ordering assertion
// @ts-check

import { test, expect } from '@playwright/test';

// This test performs the authoritative per-item harvest described in the plan:
// - deterministically collect EXACT-100 ids by clicking visible "More"
// - top-level navigate to /item?id=<id> for each id (throttle ≈600ms, 1 retry)
// - extract `span.age[title]` as authoritative evidence; accept only matches to regex
// - compute coverage = authoritative_count / 100
//   - if coverage >= 0.70: parse epoch ints and assert non-increasing ordering on parsed subset
//   - if coverage < 0.70: mark INCONCLUSIVE (fail the test with an explanatory message) and attach compact diagnostics

test.describe('HN authoritative missing timestamps — harvest and coverage', () => {
  test('Authoritative per-item harvest for first 100 ids (coverage-based)', async ({ page }, testInfo) => {
    // allow ample time for 100 navigations with throttling
    test.setTimeout(180000);

    // 1. Deterministic collector: same approach as hn-pagination-continuity.spec.ts
    await page.goto('https://news.ycombinator.com/newest');

    const collected: string[] = [];
    const seen = new Set<string>();

    const appendUnseen = (ids: string[]) => {
      for (const id of ids) {
        if (!seen.has(id)) {
          seen.add(id);
          collected.push(id);
          if (collected.length >= 100) return;
        }
      }
    };

    let exhaustionAttempts = 0;
    while (collected.length < 100) {
      const pageIds = await page.locator('tr.athing').evaluateAll((els) => els.map((el) => (el as HTMLElement).getAttribute('id') || ''));
      appendUnseen(pageIds);
      if (collected.length >= 100) break;

      const more = page.getByRole('link', { name: 'More', exact: true });
      if (!(await more.isVisible())) break;

      const prevFirst = await page.locator('tr.athing').first().getAttribute('id');
      await more.click();
      await expect(page.locator('tr.athing').first()).not.toHaveAttribute('id', prevFirst || '');

      const newPageIds = await page.locator('tr.athing').evaluateAll((els) => els.map((el) => (el as HTMLElement).getAttribute('id') || ''));
      const newlyAdded = newPageIds.some((id) => !pageIds.includes(id));
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

    // ensure we have exactly 100 ids (deterministic collector requirement)
    expect(collected.length, `expected 100 unique ids, got ${collected.length}`).toBe(100);
    await testInfo.attach('collected-ids', { body: JSON.stringify(collected, null, 2), contentType: 'application/json' });

    // 2. Authoritative harvest loop
    const authoritative: Array<{
      id: string;
      title: string | null;
      text: string | null;
      epochMs: number | null;
      outer: string | null;
      error?: string;
    }> = [];

    const titleRe = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\s+\d{10}$/;

    for (const id of collected) {
      let attempt = 0;
      let success = false;
      let info = { id, title: null as string | null, text: null as string | null, epochMs: null as number | null, outer: null as string | null, error: undefined as string | undefined };
      while (attempt < 2 && !success) {
        try {
          await page.goto(`https://news.ycombinator.com/item?id=${id}`, { waitUntil: 'domcontentloaded' });
          // extract span.age if present
          const res = await page.evaluate(() => {
            const el = document.querySelector('span.age');
            if (!el) return null;
            return { title: el.getAttribute('title'), text: (el.textContent || '').trim(), outer: el.outerHTML };
          });
          if (res) {
            info.title = res.title;
            info.text = res.text;
            info.outer = res.outer;
            if (res.title && titleRe.test(res.title)) {
              const parts = res.title.split(/\s+/);
              const epochSec = Number(parts[1]);
              if (Number.isFinite(epochSec) && epochSec > 0) {
                info.epochMs = epochSec * 1000;
              }
            }
          } else {
            info.error = 'span.age missing';
          }
          success = true;
        } catch (err: any) {
          // transient navigation error; retry once
          info.error = String(err?.message || err);
          attempt += 1;
          if (attempt < 2) {
            await page.waitForTimeout(600);
          }
        }
      }

      authoritative.push(info);
      // throttle between navigations (≈600ms)
      await page.waitForTimeout(600);
    }

    await testInfo.attach('authoritative-harvest', { body: JSON.stringify(authoritative, null, 2), contentType: 'application/json' });

    // 3. Coverage and diagnostics sampling
    const authoritativeCount = authoritative.filter(a => a.title && a.epochMs !== null).length;
    const coverage = authoritativeCount / 100;

    // collect up to 10 diagnostic outerHTMLs for missing/unparsable items
    const missing = authoritative.filter(a => !(a.title && a.epochMs !== null));
    const diagSamples = missing.slice(0, 10).map((a) => ({ id: a.id, title: a.title, outer: a.outer, error: a.error }));
    await testInfo.attach('diagnostic-samples', { body: JSON.stringify(diagSamples, null, 2), contentType: 'application/json' });

    // attach coverage summary
    await testInfo.attach('coverage-summary', { body: JSON.stringify({ authoritativeCount, coverage }, null, 2), contentType: 'application/json' });

    // 4. Branch on coverage
    if (coverage >= 0.7) {
      // build ordered parsed epochs for the collected ids in listing order
      const parsed = authoritative
        .map((a, idx) => ({ idx, id: a.id, epochMs: a.epochMs }))
        .filter((p) => p.epochMs !== null) as Array<{ idx: number; id: string; epochMs: number }>;

      // Assert non-increasing order across the parsed subset
      for (let i = 0; i < parsed.length - 1; i++) {
        const left = parsed[i].epochMs;
        const right = parsed[i + 1].epochMs;
        expect(left, `Order violation at parsed index ${i} (collected idx ${parsed[i].idx} id=${parsed[i].id})`).toBeGreaterThanOrEqual(right);
      }
    } else {
      // Insufficient authoritative coverage → INCONCLUSIVE
      await testInfo.attach('inconclusive', { body: JSON.stringify({ authoritativeCount, coverage, note: 'coverage < 0.70' }, null, 2), contentType: 'application/json' });
      // fail the test to indicate inconclusive result with context
      expect(coverage, `INCONCLUSIVE: authoritative coverage (${(coverage * 100).toFixed(1)}%) < 70%`).toBeGreaterThanOrEqual(0.7);
    }
  });
});
