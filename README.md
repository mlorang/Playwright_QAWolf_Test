# 🐺 QA Wolf Take Home Assignment

## Project Overview

A comprehensive Playwright-based testing solution for Hacker News that goes beyond basic validation to provide production-ready test automation, performance monitoring, and data visualization.

**Technology Stack:** JavaScript/TypeScript, Playwright, Node.js

**Key Highlights:**

- ✅ Complete solution for validating article sorting on HN/newest
- 🧪 9 comprehensive test specs covering edge cases and failure scenarios
- 📊 Performance benchmarking system with statistical analysis
- 📈 Interactive dashboard for visualizing benchmark trends
- 🚀 Production-ready code with robust error handling

### Quick Start

```bash
# Install dependencies
npm install

# Run the main validation script
node index.js

# Run the full test suite
npx playwright test

# View test results
npx playwright show-report

# Run performance benchmarks
npm run bench

# View benchmark results
open benchmark-dashboard/index.html
```

### What's Included

#### ✅ Core Assignment (Question 1)

- **`index.js`** - Validates that the first 100 articles on HN/newest are sorted from newest to oldest
- Handles edge cases: missing timestamps, malformed data, dynamic content changes
- Robust error handling and clear output

#### 🧪 Comprehensive Test Suite

Beyond the basic requirement, I built a full test suite covering:

- **Sorting validation** - First 100 articles chronological order
- **Pagination continuity** - Articles flow correctly across pages
- **API fallback testing** - Graceful degradation when DOM parsing fails
- **Edge cases** - Missing timestamps, malformed data, dynamic inserts
- **Site reachability** - Basic smoke tests

**Test Results:** All tests passing with batched execution for optimal performance

#### 📊 Performance Benchmarking System

A complete benchmarking infrastructure to track performance over time:

- **Page load metrics** - Track loading performance for /newest and /news
- **Data collection benchmarks** - Measure article extraction and pagination performance
- **Statistical analysis** - Calculate mean, median, min, max, P95, P99 for all metrics
- **JSON export** - Results saved with timestamps for trend analysis

#### 📈 Interactive Benchmark Dashboard

A professional visualization tool for analyzing benchmark results:

- **Performance trends** - Interactive line charts showing metrics over time
- **Latest results** - Card-based view of most recent benchmark run
- **Detailed table** - Complete tabular view with filtering by benchmark type and date
- **Dark mode** - Theme toggle for comfortable viewing
- **Data export** - Export results as JSON or CSV for further analysis
- **Help documentation** - Built-in guide accessible via help button

### Project Structure

```
qa_wolf_take_home/
├── index.js                       # Main validation script (Question 1)
├── tests/                         # Playwright test suite (9 specs)
│   ├── hn-first-100-order.spec.ts       # Core sorting validation
│   ├── hn-pagination-continuity.spec.ts # Cross-page ordering
│   ├── hn-api-fallback.spec.ts          # API-based validation
│   ├── hn-missing-timestamps.spec.ts    # Missing data handling
│   ├── hn-malformed-timestamps.spec.ts  # Invalid data handling
│   ├── hn-dynamic-inserts.spec.ts       # Dynamic content changes
│   ├── hn-api-first-100-order.spec.ts   # API ordering validation
│   ├── hn-reachability.spec.ts          # Smoke tests
│   └── seed.spec.ts                     # Test setup
├── benchmarks/                    # Performance benchmarking system
│   ├── hn-benchmarks.spec.ts      # Benchmark test suite
│   ├── reporter.js                # CLI reporting tool
│   ├── results/                   # JSON benchmark results
│   └── README.md                  # Benchmarking documentation
├── benchmark-dashboard/           # Interactive visualization UI
│   ├── index.html                 # Dashboard interface
│   ├── styles.css                 # Styling and themes
│   ├── scripts/                   # Dashboard logic
│   └── DASHBOARD_README.md        # Dashboard guide
├── playwright.config.js           # Main test configuration
├── playwright.bench.config.js     # Benchmark configuration
└── package.json                   # Dependencies and npm scripts
```

### Key Features

**Reliability:**

- Handles missing/malformed timestamps gracefully
- Tests for both DOM-based and API-based data collection
- Validates pagination continuity across page boundaries
- Comprehensive error handling

**Performance:**

- Batched test execution for faster runs
- Benchmark suite tracks performance trends
- Optimized for local development workflow

**User Experience:**

- Clear, actionable error messages
- Interactive dashboard with filtering and dark mode
- Comprehensive documentation
- Easy-to-use npm scripts

### Design Decisions

1. **Why both `index.js` and test suite?** - [index.js](index.js) provides a simple, standalone script as requested. The test suite adds comprehensive coverage and integrates with CI/CD workflows.

2. **Why benchmarking?** - Performance monitoring helps catch regressions early and validates that optimization efforts are effective.

3. **Why a dashboard?** - Manual JSON inspection doesn't scale. The [interactive dashboard](benchmark-dashboard/index.html) makes it easy to spot trends, regressions, and compare runs over time.

4. **Why the extra edge case tests?** - Real-world testing requires handling unexpected scenarios. These tests ensure the solution is production-ready.

### Technical Approach

**Core Implementation ([index.js](index.js)):**

- DOM-based timestamp extraction from article metadata
- Chronological validation across first 100 articles
- Clear console output with pass/fail status
- Graceful error handling for missing/malformed data

**Test Suite ([tests/](tests/)):**

- Modular test specs for different scenarios
- Batched execution for optimal performance
- Both UI and API-based validation approaches
- Comprehensive edge case coverage

**Benchmarking System ([benchmarks/](benchmarks/)):**

- Statistical analysis (mean, median, P95, P99)
- Timestamped JSON results for trend tracking
- CLI reporter with multiple output formats
- Separate configuration for benchmark runs

**Visualization ([benchmark-dashboard/](benchmark-dashboard/)):**

- Vanilla JavaScript, HTML, CSS (no framework dependencies)
- Responsive design with dark/light themes
- Interactive charts using Chart.js
- Export capabilities for further analysis

### What Makes This Solution Stand Out

**Beyond the Requirements:**
This submission doesn't just validate the first 100 articles—it demonstrates how I would approach building a production-ready testing solution:

- **Comprehensive Coverage**: 9 test specs covering happy paths, edge cases, and failure scenarios
- **Performance Monitoring**: Built-in benchmarking to track and optimize test execution
- **Developer Experience**: Interactive dashboard for analyzing trends and debugging issues
- **Production-Ready**: Robust error handling, clear documentation, and maintainable code structure
- **Extensibility**: Modular design makes it easy to add new tests or benchmarks

**Real-World Application:**
The patterns used here (modular test design, performance tracking, visualization tools) are directly applicable to scaling test automation in production environments—exactly what QA Wolf customers need.

---

## Original Assignment Instructions

This assignment has two questions as outlined below. When you are done, upload your assignment to our [application page](https://www.task-wolf.com/apply-qae):

### Question 1

In this assignment, you will create a script on [Hacker News](https://news.ycombinator.com/) using JavaScript and Microsoft's [Playwright](https://playwright.dev/) framework.

1. Install node modules by running `npm i`.

2. Edit the `index.js` file in this project to go to [Hacker News/newest](https://news.ycombinator.com/newest) and validate that EXACTLY the first 100 articles are sorted from newest to oldest. You can run your script with the `node index.js` command.

Note that you are welcome to update Playwright or install other packages as you see fit, however you must utilize Playwright in this assignment.

### Question 2

Why do you want to work at QA Wolf? Please record a short, ~2 min video using [Loom](https://www.loom.com/) that includes:

1. Your answer

2. A walk-through demonstration of your code, showing a successful execution

The answer and walkthrough should be combined into _one_ video, and must be recorded using Loom as the submission page only accepts Loom links.

## Frequently Asked Questions

### What is your hiring process? When will I hear about next steps?

This take home assignment is the first step in our hiring process, followed by a final round interview if it goes well. **We review every take home assignment submission and promise to get back to you either way within two weeks (usually sooner).** The only caveat is if we are out of the office, in which case we will get back to you when we return. If it has been more than two weeks and you have not heard from us, please do follow up.

The final round interview is a 2-hour technical work session that reflects what it is like to work here. We provide a $150 stipend for your time for the final round interview regardless of how it goes. After that, there may be a short chat with our director about your experience and the role.

Our hiring process is rolling where we review candidates until we have filled our openings. If there are no openings left, we will keep your contact information on file and reach out when we are hiring again.

### Having trouble uploading your assignment?

Be sure to delete your `node_modules` file, then zip your assignment folder prior to upload.

### How do you decide who to hire?

We evaluate candidates based on three criteria:

- Technical ability (as demonstrated in the take home and final round)
- Customer service orientation (as this role is customer facing)
- Alignment with our mission and values (captured [here](https://qawolf.notion.site/Mission-and-Values-859c7d0411ba41349e1b318f4e7abc8f))

This means whether we hire you is based on how you do during our interview process, not on your previous experience (or lack thereof). Note that you will also need to pass a background check to work here as our customers require this.

### How can I help my application stand out?

While the assignment has clear requirements, we encourage applicants to treat it as more than a checklist. If you're genuinely excited about QA Wolf, consider going a step further—whether that means building a simple user interface, adding detailed error handling or reporting, improving the structure of the script, or anything else that showcases your unique perspective.

There's no "right" answer—we're curious to see what you choose to do when given freedom and ambiguity. In a world where tools can help generate working code quickly and make it easier than ever to complete technical take-homes, we value originality and intentionality. If that resonates with you, use this assignment as a chance to show us how you think.

Applicants who approach the assignment as a creative challenge, not just a checklist, tend to perform best in our process.
