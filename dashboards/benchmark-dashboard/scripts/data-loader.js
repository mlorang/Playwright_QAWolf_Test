// Benchmark files handler
document.getElementById('benchmark-files').addEventListener('change', function(e) {
    const files = Array.from(e.target.files);

    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const data = JSON.parse(event.target.result);
                data.filename = file.name;
                window.benchmarkState.data.push(data);
                window.benchmarkState.data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                window.uiManager.updateUI();
            } catch (error) {
                alert('Error parsing file ' + file.name + ': ' + error.message);
            }
        };
        reader.readAsText(file);
    });
});

function updateFileList() {
    const container = document.getElementById('loaded-files');
    const benchmarkData = window.benchmarkState.data;

    if (benchmarkData.length === 0) {
        container.innerHTML = '<p style="color: #666; font-size: 14px;">No files loaded yet</p>';
        return;
    }

    container.innerHTML = benchmarkData.map((data, index) => `
        <div class="file-item">
            <span>${data.filename} - ${new Date(data.timestamp).toLocaleString()}</span>
            <span class="remove-btn" onclick="removeFile(${index})" title="Remove file">×</span>
        </div>
    `).join('');
}

function removeFile(index) {
    window.benchmarkState.data.splice(index, 1);
    window.uiManager.updateUI();
    if (window.benchmarkState.chart) {
        window.chartUtils.updateTrendChart();
    }
}

// Export functions for global access
window.removeFile = removeFile;
window.dataLoader = {
    updateFileList
};
