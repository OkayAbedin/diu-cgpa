/**
 * Calculator Service for DIU CGPA Calculator
 * Handles all GPA and CGPA calculations
 */

class CgpaCalculator {
    /**
     * Calculate semester GPA for a set of courses
     * @param {Array} courses - Array of course objects for a semester
     * @returns {Object} Object containing GPA and total credits
     */
    calculateSemesterGpa(courses) {
        if (!courses || courses.length === 0) {
            return { gpa: 0, totalCredits: 0 };
        }

        let totalPoints = 0;
        let totalCredits = 0;

        courses.forEach(course => {
            const credit = parseFloat(course.totalCredit);
            const gradePoint = parseFloat(course.pointEquivalent);
            
            if (!isNaN(credit) && !isNaN(gradePoint)) {
                totalPoints += credit * gradePoint;
                totalCredits += credit;
            }
        });

        return {
            gpa: totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0,
            totalCredits: totalCredits
        };
    }

    /**
     * Calculate CGPA across all semesters
     * @param {Object} allSemesterResults - Object containing results for all semesters
     * @returns {Object} Object containing CGPA and total credits
     */
    calculateCgpa(allSemesterResults) {
        let totalPoints = 0;
        let totalCredits = 0;

        // Process each semester's courses
        Object.values(allSemesterResults).forEach(semesterCourses => {
            semesterCourses.forEach(course => {
                const credit = parseFloat(course.totalCredit);
                const gradePoint = parseFloat(course.pointEquivalent);
                
                if (!isNaN(credit) && !isNaN(gradePoint)) {
                    totalPoints += credit * gradePoint;
                    totalCredits += credit;
                }
            });
        });

        return {
            cgpa: totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0,
            totalCredits: totalCredits
        };
    }

    /**
     * Calculate CGPA based on manually entered course data
     * @param {Array} semesters - Array of semester objects, each containing courses
     * @returns {Object} Object containing CGPA and total credits
     */
    calculateManualCgpa(semesters) {
        let totalPoints = 0;
        let totalCredits = 0;
        let semesterResults = [];

        // Process each semester
        semesters.forEach((semester, index) => {
            let semesterPoints = 0;
            let semesterCredits = 0;
            
            // Process each course in the semester
            semester.courses.forEach(course => {
                const credit = parseFloat(course.credit);
                const gradePoint = parseFloat(course.grade);
                
                if (!isNaN(credit) && !isNaN(gradePoint) && credit > 0 && gradePoint >= 0) {
                    const coursePoints = credit * gradePoint;
                    semesterPoints += coursePoints;
                    semesterCredits += credit;
                    
                    // Add to total for CGPA calculation
                    totalPoints += coursePoints;
                    totalCredits += credit;
                }
            });
            
            // Add semester results to the array
            if (semesterCredits > 0) {
                semesterResults.push({
                    name: `Semester ${index + 1}`,
                    gpa: (semesterPoints / semesterCredits).toFixed(2),
                    totalCredits: semesterCredits
                });
            }
        });

        return {
            cgpa: totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0,
            totalCredits: totalCredits,
            semesterResults: semesterResults
        };
    }

    /**
     * Get the CSS class for a grade letter
     * @param {string} gradeLetter - The grade letter (A+, A, B+, etc.)
     * @returns {string} CSS class name
     */
    getGradeClass(gradeLetter) {
        const gradeClasses = {
            'A+': 'grade-a-plus',
            'A': 'grade-a',
            'A-': 'grade-a-minus',
            'B+': 'grade-b-plus',
            'B': 'grade-b',
            'B-': 'grade-b-minus',
            'C+': 'grade-c-plus',
            'C': 'grade-c',
            'D': 'grade-d',
            'F': 'grade-f'
        };

        return gradeClasses[gradeLetter] || '';
    }

    /**
     * Process all semester results and calculate GPA for each semester
     * @param {Object} allSemesterResults - Object containing results for all semesters
     * @param {Array} semesterList - Array of all semesters
     * @returns {Array} Array of semester data with calculated GPA
     */
    processSemesterData(allSemesterResults, semesterList) {
        const semesterData = [];
        
        // Create a lookup object for quicker semester info access
        const semesterLookup = semesterList.reduce((acc, sem) => {
            acc[sem.semesterId] = sem;
            return acc;
        }, {});

        // Process each semester
        Object.entries(allSemesterResults).forEach(([semesterId, courses]) => {
            const semesterInfo = semesterLookup[semesterId];
            if (!semesterInfo) return;

            const { gpa, totalCredits } = this.calculateSemesterGpa(courses);
            
            semesterData.push({
                id: semesterId,
                name: `${semesterInfo.semesterName} ${semesterInfo.semesterYear}`,
                courses: courses,
                gpa: gpa,
                totalCredits: totalCredits
            });
        });

        // Sort semesters by ID in descending order (newest first)
        return semesterData.sort((a, b) => b.id.localeCompare(a.id));
    }
}

// Export as global variable
window.cgpaCalculator = new CgpaCalculator();