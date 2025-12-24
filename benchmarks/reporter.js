#!/usr/bin/env node

/**
 * Benchmark Results Reporter
 *
 * Reads benchmark result files and generates formatted reports
 */

const fs = require('fs');
const path = require('path');

const { calculateStats, formatMs } = require('./utils');

function findLatestResults(benchmarkName) {
  const resultsDir = path.join(__dirname, 'results');

  if (!fs.existsSync(resultsDir)) {
    console.error('No results directory found. Run benchmarks first.');
    return null;
  }

  const files = fs.readdirSync(resultsDir)
    .filter(f => f.startsWith(benchmarkName) && f.endsWith('.json'))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.error(`No results found for benchmark: ${benchmarkName}`);
    return null;
  }

  const latestFile = path.join(resultsDir, files[0]);
  return JSON.parse(fs.readFileSync(latestFile, 'utf8'));
}

function findAllResults(benchmarkName) {
  const resultsDir = path.join(__dirname, 'results');

  if (!fs.existsSync(resultsDir)) {
    return [];
  }

  const files = fs.readdirSync(resultsDir)
    .filter(f => f.startsWith(benchmarkName) && f.endsWith('.json'))
    .sort();

  return files.map(file => {
    const filepath = path.join(resultsDir, file);
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  });
}

function printResultsSummary(data) {
  console.log('\n' + '='.repeat(60));
  console.log('BENCHMARK RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`\nTimestamp: ${new Date(data.timestamp).toLocaleString()}`);
  console.log('\n' + '-'.repeat(60));

  for (const [testName, summary] of Object.entries(data.summary)) {
    console.log(`\n${testName}:`);
    console.log(`  Count:   ${summary.count}`);
    console.log(`  Average: ${formatMs(summary.mean)}`);
    console.log(`  Median:  ${formatMs(summary.median)}`);
    console.log(`  Min:     ${formatMs(summary.min)}`);
    console.log(`  Max:     ${formatMs(summary.max)}`);
    console.log(`  P95:     ${formatMs(summary.p95)}`);
    console.log(`  P99:     ${formatMs(summary.p99)}`);
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

function printDetailedResults(data) {
  console.log('\n' + '='.repeat(60));
  console.log('DETAILED BENCHMARK RESULTS');
  console.log('='.repeat(60));
  console.log(`\nTimestamp: ${new Date(data.timestamp).toLocaleString()}`);

  for (const [testName, runs] of Object.entries(data.results)) {
    console.log('\n' + '-'.repeat(60));
    console.log(`\nTest: ${testName}`);
    console.log(`Runs: ${runs.length}\n`);

    runs.forEach((run, idx) => {
      console.log(`  Run ${idx + 1}:`);
      if (run.duration !== undefined) {
        console.log(`    Duration: ${formatMs(run.duration)}`);
      }
      if (run.perfMetrics) {
        console.log(`    First Paint: ${formatMs(run.perfMetrics.firstPaint)}`);
        console.log(`    First Contentful Paint: ${formatMs(run.perfMetrics.firstContentfulPaint)}`);
        console.log(`    DOM Interactive: ${formatMs(run.perfMetrics.domInteractive)}`);
      }
      if (run.marks && run.marks.length > 0) {
        console.log(`    Marks:`);
        run.marks.forEach(mark => {
          console.log(`      ${mark.label}: ${formatMs(mark.time)}`);
        });
      }
    });
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

function compareBenchmarks(benchmarkName) {
  const allResults = findAllResults(benchmarkName);

  if (allResults.length < 2) {
    console.log('\nNot enough benchmark runs to compare. Need at least 2 runs.');
    return;
  }

  console.log('\n' + '='.repeat(60));
  console.log('BENCHMARK COMPARISON');
  console.log('='.repeat(60));
  console.log(`\nComparing ${allResults.length} benchmark runs:\n`);

  // Get all test names from the first result
  const firstResult = allResults[0];
  const testNames = Object.keys(firstResult.summary);

  for (const testName of testNames) {
    console.log(`\n${testName}:`);
    console.log('  Run Date              | Mean      | Median    | Min       | Max');
    console.log('  ' + '-'.repeat(70));

    allResults.forEach(result => {
      const summary = result.summary[testName];
      if (summary) {
        const date = new Date(result.timestamp).toLocaleDateString();
        const time = new Date(result.timestamp).toLocaleTimeString();
        console.log(
          `  ${date} ${time} | ${formatMs(summary.mean).padEnd(9)} | ${formatMs(summary.median).padEnd(9)} | ${formatMs(summary.min).padEnd(9)} | ${formatMs(summary.max)}`
        );
      }
    });
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

// CLI interface
const args = process.argv.slice(2);
const command = args[0] || 'summary';
const benchmarkType = args[1] || 'page-load-benchmark';

switch (command) {
  case 'summary':
    const summaryData = findLatestResults(benchmarkType);
    if (summaryData) {
      printResultsSummary(summaryData);
    }
    break;

  case 'detailed':
    const detailedData = findLatestResults(benchmarkType);
    if (detailedData) {
      printDetailedResults(detailedData);
    }
    break;

  case 'compare':
    compareBenchmarks(benchmarkType);
    break;

  case 'list':
    const resultsDir = path.join(__dirname, 'results');
    if (fs.existsSync(resultsDir)) {
      const files = fs.readdirSync(resultsDir).filter(f => f.endsWith('.json'));
      console.log('\nAvailable benchmark results:');
      files.forEach(file => {
        console.log(`  - ${file}`);
      });
      console.log();
    } else {
      console.log('\nNo results found. Run benchmarks first.\n');
    }
    break;

  default:
    console.log(`
Usage: node reporter.js [command] [benchmark-type]

Commands:
  summary   Show summary statistics (default)
  detailed  Show detailed run-by-run results
  compare   Compare results across multiple runs
  list      List all available benchmark results

Benchmark types:
  page-load-benchmark          Page loading benchmarks
  data-collection-benchmark    Data collection benchmarks

Examples:
  node reporter.js summary page-load-benchmark
  node reporter.js detailed data-collection-benchmark
  node reporter.js compare page-load-benchmark
  node reporter.js list
`);
}
