import { test, expect } from '@playwright/test';

interface ArticleData {
  id: string;
  title: string;
  domTimestamp: string | null;
  apiTimestamp: number | null;
  finalTimestamp: Date | null;
  position: number;
}

interface ApiResponse {
  id: number;
  time: number;
  title?: string;
  by?: string;
  [key: string]: any;
}

test.describe('HN API Fallback for Authoritative Timestamps', () => {
  test('should fallback to HN API when .age[title] coverage is insufficient', async ({ page }) => {
    const articles: ArticleData[] = [];
    const apiDiagnostics: { id: string; success: boolean; error?: string; time?: number }[] = [];
    let currentPage = 0;

    // Navigate to HN newest page
    await page.goto('https://news.ycombinator.com/newest');
    
    console.log('Starting collection of 100 articles with API fallback support...');

    // Collect 100 unique articles with pagination
    while (articles.length < 100) {
      // Get all article rows on current page
      const rows = page.locator('tr.athing');
      const count = await rows.count();
      
      console.log(`Page ${currentPage}: Found ${count} article rows`);

      for (let i = 0; i < count && articles.length < 100; i++) {
        const row = rows.nth(i);
        
        // Extract article ID
        const id = await row.getAttribute('id');
        if (!id) continue;

        // Check for duplicate
        if (articles.some(a => a.id === id)) {
          console.log(`  Skipping duplicate article ID: ${id}`);
          continue;
        }

        // Extract title
        const titleElem = row.locator('.titleline > a').first();
        const title = await titleElem.textContent() || 'Unknown';

        // Try to extract DOM timestamp from .age[title]
        const subtext = row.locator('xpath=following-sibling::tr[1]').locator('.subtext').first();
        let domTimestamp: string | null = null;
        
        try {
          const ageElem = subtext.locator('.age[title]');
          if (await ageElem.count() > 0) {
            domTimestamp = await ageElem.getAttribute('title');
          }
        } catch (error) {
          console.log(`  Article ${id}: No DOM timestamp found`);
        }

        articles.push({
          id,
          title,
          domTimestamp,
          apiTimestamp: null,
          finalTimestamp: null,
          position: articles.length + 1
        });

        console.log(`  [${articles.length}] ID: ${id}, Title: ${title.substring(0, 50)}..., DOM Timestamp: ${domTimestamp ? 'Found' : 'Missing'}`);
      }

      // Check if we need more articles
      if (articles.length < 100) {
        const moreLink = page.locator('a.morelink');
        if (await moreLink.count() > 0) {
          console.log(`Clicking 'More' to load next page...`);
          await moreLink.click();
          await page.waitForLoadState('networkidle');
          currentPage++;
        } else {
          console.log(`No more pages available. Collected ${articles.length} articles.`);
          break;
        }
      }
    }

    expect(articles.length).toBe(100);
    console.log(`\nSuccessfully collected ${articles.length} unique articles.`);

    // Calculate DOM timestamp coverage
    const articlesWithDomTimestamp = articles.filter(a => a.domTimestamp !== null);
    const domCoverage = (articlesWithDomTimestamp.length / articles.length) * 100;
    
    console.log(`\nDOM Timestamp Coverage: ${articlesWithDomTimestamp.length}/100 (${domCoverage.toFixed(1)}%)`);

    // Parse DOM timestamps
    for (const article of articles) {
      if (article.domTimestamp) {
        try {
          article.finalTimestamp = new Date(article.domTimestamp);
        } catch (error) {
          console.log(`  Failed to parse DOM timestamp for article ${article.id}: ${article.domTimestamp}`);
        }
      }
    }

    // Identify articles missing timestamps
    const articlesNeedingApiFallback = articles.filter(a => a.finalTimestamp === null);
    console.log(`\nArticles needing API fallback: ${articlesNeedingApiFallback.length}`);

    // Fetch missing timestamps from HN API
    if (articlesNeedingApiFallback.length > 0) {
      console.log('\nFetching timestamps from HN API...');
      
      for (const article of articlesNeedingApiFallback) {
        const apiUrl = `https://hacker-news.firebaseio.com/v0/item/${article.id}.json`;
        
        try {
          const response = await page.request.get(apiUrl);
          
          if (response.ok()) {
            const data: ApiResponse = await response.json();
            
            if (data.time) {
              article.apiTimestamp = data.time;
              article.finalTimestamp = new Date(data.time * 1000); // Convert epoch seconds to milliseconds
              
              apiDiagnostics.push({
                id: article.id,
                success: true,
                time: data.time
              });
              
              console.log(`  ✓ Article ${article.id}: Retrieved API timestamp ${data.time} (${article.finalTimestamp.toISOString()})`);
            } else {
              apiDiagnostics.push({
                id: article.id,
                success: false,
                error: 'No time field in API response'
              });
              console.log(`  ✗ Article ${article.id}: No time field in API response`);
            }
          } else {
            const error = `HTTP ${response.status()}`;
            apiDiagnostics.push({
              id: article.id,
              success: false,
              error
            });
            console.log(`  ✗ Article ${article.id}: ${error}`);
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          apiDiagnostics.push({
            id: article.id,
            success: false,
            error: errorMsg
          });
          console.log(`  ✗ Article ${article.id}: ${errorMsg}`);
        }
      }
    }

    // Calculate final timestamp coverage after API fallback
    const articlesWithFinalTimestamp = articles.filter(a => a.finalTimestamp !== null);
    const finalCoverage = (articlesWithFinalTimestamp.length / articles.length) * 100;
    
    console.log(`\n=== Coverage Summary ===`);
    console.log(`Initial DOM coverage: ${domCoverage.toFixed(1)}%`);
    console.log(`Final coverage (after API fallback): ${finalCoverage.toFixed(1)}%`);
    console.log(`API calls made: ${apiDiagnostics.length}`);
    console.log(`Successful API calls: ${apiDiagnostics.filter(d => d.success).length}`);
    console.log(`Failed API calls: ${apiDiagnostics.filter(d => !d.success).length}`);

    // Verify that API fallback increased coverage
    if (articlesNeedingApiFallback.length > 0) {
      const apiSuccessCount = apiDiagnostics.filter(d => d.success).length;
      expect(apiSuccessCount).toBeGreaterThan(0);
      console.log(`\n✓ API fallback successfully retrieved ${apiSuccessCount} timestamps`);
    }

    // Verify ordering with combined timestamp data
    console.log(`\n=== Verifying Timestamp Ordering ===`);
    const articlesWithTimestamps = articles.filter(a => a.finalTimestamp !== null);
    
    expect(articlesWithTimestamps.length).toBeGreaterThanOrEqual(70); // At least 70% coverage
    
    let orderingViolations = 0;
    const violations: { index: number; current: ArticleData; next: ArticleData }[] = [];

    for (let i = 0; i < articlesWithTimestamps.length - 1; i++) {
      const current = articlesWithTimestamps[i];
      const next = articlesWithTimestamps[i + 1];
      
      if (current.finalTimestamp! < next.finalTimestamp!) {
        orderingViolations++;
        violations.push({ index: i, current, next });
        
        console.log(`  ✗ Ordering violation at position ${i}→${i+1}:`);
        console.log(`    [${current.position}] ID ${current.id}: ${current.finalTimestamp!.toISOString()} (source: ${current.domTimestamp ? 'DOM' : 'API'})`);
        console.log(`    [${next.position}] ID ${next.id}: ${next.finalTimestamp!.toISOString()} (source: ${next.domTimestamp ? 'DOM' : 'API'})`);
      }
    }

    if (orderingViolations === 0) {
      console.log(`✓ All ${articlesWithTimestamps.length} articles are in correct order (newest → oldest)`);
    } else {
      console.log(`✗ Found ${orderingViolations} ordering violation(s)`);
    }

    // Attach diagnostics
    await test.info().attach('api-diagnostics', {
      body: JSON.stringify({
        totalArticles: articles.length,
        domCoverage: `${domCoverage.toFixed(1)}%`,
        finalCoverage: `${finalCoverage.toFixed(1)}%`,
        apiCalls: apiDiagnostics.length,
        successfulApiCalls: apiDiagnostics.filter(d => d.success).length,
        failedApiCalls: apiDiagnostics.filter(d => !d.success).length,
        orderingViolations,
        apiDiagnostics,
        violations: violations.map(v => ({
          position: `${v.current.position}→${v.next.position}`,
          currentId: v.current.id,
          currentTime: v.current.finalTimestamp?.toISOString(),
          currentSource: v.current.domTimestamp ? 'DOM' : 'API',
          nextId: v.next.id,
          nextTime: v.next.finalTimestamp?.toISOString(),
          nextSource: v.next.domTimestamp ? 'DOM' : 'API'
        }))
      }, 2),
      contentType: 'application/json'
    });

    await test.info().attach('collected-articles', {
      body: JSON.stringify(articles.map(a => ({
        position: a.position,
        id: a.id,
        title: a.title,
        domTimestamp: a.domTimestamp,
        apiTimestamp: a.apiTimestamp,
        finalTimestamp: a.finalTimestamp?.toISOString(),
        source: a.domTimestamp ? 'DOM' : (a.apiTimestamp ? 'API' : 'MISSING')
      })), 2),
      contentType: 'application/json'
    });

    // Final assertions
    expect(orderingViolations).toBe(0);
    expect(finalCoverage).toBeGreaterThanOrEqual(70); // At least 70% timestamp coverage
  });

  test('should handle API rate limiting and failures gracefully', async ({ page }) => {
    await page.goto('https://news.ycombinator.com/newest');
    
    // Collect first 10 articles for faster test
    const articles: ArticleData[] = [];
    const rows = page.locator('tr.athing');
    const count = Math.min(await rows.count(), 10);

    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const id = await row.getAttribute('id');
      if (!id) continue;

      const titleElem = row.locator('.titleline > a').first();
      const title = await titleElem.textContent() || 'Unknown';

      articles.push({
        id,
        title,
        domTimestamp: null,
        apiTimestamp: null,
        finalTimestamp: null,
        position: i + 1
      });
    }

    console.log(`Testing API fallback with ${articles.length} articles (all missing DOM timestamps)`);

    // Test API fallback for all articles
    const apiResults = [];
    
    for (const article of articles) {
      const apiUrl = `https://hacker-news.firebaseio.com/v0/item/${article.id}.json`;
      
      try {
        const response = await page.request.get(apiUrl);
        const success = response.ok();
        
        apiResults.push({
          id: article.id,
          success,
          status: response.status()
        });

        if (success) {
          const data: ApiResponse = await response.json();
          console.log(`  ✓ Article ${article.id}: API returned time ${data.time}`);
        } else {
          console.log(`  ✗ Article ${article.id}: API returned status ${response.status()}`);
        }
      } catch (error) {
        apiResults.push({
          id: article.id,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        });
        console.log(`  ✗ Article ${article.id}: ${error}`);
      }
    }

    const successCount = apiResults.filter(r => r.success).length;
    console.log(`\nAPI Success Rate: ${successCount}/${articles.length} (${(successCount/articles.length*100).toFixed(1)}%)`);

    // Verify that API is accessible (at least some calls should succeed)
    expect(successCount).toBeGreaterThan(0);

    // Attach diagnostics
    await test.info().attach('api-reliability-test', {
      body: JSON.stringify({
        totalApiCalls: apiResults.length,
        successfulCalls: successCount,
        failedCalls: apiResults.length - successCount,
        successRate: `${(successCount/articles.length*100).toFixed(1)}%`,
        results: apiResults
      }, 2),
      contentType: 'application/json'
    });
  });
});
