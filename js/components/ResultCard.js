/**
 * ResultCard Component for DIU CGPA
 * Displays a single semester's results in clean table format
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
            <div class="semester-card ${openClass}" id="${cardId}">
                <div class="semester-header" id="${headerId}">
                    <div class="semester-title">${name}</div>
                    <div style="display: inline-block; border: 2px solid #4CAF50; border-radius: 5px; padding: 5px 10px;">
                        <span style="font-weight: bold;">GPA: ${gpa}</span>
                        <span style="margin-left: 10px;">Credits: ${totalCredits}</span>
                    </div>
                </div>
                <div class="semester-content" id="${collapseId}">
                    <table class="results-table">
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
     * Generate a PDF academic transcript for the student
     * @param {Object} studentInfo - Student information object
     * @param {Array} semesterData - Array of semester data
     * @param {Object} cgpaData - Object containing CGPA and total credits
     */
    generatePdfTranscript(studentInfo, semesterData, cgpaData) {
        const htmlTemplate = this.createTranscriptHtml(studentInfo, semesterData, cgpaData);
        
        // Options for html2pdf - exactly matched to design requirements
        const options = {
            margin: [10, 10],
            filename: `${studentInfo.studentId}_transcript.pdf`,
            image: { type: 'jpeg', quality: 1.0 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: 'avoid-all' }
        };

        // Generate PDF
        html2pdf().set(options).from(htmlTemplate).save();
    }

    /**
     * Create HTML for transcript
     * @param {Object} studentInfo - Student information
     * @param {Array} semesterData - Array of semester data
     * @param {Object} cgpaData - Object containing CGPA and total credits
     * @returns {HTMLElement} HTML element for the transcript
     */
    createTranscriptHtml(studentInfo, semesterData, cgpaData) {
        // Create transcript container - matched to A4 paper size
        const container = document.createElement('div');
        container.className = 'transcript-container';
        container.style.width = '210mm';
        container.style.minHeight = '297mm';
        container.style.padding = '10mm';
        container.style.margin = '0 auto';
        container.style.backgroundColor = '#fff';
        container.style.color = '#000';
        container.style.fontFamily = 'Arial, sans-serif';
        container.style.fontSize = '10pt';
        container.style.boxSizing = 'border-box';
        
        // Add transcript header
        container.appendChild(this.createTranscriptHeader());
        
        // Add program and student information section
        container.appendChild(this.createStudentSection(studentInfo));
        
        // Add semester results (will handle pagination) - this needs to be exactly like the image
        this.appendSemesterTables(container, semesterData);
        
        // Add transcript footer
        container.appendChild(this.createTranscriptFooter());
        
        return container;
    }

    /**
     * Create transcript header section with university logo and title
     * @returns {HTMLElement} Header section
     */
    createTranscriptHeader() {
        const header = document.createElement('div');
        header.className = 'transcript-header';
        header.style.textAlign = 'center';
        header.style.marginBottom = '10mm';
        
        // University Logo
        const logo = document.createElement('img');
        logo.src = 'assets/img/diu-logo.svg';
        logo.alt = 'Daffodil International University';
        logo.style.height = '20mm';
        logo.style.marginBottom = '5mm';
        
        // University Address and Contact Information
        const addressText = document.createElement('div');
        addressText.style.fontSize = '9pt';
        addressText.style.lineHeight = '1.3';
        addressText.innerHTML = `
            Daffodil International University, Daffodil Smart City, Birulia, Savar, Dhaka-1216 Bangladesh<br>
            Tel: +88 02 9143254-5, 48111639, 48111670, 8411470(Ext. 01)/1350091, 01713485941, 01611458841, 01841149850<br>
            E-mail: info@daffodilvarsity.edu.bd, Fax: +88 02 9131947
        `;
        
        // Transcript Title
        const title = document.createElement('div');
        title.style.fontWeight = 'bold';
        title.style.fontSize = '16pt';
        title.style.marginTop = '5mm';
        title.textContent = 'Transcript';
        
        header.appendChild(logo);
        header.appendChild(addressText);
        header.appendChild(title);
        
        return header;
    }

    /**
     * Create student information and program section
     * @param {Object} studentInfo - Student information
     * @returns {HTMLElement} Student section
     */
    createStudentSection(studentInfo) {
        const section = document.createElement('div');
        section.className = 'student-section';
        section.style.marginBottom = '10mm';
        
        // Program heading - exactly like in the image
        const program = document.createElement('div');
        program.style.fontStyle = 'italic';
        program.style.marginBottom = '5mm';
        program.innerHTML = '<strong>Program:</strong> 4-Year B.Sc. in Computer Science and Engineering';
        
        // Create a table layout for student info
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        
        const tbody = document.createElement('tbody');
        
        // Row 1: Student Name
        const row1 = document.createElement('tr');
        const nameLabel = document.createElement('td');
        nameLabel.style.width = '130px';
        nameLabel.textContent = 'Name of the Student';
        
        const nameValue = document.createElement('td');
        nameValue.textContent = ': ' + (studentInfo.studentName || studentInfo.name || '');
        
        const sessionLabel = document.createElement('td');
        sessionLabel.style.width = '130px';
        sessionLabel.textContent = 'Enrollment Session';
        
        const sessionValue = document.createElement('td');
        sessionValue.textContent = ': ' + (studentInfo.enrollmentSession || 'Spring 2022');
        
        row1.appendChild(nameLabel);
        row1.appendChild(nameValue);
        row1.appendChild(sessionLabel);
        row1.appendChild(sessionValue);
        
        // Row 2: Student ID and Date of Issue
        const row2 = document.createElement('tr');
        const idLabel = document.createElement('td');
        idLabel.textContent = 'Student ID';
        
        const idValue = document.createElement('td');
        idValue.textContent = ': ' + (studentInfo.studentId || studentInfo.id || '');
        
        const issueLabel = document.createElement('td');
        issueLabel.textContent = 'Date of Issue';
        
        const today = new Date();
        const issueValue = document.createElement('td');
        issueValue.textContent = ': ' + today.toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        row2.appendChild(idLabel);
        row2.appendChild(idValue);
        row2.appendChild(issueLabel);
        row2.appendChild(issueValue);
        
        // Row 3: Batch
        const row3 = document.createElement('tr');
        const batchLabel = document.createElement('td');
        batchLabel.textContent = 'Batch';
        
        const batchValue = document.createElement('td');
        batchValue.textContent = ': ' + (studentInfo.batch || studentInfo.batchNo || '61');
        
        row3.appendChild(batchLabel);
        row3.appendChild(batchValue);
        row3.appendChild(document.createElement('td'));
        row3.appendChild(document.createElement('td'));
        
        // Add rows to table
        tbody.appendChild(row1);
        tbody.appendChild(row2);
        tbody.appendChild(row3);
        table.appendChild(tbody);
        
        section.appendChild(program);
        section.appendChild(table);
        
        return section;
    }

    /**
     * Append all semester tables to the container
     * @param {HTMLElement} container - The container element
     * @param {Array} semesterData - Array of semester data objects
     */
    appendSemesterTables(container, semesterData) {
        if (!semesterData || semesterData.length === 0) {
            const noData = document.createElement('div');
            noData.textContent = 'No semester data available';
            container.appendChild(noData);
            return;
        }
        
        // Sort semesters chronologically (oldest first) as in the image
        const sortedSemesters = [...semesterData].sort((a, b) => a.id.localeCompare(b.id));
        
        // Add each semester table
        sortedSemesters.forEach(semester => {
            container.appendChild(this.createSemesterTable(semester));
        });
    }

    /**
     * Create a semester table using the exact layout from the image
     * @param {Object} semester - Semester data
     * @returns {HTMLElement} Semester table
     */
    createSemesterTable(semester) {
        const tableContainer = document.createElement('div');
        tableContainer.className = 'semester-table-container';
        tableContainer.style.marginBottom = '10mm';
        tableContainer.style.pageBreakInside = 'avoid';
        
        // Semester header table
        const headerRow = document.createElement('table');
        headerRow.style.width = '100%';
        headerRow.style.borderCollapse = 'collapse';
        headerRow.style.marginBottom = '2mm';
        
        const headerRowBody = document.createElement('tbody');
        const semRow = document.createElement('tr');
        
        const semCell = document.createElement('td');
        semCell.textContent = 'Semester';
        semCell.style.width = '80px';
        semCell.style.fontSize = '10pt';
        
        const semValueCell = document.createElement('td');
        semValueCell.textContent = semester.name || 'Spring 2025';
        semValueCell.style.fontWeight = 'normal';
        
        semRow.appendChild(semCell);
        semRow.appendChild(semValueCell);
        headerRowBody.appendChild(semRow);
        headerRow.appendChild(headerRowBody);
        
        // Create main table
        const table = document.createElement('table');
        table.className = 'semester-table';
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.border = '1px solid #000';
        
        // Table header
        const thead = document.createElement('thead');
        const headerTr = document.createElement('tr');
        
        // Create header cells based on exact image layout
        const headers = ['Course Code', 'Course Title', 'Credit', 'Grade', 'Grade Point', 'GPA'];
        const widths = ['100px', '', '50px', '60px', '80px', '50px'];
        
        headers.forEach((text, idx) => {
            const th = document.createElement('th');
            th.textContent = text;
            th.style.border = '1px solid #000';
            th.style.padding = '3px 5px';
            th.style.textAlign = idx === 1 ? 'left' : 'center';
            th.style.fontWeight = 'bold';
            if (widths[idx]) th.style.width = widths[idx];
            headerTr.appendChild(th);
        });
        
        thead.appendChild(headerTr);
        table.appendChild(thead);
        
        // Table body
        const tbody = document.createElement('tbody');
        
        // Add course rows
        if (semester.courses && semester.courses.length > 0) {
            semester.courses.forEach(course => {
                const tr = document.createElement('tr');
                
                // Course code
                const codeCell = document.createElement('td');
                codeCell.textContent = course.courseCode || 'CSE332';
                codeCell.style.border = '1px solid #000';
                codeCell.style.padding = '3px 5px';
                codeCell.style.textAlign = 'center';
                
                // Course title
                const titleCell = document.createElement('td');
                titleCell.textContent = course.courseName || course.courseTitle || 'Computer Design Lab';
                titleCell.style.border = '1px solid #000';
                titleCell.style.padding = '3px 5px';
                
                // Credit
                const creditCell = document.createElement('td');
                creditCell.textContent = course.totalCredit || '1';
                creditCell.style.border = '1px solid #000';
                creditCell.style.padding = '3px 5px';
                creditCell.style.textAlign = 'center';
                
                // Grade
                const gradeCell = document.createElement('td');
                gradeCell.textContent = course.gradeLetter || course.grade || 'A+';
                gradeCell.style.border = '1px solid #000';
                gradeCell.style.padding = '3px 5px';
                gradeCell.style.textAlign = 'center';
                
                // Grade point
                const pointCell = document.createElement('td');
                pointCell.textContent = course.pointEquivalent || '4.00';
                pointCell.style.border = '1px solid #000';
                pointCell.style.padding = '3px 5px';
                pointCell.style.textAlign = 'center';
                
                // GPA column - empty for course rows
                const gpaCell = document.createElement('td');
                gpaCell.style.border = '1px solid #000';
                gpaCell.style.padding = '3px 5px';
                gpaCell.style.textAlign = 'center';
                
                tr.appendChild(codeCell);
                tr.appendChild(titleCell);
                tr.appendChild(creditCell);
                tr.appendChild(gradeCell);
                tr.appendChild(pointCell);
                tr.appendChild(gpaCell);
                
                tbody.appendChild(tr);
            });
            
            // Add the semester GPA row at the bottom - exactly like in the image
            const gpaRow = document.createElement('tr');
            
            // Empty cells for course code and title
            const emptyCell1 = document.createElement('td');
            emptyCell1.colSpan = 5;
            emptyCell1.style.border = '1px solid #000';
            emptyCell1.style.padding = '3px 5px';
            emptyCell1.textContent = '';
            
            // GPA cell
            const semesterGpaCell = document.createElement('td');
            semesterGpaCell.textContent = semester.gpa || '4.00';
            semesterGpaCell.style.border = '1px solid #000';
            semesterGpaCell.style.padding = '3px 5px';
            semesterGpaCell.style.textAlign = 'center';
            semesterGpaCell.style.fontWeight = 'bold';
            
            gpaRow.appendChild(emptyCell1);
            gpaRow.appendChild(semesterGpaCell);
            
            tbody.appendChild(gpaRow);
        } else {
            // No courses found
            const noCoursesRow = document.createElement('tr');
            const noCoursesCell = document.createElement('td');
            noCoursesCell.colSpan = 6;
            noCoursesCell.textContent = 'No courses found for this semester';
            noCoursesCell.style.border = '1px solid #000';
            noCoursesCell.style.padding = '10px';
            noCoursesCell.style.textAlign = 'center';
            
            noCoursesRow.appendChild(noCoursesCell);
            tbody.appendChild(noCoursesRow);
        }
        
        table.appendChild(tbody);
        tableContainer.appendChild(headerRow);
        tableContainer.appendChild(table);
        
        return tableContainer;
    }

    /**
     * Create transcript footer with disclaimer text
     * @returns {HTMLElement} Footer element
     */
    createTranscriptFooter() {
        const footer = document.createElement('div');
        footer.className = 'transcript-footer';
        footer.style.marginTop = '20mm';
        footer.style.textAlign = 'center';
        footer.style.fontSize = '9pt';
        footer.style.color = '#555';
        
        const disclaimer = document.createElement('p');
        disclaimer.textContent = 'This is not a official document. Generated with DIUCGPA';
        
        footer.appendChild(disclaimer);
        
        return footer;
    }
}

// Export as global variable
window.ResultCard = ResultCard;