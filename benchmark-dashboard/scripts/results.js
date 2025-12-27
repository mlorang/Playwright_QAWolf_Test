// Latest results display
function displayLatestResults() {
    const benchmarkData = window.benchmarkState.data;
    if (benchmarkData.length === 0) return;

    const latest = benchmarkData[benchmarkData.length - 1];

    document.getElementById('latest-timestamp').innerHTML = `
        <p style="color: #666; font-size: 14px; margin-bottom: 15px;">
            Timestamp: ${new Date(latest.timestamp).toLocaleString()}
        </p>
    `;

    const statsContainer = document.getElementById('latest-stats');
    const summaries = latest.summary;

    let html = '';
    for (const [benchmarkName, stats] of Object.entries(summaries)) {
        html += `
            <div class="stat-card">
                <div class="stat-label">${window.utils.formatBenchmarkName(benchmarkName)}</div>
                <div class="stat-value">${stats.mean.toFixed(2)}ms</div>
                <div class="stat-sub">
                    Min: ${stats.min.toFixed(2)}ms | Max: ${stats.max.toFixed(2)}ms<br>
                    Median: ${stats.median.toFixed(2)}ms | P95: ${stats.p95.toFixed(2)}ms
                </div>
            </div>
        `;
    }
    statsContainer.innerHTML = html;
}

// Export functions
window.resultsDisplay = {
    displayLatestResults
};
