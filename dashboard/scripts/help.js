// Help modal functions
function openHelp() {
    const modal = document.getElementById('help-modal');
    const helpContent = document.getElementById('help-content');

    // README content embedded directly to avoid CORS issues with file:// protocol
    const markdown = `# Benchmark Dashboard

A web-based dashboard for viewing and analyzing Playwright benchmark performance results.

> **Note:** For test results, use Playwright's built-in test reporter: \`npx playwright show-report\`

## Quick Start

1. **Open the dashboard:**
   \`\`\`bash
   open dashboard/index.html
   \`\`\`
   Or simply double-click \`dashboard/index.html\` in your file browser.

2. **Load benchmark data:**
   - Click "Select Benchmark JSON Files" button
   - Navigate to \`benchmarks/results/\`
   - Select one or more JSON files (you can select multiple with Cmd/Ctrl+Click)
   - Files are automatically sorted by timestamp

## Features

### 1. Latest Benchmark Results
- Displays statistics from the most recent benchmark run
- Shows mean, min, max, median, and P95 for each benchmark type
- Organized in an easy-to-read card layout

### 2. Performance Trends
- **Interactive line charts** showing performance over time
- Select different benchmark types from the dropdown
- Visualizes:
  - Mean (blue solid line)
  - Min (green dashed line)
  - Max (red dashed line)
  - P95 (yellow dotted line)
  - Median (gray solid line)
- Helps identify performance regressions or improvements

### 3. Detailed Results Table
- Complete tabular view of all loaded benchmark runs
- Sortable by clicking column headers
- Shows all statistical metrics for each benchmark

### 4. Data Export
- **Export as JSON**: Complete benchmark data export
- **Export as CSV**: Tabular format for analysis in Excel, Google Sheets, etc.
- Files are named with timestamp for easy organization

## Usage Tips

### Comparing Multiple Runs

To track performance trends:

1. Load multiple benchmark files from different dates
2. Select a benchmark type from the dropdown (e.g., "Newest Page Load")
3. View the line chart to see how performance changed over time
4. Look for trends:
   - **Upward trend**: Performance degradation (slower)
   - **Downward trend**: Performance improvement (faster)
   - **Flat line**: Stable performance
   - **High variance** (distance between min/max): Inconsistent results

### Understanding the Charts

- **Mean**: Average performance across all iterations
- **Median**: Middle value (less affected by outliers)
- **Min/Max**: Best and worst case performance
- **P95**: 95% of requests were faster than this value (useful for SLA targets)
- **P99**: 99% of requests were faster than this value

### File Management

- Files are listed with timestamps after loading
- Click the **×** button next to any file to remove it
- Charts and tables update automatically when files are added/removed

## Data Structure

The dashboard expects benchmark JSON files with this structure:

\`\`\`json
{
  "timestamp": "2025-12-27T00:38:36.308Z",
  "results": {
    "benchmarkType": [
      {
        "iteration": 1,
        "duration": 439.42,
        "perfMetrics": { ... }
      }
    ]
  },
  "summary": {
    "benchmarkType": {
      "min": 430.65,
      "max": 443.84,
      "mean": 436.79,
      "median": 437.42,
      "p95": 443.84,
      "p99": 443.84,
      "count": 5
    }
  }
}
\`\`\`

## Benchmark Types

The dashboard automatically detects these benchmark types from your data:

### Page Load Benchmarks
- **Newest Page Load**: \`/newest\` page load time
- **News Page Load**: Front page (\`/news\`) load time
- **Paint Timing**: First Contentful Paint metrics

### Data Collection Benchmarks
- **Collect 30 Articles**: Time to collect 30 articles with pagination
- **Single Page Extraction**: DOM extraction performance
- **Pagination**: Time to navigate to next page

## Troubleshooting

### Charts not displaying
- Make sure you've selected a benchmark type from the dropdown
- Verify that you've loaded at least one benchmark file
- Check browser console for errors (F12)

### Files not loading
- Ensure JSON files are valid (not corrupted)
- Check that files follow the expected structure
- Only \`.json\` files are accepted

### Performance issues
- Loading many large files may slow down the browser
- Consider loading only recent benchmarks for analysis
- Use export feature to archive old data

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari

Note: Requires JavaScript to be enabled.

## Integration with npm Scripts

You can use this dashboard alongside your existing benchmark workflow:

\`\`\`bash
# Run benchmarks
npm run bench

# Open dashboard to view results
open dashboard.html
# Then load files from benchmarks/results/

# Or run specific benchmarks
npm run bench:page-load
npm run bench:data-collection

# View in dashboard for trend analysis
\`\`\`

## Advanced Usage

### Automating Data Loading

For frequent analysis, you can:

1. Keep the dashboard open in a browser tab (\`dashboard/index.html\`)
2. Run benchmarks with \`npm run bench\`
3. Click "Select Benchmark JSON Files" and reload the new results
4. Charts update automatically

### Export for CI/CD

Export benchmark data as CSV or JSON for:
- Tracking in spreadsheets
- Importing into monitoring tools
- Historical performance analysis
- Sharing with team members
- Integration with performance monitoring systems

### Performance Baseline

Use the dashboard to:
1. Establish performance baselines (median values)
2. Set P95/P99 targets for SLAs
3. Detect regressions by comparing trends
4. Identify which changes caused performance changes

## File Structure

Dashboard directory: \`dashboard/\`
- \`index.html\` - Main HTML file
- \`styles.css\` - Stylesheet with light/dark theme
- \`script.js\` - JavaScript logic for data loading, charts, and theme switching

Related directories:
- Benchmark results: \`benchmarks/results/\`

For test results, use:
\`\`\`bash
npx playwright test
npx playwright show-report
\`\`\`

## Support

For issues or questions:
1. Check that JSON files are valid
2. Verify file structure matches expected format
3. Check browser console for errors
4. Ensure you're using a modern browser

---

**Enjoy analyzing your benchmarks!**
`;

    // Convert markdown to HTML
    const html = convertMarkdownToHTML(markdown);
    helpContent.innerHTML = html;
    modal.classList.add('show');
}

function closeHelp() {
    const modal = document.getElementById('help-modal');
    modal.classList.remove('show');
}

// Basic markdown to HTML converter
function convertMarkdownToHTML(markdown) {
    let html = markdown;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

    // Lists
    const lines = html.split('\n');
    let inList = false;
    let inOrderedList = false;
    let processedLines = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Unordered list
        if (line.match(/^- /)) {
            if (!inList) {
                processedLines.push('<ul>');
                inList = true;
            }
            processedLines.push('<li>' + line.substring(2) + '</li>');
        }
        // Ordered list
        else if (line.match(/^\d+\. /)) {
            if (!inOrderedList) {
                processedLines.push('<ol>');
                inOrderedList = true;
            }
            processedLines.push('<li>' + line.substring(line.indexOf('. ') + 2) + '</li>');
        }
        else {
            if (inList) {
                processedLines.push('</ul>');
                inList = false;
            }
            if (inOrderedList) {
                processedLines.push('</ol>');
                inOrderedList = false;
            }
            processedLines.push(line);
        }
    }

    if (inList) processedLines.push('</ul>');
    if (inOrderedList) processedLines.push('</ol>');

    html = processedLines.join('\n');

    // Paragraphs
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';

    // Clean up empty paragraphs and fix structure
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>(<h[1-3]>)/g, '$1');
    html = html.replace(/(<\/h[1-3]>)<\/p>/g, '$1');
    html = html.replace(/<p>(<ul>)/g, '$1');
    html = html.replace(/(<\/ul>)<\/p>/g, '$1');
    html = html.replace(/<p>(<ol>)/g, '$1');
    html = html.replace(/(<\/ol>)<\/p>/g, '$1');
    html = html.replace(/<p>(<pre>)/g, '$1');
    html = html.replace(/(<\/pre>)<\/p>/g, '$1');
    html = html.replace(/<p>(<blockquote>)/g, '$1');
    html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');

    return html;
}

// Export functions for global access
window.openHelp = openHelp;
window.closeHelp = closeHelp;
