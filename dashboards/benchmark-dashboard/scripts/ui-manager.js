// UI update orchestration
function updateUI() {
    window.dataLoader.updateFileList();
    window.resultsDisplay.displayLatestResults();
    window.chartUtils.populateBenchmarkSelector();
    window.detailsTable.displayDetailsTable();

    // Show sections
    if (window.benchmarkState.data.length > 0) {
        document.getElementById('latest-results-section').style.display = 'block';
        document.getElementById('comparison-section').style.display = 'block';
        document.getElementById('details-section').style.display = 'block';
        document.getElementById('export-section').style.display = 'block';
    }
}

// Export functions
window.uiManager = {
    updateUI
};
