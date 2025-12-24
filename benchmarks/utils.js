/**
 * Benchmark utilities for performance testing
 */

class BenchmarkTimer {
  constructor(name) {
    this.name = name;
    this.startTime = null;
    this.endTime = null;
    this.marks = [];
  }

  start() {
    this.startTime = performance.now();
    return this;
  }

  mark(label) {
    if (!this.startTime) {
      throw new Error('Timer not started');
    }
    this.marks.push({
      label,
      time: performance.now() - this.startTime
    });
    return this;
  }

  end() {
    if (!this.startTime) {
      throw new Error('Timer not started');
    }
    this.endTime = performance.now();
    return this.duration();
  }

  duration() {
    if (!this.startTime || !this.endTime) {
      throw new Error('Timer not properly started/ended');
    }
    return this.endTime - this.startTime;
  }

  getReport() {
    return {
      name: this.name,
      duration: this.duration(),
      marks: this.marks,
      startTime: this.startTime,
      endTime: this.endTime
    };
  }
}

/**
 * Measure page performance metrics using Playwright
 */
async function measurePagePerformance(page) {
  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');

    return {
      // Navigation timing
      navigationStart: navigation?.startTime || 0,
      domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart || 0,
      loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart || 0,
      domInteractive: navigation?.domInteractive || 0,

      // Paint timing
      firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,

      // Resource timing
      transferSize: navigation?.transferSize || 0,
      encodedBodySize: navigation?.encodedBodySize || 0,
      decodedBodySize: navigation?.decodedBodySize || 0,
    };
  });

  return metrics;
}

/**
 * Calculate statistics from an array of numbers
 */
function calculateStats(values) {
  if (values.length === 0) {
    return { min: 0, max: 0, mean: 0, median: 0, p95: 0, p99: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, val) => acc + val, 0);

  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    mean: sum / sorted.length,
    median: sorted[Math.floor(sorted.length / 2)],
    p95: sorted[Math.floor(sorted.length * 0.95)],
    p99: sorted[Math.floor(sorted.length * 0.99)],
    count: sorted.length
  };
}

/**
 * Format milliseconds to human-readable string
 */
function formatMs(ms) {
  if (ms === null || ms === undefined || !isFinite(ms)) {
    return 'N/A';
  }
  if (ms < 1000) {
    return `${ms.toFixed(2)}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Save benchmark results to file
 */
async function saveBenchmarkResults(results, filename) {
  const fs = require('fs');
  const path = require('path');

  const resultsDir = path.join(__dirname, 'results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filepath = path.join(resultsDir, `${filename}-${timestamp}.json`);

  const output = {
    timestamp: new Date().toISOString(),
    results,
    summary: generateSummary(results)
  };

  fs.writeFileSync(filepath, JSON.stringify(output, null, 2));

  return filepath;
}

/**
 * Generate summary statistics from benchmark results
 */
function generateSummary(results) {
  const summary = {};

  for (const [key, runs] of Object.entries(results)) {
    if (Array.isArray(runs)) {
      const durations = runs.map(r => r.duration || r);
      summary[key] = calculateStats(durations);
    }
  }

  return summary;
}

module.exports = {
  BenchmarkTimer,
  measurePagePerformance,
  calculateStats,
  formatMs,
  saveBenchmarkResults,
  generateSummary
};
