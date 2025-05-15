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
        try {
            // First create the preview window with minimal content and controls
            const previewWindow = window.open("", "_blank");
            if (!previewWindow) {
                alert("Popup blocker might be preventing the transcript from opening. Please allow popups for this site.");
                return;
            }
            
            // Set up the preview window content with minimal structure first
            previewWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>                    <title>Transcript Preview - ${studentInfo.studentName || studentInfo.name || "Student"}</title>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
                    <style>
                        :root {
                            --color-bg: #ffffff;
                            --color-header-bg: #1a1c2c;
                            --color-text: #2d3748;
                            --color-text-secondary: #718096;
                            --color-border: #e2e8f0;
                            --color-btn-bg: #edf2f7;
                            --color-btn-border: #e2e8f0;
                            --color-btn-text: #2d3748;
                            --color-btn-primary-bg: #4361ee;
                            --color-btn-primary-text: #ffffff;
                            --color-btn-hover-bg: #e2e8f0;
                            --color-btn-primary-hover-bg: #3849e0;
                            --main-bg: #f3f4f9;
                            --header-gradient-start: #1a1c2c;
                            --header-gradient-end: #293245;
                            --dash-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                            --font-size-small: 13px;
                            --font-size-normal: 15px;
                            --border-radius-small: 6px;
                            --shadow-small: 0 2px 4px rgba(0, 0, 0, 0.05);
                            --shadow-medium: 0 4px 12px rgba(0, 0, 0, 0.08);
                            --transition-default: all 0.25s ease-in-out;
                            --font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
                        }
                        
                        body {
                            font-family: var(--font-family);
                            margin: 0;
                            padding: 0;
                            background-color: var(--main-bg);
                            color: var(--color-text);
                            line-height: 1.6;
                            -webkit-font-smoothing: antialiased;                        }                        .floating-controls {
                            position: fixed;
                            top: 20px;
                            right: 20px;
                            z-index: 1000;
                            display: flex;
                            flex-direction: column;
                            gap: 10px;
                        }                        .btn {
                            display: inline-flex;
                            align-items: center;
                            justify-content: center;
                            padding: 10px 18px;
                            font-size: var(--font-size-normal);
                            font-weight: 500;
                            line-height: 1.5;
                            white-space: nowrap;
                            border: none;
                            border-radius: var(--border-radius-small);
                            background-color: var(--color-btn-primary-bg);
                            color: var(--color-btn-primary-text);
                            cursor: pointer;
                            transition: var(--transition-default);
                            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                            width: 100%;
                        }
                        .btn:hover {
                            background-color: var(--color-btn-primary-hover-bg);
                            box-shadow: var(--shadow-medium);
                        }                        .content-wrapper {
                            padding: 20px;
                            display: flex;
                            justify-content: center;
                        }.message {
                            color: var(--color-text-secondary);
                            font-size: var(--font-size-small);
                            margin: 20px;
                        }
                        @media print {
                            body {
                                margin: 0;
                                padding: 0;
                                background: #ffffff;
                            }
                            .controls, .floating-controls, .message {
                                display: none;
                            }
                            .content-wrapper {
                                margin: 0;
                                padding: 0;
                                display: block;
                            }
                            .transcript-container {
                                width: 210mm;
                                min-height: 297mm;
                                margin: 0;
                                padding: 10mm;
                                box-shadow: none;
                                page-break-inside: avoid;
                            }
                        }
                        /* Transcript styles */
                        .transcript-container {
                            width: 210mm;
                            min-height: 297mm;
                            padding: 10mm;
                            margin: 0 auto;
                            background-color: #fff;
                            color: #000;
                            font-family: Arial, sans-serif;
                            font-size: 10pt;
                            box-sizing: border-box;
                            box-shadow: 0 0 10px rgba(0,0,0,0.1);
                        }
                        .transcript-header {
                            text-align: center;
                            margin-bottom: 10mm;
                        }
                        .semester-table-container {
                            margin-bottom: 10mm;
                            page-break-inside: avoid;
                        }
                        .semester-table {
                            width: 100%;
                            border-collapse: collapse;
                        }
                        .semester-table, .semester-table th, .semester-table td {
                            border: 1px solid black;
                        }
                        .semester-table th, .semester-table td {
                            padding: 3px 5px;
                        }
                        .semester-table th {
                            font-weight: bold;
                        }
                        .student-section {
                            margin-bottom: 10mm;
                        }
                        .transcript-footer {
                            margin-top: 20mm;
                            text-align: center;
                            font-size: 9pt;
                            color: #555;
                        }
                    </style>                </head>                <body>                    <div class="floating-controls">
                        <button class="btn" id="printBtn">Print or Save PDF</button>
                        <button class="btn" id="closeBtn">Close</button>
                    </div>
                    <div class="content-wrapper" id="content">
                        <div class="message">Loading transcript...</div>
                    </div>                    <script>
                        document.getElementById("closeBtn").addEventListener("click", function() {
                            window.close();
                        });
                        
                        document.getElementById("printBtn").addEventListener("click", function() {
                            // Ensure the content wrapper has proper print styling
                            document.querySelector('.content-wrapper').style.margin = "0";
                            document.querySelector('.content-wrapper').style.padding = "0";
                            
                            // Optimize transcript container for printing
                            const transcriptContainer = document.querySelector('.transcript-container');
                            if (transcriptContainer) {
                                transcriptContainer.style.margin = "0";
                                transcriptContainer.style.boxShadow = "none";
                            }
                            
                            // Print the document
                            window.print();
                        });
                    </script>
                </body>
                </html>
            `);
            
            // Close document to finish initial rendering
            previewWindow.document.close();
            
            // Create the transcript content manually and insert it directly into the DOM
            setTimeout(() => {
                try {
                    // Get the content container
                    const contentContainer = previewWindow.document.getElementById("content");
                    if (!contentContainer) {
                        throw new Error("Content container not found");
                    }
                    
                    // Clear any loading message
                    contentContainer.innerHTML = "";
                    
                    // Create transcript container
                    const transcriptContainer = previewWindow.document.createElement("div");
                    transcriptContainer.className = "transcript-container";
                    
                    // Create header
                    const header = previewWindow.document.createElement("div");
                    header.className = "transcript-header";
                    
                    // Add logo
                    const logo = previewWindow.document.createElement("img");
                    logo.alt = "Daffodil International University";
                    logo.style.height = "15mm";
                    logo.style.marginBottom = "5mm";
                    const logoSrc = logo.src;
                    logo.src = "assets/img/diu-logo.svg"; // Use the actual DIU logo from assets

                    // Add university address
                    const address = previewWindow.document.createElement("div");
                    address.style.fontSize = "9pt";
                    address.style.lineHeight = "1.3";
                    address.innerHTML = `
                        Daffodil International University, Daffodil Smart City, Birulia, Savar, Dhaka-1216 Bangladesh<br>
                        Tel: +88 02 9143254-5, 48111639, 48111670, 8411470(Ext. 01)/1350091, 01713485941, 01611458841, 01841149850<br>
                        E-mail: info@daffodilvarsity.edu.bd, Fax: +88 02 9131947
                    `;
                    
                    // Add title
                    const title = previewWindow.document.createElement("div");
                    title.style.fontWeight = "bold";
                    title.style.fontSize = "16pt";
                    title.style.marginTop = "5mm";
                    title.textContent = "Transcript";
                    
                    // Assemble header
                    header.appendChild(logo);
                    header.appendChild(address);
                    header.appendChild(title);
                    transcriptContainer.appendChild(header);
                    
                    // Add student info section
                    const studentSection = previewWindow.document.createElement("div");
                    studentSection.className = "student-section";
                    
                    // Program info
                    const program = previewWindow.document.createElement("div");
                    program.style.fontStyle = "italic";
                    program.style.marginBottom = "5mm";
                    program.innerHTML = `<strong>Program:</strong> ${studentInfo.programName || "4-Year B.Sc. in Computer Science and Engineering"}`;
                    
                    // Student info table
                    const studentTable = previewWindow.document.createElement("table");
                    studentTable.style.width = "100%";
                    studentTable.style.borderCollapse = "collapse";
                    studentTable.innerHTML = `
                        <tr>
                            <td style="width:130px;">Name of the Student</td>
                            <td>: ${studentInfo.studentName || studentInfo.name || ""}</td>
                            <td style="width:130px;">Enrollment Session</td>
                            <td>: ${studentInfo.semesterName || studentInfo.enrollmentSession || (studentInfo.studentId ? `${studentInfo.studentId.substring(0, 3)} Batch` : "Not Available")}</td>
                        </tr>
                        <tr>
                            <td>Student ID</td>
                            <td>: ${studentInfo.studentId || studentInfo.id || ""}</td>
                            <td>Date of Issue</td>
                            <td>: ${new Date().toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                            })}</td>
                        </tr>
                        <tr>
                            <td>Batch</td>
                            <td>: ${studentInfo.batch || studentInfo.batchNo || "61"}</td>
                            <td></td>
                            <td></td>
                        </tr>
                    `;
                    
                    studentSection.appendChild(program);
                    studentSection.appendChild(studentTable);
                    transcriptContainer.appendChild(studentSection);
                    
                    // Add semester tables
                    if (semesterData && semesterData.length > 0) {
                        // Sort semesters chronologically
                        const sortedSemesters = [...semesterData].sort((a, b) => a.id.localeCompare(b.id));
                        
                        sortedSemesters.forEach(semester => {
                            // Semester container
                            const semesterContainer = previewWindow.document.createElement("div");
                            semesterContainer.className = "semester-table-container";
                            
                            // Semester header with simple styling
                            semesterContainer.innerHTML = `
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5mm;">
                                    <div><strong>Semester:</strong> ${semester.name}</div>
                                    <div>
                                        <span><strong>GPA:</strong> ${semester.gpa || semester.cgpa || "0.00"}</span>
                                        <span style="margin-left: 10px;"><strong>Credits:</strong> ${semester.totalCredits || semester.totalCredit || "0"}</span>
                                    </div>
                                </div>
                            `;
                            
                            // Semester table
                            const semesterTable = previewWindow.document.createElement("table");
                            semesterTable.className = "semester-table";
                            
                            // Table without GPA column
                            let tableHTML = `
                                <thead>
                                    <tr>
                                        <th style="width:100px;">Course Code</th>
                                        <th>Course Title</th>
                                        <th style="width:50px;">Credit</th>
                                        <th style="width:60px;">Grade</th>
                                        <th style="width:80px;">Grade Point</th>
                                    </tr>
                                </thead>
                                <tbody>
                            `;
                            
                            // Course rows
                            if (semester.courses && semester.courses.length > 0) {
                                semester.courses.forEach((course) => {
                                    tableHTML += `
                                        <tr>
                                            <td style="text-align:center;">${course.courseCode || course.customCourseId || "-"}</td>
                                            <td>${course.courseName || course.courseTitle || "Unknown Course"}</td>
                                            <td style="text-align:center;">${course.totalCredit || "0"}</td>
                                            <td style="text-align:center;">${course.gradeLetter || "-"}</td>
                                            <td style="text-align:center;">${course.pointEquivalent || "0"}</td>
                                        </tr>
                                    `;
                                });
                            } else {
                                tableHTML += '<tr><td colspan="5" style="text-align:center;">No courses found for this semester</td></tr>';
                            }
                            
                            semesterTable.innerHTML = tableHTML;
                            
                            semesterContainer.appendChild(semesterTable);
                            transcriptContainer.appendChild(semesterContainer);
                        });
                    } else {
                        const noData = previewWindow.document.createElement("div");
                        noData.style.textAlign = "center";
                        noData.style.padding = "20px";
                        noData.textContent = "No semester data available";
                        transcriptContainer.appendChild(noData);
                    }
                    
                    // Add timer information display
                    if (this.fetchTimerValue) {
                        const timerInfo = previewWindow.document.createElement("div");
                        timerInfo.className = "timer-info";
                        timerInfo.style.marginTop = "10mm";
                        timerInfo.style.fontSize = "8pt";
                        timerInfo.style.color = "#999";
                        timerInfo.style.textAlign = "center";
                        timerInfo.textContent = `Data fetched in ${this.fetchTimerValue} seconds`;
                        transcriptContainer.appendChild(timerInfo);
                    }
                    
                    // Add footer
                    const footer = previewWindow.document.createElement("div");
                    footer.className = "transcript-footer";
                    footer.innerHTML = "<p>This is not an official document. Generated with https://diucgpa.netlify.app</p>";
                    transcriptContainer.appendChild(footer);
                      // Add to the content container
                    contentContainer.appendChild(transcriptContainer);
                } catch (err) {
                    console.error("Error building transcript:", err);
                    const contentContainer = previewWindow.document.getElementById("content");
                    if (contentContainer) {
                        contentContainer.innerHTML = `<div style="color:red;padding:20px;text-align:center;">Error generating transcript: ${err.message}</div>`;
                    }
                }
            }, 300); // Short delay to ensure window is ready
            
        } catch (error) {
            console.error("Error generating transcript:", error);
            alert("An error occurred while generating the transcript: " + error.message);
        }
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
        
        // Use embedded SVG for the DIU logo instead of external URL to avoid CORS issues
        // This uses a data URI with an embedded SVG for the DIU logo
        const logo = document.createElement('img');
        logo.alt = 'Daffodil International University';
        logo.style.height = '20mm';
        logo.style.marginBottom = '5mm';
        
        // Use a local asset if available, otherwise use a data URI for the logo
        if (window.location.href.includes('localhost') || window.location.href.includes('127.0.0.1')) {
            // For local development
            logo.src = 'assets/img/diu-logo.svg';
        } else {
            // Inline SVG data URI as fallback (simplified DIU logo)
            logo.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMTAwIj48c3R5bGU+LnN0MHtmaWxsOiMwMDYyMzk7fTwvc3R5bGU+PHBhdGggY2xhc3M9InN0MCIgZD0iTTI1IDI1aDE1MHY1MEgyNXoiLz48dGV4dCB4PSI1MCIgeT0iNjAiIGZpbGw9IiNmZmYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZm9udC13ZWlnaHQ9ImJvbGQiPkRJVTwvdGV4dD48L3N2Zz4=';
        }
        
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
        sessionValue.textContent = ': ' + (studentInfo.semesterName || studentInfo.enrollmentSession || (studentInfo.studentId ? `${studentInfo.studentId.substring(0, 3)} Batch` : "Not Available"));
        
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
        issueValue.textContent = ': ' + today.toLocaleDateString('en-GB', {
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
        
        // Semester header table with modern styling - include GPA and credits
        const headerRow = document.createElement('table');
        headerRow.style.width = '100%';
        headerRow.style.borderCollapse = 'collapse';
        headerRow.style.marginBottom = '2mm';
        
        const headerRowBody = document.createElement('tbody');
        const semRow = document.createElement('tr');
        
        // Semester label
        const semCell = document.createElement('td');
        semCell.textContent = 'Semester';
        semCell.style.width = '80px';
        semCell.style.fontSize = '10pt';
        
        // Semester value
        const semValueCell = document.createElement('td');
        semValueCell.textContent = semester.name || 'Spring 2025';
        semValueCell.style.fontWeight = 'normal';
        
        // Semester GPA badge - simplified styling
        const gpaCell = document.createElement('td');
        gpaCell.style.textAlign = 'right';
        
        const gpaInfo = document.createElement('div');
        gpaInfo.innerHTML = `
            <span><strong>GPA:</strong> ${semester.gpa || '0.00'}</span>
            <span style="margin-left: 10px;"><strong>Credits:</strong> ${semester.totalCredits || '0'}</span>
        `;
        
        gpaCell.appendChild(gpaInfo);
        
        semRow.appendChild(semCell);
        semRow.appendChild(semValueCell);
        semRow.appendChild(gpaCell);
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
        // Remove GPA column as requested
        const headers = ['Course Code', 'Course Title', 'Credit', 'Grade', 'Grade Point'];
        const widths = ['100px', '', '50px', '60px', '80px'];
        
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
            semester.courses.forEach((course) => {
                const tr = document.createElement('tr');
                
                // Course code
                const codeCell = document.createElement('td');
                codeCell.textContent = course.courseCode || course.customCourseId || '-';
                codeCell.style.border = '1px solid #000';
                codeCell.style.padding = '3px 5px';
                codeCell.style.textAlign = 'center';
                
                // Course title
                const titleCell = document.createElement('td');
                titleCell.textContent = course.courseName || course.courseTitle || 'Unknown Course';
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
                gradeCell.textContent = course.gradeLetter || course.grade || '-';
                gradeCell.style.border = '1px solid #000';
                gradeCell.style.padding = '3px 5px';
                gradeCell.style.textAlign = 'center';
                
                // Grade point
                const pointCell = document.createElement('td');
                pointCell.textContent = course.pointEquivalent || '0';
                pointCell.style.border = '1px solid #000';
                pointCell.style.padding = '3px 5px';
                pointCell.style.textAlign = 'center';
                
                // Add cells to the row
                tr.appendChild(codeCell);
                tr.appendChild(titleCell);
                tr.appendChild(creditCell);
                tr.appendChild(gradeCell);
                tr.appendChild(pointCell);
                
                tbody.appendChild(tr);
            });
        } else {
            // No courses found
            const noCoursesRow = document.createElement('tr');
            const noCoursesCell = document.createElement('td');
            noCoursesCell.colSpan = 5; // Reduced by one since we removed the GPA column
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