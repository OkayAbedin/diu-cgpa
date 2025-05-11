/**
 * Helper functions for DIU CGPA
 */

class Helpers {
    /**
     * Show an element by removing the 'hidden' class
     * @param {HTMLElement} element - The element to show
     */
    static showElement(element) {
        if (element) {
            element.classList.remove('hidden');
        }
    }

    /**
     * Hide an element by adding the 'hidden' class
     * @param {HTMLElement} element - The element to hide
     */
    static hideElement(element) {
        if (element) {
            element.classList.add('hidden');
        }
    }    /**
     * Validate student ID format
     * @param {string} studentId - The student ID to validate
     * @returns {boolean} True if valid, false otherwise
     */
    static isValidStudentId(studentId) {
        // Validation removed as requested - any non-empty ID is valid now
        return studentId && studentId.trim() !== '';
    }

    /**
     * Format number to display with 2 decimal places
     * @param {number} number - The number to format
     * @returns {string} Formatted number string
     */
    static formatNumber(number) {
        return parseFloat(number).toFixed(2);
    }
}

// Export as global variable
window.Helpers = Helpers;