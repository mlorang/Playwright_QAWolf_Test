// Utility functions
function formatBenchmarkName(name) {
    return name
        // Add space before capital letters
        .replace(/([A-Z])/g, ' $1')
        // Remove space between numbers and letters (e.g., "30 Articles" -> "30Articles")
        .replace(/(\d)\s+([A-Z])/g, '$1 $2')
        // Capitalize first letter
        .replace(/^./, str => str.toUpperCase())
        .trim();
}

// Export functions
window.utils = {
    formatBenchmarkName
};
