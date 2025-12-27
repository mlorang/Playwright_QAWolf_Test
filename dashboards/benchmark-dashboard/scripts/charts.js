// Chart utilities
function updateTrendChart() {
    const benchmarkType = document.getElementById('benchmark-type-select').value;
    const benchmarkData = window.benchmarkState.data;

    if (!benchmarkType || benchmarkData.length === 0) return;

    const ctx = document.getElementById('trend-chart').getContext('2d');

    // Prepare data
    const labels = benchmarkData.map(d => new Date(d.timestamp).toLocaleDateString());
    const datasets = [];

    // Mean line
    datasets.push({
        label: 'Mean',
        data: benchmarkData.map(d => d.summary[benchmarkType]?.mean || null),
        borderColor: '#007bff',
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4
    });

    // Min/Max area
    datasets.push({
        label: 'Min',
        data: benchmarkData.map(d => d.summary[benchmarkType]?.min || null),
        borderColor: '#28a745',
        backgroundColor: 'rgba(40, 167, 69, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
        tension: 0.4
    });

    datasets.push({
        label: 'Max',
        data: benchmarkData.map(d => d.summary[benchmarkType]?.max || null),
        borderColor: '#dc3545',
        backgroundColor: 'rgba(220, 53, 69, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
        tension: 0.4
    });

    // P95
    datasets.push({
        label: 'P95',
        data: benchmarkData.map(d => d.summary[benchmarkType]?.p95 || null),
        borderColor: '#ffc107',
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        borderWidth: 2,
        borderDash: [2, 2],
        fill: false,
        tension: 0.4
    });

    // Median
    datasets.push({
        label: 'Median',
        data: benchmarkData.map(d => d.summary[benchmarkType]?.median || null),
        borderColor: '#6c757d',
        backgroundColor: 'rgba(108, 117, 125, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4
    });

    if (window.benchmarkState.chart) {
        window.benchmarkState.chart.destroy();
    }

    // Get theme-aware colors
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#e0e0e0' : '#333';
    const gridColor = isDark ? '#444' : '#e0e0e0';

    window.benchmarkState.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `${window.utils.formatBenchmarkName(benchmarkType)} - Performance Trends`,
                    font: { size: 16 },
                    color: textColor
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Duration (ms)',
                        color: textColor
                    },
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        color: gridColor
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date',
                        color: textColor
                    },
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        color: gridColor
                    }
                }
            }
        }
    });
}

function populateBenchmarkSelector() {
    const benchmarkData = window.benchmarkState.data;
    if (benchmarkData.length === 0) return;

    const select = document.getElementById('benchmark-type-select');
    const benchmarkTypes = new Set();

    benchmarkData.forEach(data => {
        Object.keys(data.summary).forEach(type => benchmarkTypes.add(type));
    });

    select.innerHTML = '<option value="">-- Select a benchmark --</option>' +
        Array.from(benchmarkTypes).map(type =>
            `<option value="${type}">${window.utils.formatBenchmarkName(type)}</option>`
        ).join('');

    select.onchange = function() {
        if (this.value) {
            updateTrendChart();
        }
    };
}

// Export functions
window.chartUtils = {
    updateTrendChart,
    populateBenchmarkSelector
};
