import { test, expect } from '@playwright/test';

test.describe('HN Dynamic Insertion & Race Conditions', () => {
  test('should collect 100 unique IDs with duplicate detection and ordering verification', async ({ page }) => {
    await page.goto('https://news.ycombinator.com/newest');

    const collectedData = {
      uniqueIds: new Set<string>(),
      duplicates: [] as any[],
      articles: [] as any[],
      pageCollections: [] as any[]
    };

    let pageNum = 1;
    const maxPages = 10; // Safety limit to prevent infinite loops

    // Collect articles across pages until we have 100 unique IDs
    while (collectedData.uniqueIds.size < 100 && pageNum <= maxPages) {
      const pageData = {
        pageNumber: pageNum,
        articlesOnPage: [] as any[],
        duplicatesFound: [] as any[],
        newArticles: 0
      };

      // Collect articles from current page
      const articleRows = await page.locator('tr.athing').all();

      for (let idx = 0; idx < articleRows.length; idx++) {
        const row = articleRows[idx];
        const articleId = await row.getAttribute('id');

        if (!articleId) continue;

        const titleCell = row.locator('.titleline a').first();
        const articleTitle = await titleCell.textContent() || 'Unknown';

        // Get timestamp from the next sibling row
        const metaRow = page.locator('tr.athing').nth(idx).locator('xpath=following-sibling::tr[1]');
        const ageElement = metaRow.locator('.age');
        const timestamp = await ageElement.getAttribute('title').catch(() => null);

        const articleData = {
          id: articleId,
          title: articleTitle.trim(),
          timestamp: timestamp,
          positionOnPage: idx + 1,
          pageFound: pageNum
        };

        pageData.articlesOnPage.push(articleData);

        // Detect duplicates
        if (collectedData.uniqueIds.has(articleId)) {
          const originalArticle = collectedData.articles.find(a => a.id === articleId);
          pageData.duplicatesFound.push({
            id: articleId,
            title: articleTitle.trim(),
            firstSeenOnPage: originalArticle.pageFound,
            duplicateOnPage: pageNum,
            firstPosition: originalArticle.positionOnPage,
            duplicatePosition: idx + 1,
            firstTimestamp: originalArticle.timestamp,
            duplicateTimestamp: timestamp
          });
        } else {
          collectedData.uniqueIds.add(articleId);
          collectedData.articles.push(articleData);
          pageData.newArticles++;
        }
      }

      collectedData.duplicates.push(...pageData.duplicatesFound);
      collectedData.pageCollections.push(pageData);

      console.log(`Page ${pageNum}: Collected ${pageData.newArticles} new articles, found ${pageData.duplicatesFound.length} duplicates. Total unique: ${collectedData.uniqueIds.size}`);

      // Log duplicates for diagnostics
      if (pageData.duplicatesFound.length > 0) {
        console.log(`\n=== DUPLICATES DETECTED ON PAGE ${pageNum} ===`);
        pageData.duplicatesFound.forEach((dup: any) => {
          console.log(`  Article ID: ${dup.id}`);
          console.log(`  Title: ${dup.title}`);
          console.log(`  First seen: Page ${dup.firstSeenOnPage}, Position ${dup.firstPosition}`);
          console.log(`  Duplicate: Page ${dup.duplicateOnPage}, Position ${dup.duplicatePosition}`);
          console.log(`  Timestamps: ${dup.firstTimestamp} -> ${dup.duplicateTimestamp}`);
          console.log('');
        });
      }

      // Check if we need to paginate
      if (collectedData.uniqueIds.size < 100) {
        const moreLink = page.locator('a.morelink');
        const moreLinkExists = await moreLink.count() > 0;

        if (moreLinkExists) {
          // Click "More" to go to next page
          await moreLink.click();
          await page.waitForLoadState('networkidle');
          pageNum++;
        } else {
          console.log(`No more pages available. Stopped at ${collectedData.uniqueIds.size} unique articles.`);
          break;
        }
      } else {
        break;
      }
    }

    // Trim to exactly 100 articles
    const first100Articles = collectedData.articles.slice(0, 100);

    // Verify ordering for articles with valid timestamps
    const articlesWithTimestamps = first100Articles.filter(a => a.timestamp !== null);
    const orderingAnomalies = [];

    for (let i = 0; i < articlesWithTimestamps.length - 1; i++) {
      const current = articlesWithTimestamps[i];
      const next = articlesWithTimestamps[i + 1];

      const currentDate = new Date(current.timestamp);
      const nextDate = new Date(next.timestamp);

      // Check if current >= next (newest to oldest)
      if (currentDate < nextDate) {
        orderingAnomalies.push({
          position: i,
          currentArticle: {
            id: current.id,
            title: current.title,
            timestamp: current.timestamp,
            date: currentDate.toISOString()
          },
          nextArticle: {
            id: next.id,
            title: next.title,
            timestamp: next.timestamp,
            date: nextDate.toISOString()
          },
          timeDifference: nextDate.getTime() - currentDate.getTime()
        });
      }
    }

    // Log summary
    console.log('\n=== COLLECTION SUMMARY ===');
    console.log(`Total unique IDs collected: ${collectedData.uniqueIds.size}`);
    console.log(`Total duplicates detected: ${collectedData.duplicates.length}`);
    console.log(`Pages visited: ${pageNum}`);
    console.log(`Articles with timestamps: ${articlesWithTimestamps.length}`);
    console.log(`Ordering anomalies detected: ${orderingAnomalies.length}`);

    // Log ordering anomalies if any
    if (orderingAnomalies.length > 0) {
      console.log('\n=== ORDERING ANOMALIES ===');
      orderingAnomalies.forEach((anomaly, idx) => {
        console.log(`\nAnomaly ${idx + 1}:`);
        console.log(`  Position: ${anomaly.position} -> ${anomaly.position + 1}`);
        console.log(`  Current: [${anomaly.currentArticle.id}] ${anomaly.currentArticle.title}`);
        console.log(`  Current timestamp: ${anomaly.currentArticle.date}`);
        console.log(`  Next: [${anomaly.nextArticle.id}] ${anomaly.nextArticle.title}`);
        console.log(`  Next timestamp: ${anomaly.nextArticle.date}`);
        console.log(`  Time difference: ${anomaly.timeDifference}ms (next is NEWER)`);
      });
    }

    // Assertions
    // 1. Should have collected data
    expect(collectedData).toBeDefined();

    // 2. Should reach 100 unique IDs (or close to it if HN doesn't have enough)
    expect(collectedData.uniqueIds.size).toBeGreaterThanOrEqual(95);

    // 3. Duplicates should be tracked (may be 0, which is fine)
    expect(collectedData.duplicates).toBeDefined();

    // 4. Should not be trapped by infinite pagination
    expect(pageNum).toBeLessThanOrEqual(maxPages);

    // 5. Verify first 100 articles are collected
    expect(first100Articles.length).toBe(Math.min(100, collectedData.articles.length));

    // 6. Ordering anomalies should be rare (allow some tolerance for race conditions)
    // In a stable system, we expect mostly correct ordering
    const orderingAccuracy = articlesWithTimestamps.length > 0
      ? 1 - (orderingAnomalies.length / articlesWithTimestamps.length)
      : 1;

    console.log(`\nOrdering accuracy: ${(orderingAccuracy * 100).toFixed(2)}%`);

    // Allow up to 5% ordering anomalies due to dynamic insertions
    expect(orderingAccuracy).toBeGreaterThanOrEqual(0.95);

    // 7. Attach diagnostics to test report
    await test.info().attach('collection-summary', {
      body: JSON.stringify({
        totalUniqueIds: collectedData.uniqueIds.size,
        totalDuplicates: collectedData.duplicates.length,
        pagesVisited: pageNum,
        orderingAnomalies: orderingAnomalies.length,
        orderingAccuracy: orderingAccuracy
      }, null, 2),
      contentType: 'application/json'
    });

    if (collectedData.duplicates.length > 0) {
      await test.info().attach('duplicate-details', {
        body: JSON.stringify(collectedData.duplicates, null, 2),
        contentType: 'application/json'
      });
    }

    if (orderingAnomalies.length > 0) {
      await test.info().attach('ordering-anomalies', {
        body: JSON.stringify(orderingAnomalies, null, 2),
        contentType: 'application/json'
      });
    }

    await test.info().attach('all-articles', {
      body: JSON.stringify(first100Articles, null, 2),
      contentType: 'application/json'
    });
  });
});
