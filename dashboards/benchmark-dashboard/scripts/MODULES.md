# Dashboard Modules

The dashboard JavaScript has been refactored into smaller, focused modules for better maintainability.

## Module Structure

### Core Modules

1. **state.js** (302 bytes)
   - Manages global application state
   - Stores benchmark data and chart instances
   - Exports `window.benchmarkState` object

2. **utils.js** (457 bytes)
   - Shared utility functions
   - `formatBenchmarkName()` - Formats camelCase names to readable text
   - Exports `window.utils` object

### Feature Modules

3. **theme.js** (1.1 KB)
   - Dark/light mode management
   - Persists theme preference to localStorage
   - Auto-updates charts when theme changes
   - Exports `window.toggleTheme` function

4. **help.js** (9.1 KB)
   - Help modal and documentation
   - Markdown to HTML converter
   - Embedded README content
   - Exports `window.openHelp` and `window.closeHelp` functions

5. **data-loader.js** (1.7 KB)
   - File upload handling
   - Benchmark data parsing and sorting
   - File list management
   - Exports `window.dataLoader` object and `window.removeFile` function

6. **charts.js** (4.7 KB)
   - Performance trend chart creation
   - Chart.js configuration with theme awareness
   - Benchmark type selector population
   - Exports `window.chartUtils` object

7. **results.js** (1.2 KB)
   - Latest benchmark results display
   - Statistics card generation
   - Exports `window.resultsDisplay` object

8. **details-table.js** (3.9 KB)
   - Detailed results table with filtering
   - Filter dropdown management
   - Export `window.detailsTable` object and `window.clearDetailsFilters` function

9. **export.js** (1.2 KB)
   - Data export (JSON/CSV)
   - File download handling
   - Exports `window.exportToJSON` and `window.exportToCSV` functions

10. **ui-manager.js** (687 bytes)
    - Orchestrates UI updates across modules
    - Shows/hides sections based on data availability
    - Exports `window.uiManager` object

11. **script.js** (702 bytes)
    - Main entry point
    - Initialization and module loading documentation

## Load Order

Modules must be loaded in this specific order (already configured in index.html):

1. `state.js` - Required by all other modules
2. `utils.js` - Used by charts, tables, and results
3. `theme.js` - Independent, initializes on load
4. `help.js` - Independent
5. `data-loader.js` - Depends on state, utils, ui-manager
6. `charts.js` - Depends on state, utils
7. `results.js` - Depends on state, utils
8. `details-table.js` - Depends on state, utils
9. `export.js` - Depends on state
10. `ui-manager.js` - Depends on all display modules
11. `script.js` - Final initialization

## Benefits of Modularization

- **Maintainability**: Each module has a single, clear responsibility
- **Debuggability**: Easier to locate and fix issues
- **Testability**: Modules can be tested in isolation
- **Code Organization**: Related functions grouped together
- **File Size**: Smaller individual files are easier to navigate
- **Reusability**: Modules can be reused or swapped independently

## File Size Comparison

- **Before**: 1 file (748 lines, ~24 KB)
- **After**: 11 files (averaging 68 lines each, same total size but better organized)

## Backwards Compatibility

All functions are exported to the global `window` object, maintaining backwards compatibility with existing onclick handlers in the HTML.
