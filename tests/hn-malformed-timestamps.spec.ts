import { test, expect } from '@playwright/test';

test.describe('HN Malformed Timestamps — Parsing Resilience', () => {
  test('should handle malformed timestamps gracefully without crashing', async ({ page }) => {
    // Navigate to HN newest page
    await page.goto('https://news.ycombinator.com/newest');

    // Collect and parse timestamps with robust error handling
    const results = await page.evaluate(() => {
      const results = {
        articles: [],
        parseErrors: [],
        summary: {}
      };

      // Function to parse timestamps robustly
      function parseTimestamp(timestampStr: string | null, articleId: string, articleTitle: string) {
        const parseResult = {
          articleId,
          articleTitle,
          originalTimestamp: timestampStr,
          parsedDate: null as string | null,
          parseMethod: null as string | null,
          error: null as string | null
        };

        try {
          // Method 1: Try ISO date parsing (first part before space)
          if (timestampStr && typeof timestampStr === 'string') {
            const parts = timestampStr.trim().split(/\s+/);
            
            // Try ISO format (first part)
            if (parts[0]) {
              const isoDate = new Date(parts[0]);
              if (!isNaN(isoDate.getTime())) {
                parseResult.parsedDate = isoDate.toISOString();
                parseResult.parseMethod = 'ISO';
                return parseResult;
              }
            }

            // Method 2: Try 10-digit epoch seconds (second part)
            if (parts[1]) {
              const epochMatch = parts[1].match(/^(\d{10})$/);
              if (epochMatch) {
                const epochSeconds = parseInt(epochMatch[1], 10);
                const epochDate = new Date(epochSeconds * 1000);
                if (!isNaN(epochDate.getTime())) {
                  parseResult.parsedDate = epochDate.toISOString();
                  parseResult.parseMethod = 'EPOCH';
                  return parseResult;
                }
              }
            }

            // Method 3: Try full string as Date
            const fallbackDate = new Date(timestampStr);
            if (!isNaN(fallbackDate.getTime())) {
              parseResult.parsedDate = fallbackDate.toISOString();
              parseResult.parseMethod = 'FALLBACK';
              return parseResult;
            }
          }

          // If we get here, parsing failed
          parseResult.error = 'All parsing methods failed';
        } catch (err) {
          parseResult.error = (err as Error).message;
        }

        return parseResult;
      }

      // Collect articles with timestamps
      const articleRows = document.querySelectorAll('tr.athing');
      
      articleRows.forEach(row => {
        const titleCell = row.querySelector('.titleline a');
        const articleId = row.getAttribute('id') || 'unknown';
        const articleTitle = titleCell ? titleCell.textContent || 'Unknown' : 'Unknown';
        
        // Get the next row which contains the timestamp
        const metaRow = row.nextElementSibling;
        if (metaRow) {
          const ageElement = metaRow.querySelector('.age');
          if (ageElement) {
            const timestampStr = ageElement.getAttribute('title');
            const parseResult = parseTimestamp(timestampStr, articleId, articleTitle);
            
            results.articles.push(parseResult);
            
            if (parseResult.error) {
              results.parseErrors.push({
                articleId,
                articleTitle,
                timestampStr,
                error: parseResult.error,
                domSnippet: ageElement.outerHTML
              });
            }
          } else {
            // No timestamp found
            results.parseErrors.push({
              articleId,
              articleTitle,
              timestampStr: null,
              error: 'No .age element found',
              domSnippet: metaRow.outerHTML.substring(0, 200)
            });
          }
        }
      });

      // Calculate summary
      results.summary = {
        totalArticles: results.articles.length,
        successfullyParsed: results.articles.filter((a: any) => a.parsedDate !== null).length,
        parseErrors: results.parseErrors.length,
        parseMethodBreakdown: {
          ISO: results.articles.filter((a: any) => a.parseMethod === 'ISO').length,
          EPOCH: results.articles.filter((a: any) => a.parseMethod === 'EPOCH').length,
          FALLBACK: results.articles.filter((a: any) => a.parseMethod === 'FALLBACK').length
        }
      };

      return results;
    });

    // Log parse errors as diagnostics
    if (results.parseErrors.length > 0) {
      console.log('\n=== PARSE ERRORS DETECTED ===');
      console.log(`Total parse errors: ${results.parseErrors.length}`);
      results.parseErrors.forEach((error: any, index: number) => {
        console.log(`\nError ${index + 1}:`);
        console.log(`  Article ID: ${error.articleId}`);
        console.log(`  Article Title: ${error.articleTitle}`);
        console.log(`  Timestamp String: ${error.timestampStr}`);
        console.log(`  Error: ${error.error}`);
        console.log(`  DOM Snippet: ${error.domSnippet}`);
      });
    }

    // Log summary
    console.log('\n=== TIMESTAMP PARSING SUMMARY ===');
    console.log(`Total articles: ${results.summary.totalArticles}`);
    console.log(`Successfully parsed: ${results.summary.successfullyParsed}`);
    console.log(`Parse errors: ${results.summary.parseErrors}`);
    console.log(`Parse method breakdown:`);
    console.log(`  ISO: ${results.summary.parseMethodBreakdown.ISO}`);
    console.log(`  EPOCH: ${results.summary.parseMethodBreakdown.EPOCH}`);
    console.log(`  FALLBACK: ${results.summary.parseMethodBreakdown.FALLBACK}`);

    // Assertions
    // 1. Test should not crash (if we get here, it didn't crash)
    expect(results).toBeDefined();
    
    // 2. Should have collected some articles
    expect(results.summary.totalArticles).toBeGreaterThan(0);
    
    // 3. Parse errors should be logged but not cause test failure
    // This assertion passes regardless of error count, demonstrating resilience
    expect(results.parseErrors).toBeDefined();
    
    // 4. At least some timestamps should parse successfully
    // (in production, most should parse, but we're testing resilience)
    expect(results.summary.successfullyParsed).toBeGreaterThan(0);
    
    // 5. Verify that each successfully parsed timestamp is valid
    const successfullyParsed = results.articles.filter(a => a.parsedDate !== null);
    for (const article of successfullyParsed) {
      expect(article.parsedDate).toBeTruthy();
      expect(article.parseMethod).toMatch(/^(ISO|EPOCH|FALLBACK)$/);
      // Verify the parsed date is actually valid
      const date = new Date(article.parsedDate);
      expect(date.getTime()).not.toBeNaN();
    }

    // 6. Log all articles for manual inspection (attach to test report)
    await test.info().attach('all-articles', {
      body: JSON.stringify(results.articles, null, 2),
      contentType: 'application/json'
    });

    // 7. Attach parse errors diagnostics if any exist
    if (results.parseErrors.length > 0) {
      await test.info().attach('parse-errors-diagnostics', {
        body: JSON.stringify(results.parseErrors, null, 2),
        contentType: 'application/json'
      });
    }
  });
});