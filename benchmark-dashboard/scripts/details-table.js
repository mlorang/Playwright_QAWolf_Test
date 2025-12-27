// Detailed results table
function displayDetailsTable() {
    const benchmarkData = window.benchmarkState.data;
    if (benchmarkData.length === 0) return;

    // Populate filter dropdowns
    populateDetailsFilters();

    // Get filter values
    const benchmarkFilter = document.getElementById('details-benchmark-filter')?.value || '';
    const fileFilter = document.getElementById('details-file-filter')?.value || '';

    const container = document.getElementById('details-table-container');
    let html = '<table><thead><tr><th>Timestamp</th><th>Benchmark</th><th>Mean</th><th>Median</th><th>Min</th><th>Max</th><th>P95</th><th>P99</th><th>Count</th></tr></thead><tbody>';

    let hasResults = false;

    benchmarkData.forEach((data, dataIndex) => {
        // Apply file filter
        if (fileFilter && dataIndex.toString() !== fileFilter) {
            return;
        }

        for (const [benchmarkName, stats] of Object.entries(data.summary)) {
            // Apply benchmark filter
            if (benchmarkFilter && benchmarkName !== benchmarkFilter) {
                continue;
            }

            hasResults = true;
            html += `
                <tr>
                    <td>${new Date(data.timestamp).toLocaleString()}</td>
                    <td>${window.utils.formatBenchmarkName(benchmarkName)}</td>
                    <td>${stats.mean.toFixed(2)}ms</td>
                    <td>${stats.median.toFixed(2)}ms</td>
                    <td>${stats.min.toFixed(2)}ms</td>
                    <td>${stats.max.toFixed(2)}ms</td>
                    <td>${stats.p95.toFixed(2)}ms</td>
                    <td>${stats.p99.toFixed(2)}ms</td>
                    <td>${stats.count}</td>
                </tr>
            `;
        }
    });

    if (!hasResults) {
        html += '<tr><td colspan="9" style="text-align: center; padding: 20px; color: var(--text-secondary);">No results match the selected filters</td></tr>';
    }

    html += '</tbody></table>';
    container.innerHTML = html;
}

function populateDetailsFilters() {
    const benchmarkData = window.benchmarkState.data;

    // Populate benchmark type filter
    const benchmarkFilterSelect = document.getElementById('details-benchmark-filter');
    const currentBenchmarkFilter = benchmarkFilterSelect?.value || '';

    const benchmarkTypes = new Set();
    benchmarkData.forEach(data => {
        Object.keys(data.summary).forEach(type => benchmarkTypes.add(type));
    });

    if (benchmarkFilterSelect) {
        benchmarkFilterSelect.innerHTML = '<option value="">All Benchmarks</option>' +
            Array.from(benchmarkTypes).sort().map(type =>
                `<option value="${type}" ${type === currentBenchmarkFilter ? 'selected' : ''}>${window.utils.formatBenchmarkName(type)}</option>`
            ).join('');

        // Add change handler
        benchmarkFilterSelect.onchange = displayDetailsTable;
    }

    // Populate file filter
    const fileFilterSelect = document.getElementById('details-file-filter');
    const currentFileFilter = fileFilterSelect?.value || '';

    if (fileFilterSelect) {
        fileFilterSelect.innerHTML = '<option value="">All Files</option>' +
            benchmarkData.map((data, index) =>
                `<option value="${index}" ${index.toString() === currentFileFilter ? 'selected' : ''}>${data.filename || new Date(data.timestamp).toLocaleString()}</option>`
            ).join('');

        // Add change handler
        fileFilterSelect.onchange = displayDetailsTable;
    }
}

function clearDetailsFilters() {
    const benchmarkFilter = document.getElementById('details-benchmark-filter');
    const fileFilter = document.getElementById('details-file-filter');

    if (benchmarkFilter) benchmarkFilter.value = '';
    if (fileFilter) fileFilter.value = '';

    displayDetailsTable();
}

// Export functions for global access
window.clearDetailsFilters = clearDetailsFilters;
window.detailsTable = {
    displayDetailsTable,
    populateDetailsFilters
};
