// Global state
let benchmarkData = [];
let trendChart = null;

// Export state for other modules
window.benchmarkState = {
    get data() { return benchmarkData; },
    set data(value) { benchmarkData = value; },
    get chart() { return trendChart; },
    set chart(value) { trendChart = value; }
};
