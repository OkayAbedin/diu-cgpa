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
                <head>
                    <title>Transcript Preview - ${studentInfo.studentName || studentInfo.name || "Student"}</title>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            margin: 0;
                            padding: 0;
                            background-color: #f0f0f0;
                        }
                        .controls {
                            position: fixed;
                            top: 0;
                            left: 0;
                            right: 0;
                            background-color: #333;
                            color: white;
                            padding: 10px;
                            text-align: center;
                            z-index: 1000;
                            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                        }
                        .btn {
                            background-color: #4CAF50;
                            color: white;
                            border: none;
                            padding: 8px 16px;
                            margin: 0 5px;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 14px;
                        }
                        .btn:hover {
                            background-color: #45a049;
                        }
                        .content-wrapper {
                            margin-top: 60px;
                            padding: 20px;
                            display: flex;
                            justify-content: center;
                        }
                        .message {
                            color: #999;
                            font-size: 14px;
                            margin: 20px;
                        }
                        @media print {
                            .controls, .message {
                                display: none;
                            }
                            .content-wrapper {
                                margin-top: 0;
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
                            border: 1px solid #000;
                        }
                        .semester-table th, .semester-table td {
                            border: 1px solid #000;
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
                    </style>
                </head>
                <body>
                    <div class="controls">
                        <button class="btn" id="savePdf">Save as PDF</button>
                        <button class="btn" id="printBtn">Print</button>
                        <button class="btn" id="closeBtn">Close</button>
                        <span style="font-size: 12px; margin-left: 10px; color: #ddd;">You can preview the transcript and decide to save it or print it.</span>
                    </div>
                    <div class="content-wrapper" id="content">
                        <div class="message">Loading transcript...</div>
                    </div>
                    <script>
                        document.getElementById("closeBtn").addEventListener("click", function() {
                            window.close();
                        });
                        
                        document.getElementById("printBtn").addEventListener("click", function() {
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
                    logo.style.height = "20mm";
                    logo.style.marginBottom = "5mm";
                    const logoSrc = logo.src;
                    logo.src = "assets/img/diu-logo.svg"; // Use the actual DIU logo from assets

                    // Try to determine enrollment semester from student ID if possible
                    if (studentInfo && studentInfo.studentId) {
                        try {
                            // Student IDs often encode enrollment information
                            // Format is typically: semester-year-batch
                            // e.g., 221-15-4919 (Spring 2021, batch 15)
                            const idParts = studentInfo.studentId.split('-');
                            if (idParts.length >= 2) {
                                const semesterYearCode = idParts[0];
                                // First digit is semester (1=Spring, 2=Summer, 3=Fall)
                                const semesterCode = semesterYearCode.charAt(0);
                                // Last two digits are the year (e.g., 22 for 2022)
                                const yearCode = semesterYearCode.substring(1);
                                
                                let enrollmentSemester = "";
                                
                                // Convert semester code to name
                                if (semesterCode === '1') {
                                    enrollmentSemester = "Spring ";
                                } else if (semesterCode === '2') {
                                    enrollmentSemester = "Summer ";
                                } else if (semesterCode === '3') {
                                    enrollmentSemester = "Fall ";
                                }
                                
                                // Add year (20xx format)
                                if (yearCode && yearCode.length === 2) {
                                    enrollmentSemester += "20" + yearCode;
                                }
                                
                                // Set enrollment semester if we determined it
                                if (enrollmentSemester) {
                                    studentInfo.enrollmentSession = enrollmentSemester;
                                }
                            }
                        } catch (error) {
                            console.warn("Could not determine enrollment semester from ID:", error);
                        }
                    }

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
                    program.innerHTML = "<strong>Program:</strong> 4-Year B.Sc. in Computer Science and Engineering";
                    
                    // Student info table
                    const studentTable = previewWindow.document.createElement("table");
                    studentTable.style.width = "100%";
                    studentTable.style.borderCollapse = "collapse";
                    studentTable.innerHTML = `
                        <tr>
                            <td style="width:130px;">Name of the Student</td>
                            <td>: ${studentInfo.studentName || studentInfo.name || ""}</td>
                            <td style="width:130px;">Enrollment Session</td>
                            <td>: ${studentInfo.enrollmentSession || "Spring 2022"}</td>
                        </tr>
                        <tr>
                            <td>Student ID</td>
                            <td>: ${studentInfo.studentId || studentInfo.id || ""}</td>
                            <td>Date of Issue</td>
                            <td>: ${new Date().toLocaleDateString()}</td>
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
                            
                            // Semester header
                            const semesterHeader = previewWindow.document.createElement("div");
                            semesterHeader.style.marginBottom = "5mm";
                            semesterHeader.innerHTML = `<strong>Semester:</strong> ${semester.name}`;
                            
                            // Semester table
                            const semesterTable = previewWindow.document.createElement("table");
                            semesterTable.className = "semester-table";
                            
                            // Table header
                            let tableHTML = `
                                <thead>
                                    <tr>
                                        <th style="width:100px;">Course Code</th>
                                        <th>Course Title</th>
                                        <th style="width:50px;">Credit</th>
                                        <th style="width:60px;">Grade</th>
                                        <th style="width:80px;">Grade Point</th>
                                        <th style="width:50px;">GPA</th>
                                    </tr>
                                </thead>
                                <tbody>
                            `;
                            
                            // Course rows
                            if (semester.courses && semester.courses.length > 0) {
                                semester.courses.forEach(course => {
                                    tableHTML += `
                                        <tr>
                                            <td style="text-align:center;">${course.courseCode || course.customCourseId || "-"}</td>
                                            <td>${course.courseName || course.courseTitle || "Unknown Course"}</td>
                                            <td style="text-align:center;">${course.totalCredit || "0"}</td>
                                            <td style="text-align:center;">${course.gradeLetter || "-"}</td>
                                            <td style="text-align:center;">${course.pointEquivalent || "0"}</td>
                                            <td></td>
                                        </tr>
                                    `;
                                });
                                
                                // GPA row
                                tableHTML += `
                                    <tr>
                                        <td colspan="5"></td>
                                        <td style="text-align:center;font-weight:bold;">${semester.gpa || semester.cgpa || "0.00"}</td>
                                    </tr>
                                `;
                            } else {
                                tableHTML += '<tr><td colspan="6" style="text-align:center;">No courses found for this semester</td></tr>';
                            }
                            
                            tableHTML += '</tbody>';
                            semesterTable.innerHTML = tableHTML;
                            
                            semesterContainer.appendChild(semesterHeader);
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
                    footer.innerHTML = "<p>This is not an official document. Generated with DIUCGPA</p>";
                    transcriptContainer.appendChild(footer);
                    
                    // Add to the content container
                    contentContainer.appendChild(transcriptContainer);
                    
                    // Add PDF save button functionality
                    previewWindow.document.getElementById("savePdf").addEventListener("click", function() {
                        const element = previewWindow.document.querySelector(".transcript-container");
                        
                        if (!element) {
                            console.error("Transcript container not found");
                            return;
                        }
                        
                        const options = {
                            margin: [10, 10],
                            filename: `${studentInfo.studentId || "student"}_transcript.pdf`,
                            image: { type: "jpeg", quality: 1.0 },
                            html2canvas: { 
                                scale: 2, 
                                useCORS: true,
                                logging: true,
                                letterRendering: true,
                                allowTaint: true 
                            },
                            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
                            pagebreak: { mode: "avoid-all" }
                        };
                        
                        // Load html2pdf library dynamically
                        const script = previewWindow.document.createElement("script");
                        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
                        script.onload = function() {
                            previewWindow.html2pdf().set(options).from(element).save();
                        };
                        script.onerror = function() {
                            alert("Failed to load the PDF generation library. Please try again later.");
                        };
                        previewWindow.document.head.appendChild(script);
                    });
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