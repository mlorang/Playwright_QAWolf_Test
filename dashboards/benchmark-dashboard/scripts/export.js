// Data export functions
function exportToJSON() {
    const benchmarkData = window.benchmarkState.data;
    const blob = new Blob([JSON.stringify(benchmarkData, null, 2)], { type: 'application/json' });
    downloadFile(blob, `benchmark-export-${new Date().toISOString()}.json`);
}

function exportToCSV() {
    const benchmarkData = window.benchmarkState.data;
    let csv = 'Timestamp,Benchmark,Mean,Median,Min,Max,P95,P99,Count\n';

    benchmarkData.forEach(data => {
        for (const [benchmarkName, stats] of Object.entries(data.summary)) {
            csv += `${data.timestamp},${benchmarkName},${stats.mean},${stats.median},${stats.min},${stats.max},${stats.p95},${stats.p99},${stats.count}\n`;
        }
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    downloadFile(blob, `benchmark-export-${new Date().toISOString()}.csv`);
}

function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Export functions for global access
window.exportToJSON = exportToJSON;
window.exportToCSV = exportToCSV;
