/**
 * Manual CGPA Input System for DIU CGPA Calculator
 * Handles parsing of semester result tables and manual student info input
 */

class ManualCgpaInput {
    constructor() {
        this.semesters = [];
        this.studentInfo = {};
        this.calculator = new CgpaCalculator();
        this.initializeEventListeners();
    }

    /**
     * Initialize event listeners for the manual input system
     */
    initializeEventListeners() {
        // Add semester button
        document.getElementById('add-semester-input-btn')?.addEventListener('click', () => {
            this.addSemesterInput();
        });

        // Calculate CGPA button
        document.getElementById('calculate-manual-cgpa-btn')?.addEventListener('click', () => {
            this.calculateManualCgpa();
        });

        // Load sample data button
        document.getElementById('load-sample-data-btn')?.addEventListener('click', () => {
            this.loadSampleData();
        });

        // Toggle project input button
        document.getElementById('toggle-project-input-btn')?.addEventListener('click', () => {
            this.toggleProjectInput();
        });

        // Export buttons
        document.getElementById('manual-save-pdf-btn')?.addEventListener('click', () => {
            this.exportToPdf();
        });

        document.getElementById('manual-export-csv-btn')?.addEventListener('click', () => {
            this.exportToCsv();
        });

        // Add first semester input by default
        setTimeout(() => {
            this.addSemesterInput();
        }, 100);
    }

    /**
     * Add a new semester input area
     */
    addSemesterInput() {
        try {
            const container = document.getElementById('semester-input-list');
            if (!container) {
                console.error('Semester input container not found');
                return;
            }
            const semesterIndex = container.children.length + 1;

        const semesterHtml = `
            <div class="semester-input-container" data-semester="${semesterIndex}">
                <div class="semester-input-header">
                    <h5><i class="fas fa-calendar-alt"></i> Semester ${semesterIndex}</h5>
                    <button class="semester-remove-btn" onclick="manualCgpaInput.removeSemesterInput(this)">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
                <div class="semester-input-body">
                    <label for="semester-${semesterIndex}-data">Paste your semester result table here:</label>
                    <textarea 
                        id="semester-${semesterIndex}-data" 
                        class="semester-textarea" 
                        placeholder="Paste the table content from your student portal here. Example:

Result of Spring, 2022
SL	Course Code	Course Title	Credit	Grade	Grade Point
1	CSE-115	Introduction to Biology and chemistry for Computation	2.00	A+	4.00
2	PHY-113	Basic Physics	2.00	A+	4.00
3	CSE112	Computer Fundamentals 	3.00	A+	4.00
4	ENG113	Basic Functional English and English Spoken	3.00	A-	3.50
5	PHY114	Basic Physics Lab	1.00	A+	4.00
6	MAT111	Basic Mathematics	3.00	A+	4.00
Total Credit	14.00	SGPA	3.89

Tip: Select all result text from your student portal and copy-paste it here. The system supports multiple formats and will automatically detect courses."
                        oninput="manualCgpaInput.parseSemesterData(this, ${semesterIndex})"></textarea>
                    <div class="semester-parse-status" id="semester-${semesterIndex}-status" style="display: none;"></div>
                </div>
                <div class="semester-input-footer">
                    <i class="fas fa-info-circle"></i> Paste the table data directly from your student portal. The system will automatically detect and parse the course information.
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', semesterHtml);
        } catch (error) {
            console.error('Error adding semester input:', error);
        }
    }

    /**
     * Remove a semester input area
     */
    removeSemesterInput(button) {
        const semesterContainer = button.closest('.semester-input-container');
        const container = document.getElementById('semester-input-list');
        
        // Don't allow removing if it's the only semester
        if (container.children.length <= 1) {
            alert('You need at least one semester to calculate CGPA.');
            return;
        }

        semesterContainer.remove();
        this.updateSemesterNumbers();
    }

    /**
     * Update semester numbers after removal
     */
    updateSemesterNumbers() {
        const container = document.getElementById('semester-input-list');
        Array.from(container.children).forEach((semesterDiv, index) => {
            const semesterNumber = index + 1;
            semesterDiv.setAttribute('data-semester', semesterNumber);
            
            const headerTitle = semesterDiv.querySelector('h5');
            headerTitle.innerHTML = `<i class="fas fa-calendar-alt"></i> Semester ${semesterNumber}`;
            
            const textarea = semesterDiv.querySelector('.semester-textarea');
            textarea.id = `semester-${semesterNumber}-data`;
            
            const statusDiv = semesterDiv.querySelector('.semester-parse-status');
            statusDiv.id = `semester-${semesterNumber}-status`;
        });
    }

    /**
     * Toggle project/thesis/internship input visibility
     */
    toggleProjectInput() {
        const container = document.getElementById('project-input-container');
        const button = document.getElementById('toggle-project-input-btn');
        
        if (container.style.display === 'none') {
            // Show the project input
            container.style.display = 'block';
            button.innerHTML = '<i class="fas fa-minus"></i> Remove Project/Thesis/Internship';
            button.classList.remove('gh-btn-secondary');
            button.classList.add('gh-btn-danger');
        } else {
            // Hide and clear the project input
            container.style.display = 'none';
            document.getElementById('project-course-code').value = '';
            document.getElementById('project-credits').value = '';
            document.getElementById('project-gpa').value = '';
            button.innerHTML = '<i class="fas fa-plus"></i> Add Project/Thesis/Internship';
            button.classList.remove('gh-btn-danger');
            button.classList.add('gh-btn-secondary');
        }
    }

    /**
     * Parse semester data from textarea input
     */
    parseSemesterData(textarea, semesterIndex) {
        const data = textarea.value.trim();
        const statusDiv = document.getElementById(`semester-${semesterIndex}-status`);
        
        if (!data) {
            statusDiv.style.display = 'none';
            return;
        }

        try {
            const parsedData = this.parseResultTable(data);
            
            if (parsedData.courses.length > 0) {
                statusDiv.style.display = 'block';
                statusDiv.className = 'semester-parse-status success';
                statusDiv.innerHTML = `
                    <i class="fas fa-check-circle"></i> 
                    Successfully parsed ${parsedData.courses.length} courses from ${parsedData.semesters.length} semester(s).
                    Total Credits: ${parsedData.totalCredits.toFixed(2)}
                `;
            } else {
                statusDiv.style.display = 'block';
                statusDiv.className = 'semester-parse-status warning';
                statusDiv.innerHTML = `
                    <i class="fas fa-exclamation-triangle"></i> 
                    No courses detected. Please check the format and try again.
                `;
            }
        } catch (error) {
            statusDiv.style.display = 'block';
            statusDiv.className = 'semester-parse-status error';
            statusDiv.innerHTML = `
                <i class="fas fa-times-circle"></i> 
                Error parsing data: ${error.message}
            `;
        }
    }

    /**
     * Parse result table data from student portal
     */
    parseResultTable(data) {
        const lines = data.split('\n').map(line => line.trim()).filter(line => line);
        const semesters = [];
        let currentSemester = null;
        let courses = [];
        let totalCredits = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Detect semester header (various patterns)
            if (line.match(/Result of .+/i) || 
                line.match(/\b(Spring|Summer|Fall|Autumn)\b.*\d{4}/i) ||
                line.match(/Semester.*\d{4}/i) ||
                line.match(/\d{4}.*\b(Spring|Summer|Fall|Autumn)\b/i)) {
                
                // Save previous semester if exists
                if (currentSemester && currentSemester.courses.length > 0) {
                    semesters.push(currentSemester);
                }
                
                // Start new semester
                currentSemester = {
                    name: line.replace(/Result of /i, '').trim(),
                    courses: [],
                    totalCredits: 0,
                    sgpa: 0
                };
                continue;
            }
            
            // Skip header lines (more comprehensive patterns)
            if (line.match(/^SL\s+Course.*Code/i) || 
                line.match(/^Serial/i) ||
                line.match(/^Course.*Title.*Credit/i) ||
                line.match(/^\s*SL\s+/i) ||
                line === 'SL	Course Code	Course Title	Credit	Grade	Grade Point' ||
                line.toLowerCase().includes('course code') ||
                line.toLowerCase().includes('course title')) {
                continue;
            }
            
            // Skip empty lines or dividers
            if (line.length < 5 || line.match(/^[-=\s]+$/)) {
                continue;
            }
            
            // Parse course line
            const courseMatch = this.parseCourseFromLine(line);
            if (courseMatch) {
                if (!currentSemester) {
                    // If no semester header found, create default one
                    currentSemester = {
                        name: 'Semester ' + (semesters.length + 1),
                        courses: [],
                        totalCredits: 0,
                        sgpa: 0
                    };
                }
                
                currentSemester.courses.push(courseMatch);
                currentSemester.totalCredits += courseMatch.totalCredit;
                totalCredits += courseMatch.totalCredit;
                courses.push(courseMatch);
                continue;
            }
            
            // Parse total/SGPA line (multiple patterns)
            const totalMatch = line.match(/Total Credit[s]?\s+([\d.]+)/i) ||
                             line.match(/Total\s+([\d.]+)/i) ||
                             line.match(/Credit[s]?\s*Total[:\s]+([\d.]+)/i);
            
            const sgpaMatch = line.match(/SGPA\s+([\d.]+)/i) ||
                            line.match(/GPA\s+([\d.]+)/i) ||
                            line.match(/Average[:\s]+([\d.]+)/i);
            
            if (totalMatch && currentSemester) {
                // Verify total credits match our calculation
                const reportedTotal = parseFloat(totalMatch[1]);
                if (Math.abs(reportedTotal - currentSemester.totalCredits) < 0.1) {
                    // Credits match, good
                } else {
                    console.warn(`Credit mismatch: calculated ${currentSemester.totalCredits}, reported ${reportedTotal}`);
                }
            }
            
            if (sgpaMatch && currentSemester) {
                currentSemester.sgpa = parseFloat(sgpaMatch[1]);
            }
        }
        
        // Add the last semester
        if (currentSemester && currentSemester.courses.length > 0) {
            semesters.push(currentSemester);
        }

        // If no semesters were detected but we have courses, create a default semester
        if (semesters.length === 0 && courses.length > 0) {
            semesters.push({
                name: 'Semester 1',
                courses: courses,
                totalCredits: totalCredits,
                sgpa: 0
            });
        }

        return {
            semesters,
            courses,
            totalCredits
        };
    }

    /**
     * Parse a single course line from the table
     */
    parseCourseFromLine(line) {
        // Skip lines that are clearly not course data
        if (line.match(/^SL\s+Course/i) || 
            line.match(/^Total Credit/i) || 
            line.match(/^Result of/i) ||
            line.length < 10 ||
            !line.match(/[A-Za-z]/) ||
            !line.match(/\d/)) {
            return null;
        }
        
        // Split by tab or multiple spaces, but be more careful about spaces in course titles
        let parts;
        
        // First try splitting by tabs
        if (line.includes('\t')) {
            parts = line.split('\t').map(p => p.trim()).filter(p => p);
        } else {
            // Try splitting by multiple spaces (2 or more)
            parts = line.split(/\s{2,}/).map(p => p.trim()).filter(p => p);
        }
        
        if (parts.length < 4) {
            // Try different splitting strategy - look for patterns
            // Pattern: number/letter code, then title, then credit number, then grade
            const creditPattern = /(\d+\.?\d*)\s+(A\+|A-?|B\+?-?|C\+?|D|F)\s+([\d.]+)/;
            const creditMatch = line.match(creditPattern);
            
            if (creditMatch) {
                const beforeCredit = line.substring(0, line.indexOf(creditMatch[0])).trim();
                const courseCode = beforeCredit.split(/\s+/)[0];
                const courseTitle = beforeCredit.substring(courseCode.length).trim();
                
                parts = [
                    courseCode,
                    courseTitle,
                    creditMatch[1], // credit
                    creditMatch[2], // grade
                    creditMatch[3]  // grade point
                ];
            } else {
                return null;
            }
        }
        
        let sl, courseCode, courseTitle, credit, grade, gradePoint;
        
        // Detect if first part is a sequence number
        const firstPartIsNumber = parts[0] && parts[0].match(/^\d+$/);
        
        if (firstPartIsNumber && parts.length >= 6) {
            // Pattern: SL, Code, Title, Credit, Grade, Grade Point
            [sl, courseCode, courseTitle, credit, grade, gradePoint] = parts;
        } else if (firstPartIsNumber && parts.length === 5) {
            // Pattern: SL, Code, Title, Credit, Grade (no grade point)
            [sl, courseCode, courseTitle, credit, grade] = parts;
            gradePoint = this.gradeToPoint(grade);
        } else if (!firstPartIsNumber && parts.length >= 5) {
            // Pattern: Code, Title, Credit, Grade, Grade Point (no SL)
            [courseCode, courseTitle, credit, grade, gradePoint] = parts;
        } else if (!firstPartIsNumber && parts.length === 4) {
            // Pattern: Code, Title, Credit, Grade (no SL, no grade point)
            [courseCode, courseTitle, credit, grade] = parts;
            gradePoint = this.gradeToPoint(grade);
        } else {
            return null;
        }
        
        // Validate course code
        if (!courseCode || courseCode.length < 2 || !courseCode.match(/[A-Za-z]/)) {
            return null;
        }
        
        // Validate and parse credit
        const creditNum = parseFloat(credit);
        if (isNaN(creditNum) || creditNum <= 0 || creditNum > 6) {
            return null;
        }
        
        // Validate grade
        if (!grade || !grade.match(/^(A\+|A-?|B\+?-?|C\+?|D|F)$/i)) {
            return null;
        }
        
        // Validate and parse grade point
        let gradePointNum = parseFloat(gradePoint);
        if (isNaN(gradePointNum)) {
            gradePointNum = this.gradeToPoint(grade);
        }
        
        // Final validation
        if (gradePointNum < 0 || gradePointNum > 4) {
            gradePointNum = this.gradeToPoint(grade);
        }
        
        return {
            courseCode: courseCode.trim(),
            courseName: courseTitle ? courseTitle.trim() : courseCode.trim(),
            totalCredit: creditNum,
            gradeLetter: grade.trim().toUpperCase(),
            pointEquivalent: gradePointNum,
            customCourseId: courseCode.trim()
        };
    }

    /**
     * Convert grade letter to grade point
     */
    gradeToPoint(grade) {
        if (!grade) return 0;
        
        const gradeMap = {
            'A+': 4.00, 'A': 3.75, 'A-': 3.50,
            'B+': 3.25, 'B': 3.00, 'B-': 2.75,
            'C+': 2.50, 'C': 2.25, 'D': 2.00, 'F': 0.00,
            // Additional variations
            'APLUS': 4.00, 'AMINUS': 3.50, 'BPLUS': 3.25, 'BMINUS': 2.75, 'CPLUS': 2.50
        };
        
        const normalizedGrade = grade.toUpperCase().trim().replace(/\s+/g, '');
        return gradeMap[normalizedGrade] !== undefined ? gradeMap[normalizedGrade] : 0;
    }

    /**
     * Convert grade point to grade letter
     */
    pointToGrade(point) {
        if (point >= 4.00) return 'A+';
        if (point >= 3.75) return 'A';
        if (point >= 3.50) return 'A-';
        if (point >= 3.25) return 'B+';
        if (point >= 3.00) return 'B';
        if (point >= 2.75) return 'B-';
        if (point >= 2.50) return 'C+';
        if (point >= 2.25) return 'C';
        if (point >= 2.00) return 'D';
        return 'F';
    }

    /**
     * Calculate CGPA from manual input
     */
    calculateManualCgpa() {
        try {
            // Hide the input forms when calculation starts
            this.hideInputSections();
            
            // Show loading
            document.getElementById('manual-loading').classList.remove('hidden');
            document.getElementById('manual-error-message').classList.add('hidden');

            // Collect student info
            this.collectStudentInfo();

            // Collect and parse all semester data
            const allSemesterData = this.collectAllSemesterData();
            
            if (allSemesterData.courses.length === 0) {
                throw new Error('No course data found. Please paste your semester results and try again.');
            }

            // Simulate the API response structure
            const mockApiResponse = this.createMockApiResponse(allSemesterData);

            // Calculate CGPA using existing calculator
            const cgpaResult = this.calculator.calculateCgpa(mockApiResponse.results);

            // Display results
            setTimeout(() => {
                this.displayResults(mockApiResponse, cgpaResult);
                document.getElementById('manual-loading').classList.add('hidden');
            }, 500);

        } catch (error) {
            console.error('Error calculating manual CGPA:', error);
            document.getElementById('manual-loading').classList.add('hidden');
            
            // Show input sections again on error
            this.showInputSections();
            
            const errorDiv = document.getElementById('manual-error-message');
            errorDiv.querySelector('p').textContent = error.message;
            errorDiv.classList.remove('hidden');
        }
    }

    /**
     * Hide input sections (student info and semester inputs)
     */
    hideInputSections() {
        // Hide student information section - use more direct approach
        const studentNameInput = document.getElementById('manual-student-name');
        if (studentNameInput) {
            const studentInfoBox = studentNameInput.closest('.gh-box');
            if (studentInfoBox) {
                studentInfoBox.style.display = 'none';
            } else {
                // Fallback: try to find by looking for all gh-box elements
                const allBoxes = document.querySelectorAll('.gh-box');
                allBoxes.forEach(box => {
                    if (box.querySelector('#manual-student-name')) {
                        box.style.display = 'none';
                    }
                });
            }
        }

        // Hide semester results input section - use more direct approach
        const semesterInputList = document.getElementById('semester-input-list');
        if (semesterInputList) {
            const semesterBox = semesterInputList.closest('.gh-box');
            if (semesterBox) {
                semesterBox.style.display = 'none';
            } else {
                // Fallback: try to find by looking for all gh-box elements
                const allBoxes = document.querySelectorAll('.gh-box');
                allBoxes.forEach(box => {
                    if (box.querySelector('#semester-input-list')) {
                        box.style.display = 'none';
                    }
                });
            }
        }

        // Hide calculate button section - use more direct approach
        const calculateBtn = document.getElementById('calculate-manual-cgpa-btn');
        if (calculateBtn) {
            const calculateBox = calculateBtn.closest('.gh-box');
            if (calculateBox) {
                calculateBox.style.display = 'none';
            } else {
                // Fallback: try to find by looking for all gh-box elements
                const allBoxes = document.querySelectorAll('.gh-box');
                allBoxes.forEach(box => {
                    if (box.querySelector('#calculate-manual-cgpa-btn')) {
                        box.style.display = 'none';
                    }
                });
            }
        }

        // Hide project/thesis/internship input section
        const projectInputContainer = document.getElementById('project-input-container');
        if (projectInputContainer) {
            const projectBox = projectInputContainer.closest('.gh-box');
            if (projectBox) {
                projectBox.style.display = 'none';
            }
        }
    }

    /**
     * Show input sections (student info and semester inputs) - used on error
     */
    showInputSections() {
        // Show student information section - use more direct approach
        const studentNameInput = document.getElementById('manual-student-name');
        if (studentNameInput) {
            const studentInfoBox = studentNameInput.closest('.gh-box');
            if (studentInfoBox) {
                studentInfoBox.style.display = 'block';
            } else {
                // Fallback: try to find by looking for all gh-box elements
                const allBoxes = document.querySelectorAll('.gh-box');
                allBoxes.forEach(box => {
                    if (box.querySelector('#manual-student-name')) {
                        box.style.display = 'block';
                    }
                });
            }
        }

        // Show semester results input section - use more direct approach
        const semesterInputList = document.getElementById('semester-input-list');
        if (semesterInputList) {
            const semesterBox = semesterInputList.closest('.gh-box');
            if (semesterBox) {
                semesterBox.style.display = 'block';
            } else {
                // Fallback: try to find by looking for all gh-box elements
                const allBoxes = document.querySelectorAll('.gh-box');
                allBoxes.forEach(box => {
                    if (box.querySelector('#semester-input-list')) {
                        box.style.display = 'block';
                    }
                });
            }
        }

        // Show calculate button section - use more direct approach
        const calculateBtn = document.getElementById('calculate-manual-cgpa-btn');
        if (calculateBtn) {
            const calculateBox = calculateBtn.closest('.gh-box');
            if (calculateBox) {
                calculateBox.style.display = 'block';
            } else {
                // Fallback: try to find by looking for all gh-box elements
                const allBoxes = document.querySelectorAll('.gh-box');
                allBoxes.forEach(box => {
                    if (box.querySelector('#calculate-manual-cgpa-btn')) {
                        box.style.display = 'block';
                    }
                });
            }
        }

        // Show project/thesis/internship input section
        const projectInputContainer = document.getElementById('project-input-container');
        if (projectInputContainer) {
            const projectBox = projectInputContainer.closest('.gh-box');
            if (projectBox) {
                projectBox.style.display = 'block';
            }
        }
    }

    /**
     * Collect student info from form
     */
    collectStudentInfo() {
        this.studentInfo = {
            name: document.getElementById('manual-student-name').value.trim() || 'Student Name',
            studentId: document.getElementById('manual-student-id').value.trim() || 'Student ID',
            department: document.getElementById('manual-department').value.trim() || 'Department',
            program: document.getElementById('manual-program').value.trim() || 'B.Sc. in Computer Science & Engineering',
            enrollmentSession: document.getElementById('manual-enrollment-session').value.trim() || 'Enrollment Session',
            totalCreditRequirement: document.getElementById('manual-total-credit-requirement').value.trim() || '148',
            // Keep these for PDF export only - don't include campusName, facShortName, or batch for UI display
            campus: document.getElementById('manual-campus').value.trim() || 'Campus',
            faculty: document.getElementById('manual-faculty').value.trim() || 'Faculty',
            batch: document.getElementById('manual-batch').value.trim() || 'Batch'
        };
    }

    /**
     * Collect all semester data from textareas
     */
    collectAllSemesterData() {
        const container = document.getElementById('semester-input-list');
        const allCourses = [];
        const allSemesters = [];
        let totalProcessed = 0;
        let totalErrors = 0;
        
        Array.from(container.children).forEach((semesterDiv, index) => {
            const textarea = semesterDiv.querySelector('.semester-textarea');
            const data = textarea.value.trim();
            
            if (data) {
                totalProcessed++;
                try {
                    const parsedData = this.parseResultTable(data);
                    if (parsedData.courses.length > 0) {
                        allCourses.push(...parsedData.courses);
                        allSemesters.push(...parsedData.semesters);
                    } else {
                        totalErrors++;
                        console.warn(`No courses found in semester ${index + 1}`);
                    }
                } catch (error) {
                    totalErrors++;
                    console.warn(`Error parsing semester ${index + 1}:`, error);
                }
            }
        });

        // Check if project/thesis/internship data is present
        const projectData = this.collectProjectData();
        if (projectData) {
            allSemesters.push(projectData);
        }

        // Provide feedback to user
        if (totalProcessed === 0) {
            throw new Error('No semester data entered. Please paste your result data in at least one semester field.');
        }

        if (allCourses.length === 0 && !projectData) {
            throw new Error(`Unable to parse any course data from ${totalProcessed} semester(s). Please check the format and try again.`);
        }

        if (totalErrors > 0) {
            this.showNotification(`Successfully processed ${allCourses.length} courses, but had ${totalErrors} error(s) in parsing. Check the semester status indicators.`, 'warning');
        }

        return {
            courses: allCourses,
            semesters: allSemesters,
            totalCredits: allCourses.reduce((sum, course) => sum + course.totalCredit, 0),
            processedCount: totalProcessed,
            errorCount: totalErrors,
            hasProject: projectData !== null
        };
    }

    /**
     * Collect project/thesis/internship data if present
     */
    collectProjectData() {
        const container = document.getElementById('project-input-container');
        
        // Check if project input is visible
        if (container.style.display === 'none') {
            return null;
        }

        const courseCode = document.getElementById('project-course-code').value.trim() || 'PROJECT';
        const credits = parseFloat(document.getElementById('project-credits').value);
        const gpa = parseFloat(document.getElementById('project-gpa').value);

        // Validate inputs
        if (isNaN(credits) || isNaN(gpa) || credits <= 0 || gpa < 0 || gpa > 4) {
            return null;
        }

        // Create a semester-like object for project
        return {
            name: 'Project/Thesis/Internship',
            courses: [{
                courseCode: courseCode,
                courseName: 'Project/Thesis/Internship',
                totalCredit: credits,
                gradeLetter: this.pointToGrade(gpa),
                pointEquivalent: gpa,
                customCourseId: courseCode
            }],
            totalCredits: credits,
            sgpa: gpa
        };
    }

    /**
     * Convert grade point to letter grade
     */
    pointToGrade(point) {
        if (point >= 4.0) return 'A+';
        if (point >= 3.75) return 'A';
        if (point >= 3.5) return 'A-';
        if (point >= 3.25) return 'B+';
        if (point >= 3.0) return 'B';
        if (point >= 2.75) return 'B-';
        if (point >= 2.5) return 'C+';
        if (point >= 2.25) return 'C';
        if (point >= 2.0) return 'D';
        return 'F';
    }

    /**
     * Create mock API response structure
     */
    createMockApiResponse(semesterData) {
        // Group courses by semester and preserve semester names
        const semesterGroups = {};
        const semesterNames = {};
        
        semesterData.semesters.forEach((semester, index) => {
            const semesterId = (100 + index).toString(); // Generate mock semester IDs
            semesterGroups[semesterId] = semester.courses;
            semesterNames[semesterId] = semester.name;
        });

        return {
            studentInfo: this.studentInfo,
            results: semesterGroups,
            semesterNames: semesterNames, // Preserve semester names
            missingSemesters: [],
            hasMissingSemesters: false
        };
    }

    /**
     * Display results using existing UI components
     */
    displayResults(mockApiResponse, cgpaResult) {
        // Store calculated data for export functions
        this.calculatedData = {
            semesters: [],
            cgpa: cgpaResult.cgpa,
            totalCredits: cgpaResult.totalCredits
        };

        // Process semester data using the exact same logic as the original UI
        const semesterResults = mockApiResponse.results;
        const semesterNames = mockApiResponse.semesterNames || {};
        const semesterData = [];
        
        Object.entries(semesterResults).forEach(([semesterId, courses], index) => {
            const semesterGpa = this.calculator.calculateSemesterGpa(courses);
            const semester = {
                id: semesterId,
                name: semesterNames[semesterId] || `Semester ${index + 1}`, // Use preserved name or fallback
                gpa: semesterGpa.gpa,
                totalCredits: semesterGpa.totalCredits,
                courses: courses
            };
            semesterData.push(semester);
            this.calculatedData.semesters.push(semester);
        });

        // Update student info using a custom renderer that excludes Batch, Faculty, and Campus
        const studentInfoWithCgpa = {
            ...mockApiResponse.studentInfo,
            cgpa: cgpaResult.cgpa
        };
        
        const studentInfoHtml = this.renderCustomStudentInfo(studentInfoWithCgpa);
        document.getElementById('manual-student-info').innerHTML = studentInfoHtml;
        document.getElementById('manual-student-info').classList.remove('hidden');

        // Update the circular CGPA display using the same method as original UI
        this.updateCircularCgpaDisplay(parseFloat(cgpaResult.cgpa));

        // Update the stats in the student info section using the EXACT same method
        StudentInfo.updateStats(semesterData.length, cgpaResult.totalCredits);

        // Display semester results using the EXACT same SemesterList component
        const manualSemesterResultsSection = document.getElementById('manual-semester-results');
        manualSemesterResultsSection.innerHTML = SemesterList.render(semesterData);

        // Create CGPA chart using the same method
        this.createCgpaChart(semesterData);

        // Show results container
        document.getElementById('manual-results-container').classList.remove('hidden');
        
        // Hide loading
        document.getElementById('manual-loading').classList.add('hidden');
    }

    /**
     * Create abbreviation from text by taking first letter of each significant word
     * Excludes prepositions, conjunctions, and other small words
     * @param {string} text - Text to abbreviate
     * @returns {string} Abbreviation
     */
    createAbbreviation(text) {
        if (!text || typeof text !== 'string') return text;
        
        // Words to exclude from abbreviations (prepositions, conjunctions, articles, etc.)
        const excludeWords = new Set([
            'of', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by',
            'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after',
            'above', 'below', 'between', 'among', 'under', 'over', 'the', 'a', 'an',
            '&', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have',
            'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'
        ]);
        
        return text
            .split(' ')
            .filter(word => word.length > 0 && !excludeWords.has(word.toLowerCase()))
            .map(word => word.charAt(0).toUpperCase())
            .join('');
    }

    /**
     * Custom student info renderer for manual input that shows all entered information
     * @param {Object} studentInfo - Student information object
     * @returns {string} HTML string for student info
     */
    renderCustomStudentInfo(studentInfo) {
        if (!studentInfo) {
            return '<p>No student information available.</p>';
        }
        
        // Support multiple possible property names from API
        const studentName = studentInfo.name || studentInfo.studentName || studentInfo.fullName || 'Unknown Student';
        const studentId = studentInfo.studentId || studentInfo.id || 'Unknown ID';
        const department = studentInfo.department || studentInfo.departmentName || 'Unknown Department';
        const program = studentInfo.program || 'B.Sc. in Computer Science & Engineering';
        const batch = studentInfo.batch || 'Batch';
        const campus = this.createAbbreviation(studentInfo.campus) || 'Campus';
        const faculty = this.createAbbreviation(studentInfo.faculty) || 'Faculty';
        const enrollmentSession = studentInfo.enrollmentSession || 'Enrollment Session';
        
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
                    <div class="student-program">${program}</div>
                </div>
                <div class="department-display">
                    <div class="department-value">${department}</div>
                    <div class="department-label">Department</div>
                </div>
                <div class="student-stats">
                    <div class="stat-item">
                        <div class="stat-value">${batch}</div>
                        <div class="stat-label">Batch</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${campus}</div>
                        <div class="stat-label">Campus</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${faculty}</div>
                        <div class="stat-label">Faculty</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${enrollmentSession}</div>
                        <div class="stat-label">Session</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" id="total-semesters">-</div>
                        <div class="stat-label">Semesters</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" id="total-credits">-</div>
                        <div class="stat-label">Credits</div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Update the circular CGPA display based on CGPA value - EXACT same as original UI
     * @param {number} cgpa - The CGPA value
     */
    updateCircularCgpaDisplay(cgpa) {
        const cgpaCircle = document.querySelector('#manual-student-info .cgpa-circle');
        if (!cgpaCircle) return;
        
        // Calculate percentage for the circle fill (0-100%)
        const percentage = (cgpa / 4) * 100;
        
        // Determine color based on CGPA value - EXACT same logic as original
        let color;
        if (cgpa >= 3.75) { // A+ to A
            color = '#4CAF50'; // Green
        } else if (cgpa >= 3.50) { // A-
            color = '#8BC34A'; // Light Green
        } else if (cgpa >= 3.25) { // B+
            color = '#CDDC39'; // Lime
        } else if (cgpa >= 3.00) { // B
            color = '#FFEB3B'; // Yellow
        } else if (cgpa >= 2.75) { // B-
            color = '#FFC107'; // Amber
        } else if (cgpa >= 2.50) { // C+
            color = '#FF9800'; // Orange
        } else if (cgpa >= 2.00) { // C to D
            color = '#FF5722'; // Deep Orange
        } else { // F
            color = '#F44336'; // Red
        }
        
        // Update circle style with CSS variables
        cgpaCircle.style.setProperty('--cgpa-percentage', `${percentage}%`);
        cgpaCircle.style.setProperty('--cgpa-color', color);
        
        // Apply the dynamic styling using conic-gradient for circle completion
        cgpaCircle.style.background = `conic-gradient(var(--cgpa-color) 0% var(--cgpa-percentage), #e0e0e0 var(--cgpa-percentage) 100%)`;
        
        // Update text color to match the circle
        const cgpaValue = document.querySelector('#manual-student-info .cgpa-value');
        if (cgpaValue) {
            cgpaValue.style.color = color;
        }
    }

    /**
     * Create CGPA progress chart - EXACT same as original UI
     */
    createCgpaChart(semesterData, selectedSemesterName = null) {
        const cgpaChartCanvas = document.getElementById('manual-cgpa-chart');
        if (!semesterData || semesterData.length === 0 || !cgpaChartCanvas) return;
        
        // Show chart container
        const chartContainer = document.getElementById('manual-cgpa-progress-container');
        if (chartContainer) {
            chartContainer.classList.remove('hidden');
        }
        
        // First extract year and term from semester name if they exist
        semesterData.forEach(semester => {
            if (!semester.year || !semester.term) {
                const parts = semester.name.split(' ');
                // Try to extract term (Fall, Spring, Summer) and year from semester name
                if (parts.length >= 2) {
                    const termMap = { 'Fall': 3, 'Spring': 1, 'Summer': 2 };
                    // Remove comma and other punctuation from term name
                    const termName = parts[0].replace(/[,\s]/g, '');
                    semester.extractedTerm = termMap[termName] || 0;
                    semester.extractedYear = parseInt(parts[parts.length - 1]) || 0;
                }
            }
        });
        
        // Sort semesters chronologically (oldest first) using either explicit year/term or extracted values
        const sortedSemesters = [...semesterData].sort((a, b) => {
            const aYear = a.year || a.extractedYear || 0;
            const bYear = b.year || b.extractedYear || 0;
            
            if (aYear !== bYear) {
                return aYear - bYear; // Sort by year first
            }
            
            const aTerm = a.term || a.extractedTerm || 0;
            const bTerm = b.term || b.extractedTerm || 0;
            return aTerm - bTerm; // Then by term (Spring=1, Summer=2, Fall=3)
        });
        
        // Prepare data for chart
        const labels = sortedSemesters.map(semester => semester.name);
        const cgpaData = sortedSemesters.map(semester => semester.gpa);
        
        // This array will store the CGPA value at each semester point
        const cumulativeGpa = [];
        
        // Running totals for CGPA calculation
        let totalWeightedPoints = 0;
        let totalCredits = 0;
        
        // Calculate CGPA for each semester point (cumulative)
        sortedSemesters.forEach((semester, index) => {
            // Get this semester's total points and credits
            let semesterPoints = 0;
            let semesterCredits = 0;
            
            semester.courses.forEach(course => {
                const credit = parseFloat(course.totalCredit);
                const gradePoint = parseFloat(course.pointEquivalent);
                
                if (!isNaN(credit) && !isNaN(gradePoint) && credit > 0) {
                    semesterPoints += credit * gradePoint;
                    semesterCredits += credit;
                }
            });
            
            // Add this semester's points and credits to the running total
            totalWeightedPoints += semesterPoints;
            totalCredits += semesterCredits;
            
            // Calculate the CGPA up to this semester
            const cgpaUpToThisSemester = totalCredits > 0 ? (totalWeightedPoints / totalCredits).toFixed(2) : '0.00';
            cumulativeGpa.push(cgpaUpToThisSemester);
        });
        
        // Create chart
        const ctx = cgpaChartCanvas.getContext('2d');
        
        // Destroy existing chart if it exists
        if (window.manualCgpaChart) {
            window.manualCgpaChart.destroy();
        }
          // Create beautiful chart - EXACT same as original
        window.manualCgpaChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Semester GPA',
                        data: cgpaData,
                        backgroundColor: 'transparent', // Remove area fill
                        borderColor: '#7be280', // Bright green for semester GPA
                        borderWidth: 3,
                        pointBackgroundColor: '#7be280',
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        pointBorderWidth: 2,
                        pointBorderColor: 'white',
                        tension: 0.2,
                        fill: false // Disable area fill
                    },
                    {
                        label: selectedSemesterName ? 'GPA' : 'Cumulative GPA',
                        data: cumulativeGpa,
                        backgroundColor: 'transparent', // Remove area fill
                        borderColor: '#4361EE', // Blue for cumulative GPA
                        borderWidth: 3,
                        pointBackgroundColor: '#4361EE',
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        pointBorderWidth: 2,
                        pointBorderColor: 'white',
                        tension: 0.2,
                        fill: false, // Disable area fill
                        // Hide the cumulative line when showing only one semester
                        hidden: selectedSemesterName ? true : false
                    }
                ]
            },            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: !!selectedSemesterName,
                        text: selectedSemesterName ? `Showing results for ${selectedSemesterName}` : '',
                        position: 'top',
                        padding: {
                            top: 10,
                            bottom: 10
                        },
                        font: {
                            size: 14
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 13
                        },
                        padding: 10,
                        cornerRadius: 4,
                        displayColors: true
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        // Dynamically set min and max based on the data
                        min: function(context) {
                            // Find the minimum value in all datasets
                            const minGpa = Math.min(...cgpaData.map(v => parseFloat(v)), ...cumulativeGpa.map(v => parseFloat(v)));
                            // Set the minimum to be slightly lower than the lowest value
                            // but never below 0 and with appropriate padding
                            return Math.max(0, Math.floor(minGpa * 10) / 10 - 0.2);
                        },
                        max: function(context) {
                            // Find the maximum value in all datasets
                            const maxGpa = Math.max(...cgpaData.map(v => parseFloat(v)), ...cumulativeGpa.map(v => parseFloat(v)));
                            // Set the maximum to be slightly higher than the highest value
                            // but never above 4.0 (the maximum possible GPA)
                            return Math.min(4.0, Math.ceil(maxGpa * 10) / 10 + 0.1);
                        },
                        // Force Y-axis to have same scale for both datasets
                        offset: false,
                        // Ensure Y-axis is not stacked
                        stacked: false,
                        // Ensure ticks are aligned
                        alignToPixels: true,
                        // Ensure same scale for all datasets
                        ticks: {
                            font: {
                                weight: 'bold'
                            },
                            callback: function(value) {
                                return value.toFixed(1);
                            },
                            // Ensure consistent spacing
                            stepSize: 0.1
                        },
                        // Ensure grid lines are consistent
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            drawTicks: true,
                            tickLength: 10
                        },
                        title: {
                            display: true,
                            text: 'GPA',
                            font: {
                                weight: 'bold'
                            }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Semester',
                            font: {
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            drawTicks: true,
                            tickLength: 10
                        },
                        ticks: {
                            font: {
                                weight: 'bold'
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    /**
     * Export results to PDF
     */
    exportToPdf() {
        if (!this.calculatedData || !this.calculatedData.semesters || this.calculatedData.semesters.length === 0) {
            alert('No data available to generate PDF. Please calculate CGPA first.');
            return;
        }

        try {
            // Create a new instance of ResultCard for PDF generation
            const resultCard = new ResultCard();
            
            // Prepare student info for PDF with all available fields
            const studentInfo = {
                studentName: this.studentInfo.name || 'Student Name',
                studentId: this.studentInfo.studentId || 'Student ID',
                programName: this.studentInfo.program || 'B.Sc. in Computer Science & Engineering',
                department: this.studentInfo.department || 'Department',
                batch: this.studentInfo.batch || 'Batch',
                campus: this.studentInfo.campus || 'Campus',
                faculty: this.studentInfo.faculty || 'Faculty',
                enrollmentSession: this.studentInfo.enrollmentSession || (this.studentInfo.studentId ? `${this.studentInfo.studentId.substring(0, 3)} Batch` : 'Enrollment Session'),
                totalCreditRequirement: this.studentInfo.totalCreditRequirement || '148',
                // Additional fields for transcript
                batchNo: this.studentInfo.batch || 'Batch',
                semesterName: this.studentInfo.enrollmentSession || 'Enrollment Session'
            };

            // Prepare semester data for PDF with proper chronological sorting
            const semesterData = this.calculatedData.semesters.map(semester => {
                const semesterInfo = {
                    id: semester.name || 'Unknown',
                    name: semester.name || 'Unknown Semester',
                    gpa: semester.gpa || '0.00',
                    totalCredits: semester.totalCredits || '0',
                    courses: semester.courses || []
                };
                
                // Extract year and term from semester name for proper sorting
                if (semester.name) {
                    const parts = semester.name.split(' ');
                    if (parts.length >= 2) {
                        const termMap = { 'Fall': 3, 'Spring': 1, 'Summer': 2 };
                        // Remove comma and other punctuation from term name
                        const termName = parts[0].replace(/[,\s]/g, '');
                        semesterInfo.extractedTerm = termMap[termName] || 0;
                        semesterInfo.extractedYear = parseInt(parts[parts.length - 1]) || 0;
                    }
                }
                
                return semesterInfo;
            });

            // Prepare CGPA data for PDF
            const cgpaData = {
                cgpa: this.calculatedData.cgpa || '0.00',
                totalCredits: this.calculatedData.totalCredits || '0'
            };

            // Generate PDF using the same method as the original fetch functionality
            resultCard.generatePdfTranscript(studentInfo, semesterData, cgpaData);
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('An error occurred while generating the PDF. Please try again.');
        }
    }

    /**
     * Export results to CSV
     */
    exportToCsv() {
        if (!this.calculatedData || !this.calculatedData.semesters || this.calculatedData.semesters.length === 0) {
            alert('No data available to export to CSV. Please calculate CGPA first.');
            return;
        }

        try {
            // Create CSV content
            let csvContent = 'Semester,GPA,Course Code,Course Name,Credits,Grade,Grade Points\n';
            
            this.calculatedData.semesters.forEach(semester => {
                // Add a row for each course in the semester
                semester.courses.forEach(course => {
                    // Escape CSV fields properly
                    const courseName = course.courseName || course.courseTitle || 'Unknown Course';
                    csvContent += `${Helpers.escapeCsv(semester.name)},${Helpers.escapeCsv(semester.gpa)},${Helpers.escapeCsv(course.courseCode || course.customCourseId || '-')},${Helpers.escapeCsv(courseName)},${Helpers.escapeCsv(course.totalCredit || '0')},${Helpers.escapeCsv(course.gradeLetter || '-')},${Helpers.escapeCsv(course.pointEquivalent || '0')}\n`;
                });
                
                // Add a summary row for the semester
                csvContent += `${Helpers.escapeCsv(semester.name + ' Summary')},${Helpers.escapeCsv(semester.gpa)},${Helpers.escapeCsv('Total Credits')},${Helpers.escapeCsv(semester.totalCredits)},,\n`;
            });
            
            // Add CGPA summary
            csvContent += `\n${Helpers.escapeCsv('Final CGPA')},${Helpers.escapeCsv(this.calculatedData.cgpa)},${Helpers.escapeCsv('Total Credits')},${Helpers.escapeCsv(this.calculatedData.totalCredits)},,\n`;
            
            // Create and trigger download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            
            // Set download attributes
            const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
            link.setAttribute('href', url);
            link.setAttribute('download', `manual-cgpa-calculation-${date}.csv`);
            link.style.display = 'none';
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            
            // Clean up
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 100);
            
        } catch (error) {
            console.error('Error exporting to CSV:', error);
            alert('An error occurred while exporting to CSV. Please try again.');
        }
    }

    /**
     * Load sample data for testing
     */
    loadSampleData() {
        // Fill in sample student info with all available fields
        document.getElementById('manual-student-name').value = 'Minhazul Abedin';
        document.getElementById('manual-student-id').value = '221-15-4919';
        document.getElementById('manual-department').value = 'Computer Science & Engineering';
        document.getElementById('manual-program').value = 'B.Sc. in Computer Science & Engineering';
        document.getElementById('manual-batch').value = '61';
        document.getElementById('manual-campus').value = 'Daffodil Smart City';
        document.getElementById('manual-faculty').value = 'Faculty of Science & Information Technology';
        document.getElementById('manual-enrollment-session').value = 'Spring 2022';
        document.getElementById('manual-total-credit-requirement').value = '148';

        // Clear existing semesters
        const container = document.getElementById('semester-input-list');
        container.innerHTML = '';

        // Add first semester with sample data
        this.addSemesterInput();
        const firstTextarea = document.querySelector('#semester-1-data');
        if (firstTextarea) {
            firstTextarea.value = `Result of Spring 2022
SL	Course Code	Course Title	Credit	Grade	Grade Point
1	CSE-115	Introduction to Biology and chemistry for Computation	2.00	A+	4.00
2	PHY-113	Basic Physics	2.00	A+	4.00
3	CSE112	Computer Fundamentals 	3.00	A+	4.00
4	ENG113	Basic Functional English and English Spoken	3.00	A-	3.50
5	PHY114	Basic Physics Lab	1.00	A+	4.00
6	MAT111	Basic Mathematics	3.00	A+	4.00
Total Credit	14.00	SGPA	3.89`;
            this.parseSemesterData(firstTextarea, 1);
        }

        // Add second semester with sample data
        this.addSemesterInput();
        const secondTextarea = document.querySelector('#semester-2-data');
        if (secondTextarea) {
            secondTextarea.value = `Result of Summer 2022
SL	Course Code	Course Title	Credit	Grade	Grade Point
1	MAT121	Mathematics-II: Calculus, Complex Variables and Linear Algebra	3.00	A+	4.00
2	ENG123	Writing and Comprehension	3.00	A+	4.00
Total Credit	6.00	SGPA	4.00`;
            this.parseSemesterData(secondTextarea, 2);
        }

        // Add third semester with sample data
        this.addSemesterInput();
        const thirdTextarea = document.querySelector('#semester-3-data');
        if (thirdTextarea) {
            thirdTextarea.value = `Result of Fall 2022
SL	Course Code	Course Title	Credit	Grade	Grade Point
1	GED121	Bangladesh Studies	3.00	A+	4.00
2	CSE132	Electrical Circuits	2.00	A+	4.00
3	CSE123	Problem Solving Lab	1.00	A+	4.00
4	CSE133	Electrical Circuits Lab	1.00	A+	4.00
5	CSE131	Discrete Mathematics	3.00	A+	4.00
6	GED131	Art of Living	3.00	A+	4.00
7	CSE122	Programming and Problem Solving	3.00	A+	4.00
8	CSE-124	Business Application Design and Employability	1.00	A+	4.00
Total Credit	17.00	SGPA	4.00`;
            this.parseSemesterData(thirdTextarea, 3);
        }

        // Add fourth semester with sample data
        this.addSemesterInput();
        const fourthTextarea = document.querySelector('#semester-4-data');
        if (fourthTextarea) {
            fourthTextarea.value = `Result of Spring 2023
SL	Course Code	Course Title	Credit	Grade	Grade Point
1	MAT211	Engineering Mathematics	3.00	A	3.75
2	CSE213	Basic Electronics Lab	2.00	A+	4.00
3	CSE215	Object Oriented Programming Lab	1.00	A+	4.00
4	CSE225	Data Communication	3.00	A+	4.00
5	CSE214	Object Oriented Programming	3.00	A+	4.00
6	CSE212	Basic Electronics	1.00	A+	4.00
7	GED216	History of Bangladesh and Bangla Language	3.00	A+	4.00
Total Credit	16.00	SGPA	3.95`;
            this.parseSemesterData(fourthTextarea, 4);
        }

        // Add fifth semester with sample data (Fall 2023)
        this.addSemesterInput();
        const fifthTextarea = document.querySelector('#semester-5-data');
        if (fifthTextarea) {
            fifthTextarea.value = `Result of Fall 2023
SL	Course Code	Course Title	Credit	Grade	Grade Point
1	ECO237	Economics	3.00	A+	4.00
2	CSE235	Numerical Methods	3.00	A+	4.00
3	CSE226	Software Project I	1.00	A+	4.00
4	STA227	Statistics and Probability	3.00	A+	4.00
5	CSE236	Software Project II	1.00	A+	4.00
6	CSE134	Data Structure	3.00	A+	4.00
7	CSE231	Algorithms	3.00	A+	4.00
8	CSE135	Data Structure Lab	1.00	A+	4.00
9	CSE232	Algorithms Lab	1.00	A+	4.00
Total Credit	19.00	SGPA	4.00`;
            this.parseSemesterData(fifthTextarea, 5);
        }

        // Add sixth semester with sample data (Spring 2024)
        this.addSemesterInput();
        const sixthTextarea = document.querySelector('#semester-6-data');
        if (sixthTextarea) {
            sixthTextarea.value = `Result of Spring 2024
SL	Course Code	Course Title	Credit	Grade	Grade Point
1	CSE315	Introduction to Data Science	3.00	A+	4.00
2	CSE334	Research and Innovation in CSE	1.00	A+	4.00
3	CSE316	Software Project III	1.00	A+	4.00
4	CSE224	Digital Electronics Lab	2.00	B	3.00
5	ACT322	Financial and Managerial Accounting	2.00	A+	4.00
6	CSE321	System Analysis & Design	3.00	A+	4.00
7	CSE222	Object Oriented Programming II Lab	2.00	A+	4.00
8	CSE221	Object Oriented Programming II	1.00	A+	4.00
9	CSE223	Digital Electronics	1.00	A+	4.00
Total Credit	16.00	SGPA	3.88`;
            this.parseSemesterData(sixthTextarea, 6);
        }

        // Add seventh semester with sample data (Fall 2024)
        this.addSemesterInput();
        const seventhTextarea = document.querySelector('#semester-7-data');
        if (seventhTextarea) {
            seventhTextarea.value = `Result of Fall 2024
SL	Course Code	Course Title	Credit	Grade	Grade Point
1	CSE313	Computer Networks	3.00	A+	4.00
2	CSE325	Data Mining and Machine Learning	3.00	A+	4.00
3	CSE445	Natural Language Processing	3.00	A+	4.00
4	CSE311	Database Management System	3.00	A+	4.00
5	CSE326	Data Mining and Machine Learning Lab	1.00	A+	4.00
6	CSE324	Operating Systems Lab.	2.00	A+	4.00
7	CSE323	Operating Systems	2.00	A+	4.00
8	CSE312	Database Management System Lab	1.00	A+	4.00
9	CSE314	Computer Networks Lab	1.00	A+	4.00
Total Credit	19.00	SGPA	4.00`;
            this.parseSemesterData(seventhTextarea, 7);
        }

        // Add eighth semester with sample data (Spring 2025)
        this.addSemesterInput();
        const eighthTextarea = document.querySelector('#semester-8-data');
        if (eighthTextarea) {
            eighthTextarea.value = `Result of Spring 2025
SL	Course Code	Course Title	Credit	Grade	Grade Point
1	CSE412	Artificial Intelligence Lab	1.00	A+	4.00
2	CSE413	Mobile Application Design	1.00	A+	4.00
3	CSE414	Mobile Application Design Lab	2.00	A+	4.00
4	CSE332	Compiler Design Lab	1.00	A+	4.00
5	CSE411	Artificial Intelligence	3.00	A+	4.00
6	CSE335	Computer Architecture and Organization	3.00	A+	4.00
7	CSE331	Compiler Design	3.00	A+	4.00
Total Credit	14.00	SGPA	4.00`;
            this.parseSemesterData(eighthTextarea, 8);
        }

        // Add ninth semester with sample data (Summer 2025)
        this.addSemesterInput();
        const ninthTextarea = document.querySelector('#semester-9-data');
        if (ninthTextarea) {
            ninthTextarea.value = `Result of Summer 2025
SL	Course Code	Course Title	Credit	Grade	Grade Point
1	CSE333	Software Engineering	3.00	A+	4.00
2	CSE415	Web Engineering	2.00	A+	4.00
3	CSE416	Web Engineering Lab	2.00	A+	4.00
4	CSE234	Embedded Systems and IoT Lab	2.00	A+	4.00
5	CSE233	Embedded Systems and IoT	2.00	A+	4.00
Total Credit	11.00	SGPA	4.00`;
            this.parseSemesterData(ninthTextarea, 9);
        }

        // Add tenth semester with sample data (Fall 2025)
        this.addSemesterInput();
        const tenthTextarea = document.querySelector('#semester-10-data');
        if (tenthTextarea) {
            tenthTextarea.value = `Result of Fall 2025
SL	Course Code	Course Title	Credit	Grade	Grade Point
1	CSE422	Computer Graphics Lab	2.00	A+	4.00
2	CSE431	Social and Professional Issues in Computing	3.00	A+	4.00
3	CSE423	Information Security	3.00	A+	4.00
4	CSE421	Computer Graphics	2.00	A+	4.00
Total Credit	10.00	SGPA	4.00`;
            this.parseSemesterData(tenthTextarea, 10);
        }

        // Add Project/Thesis/Internship sample data
        this.toggleProjectInput(); // Show the project input
        document.getElementById('project-course-code').value = 'CSE 499';
        document.getElementById('project-credits').value = '6.00';
        document.getElementById('project-gpa').value = '4.00';

        // Show a notification
        this.showNotification('Sample data loaded successfully! You can now calculate CGPA or modify the data as needed.', 'success');
    }

    /**
     * Show notification to user
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `gh-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 9999;
            animation: slideInRight 0.3s ease-out;
            max-width: 400px;
        `;

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        // Add to page
        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease-in reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize manual CGPA input system
let manualCgpaInput;
document.addEventListener('DOMContentLoaded', () => {
    try {
        manualCgpaInput = new ManualCgpaInput();
    } catch (error) {
        console.error('Error initializing ManualCgpaInput:', error);
        // Retry after a delay
        setTimeout(() => {
            try {
                manualCgpaInput = new ManualCgpaInput();
            } catch (retryError) {
                console.error('Retry failed for ManualCgpaInput:', retryError);
            }
        }, 1000);
    }
});

// Export for global access
window.ManualCgpaInput = ManualCgpaInput;
