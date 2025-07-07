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

        // Export buttons
        document.getElementById('manual-save-pdf-btn')?.addEventListener('click', () => {
            this.exportToPdf();
        });

        document.getElementById('manual-export-csv-btn')?.addEventListener('click', () => {
            this.exportToCsv();
        });

        // Add first semester input by default
        this.addSemesterInput();
    }

    /**
     * Add a new semester input area
     */
    addSemesterInput() {
        const container = document.getElementById('semester-input-list');
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

Result of Spring, 2025
SL	Course Code	Course Title	Credit	Grade	Grade Point
1	CSE412	Artificial Intelligence Lab	1.00	A+	4.00
2	CSE332	Compiler Design Lab	1.00	A+	4.00
3	CSE413	Mobile Application Design	1.00	A+	4.00
4	CSE414	Mobile Application Design Lab	2.00	A+	4.00
5	CSE331	Compiler Design	3.00	A+	4.00
6	CSE411	Artificial Intelligence	3.00	A+	4.00
7	CSE335	Computer Architecture and Organization	3.00	A+	4.00
Total Credit	14.00	SGPA	4.00

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
        // Hide student information section
        const studentInfoSection = document.querySelector('.gh-box:has(#manual-student-name)') || 
                                  document.querySelector('[data-section="student-info"]');
        if (!studentInfoSection) {
            // Try to find it by looking for the student info form elements
            const studentNameInput = document.getElementById('manual-student-name');
            if (studentNameInput) {
                const parentBox = studentNameInput.closest('.gh-box');
                if (parentBox) {
                    parentBox.style.display = 'none';
                }
            }
        } else {
            studentInfoSection.style.display = 'none';
        }

        // Hide semester results input section
        const semesterSection = document.querySelector('.gh-box:has(#semester-input-list)');
        if (!semesterSection) {
            // Try to find it by looking for the semester input list
            const semesterInputList = document.getElementById('semester-input-list');
            if (semesterInputList) {
                const parentBox = semesterInputList.closest('.gh-box');
                if (parentBox) {
                    parentBox.style.display = 'none';
                }
            }
        } else {
            semesterSection.style.display = 'none';
        }

        // Hide calculate button section
        const calculateSection = document.querySelector('.gh-box:has(#calculate-manual-cgpa-btn)');
        if (!calculateSection) {
            const calculateBtn = document.getElementById('calculate-manual-cgpa-btn');
            if (calculateBtn) {
                const parentBox = calculateBtn.closest('.gh-box');
                if (parentBox) {
                    parentBox.style.display = 'none';
                }
            }
        } else {
            calculateSection.style.display = 'none';
        }
    }

    /**
     * Show input sections (student info and semester inputs) - used on error
     */
    showInputSections() {
        // Show student information section
        const studentInfoSection = document.querySelector('.gh-box:has(#manual-student-name)') || 
                                  document.querySelector('[data-section="student-info"]');
        if (!studentInfoSection) {
            const studentNameInput = document.getElementById('manual-student-name');
            if (studentNameInput) {
                const parentBox = studentNameInput.closest('.gh-box');
                if (parentBox) {
                    parentBox.style.display = 'block';
                }
            }
        } else {
            studentInfoSection.style.display = 'block';
        }

        // Show semester results input section
        const semesterSection = document.querySelector('.gh-box:has(#semester-input-list)');
        if (!semesterSection) {
            const semesterInputList = document.getElementById('semester-input-list');
            if (semesterInputList) {
                const parentBox = semesterInputList.closest('.gh-box');
                if (parentBox) {
                    parentBox.style.display = 'block';
                }
            }
        } else {
            semesterSection.style.display = 'block';
        }

        // Show calculate button section
        const calculateSection = document.querySelector('.gh-box:has(#calculate-manual-cgpa-btn)');
        if (!calculateSection) {
            const calculateBtn = document.getElementById('calculate-manual-cgpa-btn');
            if (calculateBtn) {
                const parentBox = calculateBtn.closest('.gh-box');
                if (parentBox) {
                    parentBox.style.display = 'block';
                }
            }
        } else {
            calculateSection.style.display = 'block';
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

        // Provide feedback to user
        if (totalProcessed === 0) {
            throw new Error('No semester data entered. Please paste your result data in at least one semester field.');
        }

        if (allCourses.length === 0) {
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
            errorCount: totalErrors
        };
    }

    /**
     * Create mock API response structure
     */
    createMockApiResponse(semesterData) {
        // Group courses by semester
        const semesterGroups = {};
        
        semesterData.semesters.forEach((semester, index) => {
            const semesterId = (100 + index).toString(); // Generate mock semester IDs
            semesterGroups[semesterId] = semester.courses;
        });

        return {
            studentInfo: this.studentInfo,
            results: semesterGroups,
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
        const semesterData = [];
        
        Object.entries(semesterResults).forEach(([semesterId, courses], index) => {
            const semesterGpa = this.calculator.calculateSemesterGpa(courses);
            const semester = {
                id: semesterId,
                name: `Semester ${index + 1}`,
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
     * Custom student info renderer for manual input that excludes Batch, Faculty, and Campus
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
                <div class="department-display">
                    <div class="department-value">${department}</div>
                    <div class="department-label">Department</div>
                </div>
                <div class="student-stats">
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
                    semester.extractedTerm = termMap[parts[0]] || 0;
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
                // Additional fields for transcript
                batchNo: this.studentInfo.batch || 'Batch',
                semesterName: this.studentInfo.enrollmentSession || 'Enrollment Session'
            };

            // Prepare semester data for PDF
            const semesterData = this.calculatedData.semesters.map(semester => ({
                id: semester.name || 'Unknown',
                name: semester.name || 'Unknown Semester',
                gpa: semester.gpa || '0.00',
                totalCredits: semester.totalCredits || '0',
                courses: semester.courses || []
            }));

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
                    // Handle commas in course names
                    const escapedName = (course.courseName || course.courseTitle || 'Unknown Course').includes(',') 
                        ? `"${course.courseName || course.courseTitle || 'Unknown Course'}"` 
                        : (course.courseName || course.courseTitle || 'Unknown Course');
                    
                    csvContent += `${semester.name},${semester.gpa},${course.courseCode || course.customCourseId || '-'},${escapedName},${course.totalCredit || '0'},${course.gradeLetter || '-'},${course.pointEquivalent || '0'}\n`;
                });
                
                // Add a summary row for the semester
                csvContent += `${semester.name} Summary,${semester.gpa},Total Credits,${semester.totalCredits},,\n`;
            });
            
            // Add CGPA summary
            csvContent += `\nFinal CGPA,${this.calculatedData.cgpa},Total Credits,${this.calculatedData.totalCredits},,\n`;
            
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

        // Clear existing semesters
        const container = document.getElementById('semester-input-list');
        container.innerHTML = '';

        // Add first semester with sample data
        this.addSemesterInput();
        const firstTextarea = document.querySelector('#semester-1-data');
        if (firstTextarea) {
            firstTextarea.value = `Result of Spring, 2025
SL	Course Code	Course Title	Credit	Grade	Grade Point
1	CSE412	Artificial Intelligence Lab	1.00	A+	4.00
2	CSE332	Compiler Design Lab	1.00	A+	4.00
3	CSE413	Mobile Application Design	1.00	A+	4.00
4	CSE414	Mobile Application Design Lab	2.00	A+	4.00
5	CSE331	Compiler Design	3.00	A+	4.00
6	CSE411	Artificial Intelligence	3.00	A+	4.00
7	CSE335	Computer Architecture and Organization	3.00	A+	4.00
Total Credit	14.00	SGPA	4.00`;
            this.parseSemesterData(firstTextarea, 1);
        }

        // Add second semester with sample data
        this.addSemesterInput();
        const secondTextarea = document.querySelector('#semester-2-data');
        if (secondTextarea) {
            secondTextarea.value = `Result of Fall, 2024
SL	Course Code	Course Title	Credit	Grade	Grade Point
1	CSE321	Database Management System	3.00	A	3.75
2	CSE322	Database Management System Lab	1.00	A+	4.00
3	CSE323	Operating System and System Programming	3.00	A-	3.50
4	CSE324	Operating System and System Programming Lab	1.00	A	3.75
5	CSE325	Computer Networks	3.00	B+	3.25
6	CSE326	Computer Networks Lab	1.00	A+	4.00
7	ENG213	English Composition	3.00	A	3.75
Total Credit	15.00	SGPA	3.68`;
            this.parseSemesterData(secondTextarea, 2);
        }

        // Add third semester with sample data
        this.addSemesterInput();
        const thirdTextarea = document.querySelector('#semester-3-data');
        if (thirdTextarea) {
            thirdTextarea.value = `Result of Summer, 2024
SL	Course Code	Course Title	Credit	Grade	Grade Point
1	CSE211	Data Structure and Algorithm	3.00	A+	4.00
2	CSE212	Data Structure and Algorithm Lab	1.00	A+	4.00
3	CSE213	Object Oriented Programming	3.00	A	3.75
4	CSE214	Object Oriented Programming Lab	1.00	A+	4.00
5	MAT215	Calculus and Analytical Geometry	3.00	B+	3.25
6	PHY216	Physics II	3.00	B	3.00
7	PHY217	Physics II Lab	1.00	A-	3.50
Total Credit	15.00	SGPA	3.64`;
            this.parseSemesterData(thirdTextarea, 3);
        }

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
    manualCgpaInput = new ManualCgpaInput();
});

// Export for global access
window.ManualCgpaInput = ManualCgpaInput;
