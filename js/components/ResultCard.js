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
                    
                    // Add Result Summary, Grading Table, and QR Code Section BEFORE semester tables
                    const summarySection = previewWindow.document.createElement("div");
                    summarySection.style.marginTop = "10mm";
                    summarySection.style.marginBottom = "8mm";
                    summarySection.style.pageBreakInside = "avoid";
                    
                    // Calculate totals
                    let totalCGPA = cgpaData?.cgpa || "0.00";
                    let totalCredits = cgpaData?.totalCredits || "0";
                    
                    if (!cgpaData && semesterData && semesterData.length > 0) {
                        let creditSum = 0;
                        let weightedSum = 0;
                        
                        semesterData.forEach(sem => {
                            const credits = parseFloat(sem.totalCredits || sem.totalCredit || 0);
                            const gpa = parseFloat(sem.gpa || sem.cgpa || 0);
                            
                            if (!isNaN(credits) && !isNaN(gpa)) {
                                creditSum += credits;
                                weightedSum += credits * gpa;
                            }
                        });
                        
                        totalCGPA = creditSum > 0 ? (weightedSum / creditSum).toFixed(2) : "0.00";
                        totalCredits = creditSum.toString();
                    }
                    
                    // Get total credit requirement from input
                    const totalCreditReq = studentInfo.totalCreditRequirement || "148";
                    
                    // ==================== OFFICIAL ACADEMIC TRANSCRIPT LAYOUT ====================
                    // Conservative grid-based structure - No modern UI patterns
                    
                    const mainLayout = previewWindow.document.createElement("table");
                    mainLayout.style.width = "100%";
                    mainLayout.style.borderCollapse = "collapse";
                    mainLayout.style.marginTop = "8mm";
                    mainLayout.style.marginBottom = "8mm";
                    
                    const mainRow = previewWindow.document.createElement("tr");
                    
                    // ========== LEFT COLUMN: Academic Summary + QR Code (50%) ==========
                    const leftCell = previewWindow.document.createElement("td");
                    leftCell.style.width = "50%";
                    leftCell.style.verticalAlign = "top";
                    leftCell.style.paddingRight = "10mm";
                    
                    // Academic Summary Table
                    const summaryTitle = previewWindow.document.createElement("div");
                    summaryTitle.style.fontWeight = "bold";
                    summaryTitle.style.fontSize = "10pt";
                    summaryTitle.style.marginBottom = "2mm";
                    summaryTitle.style.textAlign = "left";
                    summaryTitle.textContent = "Academic Summary";
                    
                    const summaryTable = previewWindow.document.createElement("table");
                    summaryTable.style.width = "100%";
                    summaryTable.style.borderCollapse = "collapse";
                    summaryTable.style.border = "1px solid #000";
                    summaryTable.style.fontSize = "9pt";
                    
                    // Build summary table rows
                    const summaryBody = previewWindow.document.createElement("tbody");
                    
                    // CGPA Row
                    const cgpaRow = previewWindow.document.createElement("tr");
                    const cgpaLabelCell = previewWindow.document.createElement("td");
                    cgpaLabelCell.style.border = "1px solid #000";
                    cgpaLabelCell.style.padding = "4px 6px";
                    cgpaLabelCell.style.textAlign = "left";
                    cgpaLabelCell.style.width = "70%";
                    cgpaLabelCell.textContent = "CGPA";
                    
                    const cgpaValueCell = previewWindow.document.createElement("td");
                    cgpaValueCell.style.border = "1px solid #000";
                    cgpaValueCell.style.padding = "4px 6px";
                    cgpaValueCell.style.fontWeight = "bold";
                    cgpaValueCell.style.textAlign = "center";
                    cgpaValueCell.textContent = totalCGPA;
                    
                    cgpaRow.appendChild(cgpaLabelCell);
                    cgpaRow.appendChild(cgpaValueCell);
                    
                    // Credits Completed Row
                    const creditsRow = previewWindow.document.createElement("tr");
                    const creditsLabelCell = previewWindow.document.createElement("td");
                    creditsLabelCell.style.border = "1px solid #000";
                    creditsLabelCell.style.padding = "4px 6px";
                    creditsLabelCell.style.textAlign = "left";
                    creditsLabelCell.textContent = "Credits Completed";
                    
                    const creditsValueCell = previewWindow.document.createElement("td");
                    creditsValueCell.style.border = "1px solid #000";
                    creditsValueCell.style.padding = "4px 6px";
                    creditsValueCell.style.fontWeight = "bold";
                    creditsValueCell.style.textAlign = "center";
                    creditsValueCell.textContent = totalCredits;
                    
                    creditsRow.appendChild(creditsLabelCell);
                    creditsRow.appendChild(creditsValueCell);
                    
                    // Total Credit Requirement Row
                    const reqRow = previewWindow.document.createElement("tr");
                    const reqLabelCell = previewWindow.document.createElement("td");
                    reqLabelCell.style.border = "1px solid #000";
                    reqLabelCell.style.padding = "4px 6px";
                    reqLabelCell.style.textAlign = "left";
                    reqLabelCell.textContent = "Total Credit Requirement";
                    
                    const reqValueCell = previewWindow.document.createElement("td");
                    reqValueCell.style.border = "1px solid #000";
                    reqValueCell.style.padding = "4px 6px";
                    reqValueCell.style.fontWeight = "bold";
                    reqValueCell.style.textAlign = "center";
                    reqValueCell.textContent = totalCreditReq;
                    
                    reqRow.appendChild(reqLabelCell);
                    reqRow.appendChild(reqValueCell);
                    
                    summaryBody.appendChild(cgpaRow);
                    summaryBody.appendChild(creditsRow);
                    summaryBody.appendChild(reqRow);
                    summaryTable.appendChild(summaryBody);
                    
                    leftCell.appendChild(summaryTitle);
                    leftCell.appendChild(summaryTable);
                    
                    // QR Code below Academic Summary (no decoration)
                    const qrWrapper = previewWindow.document.createElement("div");
                    qrWrapper.style.marginTop = "8mm";
                    qrWrapper.style.display = "flex";
                    qrWrapper.style.alignItems = "center";
                    qrWrapper.style.gap = "4mm";
                    
                    const qrImg = previewWindow.document.createElement("img");
                    qrImg.src = "assets/img/QR.png";
                    qrImg.alt = "Verification QR Code";
                    qrImg.style.width = "25mm";
                    qrImg.style.height = "25mm";
                    qrImg.style.display = "block";
                    qrImg.style.flexShrink = "0";
                    
                    const qrText = previewWindow.document.createElement("div");
                    qrText.style.fontSize = "8pt";
                    qrText.style.lineHeight = "1.4";
                    qrText.style.border = "1px solid #000";
                    qrText.style.padding = "4mm";
                    qrText.style.height = "25mm";
                    qrText.style.boxSizing = "border-box";
                    qrText.style.display = "flex";
                    qrText.style.alignItems = "center";
                    qrText.innerHTML = "Scan the QR code on left to verify the semester-wize results at:<br>https://studentportal.diu.edu.bd/academic-result";
                    
                    qrWrapper.appendChild(qrImg);
                    qrWrapper.appendChild(qrText);
                    leftCell.appendChild(qrWrapper);
                    
                    // ========== RIGHT COLUMN: UGC Grading System (50%) ==========
                    const rightCell = previewWindow.document.createElement("td");
                    rightCell.style.width = "50%";
                    rightCell.style.verticalAlign = "top";
                    
                    const gradingTitle = previewWindow.document.createElement("div");
                    gradingTitle.style.fontWeight = "bold";
                    gradingTitle.style.fontSize = "10pt";
                    gradingTitle.style.marginBottom = "2mm";
                    gradingTitle.style.textAlign = "left";
                    gradingTitle.textContent = "UGC Uniform Grading System";
                    
                    const gradingTable = previewWindow.document.createElement("table");
                    gradingTable.style.width = "100%";
                    gradingTable.style.borderCollapse = "collapse";
                    gradingTable.style.border = "1px solid #000";
                    gradingTable.style.fontSize = "8pt";
                    
                    gradingTable.innerHTML = `
                        <thead>
                            <tr>
                                <th style="border:1px solid #000;padding:2px 4px;text-align:center;font-weight:bold;background:#fff;font-size:8pt;">Marks (%)</th>
                                <th style="border:1px solid #000;padding:2px 4px;text-align:center;font-weight:bold;background:#fff;font-size:8pt;">Grade</th>
                                <th style="border:1px solid #000;padding:2px 4px;text-align:center;font-weight:bold;background:#fff;font-size:8pt;">Grade Point</th>
                                <th style="border:1px solid #000;padding:2px 4px;text-align:center;font-weight:bold;background:#fff;font-size:8pt;">Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td style="border:1px solid #000;padding:2px 4px;text-align:center;">80–100</td><td style="border:1px solid #000;padding:2px 4px;text-align:center;">A+</td><td style="border:1px solid #000;padding:2px 4px;text-align:center;">4.00</td><td style="border:1px solid #000;padding:2px 4px;text-align:center;">Outstanding</td></tr>
                            <tr><td style="border:1px solid #000;padding:2px 4px;text-align:center;">75–79</td><td style="border:1px solid #000;padding:2px 4px;text-align:center;">A</td><td style="border:1px solid #000;padding:2px 4px;text-align:center;">3.75</td><td style="border:1px solid #000;padding:2px 4px;text-align:center;">Excellent</td></tr>
                            <tr><td style="border:1px solid #000;padding:2px 4px;text-align:center;">70–74</td><td style="border:1px solid #000;padding:2px 4px;text-align:center;">A−</td><td style="border:1px solid #000;padding:2px 4px;text-align:center;">3.50</td><td style="border:1px solid #000;padding:2px 4px;text-align:center;">Very Good</td></tr>
                            <tr><td style="border:1px solid #000;padding:2px 4px;text-align:center;">65–69</td><td style="border:1px solid #000;padding:2px 4px;text-align:center;">B+</td><td style="border:1px solid #000;padding:2px 4px;text-align:center;">3.25</td><td style="border:1px solid #000;padding:2px 4px;text-align:center;">Good</td></tr>
                            <tr><td style="border:1px solid #000;padding:2px 4px;text-align:center;">60–64</td><td style="border:1px solid #000;padding:2px 4px;text-align:center;">B</td><td style="border:1px solid #000;padding:2px 4px;text-align:center;">3.00</td><td style="border:1px solid #000;padding:2px 4px;text-align:center;">Satisfactory</td></tr>
                            <tr><td style="border:1px solid #000;padding:2px 4px;text-align:center;">55–59</td><td style="border:1px solid #000;padding:2px 4px;text-align:center;">B−</td><td style="border:1px solid #000;padding:2px 4px;text-align:center;">2.75</td><td style="border:1px solid #000;padding:2px 4px;text-align:center;">Above Average</td></tr>
                            <tr><td style="border:1px solid #000;padding:2px 4px;text-align:center;">50–54</td><td style="border:1px solid #000;padding:2px 4px;text-align:center;">C+</td><td style="border:1px solid #000;padding:2px 4px;text-align:center;">2.50</td><td style="border:1px solid #000;padding:2px 4px;text-align:center;">Average</td></tr>
                            <tr><td style="border:1px solid #000;padding:2px 4px;text-align:center;">45–49</td><td style="border:1px solid #000;padding:2px 4px;text-align:center;">C</td><td style="border:1px solid #000;padding:2px 4px;text-align:center;">2.25</td><td style="border:1px solid #000;padding:2px 4px;text-align:center;">Below Average</td></tr>
                            <tr><td style="border:1px solid #000;padding:2px 4px;text-align:center;">40–44</td><td style="border:1px solid #000;padding:2px 4px;text-align:center;">D</td><td style="border:1px solid #000;padding:2px 4px;text-align:center;">2.00</td><td style="border:1px solid #000;padding:2px 4px;text-align:center;">Pass</td></tr>
                            <tr><td style="border:1px solid #000;padding:2px 4px;text-align:center;">00–39</td><td style="border:1px solid #000;padding:2px 4px;text-align:center;">F</td><td style="border:1px solid #000;padding:2px 4px;text-align:center;">0.00</td><td style="border:1px solid #000;padding:2px 4px;text-align:center;">Fail</td></tr>
                        </tbody>
                    `;
                    
                    const effective = previewWindow.document.createElement("div");
                    effective.style.fontSize = "8pt";
                    effective.style.marginTop = "2mm";
                    effective.style.textAlign = "center";
                    effective.textContent = "Effective from Summer Semester 2007";
                    
                    rightCell.appendChild(gradingTitle);
                    rightCell.appendChild(gradingTable);
                    rightCell.appendChild(effective);
                    
                    mainRow.appendChild(leftCell);
                    mainRow.appendChild(rightCell);
                    mainLayout.appendChild(mainRow);
                    
                    summarySection.appendChild(mainLayout);
                    transcriptContainer.appendChild(summarySection);
                    
                    // Add semester tables
                    if (semesterData && semesterData.length > 0) {
                        // Separate project/thesis/internship from regular semesters
                        const regularSemesters = [];
                        const projectSemesters = [];
                        
                        semesterData.forEach(semester => {
                            if (semester.name === 'Project/Thesis/Internship') {
                                projectSemesters.push(semester);
                            } else {
                                regularSemesters.push(semester);
                            }
                        });
                        
                        // Sort regular semesters chronologically (oldest first)
                        // Extract year and term from semester name if they exist
                        regularSemesters.forEach(semester => {
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
                        const sortedSemesters = [...regularSemesters].sort((a, b) => {
                            const aYear = a.year || a.extractedYear || 0;
                            const bYear = b.year || b.extractedYear || 0;
                            
                            if (aYear !== bYear) {
                                return aYear - bYear; // Sort by year first
                            }
                            
                            const aTerm = a.term || a.extractedTerm || 0;
                            const bTerm = b.term || b.extractedTerm || 0;
                            return aTerm - bTerm; // Then by term (Spring=1, Summer=2, Fall=3)
                        });
                        
                        // Add regular semester tables first
                        sortedSemesters.forEach(semester => {
                            // Semester container
                            const semesterContainer = previewWindow.document.createElement("div");
                            semesterContainer.className = "semester-table-container";
                            
                            // Semester header with simple styling
                            semesterContainer.innerHTML = `
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5mm;">
                                    <div><strong>Semester:</strong> ${semester.name}</div>
                                    <div>
                                        <span><strong>Credit Taken:</strong> ${semester.totalCredits || semester.totalCredit || "0"}</span>
                                        <span style="margin-left: 10px;"><strong>Credit Completed:</strong> ${semester.totalCredits || semester.totalCredit || "0"}</span>
                                        <span style="margin-left: 10px;"><strong>GPA:</strong> ${semester.gpa || semester.cgpa || "0.00"}</span>
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
                        
                        // Add project/thesis/internship tables at the END
                        projectSemesters.forEach(semester => {
                            // Semester container
                            const semesterContainer = previewWindow.document.createElement("div");
                            semesterContainer.className = "semester-table-container";
                            
                            // Project header with bold title (no "Semester:" label, no stats)
                            semesterContainer.innerHTML = `
                                <div style="margin-bottom: 5mm;">
                                    <div><strong>${semester.name}</strong></div>
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
                    // Add footer
                    const footer = previewWindow.document.createElement("div");
                    footer.className = "transcript-footer";
                    footer.innerHTML = "<p>This document has been generated electronically and is valid without a physical signature.</p>";
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
        
        // Add CGPA and Total Credits Summary Box
        container.appendChild(this.createCGPASummary(semesterData, cgpaData));

        // Add QR verification section (left aligned QR + text) before footer
        try {
            const qr = this.createQRVerificationSection();
            container.appendChild(qr);
        } catch (err) {
            const ver = document.createElement('div');
            ver.style.marginTop = '15mm';
            ver.style.marginBottom = '10mm';
            ver.style.textAlign = 'left';
            ver.innerHTML = '<strong>Verify Semester Results</strong>';
            container.appendChild(ver);
        }

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
        // Extract year and term from semester name if they exist
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
    }    /**
     * Create transcript footer with disclaimer text
     * @returns {HTMLElement} Footer element
     */
    /**
     * Create QR verification section (left aligned QR and text)
     * @returns {HTMLElement}
     */
    createQRVerificationSection() {
        // Use a table to ensure consistent layout in printed PDF
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.pageBreakInside = 'avoid';
        table.style.marginTop = '12mm';
        table.style.marginBottom = '6mm';

        const tr = document.createElement('tr');

    // Left cell will contain the UGC grading system table (compact)
    const tdLeft = document.createElement('td');
    // Make left column wide enough for layout but keep grading box compact on the left
    tdLeft.style.width = '120mm';
    tdLeft.style.maxWidth = '120mm';
    // Add left padding equal to the transcript content padding so the grading box lines up
    tdLeft.style.paddingLeft = '0mm';
    tdLeft.style.verticalAlign = 'top';
    // Build grading table
    const gradingWrap = document.createElement('div');
    gradingWrap.style.width = '100%';
    gradingWrap.style.boxSizing = 'border-box';
    // Make grading content compact but slightly larger for readability
    gradingWrap.style.fontSize = '8pt';
    gradingWrap.style.lineHeight = '1.05';
    // Center contents (title, table, effective note)
    gradingWrap.style.textAlign = 'center';

    const gradingTitle = document.createElement('div');
    gradingTitle.style.fontWeight = '700';
    gradingTitle.style.marginBottom = '4px';
    gradingTitle.style.fontSize = '9pt';
    gradingTitle.style.textAlign = 'center';
    gradingTitle.textContent = 'UGC Uniform Grading System';

    const gradingTable = document.createElement('table');
    // Constrain grading table to a smaller fixed width and use fixed layout for tighter columns
    gradingTable.style.width = '64mm';
    gradingTable.style.maxWidth = '64mm';
    // Left align the grading table inside the box so its left edge matches the red line
    gradingTable.style.margin = '0';
    gradingTable.style.tableLayout = 'fixed';
    gradingTable.style.borderCollapse = 'collapse';
    // Use much smaller font and tighter cell padding for a compact look
    gradingTable.style.fontSize = '9pt';

    const gtHead = document.createElement('thead');
    const headRow = document.createElement('tr');
    // Fixed column widths to keep overall table compact (reduce Marks and Remarks)
    const colWidths = ['16mm','16mm','16mm','24mm'];
    ['Marks (%)','Grade','Grade Point','Remarks'].forEach((h,i)=>{
        const th = document.createElement('th');
        th.textContent = h;
        th.style.border = '1px solid #000';
        th.style.padding = '1px 3px';
        th.style.textAlign = 'center';
        th.style.fontWeight = '700';
        th.style.width = colWidths[i];
        th.style.overflow = 'hidden';
        headRow.appendChild(th);
    });
    gtHead.appendChild(headRow);

    const gtBody = document.createElement('tbody');
    const rows = [
        ['80–100','A+','4.00','Outstanding'],
        ['75–79','A','3.75','Excellent'],
        ['70–74','A−','3.50','Very Good'],
        ['65–69','B+','3.25','Good'],
        ['60–64','B','3.00','Satisfactory'],
        ['55–59','B−','2.75','Above Average'],
        ['50–54','C+','2.50','Average'],
        ['45–49','C','2.25','Below Average'],
        ['40–44','D','2.00','Pass'],
        ['00–39','F','0.00','Fail']
    ];

    rows.forEach(r=>{
        const tr = document.createElement('tr');
        r.forEach((c,idx)=>{
            const td = document.createElement('td');
            td.textContent = c;
            td.style.border = '1px solid #000';
            td.style.padding = '1px 3px';
            td.style.textAlign = 'center';
            td.style.overflow = 'hidden';
            td.style.whiteSpace = 'nowrap';
            td.style.textOverflow = 'ellipsis';
            tr.appendChild(td);
        });
        gtBody.appendChild(tr);
    });

    gradingTable.appendChild(gtHead);
    gradingTable.appendChild(gtBody);

    const effective = document.createElement('div');
    effective.style.fontSize = '8pt';
    effective.style.marginTop = '6px';
    effective.style.textAlign = 'center';
    effective.textContent = 'Effective from Summer Semester 2007';

    // Place grading content inside a compact box positioned to the left (red area)
    const gradingBox = document.createElement('div');
    // Match gradingBox width to gradingTable width so title/effective center correctly
    gradingBox.style.width = '80mm';
    gradingBox.style.boxSizing = 'border-box';
    // Align the box flush to the left so the table starts at the desired intersection
    gradingBox.style.textAlign = 'left';
    gradingBox.style.marginLeft = '0mm';
    gradingBox.style.marginTop = '0mm';

    // Center the title over the compact table by matching its width to the table
    gradingTitle.style.width = '80mm';
    gradingTitle.style.margin = '0 auto 4px';
    gradingBox.appendChild(gradingTitle);
    gradingBox.appendChild(gradingTable);
    // Ensure the effective note is centered with the same width
    effective.style.width = '64mm';
    effective.style.margin = '6px auto 0';
    gradingBox.appendChild(effective);

    gradingWrap.appendChild(gradingBox);
    tdLeft.appendChild(gradingWrap);

    // Right cell contains the QR and centered caption (compact)
    const tdRight = document.createElement('td');
    tdRight.style.width = '40mm';
    tdRight.style.maxWidth = '40mm';
    tdRight.style.verticalAlign = 'center';
    tdRight.style.textAlign = 'center';

    // Place QR image directly into the right cell (no box)
    const img = document.createElement('img');
    img.alt = 'Verification QR';
    // Make QR slightly larger
    img.style.width = '36mm';
    img.style.height = '36mm';
    img.style.display = 'block';
    img.style.margin = '0 auto';
    img.style.marginTop = '2mm';
    // Use local asset path so preview and generated transcript can load it
    img.src = 'assets/img/QR.png';

    const caption = document.createElement('div');
    caption.style.fontSize = '9pt';
    caption.style.fontWeight = '700';
    caption.style.marginTop = '10px';
    caption.style.textAlign = 'center';
    caption.textContent = 'Scan the above QR code to verify semester results';

    tdRight.appendChild(img);
    tdRight.appendChild(caption);

    tr.appendChild(tdLeft);
    tr.appendChild(tdRight);
        table.appendChild(tr);

        return table;
    }
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
    }    /**
     * Create a summary box displaying CGPA and total credits
     * @param {Array} semesterData - Array of semester data
     * @param {Object} cgpaData - Object containing CGPA and total credits
     * @returns {HTMLElement} CGPA summary box
     */
    createCGPASummary(semesterData, cgpaData) {
        const summaryBox = document.createElement('div');
        summaryBox.className = 'cgpa-summary';
        summaryBox.style.marginTop = '10mm';
        summaryBox.style.marginBottom = '10mm';
        summaryBox.style.textAlign = 'right';
        
        // Calculate CGPA and total credits if not provided
        let totalCGPA = cgpaData?.cgpa || "0.00";
        let totalCredits = cgpaData?.totalCredits || "0";
        
        // If cgpaData is not provided, calculate from semester data
        if (!cgpaData && semesterData && semesterData.length > 0) {
            let creditSum = 0;
            let weightedSum = 0;
            
            semesterData.forEach(sem => {
                const credits = parseFloat(sem.totalCredits || sem.totalCredit || 0);
                const gpa = parseFloat(sem.gpa || sem.cgpa || 0);
                
                if (!isNaN(credits) && !isNaN(gpa)) {
                    creditSum += credits;
                    weightedSum += credits * gpa;
                }
            });
            
            totalCGPA = creditSum > 0 ? (weightedSum / creditSum).toFixed(2) : "0.00";
            totalCredits = creditSum.toString();
        }
        
        // Create summary table
        const summaryTable = document.createElement('table');
        summaryTable.style.width = 'auto';
        summaryTable.style.marginLeft = 'auto'; // Right align the table
        summaryTable.style.borderCollapse = 'collapse';
        summaryTable.style.border = '1px solid #000';
        
        // CGPA row
        const cgpaRow = document.createElement('tr');
        
        const cgpaLabelCell = document.createElement('td');
        cgpaLabelCell.style.padding = '3px 10px';
        cgpaLabelCell.style.border = '1px solid #000';
        cgpaLabelCell.style.fontWeight = 'bold';
        cgpaLabelCell.textContent = 'CGPA';
        
        const cgpaValueCell = document.createElement('td');
        cgpaValueCell.style.padding = '3px 10px';
        cgpaValueCell.style.border = '1px solid #000';
        cgpaValueCell.style.width = '60px';
        cgpaValueCell.style.textAlign = 'center';
        cgpaValueCell.style.fontWeight = 'bold';
        cgpaValueCell.textContent = totalCGPA;
        
        cgpaRow.appendChild(cgpaLabelCell);
        cgpaRow.appendChild(cgpaValueCell);
        
        // Credits row
        const creditsRow = document.createElement('tr');
        
        const creditsLabelCell = document.createElement('td');
        creditsLabelCell.style.padding = '3px 10px';
        creditsLabelCell.style.border = '1px solid #000';
        creditsLabelCell.style.fontWeight = 'bold';
        creditsLabelCell.textContent = 'Credits Completed';
        
        const creditsValueCell = document.createElement('td');
        creditsValueCell.style.padding = '3px 10px';
        creditsValueCell.style.border = '1px solid #000';
        creditsValueCell.style.width = '60px';
        creditsValueCell.style.textAlign = 'center';
        creditsValueCell.style.fontWeight = 'bold';
        creditsValueCell.textContent = totalCredits;
        
        creditsRow.appendChild(creditsLabelCell);
        creditsRow.appendChild(creditsValueCell);
        
        // Add rows to table
        summaryTable.appendChild(cgpaRow);
        summaryTable.appendChild(creditsRow);
        
        // Add table to summary container
        summaryBox.appendChild(summaryTable);
        
        return summaryBox;
    }
}

// Export as global variable
window.ResultCard = ResultCard;