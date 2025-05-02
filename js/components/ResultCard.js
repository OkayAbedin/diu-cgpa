/**
 * ResultCard Component for DIU CGPA Calculator
 * Displays a single semester's results in GitHub-style UI
 */

class ResultCard {
    /**
     * Render a single semester result card
     * @param {Object} semester - Semester data object
     * @param {number} index - Index for unique ID generation
     * @param {boolean} forceOpen - Flag to force the card to be open
     * @returns {string} HTML string for a semester result card
     */
    static render(semester, index, forceOpen = false) {
        if (!semester || !semester.courses || semester.courses.length === 0) {
            return '';
        }
        
        // Use the correct property names (cgpa instead of gpa if available)
        const name = semester.name;
        const gpa = semester.cgpa || semester.gpa; // Try cgpa first, then fall back to gpa
        const totalCredits = semester.totalCredit || semester.totalCredits; // Try totalCredit first
        const courses = semester.courses;
        
        // Generate unique IDs
        const cardId = `semester-${index}`;
        const headerId = `semester-header-${index}`;
        const collapseId = `semester-collapse-${index}`;
        
        // Add open class if forceOpen is true
        const openClass = forceOpen ? 'open' : '';
        
        return `
            <div class="gh-result-card ${openClass}" id="${cardId}">
                <div class="gh-result-card-header" id="${headerId}">
                    <div class="gh-result-title">${name}</div>
                    <div class="gh-result-stats">
                        <span class="gh-badge gh-badge-primary">GPA: ${gpa}</span>
                        <span class="gh-badge gh-badge-secondary">Credits: ${totalCredits}</span>
                    </div>
                </div>
                <div class="gh-result-card-body" id="${collapseId}">
                    <table class="gh-table">
                        <thead>
                            <tr>
                                <th>Course Code</th>
                                <th>Course Title</th>
                                <th>Credits</th>
                                <th>Grade</th>
                                <th>Points</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.renderCourseRows(courses)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    /**
     * Render table rows for courses
     * @param {Array} courses - Array of course objects
     * @returns {string} HTML string for course rows
     */
    static renderCourseRows(courses) {
        if (!courses || courses.length === 0) {
            return '<tr><td colspan="5">No courses found.</td></tr>';
        }
        
        return courses.map(course => {
            // Use the exact property names from the API response
            const code = course.customCourseId || '-';
            const title = course.courseName || course.courseTitle || 'Unknown Course';
            const credit = course.totalCredit || 0;
            const grade = course.gradeLetter || '-';
            const points = course.pointEquivalent || 0;
            
            // Determine grade class for color coding
            const gradeClass = this.getGradeClass(points); // Use points for the grade class
            
            return `
                <tr>
                    <td>${code}</td>
                    <td>${title}</td>
                    <td>${credit}</td>
                    <td class="${gradeClass}">${grade}</td>
                    <td>${points}</td>
                </tr>
            `;
        }).join('');
    }
    
    /**
     * Get CSS class for grade coloring
     * @param {string|number} grade - Grade value
     * @returns {string} CSS class name
     */
    static getGradeClass(grade) {
        const numGrade = parseFloat(grade);
        
        if (numGrade >= 3.75) return 'grade-a-plus';
        if (numGrade >= 3.50) return 'grade-a';
        if (numGrade >= 3.25) return 'grade-a-minus';
        if (numGrade >= 3.00) return 'grade-b-plus';
        if (numGrade >= 2.75) return 'grade-b';
        if (numGrade >= 2.50) return 'grade-b-minus';
        if (numGrade >= 2.25) return 'grade-c-plus';
        if (numGrade >= 2.00) return 'grade-c';
        if (numGrade > 0) return 'grade-d';
        return 'grade-f';
    }
    
    /**
     * Format grade for display
     * @param {string|number} grade - Grade value
     * @returns {string} Formatted grade with letter equivalent
     */
    static formatGrade(grade) {
        const numGrade = parseFloat(grade);
        
        if (numGrade === 4.00) return 'A+ (4.00)';
        if (numGrade === 3.75) return 'A (3.75)';
        if (numGrade === 3.50) return 'A- (3.50)';
        if (numGrade === 3.25) return 'B+ (3.25)';
        if (numGrade === 3.00) return 'B (3.00)';
        if (numGrade === 2.75) return 'B- (2.75)';
        if (numGrade === 2.50) return 'C+ (2.50)';
        if (numGrade === 2.25) return 'C (2.25)';
        if (numGrade === 2.00) return 'D (2.00)';
        if (numGrade === 0.00) return 'F (0.00)';
        
        return grade;
    }
}

// Export as global variable
window.ResultCard = ResultCard;