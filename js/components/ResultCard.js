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
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
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
        // Create transcript container
        const container = document.createElement('div');
        container.className = 'transcript-container';
        container.style.fontFamily = 'Arial, sans-serif';
        container.style.padding = '20px';
        container.style.maxWidth = '800px';
        container.style.margin = '0 auto';
        container.style.backgroundColor = '#fff';
        container.style.color = '#333';

        // Add transcript header
        container.appendChild(this.createTranscriptHeader());
        
        // Add student information
        container.appendChild(this.createStudentInfoSection(studentInfo));
        
        // Add transcript summary (CGPA, Credits)
        container.appendChild(this.createTranscriptSummary(cgpaData));
        
        // Add semester results
        const semesterResults = document.createElement('div');
        semesterResults.className = 'transcript-semester-results';
        
        // Sort semesters chronologically (oldest first) for transcript
        const sortedSemesters = [...semesterData].sort((a, b) => a.id.localeCompare(b.id));
        
        // Create semester tables (potentially across multiple pages)
        sortedSemesters.forEach(semester => {
            semesterResults.appendChild(this.createSemesterSection(semester));
        });
        
        container.appendChild(semesterResults);
        
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
        header.style.display = 'flex';
        header.style.alignItems = 'center';
        header.style.marginBottom = '20px';
        header.style.borderBottom = '2px solid #0d6efd';
        header.style.paddingBottom = '15px';
        
        // Logo container
        const logoContainer = document.createElement('div');
        logoContainer.style.width = '80px';
        logoContainer.style.marginRight = '20px';
        
        // Logo
        const logo = document.createElement('img');
        logo.src = 'assets/img/diu-logo.svg';
        logo.alt = 'DIU Logo';
        logo.style.width = '100%';
        logo.style.height = 'auto';
        
        logoContainer.appendChild(logo);
        
        // Title container
        const titleContainer = document.createElement('div');
        titleContainer.style.flex = '1';
        titleContainer.style.textAlign = 'center';
        
        // University name
        const universityName = document.createElement('h2');
        universityName.textContent = 'Daffodil International University';
        universityName.style.margin = '0';
        universityName.style.fontSize = '22px';
        universityName.style.fontWeight = 'bold';
        universityName.style.color = '#1a1c2c';
        
        // Transcript title
        const transcriptTitle = document.createElement('h3');
        transcriptTitle.textContent = 'Transcript';
        transcriptTitle.style.margin = '5px 0';
        transcriptTitle.style.fontSize = '18px';
        transcriptTitle.style.fontWeight = 'bold';
        
        // Address
        const address = document.createElement('p');
        address.textContent = 'Daffodil Smart City, Birulia, Savar, Dhaka - 1216, Bangladesh';
        address.style.margin = '5px 0';
        address.style.fontSize = '12px';
        address.style.color = '#666';
        
        // Contact info
        const contact = document.createElement('p');
        contact.innerHTML = 'Tel: +88 02 55034041-5, +88 09613-855544, Fax: +88 02 55034047<br>Email: info@daffodilvarsity.edu.bd, Web: www.daffodilvarsity.edu.bd';
        contact.style.margin = '5px 0';
        contact.style.fontSize = '12px';
        contact.style.color = '#666';
        
        titleContainer.appendChild(universityName);
        titleContainer.appendChild(transcriptTitle);
        titleContainer.appendChild(address);
        titleContainer.appendChild(contact);
        
        header.appendChild(logoContainer);
        header.appendChild(titleContainer);
        
        return header;
    }

    /**
     * Create student information section
     * @param {Object} studentInfo - Student information
     * @returns {HTMLElement} Student info section
     */
    createStudentInfoSection(studentInfo) {
        const section = document.createElement('div');
        section.className = 'transcript-student-info';
        section.style.marginBottom = '20px';
        section.style.padding = '15px';
        section.style.backgroundColor = '#f8f9fa';
        section.style.borderRadius = '6px';
        section.style.border = '1px solid #e2e8f0';
        
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        
        // Add student info rows
        const infoRows = [
            { label: 'Program', value: studentInfo.program || '4-Year B.Sc. in Computer Science and Engineering' },
            { label: 'Name of the Student', value: studentInfo.studentName },
            { label: 'Student ID', value: studentInfo.studentId },
            { label: 'Batch', value: studentInfo.batch || '' },
            { label: 'Enrollment Session', value: studentInfo.enrollmentSession || '' },
            { label: 'Date of Issue', value: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' }) }
        ];
        
        infoRows.forEach(row => {
            const tr = document.createElement('tr');
            
            const th = document.createElement('th');
            th.textContent = row.label;
            th.style.textAlign = 'left';
            th.style.padding = '8px';
            th.style.fontWeight = '600';
            th.style.width = '30%';
            
            const td = document.createElement('td');
            td.textContent = row.value;
            td.style.padding = '8px';
            
            tr.appendChild(th);
            tr.appendChild(td);
            table.appendChild(tr);
        });
        
        section.appendChild(table);
        return section;
    }

    /**
     * Create transcript summary section with CGPA and credits
     * @param {Object} cgpaData - CGPA data object
     * @returns {HTMLElement} Summary section
     */
    createTranscriptSummary(cgpaData) {
        const summary = document.createElement('div');
        summary.className = 'transcript-summary';
        summary.style.marginBottom = '30px';
        
        const table = document.createElement('table');
        table.className = 'transcript-summary-table';
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.border = '1px solid #e2e8f0';
        
        // Table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        ['CGPA', 'Total Credits', 'Issue Date'].forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            th.style.textAlign = 'center';
            th.style.padding = '12px';
            th.style.backgroundColor = '#f7fafc';
            th.style.fontWeight = '600';
            th.style.border = '1px solid #e2e8f0';
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Table body
        const tbody = document.createElement('tbody');
        const row = document.createElement('tr');
        
        // CGPA
        const cgpaCell = document.createElement('td');
        cgpaCell.textContent = cgpaData.cgpa;
        cgpaCell.style.textAlign = 'center';
        cgpaCell.style.padding = '12px';
        cgpaCell.style.border = '1px solid #e2e8f0';
        cgpaCell.style.fontWeight = 'bold';
        
        // Total credits
        const creditsCell = document.createElement('td');
        creditsCell.textContent = cgpaData.totalCredits;
        creditsCell.style.textAlign = 'center';
        creditsCell.style.padding = '12px';
        creditsCell.style.border = '1px solid #e2e8f0';
        
        // Issue date
        const dateCell = document.createElement('td');
        dateCell.textContent = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' });
        dateCell.style.textAlign = 'center';
        dateCell.style.padding = '12px';
        dateCell.style.border = '1px solid #e2e8f0';
        
        row.appendChild(cgpaCell);
        row.appendChild(creditsCell);
        row.appendChild(dateCell);
        tbody.appendChild(row);
        table.appendChild(tbody);
        
        summary.appendChild(table);
        return summary;
    }

    /**
     * Create a section for a semester
     * @param {Object} semester - Semester data
     * @returns {HTMLElement} Semester section
     */
    createSemesterSection(semester) {
        const section = document.createElement('div');
        section.className = 'transcript-semester';
        section.style.marginBottom = '20px';
        
        // Semester header
        const header = document.createElement('div');
        header.className = 'transcript-semester-header';
        header.style.backgroundColor = '#f7fafc';
        header.style.padding = '10px 15px';
        header.style.border = '1px solid #e2e8f0';
        header.style.borderTopLeftRadius = '6px';
        header.style.borderTopRightRadius = '6px';
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        
        // Semester title
        const title = document.createElement('h4');
        title.textContent = semester.name;
        title.style.margin = '0';
        title.style.fontSize = '16px';
        title.style.fontWeight = '600';
        
        // Semester stats
        const stats = document.createElement('div');
        stats.className = 'transcript-semester-stats';
        stats.style.display = 'flex';
        stats.style.gap = '15px';
        
        // GPA
        const gpa = document.createElement('span');
        gpa.textContent = `GPA: ${semester.gpa}`;
        gpa.style.fontSize = '14px';
        gpa.style.fontWeight = '500';
        
        // Credits
        const credits = document.createElement('span');
        credits.textContent = `Credits: ${semester.totalCredits}`;
        credits.style.fontSize = '14px';
        credits.style.fontWeight = '500';
        
        stats.appendChild(gpa);
        stats.appendChild(credits);
        
        header.appendChild(title);
        header.appendChild(stats);
        
        // Courses table
        const coursesTable = document.createElement('table');
        coursesTable.className = 'transcript-semester-table';
        coursesTable.style.width = '100%';
        coursesTable.style.borderCollapse = 'collapse';
        coursesTable.style.border = '1px solid #e2e8f0';
        coursesTable.style.borderTop = 'none';
        
        // Table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        ['Course Code', 'Course Title', 'Credit', 'Grade', 'Grade Point'].forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            th.style.padding = '10px';
            th.style.backgroundColor = '#fff';
            th.style.fontWeight = '600';
            th.style.textAlign = 'left';
            th.style.borderBottom = '1px solid #e2e8f0';
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        coursesTable.appendChild(thead);
        
        // Table body
        const tbody = document.createElement('tbody');
        
        semester.courses.forEach(course => {
            const row = document.createElement('tr');
            
            // Course code
            const codeCell = document.createElement('td');
            codeCell.textContent = course.courseCode;
            codeCell.style.padding = '10px';
            codeCell.style.borderBottom = '1px solid #e2e8f0';
            
            // Course title
            const titleCell = document.createElement('td');
            titleCell.textContent = course.courseName;
            titleCell.style.padding = '10px';
            titleCell.style.borderBottom = '1px solid #e2e8f0';
            
            // Credit
            const creditCell = document.createElement('td');
            creditCell.textContent = course.totalCredit;
            creditCell.style.padding = '10px';
            creditCell.style.borderBottom = '1px solid #e2e8f0';
            
            // Grade
            const gradeCell = document.createElement('td');
            gradeCell.textContent = course.grade;
            gradeCell.style.padding = '10px';
            gradeCell.style.borderBottom = '1px solid #e2e8f0';
            if (course.grade === 'A+' || course.grade === 'A' || course.grade === 'A-') {
                gradeCell.style.color = '#38b2ac';
                gradeCell.style.fontWeight = '600';
            }
            
            // Grade point
            const pointCell = document.createElement('td');
            pointCell.textContent = course.pointEquivalent;
            pointCell.style.padding = '10px';
            pointCell.style.borderBottom = '1px solid #e2e8f0';
            
            row.appendChild(codeCell);
            row.appendChild(titleCell);
            row.appendChild(creditCell);
            row.appendChild(gradeCell);
            row.appendChild(pointCell);
            
            tbody.appendChild(row);
        });
        
        coursesTable.appendChild(tbody);
        
        section.appendChild(header);
        section.appendChild(coursesTable);
        
        return section;
    }

    /**
     * Create transcript footer
     * @returns {HTMLElement} Footer element
     */
    createTranscriptFooter() {
        const footer = document.createElement('div');
        footer.className = 'transcript-footer';
        footer.style.marginTop = '40px';
        footer.style.textAlign = 'center';
        footer.style.fontSize = '12px';
        footer.style.color = '#718096';
        footer.style.borderTop = '1px solid #e2e8f0';
        footer.style.paddingTop = '20px';
        
        const disclaimerText = document.createElement('p');
        disclaimerText.textContent = 'This is not an official document. Generated with DIU CGPA Calculator.';
        disclaimerText.style.margin = '5px 0';
        
        const dateText = document.createElement('p');
        const today = new Date();
        dateText.textContent = `Generated on ${today.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })}`;
        dateText.style.margin = '5px 0';
        
        footer.appendChild(disclaimerText);
        footer.appendChild(dateText);
        
        return footer;
    }
}

// Export as global variable
window.ResultCard = ResultCard;