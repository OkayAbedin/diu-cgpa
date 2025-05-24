/**
 * Calculator Service for DIU CGPA
 * Handles all GPA and CGPA calculations
 * 
 * Credit Calculation Note:
 * - All courses (including F and I grades) are included in CGPA calculation
 * - For course retakes, only the best grade counts in final CGPA
 * - F and I grades don't contribute to the displayed total credit count
 * - Retaken courses are marked with a retake indicator
 */

class CgpaCalculator {    /**
     * Calculate semester GPA for a set of courses
     * @param {Array} courses - Array of course objects for a semester
     * @returns {Object} Object containing GPA and total credits
     */
    calculateSemesterGpa(courses) {
        if (!courses || courses.length === 0) {
            return { gpa: 0, totalCredits: 0, calculatedTotalCredits: 0 };
        }

        let totalPoints = 0;
        let totalCredits = 0;
        let displayTotalCredits = 0; // For display purposes (excluding F and I)

        courses.forEach(course => {
            const credit = parseFloat(course.totalCredit);
            const gradePoint = parseFloat(course.pointEquivalent);
            const gradeLetter = course.gradeLetter;
            
            // For display purposes, skip F and I grades in credit count
            const shouldCountForDisplay = gradeLetter !== 'F' && gradeLetter !== 'I';
            
            if (!isNaN(credit) && !isNaN(gradePoint)) {
                // Always include all courses in actual GPA calculation
                totalPoints += credit * gradePoint;
                totalCredits += credit;
                
                // But for display purposes, only count valid grades
                if (shouldCountForDisplay) {
                    displayTotalCredits += credit;
                }
            }
        });

        return {
            gpa: totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0,
            totalCredits: displayTotalCredits,  // Display credits exclude F and I 
            calculatedTotalCredits: totalCredits  // Actual credits used in calculation
        };
    }    /**
     * Calculate CGPA across all semesters
     * @param {Object} allSemesterResults - Object containing results for all semesters
     * @returns {Object} Object containing CGPA and total credits
     */
    calculateCgpa(allSemesterResults) {
        // First identify retaken courses by course code
        const courseMap = {};
        const allCourses = [];
        
        // Process all courses across all semesters
        Object.entries(allSemesterResults).forEach(([semesterId, semesterCourses]) => {
            semesterCourses.forEach(course => {
                // Use courseCode as unique identifier
                const courseCode = course.courseCode || course.customCourseId;
                if (!courseCode) {
                    allCourses.push(course); // Course without code gets counted normally
                    return;
                }
                
                // Initialize course map entry if doesn't exist
                if (!courseMap[courseCode]) {
                    courseMap[courseCode] = [];
                }
                
                // Add course to the list for this code
                courseMap[courseCode].push({
                    ...course,
                    semesterId // Keep track of which semester this attempt was in
                });
            });
        });
        
        // Process course map to identify retakes and best grades
        Object.entries(courseMap).forEach(([courseCode, attempts]) => {
            // Sort attempts by grade (highest first)
            attempts.sort((a, b) => {
                return parseFloat(b.pointEquivalent || 0) - parseFloat(a.pointEquivalent || 0);
            });
            
            // Mark retakes if there's more than one attempt
            if (attempts.length > 1) {
                attempts.forEach((attempt, index) => {
                    // Find this course in the original data and mark it
                    const semesterCourses = allSemesterResults[attempt.semesterId];
                    const originalCourse = semesterCourses.find(c => 
                        (c.courseCode || c.customCourseId) === courseCode && 
                        c.courseName === attempt.courseName
                    );
                    
                    if (originalCourse) {
                        if (index === 0) {
                            // Best attempt
                            originalCourse.isRetake = attempts.length > 1;
                            originalCourse.retakeCount = attempts.length - 1;
                            originalCourse.isBestAttempt = true;
                        } else {
                            // Lower grade attempts
                            originalCourse.isRetake = true;
                            originalCourse.isBestAttempt = false;
                        }
                    }
                });
            }
            
            // For CGPA calculation, only add the best attempt to allCourses
            allCourses.push(attempts[0]);
        });
        
        // Now calculate CGPA using only the best attempts (or single attempts)
        let totalPoints = 0;
        let totalCredits = 0;
        let displayTotalCredits = 0; // For display purposes (excluding F and I)
        
        allCourses.forEach(course => {
            const credit = parseFloat(course.totalCredit);
            const gradePoint = parseFloat(course.pointEquivalent);
            const gradeLetter = course.gradeLetter;
            
            // For display purposes, skip F and I grades in credit count
            const shouldCountForDisplay = gradeLetter !== 'F' && gradeLetter !== 'I';
            
            if (!isNaN(credit) && !isNaN(gradePoint)) {
                // Always count all courses in the actual CGPA calculation
                totalPoints += credit * gradePoint;
                totalCredits += credit;
                
                // But for display purposes, only count valid grades
                if (shouldCountForDisplay) {
                    displayTotalCredits += credit;
                }
            }
        });

        return {
            cgpa: totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0,
            totalCredits: displayTotalCredits,  // Display credits exclude F and I
            calculatedTotalCredits: totalCredits // Actual credits used in calculation
        };
    }    /**
     * Calculate CGPA based on manually entered course data
     * @param {Array} semesters - Array of semester objects, each containing courses
     * @returns {Object} Object containing CGPA and total credits
     */
    calculateManualCgpa(semesters) {
        // First, identify retaken courses by course code
        const courseMap = {};
        const allCourses = [];
        
        // Collect all courses across semesters
        semesters.forEach((semester, semesterIndex) => {
            semester.courses.forEach((course, courseIndex) => {
                // Add reference to semester and course index for later
                const courseWithRef = {
                    ...course,
                    semesterIndex,
                    courseIndex
                };
                
                // If course has a code, use it for retake detection
                const courseCode = course.code || course.courseCode;
                if (courseCode) {
                    if (!courseMap[courseCode]) {
                        courseMap[courseCode] = [];
                    }
                    courseMap[courseCode].push(courseWithRef);
                } else {
                    // No code, just add to all courses
                    allCourses.push(courseWithRef);
                }
            });
        });
        
        // Process course map to identify retakes
        Object.entries(courseMap).forEach(([courseCode, attempts]) => {
            // Only process if there are multiple attempts
            if (attempts.length > 1) {
                // Sort by grade (best first)
                attempts.sort((a, b) => parseFloat(b.grade) - parseFloat(a.grade));
                
                // Mark all attempts as retakes
                attempts.forEach((attempt, index) => {
                    const course = semesters[attempt.semesterIndex].courses[attempt.courseIndex];
                    
                    // Mark retake status in the original course objects
                    if (index === 0) {
                        // Best attempt
                        course.isRetake = true;
                        course.retakeCount = attempts.length - 1;
                        course.isBestAttempt = true;
                    } else {
                        // Lower grade attempts
                        course.isRetake = true;
                        course.isBestAttempt = false;
                    }
                });
                
                // Add best attempt to all courses
                allCourses.push(attempts[0]);
            } else {
                // Single attempt, just add to all courses
                allCourses.push(attempts[0]);
            }
        });
        
        // Calculate semester GPAs normally (including all attempts)
        const semesterResults = [];
        semesters.forEach((semester, index) => {
            let semesterPoints = 0;
            let semesterCredits = 0;
            let semesterDisplayCredits = 0;
            
            semester.courses.forEach(course => {
                const credit = parseFloat(course.credit);
                const gradePoint = parseFloat(course.grade);
                
                // Determine if we should count this course for display credits
                const shouldCountForDisplay = gradePoint >= 0.01; // Skip F and I grades for display
                
                if (!isNaN(credit) && !isNaN(gradePoint) && credit > 0 && gradePoint >= 0) {
                    const coursePoints = credit * gradePoint;
                    semesterPoints += coursePoints;
                    semesterCredits += credit;
                    
                    if (shouldCountForDisplay) {
                        semesterDisplayCredits += credit;
                    }
                }
            });
            
            // Add semester results to the array
            if (semesterCredits > 0) {
                semesterResults.push({
                    name: `Semester ${index + 1}`,
                    gpa: (semesterPoints / semesterCredits).toFixed(2),
                    totalCredits: semesterDisplayCredits,
                    calculatedTotalCredits: semesterCredits
                });
            }
        });
        
        // Calculate overall CGPA using only best attempts
        let totalPoints = 0;
        let totalCredits = 0;
        let displayTotalCredits = 0;
        
        allCourses.forEach(course => {
            const credit = parseFloat(course.credit);
            const gradePoint = parseFloat(course.grade);
            
            // Determine if we should count this course for display credits
            const shouldCountForDisplay = gradePoint >= 0.01; // Skip F and I grades for display
            
            if (!isNaN(credit) && !isNaN(gradePoint) && credit > 0 && gradePoint >= 0) {
                totalPoints += credit * gradePoint;
                totalCredits += credit;
                
                if (shouldCountForDisplay) {
                    displayTotalCredits += credit;
                }
            }
        });

        return {
            cgpa: totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0,
            totalCredits: displayTotalCredits,
            calculatedTotalCredits: totalCredits,
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
    }    /**
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

        // First, detect retaken courses across all semesters
        this.detectRetakenCourses(allSemesterResults);

        // Process each semester
        Object.entries(allSemesterResults).forEach(([semesterId, courses]) => {
            const semesterInfo = semesterLookup[semesterId];
            if (!semesterInfo) return;

            const { gpa, totalCredits, calculatedTotalCredits } = this.calculateSemesterGpa(courses);
            
            semesterData.push({
                id: semesterId,
                name: `${semesterInfo.semesterName} ${semesterInfo.semesterYear}`,
                courses: courses,
                gpa: gpa,
                totalCredits: totalCredits,
                calculatedTotalCredits: calculatedTotalCredits
            });
        });

        // Sort semesters by ID in descending order (newest first)
        return semesterData.sort((a, b) => b.id.localeCompare(a.id));
    }
    
    /**
     * Detect and mark retaken courses across all semesters
     * @param {Object} allSemesterResults - Object containing results for all semesters
     * @private
     */
    detectRetakenCourses(allSemesterResults) {
        // Course map to track all instances of courses by code
        const courseMap = {};
        
        // First pass: collect all courses by course code
        Object.entries(allSemesterResults).forEach(([semesterId, courses]) => {
            courses.forEach(course => {
                const courseCode = course.courseCode || course.customCourseId;
                if (!courseCode) return; // Skip courses without codes
                
                if (!courseMap[courseCode]) {
                    courseMap[courseCode] = [];
                }
                
                courseMap[courseCode].push({
                    course,
                    semesterId,
                    pointEquivalent: parseFloat(course.pointEquivalent || 0)
                });
            });
        });
        
        // Second pass: mark retakes
        Object.entries(courseMap).forEach(([courseCode, attempts]) => {
            // If there's only one attempt, no need to mark anything
            if (attempts.length <= 1) return;
            
            // Sort by grade (best first)
            attempts.sort((a, b) => b.pointEquivalent - a.pointEquivalent);
            
            // Mark all attempts
            attempts.forEach((attempt, index) => {
                const course = attempt.course;
                course.isRetake = true;
                course.retakeCount = attempts.length - 1;
                course.isBestAttempt = (index === 0); // First in sorted array is best
            });
        });
    }
}

// Export as global variable
window.cgpaCalculator = new CgpaCalculator();