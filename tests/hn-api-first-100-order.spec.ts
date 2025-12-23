// spec: specs/indexjs-first-100-order.plan.md
// seed: tests/seed.spec.ts
// @ts-check


import { test, expect } from '@playwright/test';

test.describe('First 100 Hacker News /newest ordering', () => {
  test('Verify first 100 newest items are sorted newest→oldest using HN API fallback', async ({ page, request }) => {
    // Keep a visible page for sanity checks and debugging
    await page.goto('https://news.ycombinator.com/newest');

    // Helper to format an item for human-readable output
    const formatItem = (it: { id: number; time: number; title?: string }) => `${it.id} (${new Date(it.time * 1000).toISOString()})${it.title ? ' — ' + it.title : ''}`;

    // Step: fetch top 100 IDs
    let ids: number[] = [];
    await test.step('Fetch top 100 story IDs from HN API', async () => {
      const idsResp = await request.get('https://hacker-news.firebaseio.com/v0/newstories.json');
      expect(idsResp.ok(), `Failed to fetch newstories: ${idsResp.status()}`).toBeTruthy();
      const allIds = (await idsResp.json()) as number[];
      ids = allIds.slice(0, 100);
    });

    // Step: fetch item JSONs (title + time) in batches and collect
    const items: { id: number; time: number; title?: string }[] = [];
    await test.step('Fetch item JSONs (batch requests)', async () => {
      const batchSize = 20;
      for (let i = 0; i < ids.length; i += batchSize) {
        const batch = ids.slice(i, i + batchSize);
        const results = await Promise.all(batch.map(async (id) => {
          const r = await request.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
          if (!r.ok()) throw new Error(`Failed to fetch item ${id}: ${r.status()}`);
          const j = await r.json();
          return { id, time: j.time as number, title: j.title as string };
        }));
        items.push(...results);
      }
    });

    // Step: verify we have 100 items
    await test.step('Verify collected item count', async () => {
      const msg = `Expected 100 items but got ${items.length}. Sample items: ${items.slice(0, 8).map(formatItem).join(' | ')}`;
      expect(items.length, msg).toBe(100);
    });

    // Step: verify non-increasing order by epoch with human-readable diagnostics
    await test.step('Verify order newest → oldest', async () => {
      const violations: { index: number; a: { id: number; time: number; title?: string }; b: { id: number; time: number; title?: string } }[] = [];
      for (let i = 0; i < items.length - 1; i++) {
        const a = items[i];
        const b = items[i + 1];
        if (a.time < b.time) {
          violations.push({ index: i, a, b });
        }
      }

      if (violations.length > 0) {
        const human = violations.slice(0, 10).map(v => `${v.index}: ${formatItem(v.a)} < ${formatItem(v.b)}`);
        expect(violations, `Ordering violations detected (showing up to 10):\n${human.join('\n')}`).toHaveLength(0);
      }
    });

    // Step: Sanity check UI ordering for visible items with readable times
    await test.step('Sanity: UI contains top visible IDs in relative order', async () => {
      const visibleIds: number[] = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('tr.athing')).map(r => Number(r.getAttribute('id')));
      });
      const humanVisible = visibleIds.map((id, idx) => {
        const indexInTop = ids.indexOf(id);
        const it = items.find(x => x.id === id);
        const time = it ? new Date(it.time * 1000).toISOString() : 'n/a';
        return `${id} (pos ${indexInTop}) ${time}${it && it.title ? ' — ' + it.title : ''}`;
      });

      expect(visibleIds.length).toBeGreaterThan(0);
      for (let i = 0; i < visibleIds.length; i++) {
        const expectedIndex = ids.indexOf(visibleIds[i]);
        expect(expectedIndex, `UI id ${visibleIds[i]} not found in top 100 API list`).toBeGreaterThanOrEqual(0);
        if (i > 0) {
          const prevIndex = ids.indexOf(visibleIds[i - 1]);
          expect(prevIndex, 'previous visible ID not found in top 100 API list').toBeLessThan(expectedIndex);
        }
      }
    });
  });
});
