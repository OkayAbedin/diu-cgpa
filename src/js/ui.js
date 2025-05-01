/**
 * UI Controller for DIU CGPA Calculator
 * Handles user interactions and orchestrates the application flow
 */

class UiController {
    constructor() {
        // DOM Elements - Automatic Calculator
        this.studentIdInput = document.getElementById('student-id');
        this.calculateBtn = document.getElementById('calculate-btn');
        this.loadingSection = document.getElementById('loading');
        this.studentInfoSection = document.getElementById('student-info');
        this.resultsContainer = document.getElementById('results-container');
        this.semesterResultsSection = document.getElementById('semester-results');
        this.totalCgpaElement = document.getElementById('total-cgpa');
        this.totalCreditsElement = document.getElementById('total-credits');
        this.errorMessageSection = document.getElementById('error-message');
        this.cgpaChartCanvas = document.getElementById('cgpa-chart');
        
        // DOM Elements - Manual Calculator
        this.addSemesterBtn = document.getElementById('add-semester-btn');
        this.calculateManualBtn = document.getElementById('calculate-manual-btn');
        this.manualSemesterList = document.getElementById('manual-semester-list');
        this.manualResultsContainer = document.getElementById('manual-results-container');
        this.manualResults = document.getElementById('manual-results');
        this.manualTotalCgpa = document.getElementById('manual-total-cgpa');
        this.manualTotalCredits = document.getElementById('manual-total-credits');
        this.manualCgpaChartCanvas = document.getElementById('manual-cgpa-chart');
        
        // Navigation
        this.navItems = document.querySelectorAll('.gh-nav li');
        this.tabPanes = document.querySelectorAll('.tab-pane');
        
        // Charts
        this.cgpaChart = null;
        this.manualCgpaChart = null;
        
        // Services
        this.apiService = window.apiService;
        this.calculator = window.cgpaCalculator;
        
        // Data
        this.semesterList = [];
        this.studentInfo = null;
        this.semesterResults = {};
        this.manualSemesterCounter = 1;
        
        // DOM Elements - Advanced Fetch
        this.advancedTimeout = document.getElementById('advanced-timeout');
        this.advancedBaseUrl = document.getElementById('advanced-base-url');
        this.advancedStudentId = document.getElementById('advanced-student-id');
        this.advancedFetchBtn = document.getElementById('advanced-fetch-btn');
        this.advancedResultsContainer = document.getElementById('advanced-results-container');
        this.advancedResults = document.getElementById('advanced-results');
        this.advancedErrorMessage = document.getElementById('advanced-error-message');
        this.exportResultsBtn = document.getElementById('export-results-btn');
        
        // Fetch mode forms
        this.fetchModeRadios = document.querySelectorAll('input[name="fetch-mode"]');
        this.singleStudentForm = document.getElementById('single-student-form');
        this.idRangeForm = document.getElementById('id-range-form');
        this.multipleIdsForm = document.getElementById('multiple-ids-form');
        
        // ID Range inputs
        this.idRangePrefix = document.getElementById('id-range-prefix');
        this.idRangeStart = document.getElementById('id-range-start');
        this.idRangeEnd = document.getElementById('id-range-end');
        
        // Multiple IDs input
        this.multipleStudentIds = document.getElementById('multiple-student-ids');
        
        // Initialize
        this.init();
    }
    
    /**
     * Initialize the application
     */
    async init() {
        this.bindEvents();
        try {
            await this.loadSemesterList();
        } catch (error) {
            console.error('Failed to load semester list:', error);
            this.showError('Failed to load semester list. Please check your internet connection and try again.');
        }
    }
    
    /**
     * Bind event handlers
     */
    bindEvents() {
        // Automatic calculator events
        this.calculateBtn.addEventListener('click', () => this.handleCalculate());
        this.studentIdInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleCalculate();
            }
        });
        
        // Manual calculator events
        this.addSemesterBtn.addEventListener('click', () => this.addManualSemester());
        this.calculateManualBtn.addEventListener('click', () => this.calculateManualCgpa());
        
        // Navigation events
        this.navItems.forEach(navItem => {
            navItem.addEventListener('click', () => {
                // Get the tab ID from the data-tab attribute
                const tabId = navItem.getAttribute('data-tab');
                this.showTab(tabId);
            });
        });
        
        // Add event delegation for dynamic elements in manual calculator
        this.manualSemesterList.addEventListener('click', (e) => {
            // Add course button
            if (e.target.closest('.add-course-btn')) {
                const semesterElement = e.target.closest('.gh-semester');
                if (semesterElement) {
                    this.addManualCourse(semesterElement);
                }
            }
            
            // Remove course button
            if (e.target.closest('.remove-course-btn')) {
                const courseRow = e.target.closest('.gh-course-row');
                if (courseRow) {
                    courseRow.remove();
                }
            }
            
            // Remove semester button
            if (e.target.closest('.remove-semester-btn')) {
                const semesterElement = e.target.closest('.gh-semester');
                if (semesterElement) {
                    semesterElement.remove();
                    this.updateSemesterNumbers();
                }
            }
        });
        
        // Add event delegation for result card toggling
        document.addEventListener('click', (e) => {
            const header = e.target.closest('.gh-result-card-header');
            if (header) {
                const card = header.closest('.gh-result-card');
                if (card) {
                    card.classList.toggle('open');
                }
            }
        });

        // Advanced Fetch listeners
        this.advancedFetchBtn.addEventListener('click', () => this.handleAdvancedFetchClick());
        this.exportResultsBtn.addEventListener('click', () => this.handleExportResults());
        
        // Fetch mode radio change
        this.fetchModeRadios.forEach(radio => {
            radio.addEventListener('change', () => this.handleFetchModeChange());
        });
        
        // Initialize the fetch mode UI
        this.handleFetchModeChange();
    }
    
    /**
     * Show a specific tab and update navigation
     * @param {string} tabId - The ID of the tab to show
     */
    showTab(tabId) {
        // Update navigation items
        this.navItems.forEach(item => {
            if (item.getAttribute('data-tab') === tabId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // Update tab panes
        this.tabPanes.forEach(pane => {
            if (pane.id === tabId) {
                pane.classList.add('active');
            } else {
                pane.classList.remove('active');
            }
        });
    }
    
    /**
     * Load the semester list from the API
     */
    async loadSemesterList() {
        try {
            this.semesterList = await this.apiService.getSemesterList();
            console.log('Semester list loaded:', this.semesterList.length, 'semesters');
            
            if (!this.semesterList || !Array.isArray(this.semesterList) || this.semesterList.length === 0) {
                throw new Error('Empty or invalid semester list returned');
            }
        } catch (error) {
            console.error('Error loading semester list:', error);
            throw error;
        }
    }
    
    /**
     * Handle calculate button click
     */
    async handleCalculate() {
        const studentId = this.studentIdInput.value.trim();
        
        if (!Helpers.isValidStudentId(studentId)) {
            alert('Please enter a valid student ID (e.g., 221-15-4919)');
            return;
        }
        
        // Disable button during calculation to prevent multiple clicks
        this.calculateBtn.disabled = true;
        this.calculateBtn.textContent = 'Calculating...';
        
        this.resetUI();
        
        try {
            // Use default timeout (15 seconds) instead of showing the dialog
            this.apiService.setTimeout(15);
            
            Helpers.showElement(this.loadingSection);
            
            if (!this.semesterList || this.semesterList.length === 0) {
                // Try to reload semester list if it's empty
                await this.loadSemesterList();
            }
            
            // Load student info
            try {
                this.studentInfo = await this.apiService.getStudentInfo(studentId);
                console.log('Student info loaded:', this.studentInfo);
                if (!this.studentInfo || typeof this.studentInfo !== 'object') {
                    throw new Error('Invalid student information returned');
                }
            } catch (error) {
                console.error('Error loading student info:', error);
                throw new Error(`Could not find student with ID ${studentId}. Please check the ID and try again.`);
            }
            
            // Load all semester results
            try {
                this.semesterResults = await this.apiService.getAllSemesterResults(
                    studentId, 
                    this.semesterList
                );
                console.log('Semester results loaded:', Object.keys(this.semesterResults).length, 'semesters');
            } catch (error) {
                console.error('Error loading semester results:', error);
                throw new Error('Failed to load semester results. The student ID may be incorrect or there might be a connection issue.');
            }
            
            // Process and display results
            this.displayResults();
            
        } catch (error) {
            console.error('Error calculating CGPA:', error);
            this.showError(error.message || 'An error occurred while calculating CGPA. Please try again later.');
        } finally {
            Helpers.hideElement(this.loadingSection);
            // Re-enable button
            this.calculateBtn.disabled = false;
            this.calculateBtn.textContent = 'Calculate CGPA';
        }
    }
    
    /**
     * Reset the UI to initial state
     */
    resetUI() {
        Helpers.hideElement(this.studentInfoSection);
        Helpers.hideElement(this.resultsContainer);
        Helpers.hideElement(this.errorMessageSection);
        this.studentInfoSection.innerHTML = '';
        this.semesterResultsSection.innerHTML = '';
        this.totalCgpaElement.innerHTML = '';
        this.totalCreditsElement.innerHTML = '';
        
        // Destroy existing chart if it exists
        if (this.cgpaChart) {
            this.cgpaChart.destroy();
            this.cgpaChart = null;
        }
    }
    
    /**
     * Display student info and results
     */
    displayResults() {
        // Display student info
        this.displayStudentInfo();
        
        // No semester results
        if (Object.keys(this.semesterResults).length === 0) {
            this.showError(`No semester results found for student ID: ${this.studentIdInput.value.trim()}. This may be a new student without any course results yet.`);
            return;
        }
        
        // Check for missing semesters
        if (this.semesterResults.missingSemesters && this.semesterResults.missingSemesters.length > 0) {
            this.showMissingSemestersWarning(this.semesterResults.missingSemesters);
        }
        
        // Calculate and display CGPA
        const { cgpa, totalCredits } = this.calculator.calculateCgpa(this.semesterResults);
        this.totalCgpaElement.innerHTML = `<strong>${cgpa}</strong>`;
        this.totalCreditsElement.innerHTML = `Total Credits: <strong>${totalCredits}</strong>`;
        
        // Process semester data
        const semesterData = this.calculator.processSemesterData(
            this.semesterResults, 
            this.semesterList
        );
        
        // Display semester results
        this.semesterResultsSection.innerHTML = SemesterList.render(semesterData);
        
        // Create CGPA chart
        this.createCgpaChart(semesterData);
        
        Helpers.showElement(this.resultsContainer);
    }
    
    /**
     * Create CGPA chart using Chart.js
     * @param {Array} semesterData - Array of semester data objects
     */
    createCgpaChart(semesterData) {
        if (!semesterData || semesterData.length === 0 || !this.cgpaChartCanvas) return;
        
        // Sort semesters chronologically
        const sortedSemesters = [...semesterData].sort((a, b) => a.year - b.year || a.term - b.term);
        
        // Prepare data for chart
        const labels = sortedSemesters.map(semester => semester.name);
        const cgpaData = sortedSemesters.map(semester => semester.gpa);
        
        // Calculate cumulative GPA over time
        const cumulativeGpa = [];
        let totalPoints = 0;
        let totalCredits = 0;
        
        sortedSemesters.forEach((semester, index) => {
            const semesterPoints = semester.gpa * semester.totalCredits;
            totalPoints += semesterPoints;
            totalCredits += semester.totalCredits;
            cumulativeGpa.push((totalPoints / totalCredits).toFixed(2));
        });
        
        // Create chart
        const ctx = this.cgpaChartCanvas.getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.cgpaChart) {
            this.cgpaChart.destroy();
        }
        
        this.cgpaChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Semester GPA',
                        data: cgpaData,
                        backgroundColor: 'rgba(46, 164, 79, 0.2)', // GitHub green with transparency
                        borderColor: 'var(--color-success)', // GitHub green
                        borderWidth: 2,
                        pointBackgroundColor: 'var(--color-success)',
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        tension: 0.1
                    },
                    {
                        label: 'Cumulative GPA',
                        data: cumulativeGpa,
                        backgroundColor: 'rgba(3, 102, 214, 0.2)', // GitHub blue with transparency
                        borderColor: 'var(--color-link)', // GitHub blue
                        borderWidth: 2,
                        pointBackgroundColor: 'var(--color-link)',
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 0,
                        max: 4,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        backgroundColor: 'rgba(36, 41, 46, 0.9)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        padding: 10
                    }
                }
            }
        });
    }
    
    /**
     * Display student information
     */
    displayStudentInfo() {
        if (this.studentInfo) {
            this.studentInfoSection.innerHTML = StudentInfo.render(this.studentInfo);
            Helpers.showElement(this.studentInfoSection);
        }
    }
    
    /**
     * Show warning for missing semesters
     * @param {Array} missingSemesters - List of missing semester objects
     */
    showMissingSemestersWarning(missingSemesters) {
        if (!missingSemesters || missingSemesters.length === 0) return;
        
        // Create snackbar if it doesn't exist
        let snackbar = document.getElementById('missing-semesters-snackbar');
        if (!snackbar) {
            snackbar = document.createElement('div');
            snackbar.id = 'missing-semesters-snackbar';
            snackbar.className = 'gh-snackbar';
            document.body.appendChild(snackbar);
        }
        
        // Create warning message
        const semesterNames = missingSemesters.map(sem => sem.name).join(', ');
        snackbar.innerHTML = `
            <div class="gh-snackbar-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="gh-snackbar-content">
                <h4>Missing Semester Data</h4>
                <p>Some semester results appear to be missing: <strong>${semesterNames}</strong></p>
                <p>Your CGPA calculation may be incomplete. This could be due to server issues or missing data.</p>
            </div>
        `;
        
        // Show the snackbar and set it to hide after 6 seconds
        snackbar.classList.add('show');
        
        // Remove the show class after 6 seconds (animation duration + display time)
        setTimeout(() => {
            snackbar.classList.remove('show');
        }, 6000);
    }
    
    /**
     * Show error message
     * @param {string} message - Custom error message (optional)
     */
    showError(message) {
        const errorElement = document.querySelector('#error-message .gh-alert-content p');
        if (message && errorElement) {
            errorElement.textContent = message;
        }
        Helpers.showElement(this.errorMessageSection);
    }

    /**
     * Add a new manual semester to the list
     */
    addManualSemester() {
        this.manualSemesterCounter++;
        const semesterHtml = `
            <div class="gh-semester">
                <div class="gh-semester-header">
                    <h4>Semester ${this.manualSemesterCounter}</h4>
                    <button class="gh-btn gh-btn-sm gh-btn-danger remove-semester-btn">
                        <i class="fas fa-trash"></i>
                        <span>Remove</span>
                    </button>
                </div>
                
                <div class="courses-container">
                    <div class="gh-course-row">
                        <div class="gh-course-inputs">
                            <input type="text" class="gh-form-control course-name" placeholder="Course Name (optional)">
                            <input type="number" class="gh-form-control course-credit" placeholder="Credit" min="0" step="0.5">
                            <select class="gh-form-select course-grade">
                                <option value="">Grade</option>
                                <option value="4.00">A+ (4.00)</option>
                                <option value="3.75">A (3.75)</option>
                                <option value="3.50">A- (3.50)</option>
                                <option value="3.25">B+ (3.25)</option>
                                <option value="3.00">B (3.00)</option>
                                <option value="2.75">B- (2.75)</option>
                                <option value="2.50">C+ (2.50)</option>
                                <option value="2.25">C (2.25)</option>
                                <option value="2.00">D (2.00)</option>
                                <option value="0.00">F (0.00)</option>
                            </select>
                            <button class="gh-btn gh-btn-icon gh-btn-danger remove-course-btn">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <button class="gh-btn gh-btn-secondary add-course-btn">
                    <i class="fas fa-plus"></i> Add Course
                </button>
            </div>
        `;
        
        this.manualSemesterList.insertAdjacentHTML('beforeend', semesterHtml);
    }
    
    /**
     * Add a new course row to a manual semester
     * @param {HTMLElement} semesterElement - The semester element to add the course to
     */
    addManualCourse(semesterElement) {
        const coursesContainer = semesterElement.querySelector('.courses-container');
        if (!coursesContainer) return;
        
        const courseHtml = `
            <div class="gh-course-row">
                <div class="gh-course-inputs">
                    <input type="text" class="gh-form-control course-name" placeholder="Course Name (optional)">
                    <input type="number" class="gh-form-control course-credit" placeholder="Credit" min="0" step="0.5">
                    <select class="gh-form-select course-grade">
                        <option value="">Grade</option>
                        <option value="4.00">A+ (4.00)</option>
                        <option value="3.75">A (3.75)</option>
                        <option value="3.50">A- (3.50)</option>
                        <option value="3.25">B+ (3.25)</option>
                        <option value="3.00">B (3.00)</option>
                        <option value="2.75">B- (2.75)</option>
                        <option value="2.50">C+ (2.50)</option>
                        <option value="2.25">C (2.25)</option>
                        <option value="2.00">D (2.00)</option>
                        <option value="0.00">F (0.00)</option>
                    </select>
                    <button class="gh-btn gh-btn-icon gh-btn-danger remove-course-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
        
        coursesContainer.insertAdjacentHTML('beforeend', courseHtml);
    }
    
    /**
     * Update the semester numbers after removing a semester
     */
    updateSemesterNumbers() {
        const semesterElements = this.manualSemesterList.querySelectorAll('.gh-semester');
        semesterElements.forEach((element, index) => {
            const heading = element.querySelector('h4');
            if (heading) {
                heading.textContent = `Semester ${index + 1}`;
            }
        });
        
        // Update the counter for adding new semesters
        this.manualSemesterCounter = semesterElements.length;
    }
    
    /**
     * Calculate CGPA based on manually entered data
     */
    calculateManualCgpa() {
        // Validate inputs first
        const isValid = this.validateManualInputs();
        if (!isValid) {
            alert('Please fill in all course credits and grades in the manual calculator.');
            return;
        }
        
        // Collect semester data
        const semesters = [];
        const semesterElements = this.manualSemesterList.querySelectorAll('.gh-semester');
        
        semesterElements.forEach((semesterElement, index) => {
            const courseRows = semesterElement.querySelectorAll('.gh-course-row');
            const courses = [];
            
            courseRows.forEach(row => {
                const nameInput = row.querySelector('.course-name');
                const creditInput = row.querySelector('.course-credit');
                const gradeSelect = row.querySelector('.course-grade');
                
                // Only add if credit and grade are filled
                if (creditInput.value && gradeSelect.value) {
                    courses.push({
                        name: nameInput.value || 'Untitled Course',
                        credit: parseFloat(creditInput.value),
                        grade: parseFloat(gradeSelect.value)
                    });
                }
            });
            
            if (courses.length > 0) {
                semesters.push({ 
                    id: `manual-${index + 1}`,
                    name: `Semester ${index + 1}`,
                    courses 
                });
            }
        });
        
        // Calculate CGPA
        const result = this.calculator.calculateManualCgpa(semesters);
        
        // Display results
        this.manualTotalCgpa.textContent = `CGPA: ${result.cgpa}`;
        this.manualTotalCredits.textContent = `Total Credits: ${result.totalCredits}`;
        
        // Create chart for manual calculation
        this.createManualCgpaChart(semesters, result.cgpa);
        
        // Show results container
        Helpers.showElement(this.manualResultsContainer);
        
        // Scroll to results
        this.manualResultsContainer.scrollIntoView({ behavior: 'smooth' });
    }
    
    /**
     * Create chart for manual CGPA calculation
     * @param {Array} semesters - Array of semester data 
     * @param {string} finalCgpa - Final calculated CGPA
     */
    createManualCgpaChart(semesters, finalCgpa) {
        if (!semesters || semesters.length === 0 || !this.manualCgpaChartCanvas) return;
        
        // Calculate GPA for each semester
        const semesterGpas = semesters.map(semester => {
            let totalPoints = 0;
            let totalCredits = 0;
            
            semester.courses.forEach(course => {
                totalPoints += course.grade * course.credit;
                totalCredits += course.credit;
            });
            
            return {
                name: semester.name,
                gpa: (totalPoints / totalCredits).toFixed(2),
                totalCredits: totalCredits
            };
        });
        
        // Prepare data for chart
        const labels = semesterGpas.map(sem => sem.name);
        const gpaData = semesterGpas.map(sem => sem.gpa);
        
        // Calculate cumulative GPA over time
        const cumulativeGpa = [];
        let totalPoints = 0;
        let totalCredits = 0;
        
        semesterGpas.forEach(semester => {
            const semesterPoints = semester.gpa * semester.totalCredits;
            totalPoints += semesterPoints;
            totalCredits += semester.totalCredits;
            cumulativeGpa.push((totalPoints / totalCredits).toFixed(2));
        });
        
        // Create chart
        const ctx = this.manualCgpaChartCanvas.getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.manualCgpaChart) {
            this.manualCgpaChart.destroy();
        }
        
        // Create a combined chart
        this.manualCgpaChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Semester GPA',
                        data: gpaData,
                        backgroundColor: 'rgba(46, 164, 79, 0.2)', // GitHub green with transparency
                        borderColor: 'var(--color-success)', // GitHub green
                        borderWidth: 2,
                        pointBackgroundColor: 'var(--color-success)',
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        tension: 0.1
                    },
                    {
                        label: 'Cumulative GPA',
                        data: cumulativeGpa,
                        backgroundColor: 'rgba(3, 102, 214, 0.2)', // GitHub blue with transparency
                        borderColor: 'var(--color-link)', // GitHub blue
                        borderWidth: 2,
                        pointBackgroundColor: 'var(--color-link)',
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 0,
                        max: 4,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        backgroundColor: 'rgba(36, 41, 46, 0.9)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        padding: 10
                    }
                }
            }
        });
    }
    
    /**
     * Validate inputs in manual calculator
     * @returns {boolean} True if all required fields are filled
     */
    validateManualInputs() {
        let isValid = true;
        const courseCredits = document.querySelectorAll('.course-credit');
        const courseGrades = document.querySelectorAll('.course-grade');
        
        // Reset any previous validation styling
        courseCredits.forEach(input => input.classList.remove('is-invalid'));
        courseGrades.forEach(select => select.classList.remove('is-invalid'));
        
        // Check each pair of inputs (credit and grade)
        for (let i = 0; i < courseCredits.length; i++) {
            const credit = courseCredits[i].value;
            const grade = courseGrades[i].value;
            
            // If one is filled but not the other
            if ((credit && !grade) || (!credit && grade)) {
                if (!credit) courseCredits[i].classList.add('is-invalid');
                if (!grade) courseGrades[i].classList.add('is-invalid');
                isValid = false;
            }
        }
        
        return isValid;
    }

    /**
     * Shows a dialog to let the user choose a timeout value
     * @returns {Promise<number>} Timeout value in seconds
     */
    async showTimeoutDialog() {
        return new Promise((resolve) => {
            // Use the existing dialog from the HTML
            const timeoutModal = document.getElementById('timeoutModal');
            if (!timeoutModal) {
                // If dialog doesn't exist for some reason, use default timeout
                console.error('Timeout modal element not found, using default timeout');
                resolve(15); // Default to 15 seconds
                return;
            }
            
            const closeBtn = document.getElementById('closeTimeoutModal');
            const cancelBtn = document.getElementById('cancelTimeoutBtn');
            const confirmBtn = document.getElementById('confirmTimeoutBtn');
            const timeoutInput = document.getElementById('timeoutValue');
            
            // Set initial value from API service
            const currentTimeout = this.apiService.getTimeoutInSeconds();
            if (currentTimeout && timeoutInput) {
                timeoutInput.value = currentTimeout;
            }
            
            // Show the modal
            timeoutModal.classList.add('show');
            
            // Handle close events
            const closeModal = () => {
                timeoutModal.classList.remove('show');
            };
            
            const handleConfirm = () => {
                const timeoutValue = parseInt(timeoutInput.value, 10);
                // Validate the timeout value
                if (isNaN(timeoutValue) || timeoutValue < 5) {
                    resolve(15); // Default to 15 seconds if invalid
                } else {
                    resolve(timeoutValue);
                }
                closeModal();
            };
            
            const handleCancel = () => {
                resolve(this.apiService.getTimeoutInSeconds() || 15); // Use current value or default
                closeModal();
            };
            
            // Remove any existing event listeners
            const newCloseBtn = closeBtn.cloneNode(true);
            const newCancelBtn = cancelBtn.cloneNode(true);
            const newConfirmBtn = confirmBtn.cloneNode(true);
            
            closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
            cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
            confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
            
            // Add event listeners
            newCloseBtn.addEventListener('click', handleCancel);
            newCancelBtn.addEventListener('click', handleCancel);
            newConfirmBtn.addEventListener('click', handleConfirm);
        });
    }

    /**
     * Handle advanced fetch click
     * Fetches student data based on the selected fetch mode (Single, Range, or Multiple)
     */
    async handleAdvancedFetchClick() {
        try {
            // Get the selected fetch mode
            const selectedMode = document.querySelector('input[name="fetch-mode"]:checked').value;
            
            // Show loading indicator
            const resultsContainer = document.getElementById('advanced-results');
            resultsContainer.innerHTML = '<div class="gh-loading"><div class="gh-spinner"></div><p>Fetching data...</p></div>';
            Helpers.showElement(document.getElementById('advanced-results-container'));
            
            // Get timeout value
            const timeout = parseInt(this.advancedTimeout.value, 10) || 15;
            
            // Set custom API options
            this.apiService.setTimeout(timeout);
            
            if (this.advancedBaseUrl.value.trim()) {
                this.apiService.setBaseUrl(this.advancedBaseUrl.value.trim());
            }
            
            let studentIds = [];
            
            // Get student IDs based on the selected mode
            switch (selectedMode) {
                case 'single':
                    const singleId = this.advancedStudentId.value.trim();
                    if (!singleId) {
                        throw new Error('Please enter a student ID');
                    }
                    if (!Helpers.isValidStudentId(singleId)) {
                        throw new Error('Please enter a valid student ID (e.g., 221-15-4919)');
                    }
                    studentIds.push(singleId);
                    break;
                    
                case 'range':
                    const prefix = this.idRangePrefix.value.trim();
                    const start = parseInt(this.idRangeStart.value, 10);
                    const end = parseInt(this.idRangeEnd.value, 10);
                    
                    if (!prefix) {
                        throw new Error('Please enter an ID prefix');
                    }
                    
                    if (isNaN(start) || isNaN(end)) {
                        throw new Error('Please enter valid start and end numbers');
                    }
                    
                    if (start > end) {
                        throw new Error('Start number must be less than or equal to end number');
                    }
                    
                    if (end - start > 100) {
                        throw new Error('Range too large. Maximum of 100 students allowed.');
                    }
                    
                    studentIds = this.apiService.generateStudentIdRange(prefix, start, end);
                    break;
                    
                case 'multiple':
                    const multipleIdsText = this.multipleStudentIds.value.trim();
                    if (!multipleIdsText) {
                        throw new Error('Please enter student IDs');
                    }
                    
                    // Split by commas, newlines, or spaces
                    studentIds = multipleIdsText.split(/[\s,]+/).filter(id => id.trim().length > 0);
                    
                    if (studentIds.length > 50) {
                        throw new Error('Too many IDs. Maximum of 50 students allowed.');
                    }
                    
                    // Validate each ID
                    for (const id of studentIds) {
                        if (!Helpers.isValidStudentId(id)) {
                            throw new Error(`Invalid student ID format: ${id}`);
                        }
                    }
                    break;
                    
                default:
                    throw new Error('Please select a fetch mode');
            }
            
            if (studentIds.length === 0) {
                throw new Error('No valid student IDs provided');
            }
            
            // Fetch data for each student ID
            const results = await this.apiService.fetchMultipleStudentsCGPA(
                studentIds,
                (status, progress, currentId, completed, total) => {
                    // Update progress in UI if needed
                    resultsContainer.innerHTML = `<div class="gh-loading">
                        <div class="gh-spinner"></div>
                        <p>Fetching data: ${completed}/${total} (${progress}%)</p>
                        <p>Current ID: ${currentId}</p>
                    </div>`;
                }
            );
            
            // Store results for export
            this.advancedFetchResults = results;
            
            // Display results
            this.displayAdvancedResults(results);
            
            // Show export button
            Helpers.showElement(document.getElementById('export-results-btn'));
            
        } catch (error) {
            console.error('Error in advanced fetch:', error);
            const errorElement = document.getElementById('advanced-error-message');
            const errorMsg = errorElement.querySelector('.gh-alert-content p');
            if (errorMsg) {
                errorMsg.textContent = error.message || 'An error occurred during advanced fetch.';
            }
            Helpers.showElement(errorElement);
            
            // Clear results area
            document.getElementById('advanced-results').innerHTML = '';
        }
    }

    /**
     * Display multiple students results in the advanced fetch results table
     * @param {Array|Object} results - Array of student results or results object from fetchMultipleStudentsCGPA
     */
    displayMultipleStudentsResults(results) {
        // If we received the results object directly from fetchMultipleStudentsCGPA
        const studentResults = Array.isArray(results) ? results : 
            (results && results.results ? Object.values(results.results) : []);
        
        if (!studentResults || studentResults.length === 0) {
            this.showMessage('No results to display', 'warning');
            return;
        }
        
        // Clear previous results
        const multiResultsBody = document.getElementById('advanced-results');
        if (!multiResultsBody) {
            console.error('Results container not found');
            return;
        }
        
        // Store the results for later use (e.g. export)
        this.multiStudentResults = studentResults;
        
        // Create results summary
        const totalStudents = studentResults.length;
        const successCount = studentResults.filter(r => r && r.studentInfo).length;
        const errorCount = totalStudents - successCount;
        
        const summaryHtml = `
            <div class="gh-box">
                <h3>Results Summary</h3>
                <div class="gh-stats-container" style="grid-template-columns: 1fr 1fr 1fr;">
                    <div class="gh-stats-box">
                        <div class="gh-stats-value">${totalStudents}</div>
                        <div class="gh-stats-label">Total Students</div>
                    </div>
                    <div class="gh-stats-box">
                        <div class="gh-stats-value" style="color: var(--color-success);">${successCount}</div>
                        <div class="gh-stats-label">Successful</div>
                    </div>
                    <div class="gh-stats-box">
                        <div class="gh-stats-value" style="color: var(--color-btn-danger-bg);">${errorCount}</div>
                        <div class="gh-stats-label">Failed</div>
                    </div>
                </div>
            </div>
        `;
        
        // Create results list
        let resultsHtml = '<div class="gh-section-title"><h3>Student Results</h3></div>';
        
        // Process each student result
        studentResults.forEach((data, index) => {
            if (!data || !data.studentInfo) return;
            
            const studentInfo = data.studentInfo;
            const studentId = studentInfo.id || studentInfo.studentId || 'Unknown ID';
            const name = studentInfo.name || studentInfo.studentName || 'Unknown';
            const department = studentInfo.department || studentInfo.departmentName || 'Unknown';
            
            // Calculate CGPA if we have results
            let cgpa = 'N/A';
            let totalCredits = 0;
            let semesterCount = 0;
            
            if (data.results) {
                try {
                    // Filter out missingSemesters key
                    const semesterResults = {};
                    Object.entries(data.results).forEach(([key, value]) => {
                        if (key !== 'missingSemesters' && Array.isArray(value)) {
                            semesterResults[key] = value;
                            semesterCount++;
                        }
                    });
                    
                    // Calculate CGPA if we have semester results
                    if (Object.keys(semesterResults).length > 0) {
                        const result = this.calculator.calculateCgpa(semesterResults);
                        cgpa = result.cgpa;
                        totalCredits = result.totalCredits;
                    }
                } catch (error) {
                    console.error(`Error calculating CGPA for ${studentId}:`, error);
                }
            }
            
            // Create result card
            resultsHtml += `
                <div class="advanced-result-item">
                    <div class="advanced-result-info">
                        <div class="advanced-result-id">${studentId} - ${name}</div>
                        <div class="advanced-result-details">
                            <span>${department}</span> | 
                            <span>Semesters: ${semesterCount}</span> |
                            <span>Credits: ${totalCredits}</span>
                        </div>
                    </div>
                    <div class="advanced-result-cgpa">
                        CGPA: ${cgpa}
                    </div>
                </div>
            `;
        });
        
        // Update the container
        multiResultsBody.innerHTML = summaryHtml + resultsHtml;
        
        // Show export button
        Helpers.showElement(document.getElementById('export-results-btn'));
        
        // Show the results section
        Helpers.showElement(document.getElementById('advanced-results-container'));
    }

    /**
     * Handle export results button click
     * Exports the advanced fetch results to a CSV file
     */
    handleExportResults() {
        if (!this.advancedFetchResults || this.advancedFetchResults.length === 0) {
            alert('No results to export');
            return;
        }
        
        // Create CSV content
        let csvContent = 'Student ID,Name,CGPA,Total Credits,Status\n';
        
        this.advancedFetchResults.forEach(result => {
            // Escape any fields that might contain commas
            const name = result.name ? `"${result.name.replace(/"/g, '""')}"` : 'N/A';
            const cgpa = result.cgpa ? result.cgpa.toFixed(2) : 'N/A';
            const credits = result.totalCredits || 'N/A';
            const status = result.error ? 'Failed' : 'Success';
            
            csvContent += `${result.id},${name},${cgpa},${credits},${status}\n`;
        });
        
        // Create a blob and download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        // Set download attributes
        const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        link.setAttribute('href', url);
        link.setAttribute('download', `diu-cgpa-export-${date}.csv`);
        link.style.display = 'none';
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
    }
    
    /**
     * Show a message to the user
     * @param {string} message - The message to show
     * @param {string} type - The type of message (success, error, warning, info)
     */
    showMessage(message, type = 'info') {
        // Create message element if it doesn't exist
        let messageElement = document.getElementById('message-toast');
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.id = 'message-toast';
            messageElement.className = 'gh-toast';
            document.body.appendChild(messageElement);
        }
        
        // Set message content and type
        messageElement.textContent = message;
        messageElement.className = `gh-toast gh-toast-${type}`;
        
        // Show the message
        messageElement.classList.add('show');
        
        // Hide after 3 seconds
        setTimeout(() => {
            messageElement.classList.remove('show');
        }, 3000);
    }
    
    /**
     * Show loader during data fetching
     */
    showLoader() {
        Helpers.showElement(this.loadingSection);
    }
    
    /**
     * Hide loader after data fetching
     */
    hideLoader() {
        Helpers.hideElement(this.loadingSection);
    }
    
    /**
     * Clear fetch results
     */
    clearResults() {
        this.fetchResults = [];
        Helpers.hideElement(document.getElementById('export-results-btn'));
    }

    /**
     * Handle fetch mode change
     * Updates the UI based on the selected fetch mode (Single, Range, or Multiple)
     */
    handleFetchModeChange() {
        // Get the selected radio button
        const selectedRadio = document.querySelector('input[name="fetch-mode"]:checked');
        if (!selectedRadio) return;
        
        // Update the hidden field with the selected mode value
        const fetchModeField = document.getElementById('fetch-mode');
        fetchModeField.value = selectedRadio.value;
        
        // Get the containers for each mode
        const singleStudentForm = document.getElementById('single-student-form');
        const idRangeForm = document.getElementById('id-range-form');
        const multipleIdsForm = document.getElementById('multiple-ids-form');
        
        // Hide all form sections first
        Helpers.hideElement(singleStudentForm);
        Helpers.hideElement(idRangeForm);
        Helpers.hideElement(multipleIdsForm);
        
        // Show the appropriate form section based on selected mode
        switch (selectedRadio.value) {
            case 'single':
                Helpers.showElement(singleStudentForm);
                break;
            case 'range':
                Helpers.showElement(idRangeForm);
                break;
            case 'multiple':
                Helpers.showElement(multipleIdsForm);
                break;
        }
        
        // Clear previous results when mode changes
        const resultsContainer = document.getElementById('advanced-results');
        if (resultsContainer) resultsContainer.innerHTML = '';
        
        const errorMessage = document.getElementById('advanced-error-message');
        if (errorMessage) Helpers.hideElement(errorMessage);
        
        // Hide export button
        const exportBtn = document.getElementById('export-results-btn');
        if (exportBtn) Helpers.hideElement(exportBtn);
    }

    /**
     * Display advanced fetch results
     * @param {Object} results - Results from fetchMultipleStudentsCGPA
     */
    displayAdvancedResults(results) {
        const resultsContainer = document.getElementById('advanced-results');
        resultsContainer.innerHTML = '';
        
        if (!results || !results.results || Object.keys(results.results).length === 0) {
            resultsContainer.innerHTML = '<div class="gh-alert gh-alert-warning">No results found</div>';
            return;
        }
        
        // Create results summary
        const totalStudents = Object.keys(results.results).length;
        const totalErrors = Object.keys(results.errors || {}).length;
        const successCount = totalStudents - totalErrors;
        
        const summaryHtml = `
            <div class="gh-box">
                <h3>Results Summary</h3>
                <div class="gh-stats-container" style="grid-template-columns: 1fr 1fr 1fr;">
                    <div class="gh-stats-box">
                        <div class="gh-stats-value">${totalStudents}</div>
                        <div class="gh-stats-label">Total Students</div>
                    </div>
                    <div class="gh-stats-box">
                        <div class="gh-stats-value" style="color: var(--color-success);">${successCount}</div>
                        <div class="gh-stats-label">Successful</div>
                    </div>
                    <div class="gh-stats-box">
                        <div class="gh-stats-value" style="color: var(--color-btn-danger-bg);">${totalErrors}</div>
                        <div class="gh-stats-label">Failed</div>
                    </div>
                </div>
            </div>
        `;
        
        // Create results list
        let resultsHtml = '<div class="gh-section-title"><h3>Student Results</h3></div>';
        
        // Process each student result
        Object.entries(results.results).forEach(([studentId, data]) => {
            if (!data || !data.studentInfo) return;
            
            const studentInfo = data.studentInfo;
            const name = studentInfo.name || studentInfo.studentName || 'Unknown';
            const department = studentInfo.department || studentInfo.departmentName || 'Unknown';
            
            // Calculate CGPA if we have results
            let cgpa = 'N/A';
            let totalCredits = 0;
            let semesterCount = 0;
            
            if (data.results) {
                try {
                    // Filter out missingSemesters key
                    const semesterResults = {};
                    Object.entries(data.results).forEach(([key, value]) => {
                        if (key !== 'missingSemesters' && Array.isArray(value)) {
                            semesterResults[key] = value;
                            semesterCount++;
                        }
                    });
                    
                    // Calculate CGPA if we have semester results
                    if (Object.keys(semesterResults).length > 0) {
                        const result = this.calculator.calculateCgpa(semesterResults);
                        cgpa = result.cgpa;
                        totalCredits = result.totalCredits;
                    }
                } catch (error) {
                    console.error(`Error calculating CGPA for ${studentId}:`, error);
                }
            }
            
            // Create result card
            resultsHtml += `
                <div class="advanced-result-item">
                    <div class="advanced-result-info">
                        <div class="advanced-result-id">${studentId} - ${name}</div>
                        <div class="advanced-result-details">
                            <span>${department}</span> | 
                            <span>Semesters: ${semesterCount}</span> |
                            <span>Credits: ${totalCredits}</span>
                        </div>
                    </div>
                    <div class="advanced-result-cgpa">
                        CGPA: ${cgpa}
                    </div>
                </div>
            `;
        });
        
        // Display errors if any
        if (totalErrors > 0) {
            resultsHtml += '<div class="gh-section-title"><h3>Errors</h3></div>';
            
            Object.entries(results.errors || {}).forEach(([studentId, errorMsg]) => {
                resultsHtml += `
                    <div class="advanced-result-item">
                        <div class="advanced-result-info">
                            <div class="advanced-result-id">${studentId}</div>
                            <div class="advanced-result-details">
                                <span class="error-message">${errorMsg}</span>
                            </div>
                        </div>
                    </div>
                `;
            });
        }
        
        // Update the container
        resultsContainer.innerHTML = summaryHtml + resultsHtml;
        
        // Show export button
        Helpers.showElement(document.getElementById('export-results-btn'));
    }
}

// Initialize UI on document load
document.addEventListener('DOMContentLoaded', () => {
    window.uiController = new UiController();
});