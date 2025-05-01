/**
 * SemesterList Component for DIU CGPA Calculator
 * Displays a list of semester results in GitHub-style UI
 */

class SemesterList {
    /**
     * Render the complete semester list
     * @param {Array} semesterData - Array of semester data objects
     * @returns {string} HTML string for semester list
     */
    static render(semesterData) {
        if (!semesterData || !Array.isArray(semesterData) || semesterData.length === 0) {
            return '<div class="gh-alert">No semester data available.</div>';
        }
        
        // Create a SemesterIterator instance
        const semesterIterator = new SemesterIterator(semesterData);
        
        // Sort semesters by year and term (most recent first)
        const sortedSemesters = [...semesterData].sort((a, b) => {
            // Sort by year (descending)
            if (a.year !== b.year) {
                return b.year - a.year;
            }
            // Then by term (descending)
            return b.term - a.term;
        });
        
        // Create a new iterator with the sorted data
        const sortedIterator = new SemesterIterator(sortedSemesters);
        
        // Build semester cards using the iterator
        let semesterCards = '';
        let index = 0;
        
        while (sortedIterator.hasNext()) {
            const semester = sortedIterator.next();
            semesterCards += ResultCard.render(semester, index++);
        }
        
        // Calculate summary data
        const totalCredits = semesterIterator.getTotalCredits();
        const averageCGPA = semesterIterator.getAverageCGPA().toFixed(2);
        
        return `
            <div class="gh-semester-list">
                <h3 class="gh-section-title">Semester Results</h3>
                <div class="gh-semester-summary">
                    <div class="gh-meta-item"><i class="fas fa-graduation-cap"></i> Total Credits: ${totalCredits}</div>
                    <div class="gh-meta-item"><i class="fas fa-calculator"></i> Average CGPA: ${averageCGPA}</div>
                </div>
                ${semesterCards}
            </div>
        `;
    }
}

// Add additional CSS for GitHub-style student info
document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `
        .gh-student-info {
            display: flex;
            flex-direction: column;
            margin-bottom: var(--spacing-lg);
        }
        
        .gh-student-header {
            display: flex;
            align-items: center;
            gap: var(--spacing-lg);
        }
        
        .gh-student-avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background-color: var(--color-box-header);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            color: var(--color-text-secondary);
        }
        
        .gh-student-details {
            flex: 1;
        }
        
        .gh-student-details h3 {
            margin: 0 0 var(--spacing-sm);
            font-size: var(--font-size-large);
            font-weight: 600;
        }
        
        .gh-student-meta {
            display: flex;
            flex-wrap: wrap;
            gap: var(--spacing-md);
            color: var(--color-text-secondary);
        }
        
        .gh-meta-item {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);
            font-size: var(--font-size-small);
        }
        
        .gh-meta-status {
            margin-left: auto;
        }
        
        .gh-section-title {
            font-size: var(--font-size-medium);
            font-weight: 600;
            margin-bottom: var(--spacing-md);
            padding-bottom: var(--spacing-sm);
            border-bottom: 1px solid var(--color-border);
        }
        
        /* Additional badge styles */
        .gh-badge-success {
            background-color: #dcffe4;
            color: var(--color-success);
        }
        
        .gh-badge-danger {
            background-color: var(--color-alert-error-bg);
            color: var(--color-btn-danger-bg);
        }
    `;
    document.head.appendChild(style);
});

// Export as global variable
window.SemesterList = SemesterList;