const { chromium } = require("playwright");

async function sortHackerNewsArticles() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
     // ======================
    // ARRANGE
    // ======================
    // Go to Hacker News newest page
    await page.goto("https://news.ycombinator.com/newest");
    await page.waitForSelector(".athing");

    let timestamps = [];

    // ======================
    // ACT
    // ======================
    while (timestamps.length < 100) {
      // Grab timestamps from the current page
      const pageTimestamps = await page.$$eval(
        ".age",
        elements => elements.map(el => el.getAttribute("title"))
      );

      timestamps.push(...pageTimestamps);

      // Stop if we already have 100
      if (timestamps.length >= 100) break;

      // Click "More" to load older articles
      await Promise.all([
        page.click("a.morelink"),
        page.waitForLoadState("networkidle")
      ]);
    }

    // Trim to EXACTLY 100
    timestamps = timestamps.slice(0, 100);

    // Convert timestamps to Date objects
    const dates = timestamps.map(ts => new Date(ts));

    // ======================
    // ASSERT
    // ======================
    // Explicit count assertion
    if (dates.length !== 100) {
      throw new Error(`Expected 100 articles, got ${dates.length}`);
    }

    // Validate sorting: newest → oldest
    for (let i = 0; i < dates.length - 1; i++) {
      if (dates[i] < dates[i + 1]) {
        throw new Error(
          `❌ Ordering error at index ${i}:
           ${dates[i].toISOString()} < ${dates[i + 1].toISOString()}`
        );
      }
    }

    console.log("✅ SUCCESS: The first 100 articles are sorted from newest to oldest");
  } catch (error) {
    // Capture failure context
    await page.screenshot({ path: "failure.png", fullPage: true });
    console.error("❌ Test failed:", error.message);
    throw error;
  } finally {
    // Always clean up
    await browser.close();
  }
}

(async () => {
  await sortHackerNewsArticles();
})();
