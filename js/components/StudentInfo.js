/**
 * StudentInfo Component for DIU CGPA
 * Displays student information in modern UI with circular CGPA display
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
        
        // Get CGPA from student info if available, otherwise it will be filled in later
        const cgpa = studentInfo.cgpa || '0.00';
        
        return `
            <div class="student-info-container">
                <div class="cgpa-display">
                    <div class="cgpa-circle">
                        <div class="cgpa-value">${cgpa}</div>
                    </div>
                </div>
                <div class="student-details">
                    <h2 class="student-name">${studentName}</h2>
                    <p class="student-id">${studentId}</p>
                </div>
                <div class="student-stats">
                    <div class="stat-item">
                        <div class="stat-value" id="total-semesters">-</div>
                        <div class="stat-label">Semesters</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${batch}</div>
                        <div class="stat-label">Batch</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" id="total-credits">-</div>
                        <div class="stat-label">Credits</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${department}</div>
                        <div class="stat-label">Department</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">FSIT</div>
                        <div class="stat-label">Faculty</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">DSC</div>
                        <div class="stat-label">Campus</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Update stats in the student info section
     * @param {number} semesters - Number of semesters
     * @param {number} credits - Total credits
     */
    static updateStats(semesters, credits) {
        const semestersElement = document.getElementById('total-semesters');
        const creditsElement = document.getElementById('total-credits');
        
        if (semestersElement) semestersElement.textContent = semesters;
        if (creditsElement) creditsElement.textContent = credits;
    }
}

// Export as global variable
window.StudentInfo = StudentInfo;