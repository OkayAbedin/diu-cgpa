/**
 * StudentInfo Component for DIU CGPA Calculator
 * Displays student information in GitHub-style UI
 */

class StudentInfo {
    /**
     * Render student information section
     * @param {Object} studentInfo - Student information object
     * @returns {string} HTML string for student info
     */
    static render(studentInfo) {
        if (!studentInfo) {
            return '<p>No student information available.</p>';
        }
        
        // Support multiple possible property names from API
        const studentName = studentInfo.name || studentInfo.studentName || studentInfo.fullName || 'Unknown Student';
        const studentId = studentInfo.id || studentInfo.studentId || 'Unknown ID';
        const program = studentInfo.program || studentInfo.programName || studentInfo.course || 'Unknown Program';
        const department = studentInfo.department || studentInfo.departmentName || 'Unknown Department';
        const batch = studentInfo.batch || studentInfo.batchName || studentInfo.batchNo || 'Unknown Batch';
        const status = studentInfo.status || studentInfo.studentStatus || '';
        
        return `
            <div class="gh-student-info">
                <div class="gh-student-header">
                    <div class="gh-student-avatar">
                        <i class="fas fa-user-graduate"></i>
                    </div>
                    <div class="gh-student-details">
                        <h3>${studentName}</h3>
                        <div class="gh-student-meta">
                            <span class="gh-meta-item">
                                <i class="fas fa-id-card"></i> ${studentId}
                            </span>
                            <span class="gh-meta-item">
                                <i class="fas fa-graduation-cap"></i> ${program}
                            </span>
                            <span class="gh-meta-item">
                                <i class="fas fa-building"></i> ${department}
                            </span>
                            <span class="gh-meta-item">
                                <i class="fas fa-users"></i> ${batch}
                            </span>
                            ${this.renderStatus(status)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Render student status badge
     * @param {string} status - Student status
     * @returns {string} HTML string for status badge
     */
    static renderStatus(status) {
        if (!status) return '';
        
        let badgeClass = 'gh-badge';
        let icon = 'fa-info-circle';
        
        switch (status.toLowerCase()) {
            case 'active':
                badgeClass += ' gh-badge-primary';
                icon = 'fa-check-circle';
                break;
            case 'graduated':
                badgeClass += ' gh-badge-success';
                icon = 'fa-graduation-cap';
                break;
            case 'inactive':
                badgeClass += ' gh-badge-danger';
                icon = 'fa-exclamation-circle';
                break;
            default:
                badgeClass += ' gh-badge-secondary';
        }
        
        return `
            <span class="gh-meta-item gh-meta-status">
                <span class="${badgeClass}">
                    <i class="fas ${icon}"></i> ${status}
                </span>
            </span>
        `;
    }
}

// Export as global variable
window.StudentInfo = StudentInfo;