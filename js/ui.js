/**
 * UI Controller for DIU CGPA
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
        
        // Theme Toggle
        this.themeToggleBtn = document.getElementById('theme-toggle-btn');
        
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
        
        // Initialize event listeners for the default semester's grade dropdown
        const initialGradeSelect = this.manualSemesterList.querySelector('.course-grade');
        const initialCustomGradeContainer = this.manualSemesterList.querySelector('.custom-grade-container');
        
        if (initialGradeSelect && initialCustomGradeContainer) {
            initialGradeSelect.addEventListener('change', (e) => {
                if (e.target.value === 'custom') {
                    initialCustomGradeContainer.style.display = 'block';
                } else {
                    initialCustomGradeContainer.style.display = 'none';
                }
            });
        }
        
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
        
        // Theme toggle event
        if (this.themeToggleBtn) {
            this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
            // Initialize theme from localStorage
            this.initTheme();
        }
        
        // Save as PDF button event
        const savePdfBtn = document.getElementById('save-pdf-btn');
        if (savePdfBtn) {
            savePdfBtn.addEventListener('click', () => this.generateTranscriptPDF());
        }
        
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
     * Initialize theme from localStorage or system preference
     */
    initTheme() {
        // Check localStorage first
        const savedTheme = localStorage.getItem('theme');
        
        if (savedTheme) {
            // Apply saved theme
            document.documentElement.setAttribute('data-theme', savedTheme);
            this.updateThemeToggleIcon(savedTheme);
        } else {
            // Check system preference
            const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const initialTheme = prefersDarkMode ? 'dark' : 'light';
            
            // Apply theme based on system preference
            document.documentElement.setAttribute('data-theme', initialTheme);
            this.updateThemeToggleIcon(initialTheme);
            
            // Save initial theme to localStorage
            localStorage.setItem('theme', initialTheme);
        }
    }
    
    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        // Apply new theme
        document.documentElement.setAttribute('data-theme', newTheme);
        
        // Update toggle button icon
        this.updateThemeToggleIcon(newTheme);
        
        // Save theme preference
        localStorage.setItem('theme', newTheme);
    }
    
    /**
     * Update theme toggle button icon based on current theme
     * @param {string} theme - 'light' or 'dark'
     */
    updateThemeToggleIcon(theme) {
        if (!this.themeToggleBtn) return;
        
        if (theme === 'dark') {
            this.themeToggleBtn.setAttribute('title', 'Switch to light mode');
        } else {
            this.themeToggleBtn.setAttribute('title', 'Switch to dark mode');
        }
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
            
            // Show loading section with detailed progress
            Helpers.showElement(this.loadingSection);
            this.showDetailedProgress();
            
            // Record start time for performance monitoring
            const apiStartTime = performance.now();
            
            // Fetch the student CGPA data with progress tracking
            const result = await this.apiService.fetchStudentCGPA(studentId, (stage, progress, message, data) => {
                this.updateProgressInfo(stage, progress, message, data);
            });
            
            // Store the fetched data
            this.studentInfo = result.studentInfo;
            this.semesterResults = result.results;
            
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
     * Show detailed progress UI
     */
    showDetailedProgress() {
        // Get the loading section
        const loadingSection = document.getElementById('loading');
        if (!loadingSection) return;
        
        // Clear the loading section
        loadingSection.innerHTML = `
            <div class="gh-loading-container">
                <div class="gh-loading-header">
                    <div class="gh-spinner"></div>
                    <h3>Fetching Data</h3>
                </div>
                <div class="gh-loading-message" id="loading-message">Initializing request...</div>
                <div class="gh-progress-container">
                    <div class="gh-progress-bar" id="loading-progress-bar" style="width: 0%"></div>
                </div>
            </div>
        `;
    }
    
    /**
     * Update progress information
     * @param {string} stage - The current stage of the process
     * @param {number} progress - Progress percentage (0-100)
     * @param {string} message - Current progress message
     * @param {Object} data - Additional data related to the current stage
     */
    updateProgressInfo(stage, progress, message, data) {
        // Get the loading message and progress bar elements
        const messageElement = document.getElementById('loading-message');
        const progressBar = document.getElementById('loading-progress-bar');
        
        if (!messageElement || !progressBar) return;
        
        // Update the message and progress bar
        messageElement.textContent = message;
        progressBar.style.width = `${progress}%`;
        
        // Display current semester being fetched
        if (stage === 'fetching_semester' && data) {
            const semesterName = `${data.semesterName} ${data.semesterYear}`;
            messageElement.textContent = `Fetching ${semesterName} (${data.semesterId})...`;
        } else if (stage === 'complete') {
            messageElement.textContent = 'All data fetched successfully!';
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
        
        // Update the circular CGPA display
        const cgpaValueElement = document.querySelector('.cgpa-value');
        if (cgpaValueElement) {
            cgpaValueElement.textContent = cgpa;
            
            // Update the circular display to reflect the CGPA value
            this.updateCircularCgpaDisplay(parseFloat(cgpa));
        }
        
        // Process semester data
        const semesterData = this.calculator.processSemesterData(
            this.semesterResults, 
            this.semesterList
        );
        
        // Update the stats in the student info section
        StudentInfo.updateStats(semesterData.length, totalCredits);
        
        // Display semester results
        this.semesterResultsSection.innerHTML = SemesterList.render(semesterData);
        
        // Create CGPA chart
        this.createCgpaChart(semesterData);
        
        Helpers.showElement(this.resultsContainer);
    }
    
    /**
     * Update the circular CGPA display based on CGPA value
     * @param {number} cgpa - The CGPA value
     */
    updateCircularCgpaDisplay(cgpa) {
        const cgpaCircle = document.querySelector('.cgpa-circle');
        if (!cgpaCircle) return;
        
        // Calculate percentage for the circle fill (0-100%)
        const percentage = (cgpa / 4) * 100;
        
        // Determine color based on CGPA value
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
        const cgpaValue = document.querySelector('.cgpa-value');
        if (cgpaValue) {
            cgpaValue.style.color = color;
        }
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
        
        // Close all existing snackbars before creating a new one
        this.closeAllSnackbars();
        
        // Create new snackbar
        let snackbar = document.createElement('div');
        snackbar.id = 'missing-semesters-snackbar';
        snackbar.className = 'gh-snackbar warning';
        document.body.appendChild(snackbar);
        
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
            <button class="gh-snackbar-close" title="Close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add event listener to close button
        const closeButton = snackbar.querySelector('.gh-snackbar-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                snackbar.classList.remove('show');
            });
        }
        
        // Show the snackbar
        snackbar.classList.add('show');
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
                                <option value="custom" selected>Custom Grade</option>
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
                            <div class="custom-grade-container" style="display: block;">
                                <input type="number" class="gh-form-control custom-grade-input" placeholder="Custom Grade Point" min="0" max="4" step="0.5" value="4.00">
                            </div>
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
        
        // Add event listener for the custom grade option
        const newSemester = this.manualSemesterList.lastElementChild;
        const gradeSelect = newSemester.querySelector('.course-grade');
        const customGradeContainer = newSemester.querySelector('.custom-grade-container');
        
        gradeSelect.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                customGradeContainer.style.display = 'block';
            } else {
                customGradeContainer.style.display = 'none';
            }
        });
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
                        <option value="custom" selected>Custom Grade</option>
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
                    <div class="custom-grade-container" style="display: block;">
                        <input type="number" class="gh-form-control custom-grade-input" placeholder="Custom Grade Point" min="0" max="4" step="0.01" value="3.50">
                    </div>
                    <button class="gh-btn gh-btn-icon gh-btn-danger remove-course-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
        
        coursesContainer.insertAdjacentHTML('beforeend', courseHtml);
        
        // Add event listener for the custom grade option
        const newCourse = coursesContainer.lastElementChild;
        const gradeSelect = newCourse.querySelector('.course-grade');
        const customGradeContainer = newCourse.querySelector('.custom-grade-container');
        
        gradeSelect.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                customGradeContainer.style.display = 'block';
            } else {
                customGradeContainer.style.display = 'none';
            }
        });
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
                    // Check if custom grade is selected and use that value instead
                    let gradeValue;
                    if (gradeSelect.value === 'custom') {
                        const customGradeInput = row.querySelector('.custom-grade-input');
                        gradeValue = customGradeInput.value ? parseFloat(customGradeInput.value) : 0;
                        // Ensure the grade is within valid range (0-4)
                        gradeValue = Math.min(Math.max(gradeValue, 0), 4);
                    } else {
                        gradeValue = parseFloat(gradeSelect.value);
                    }
                    
                    courses.push({
                        name: nameInput.value || 'Untitled Course',
                        credit: parseFloat(creditInput.value),
                        grade: gradeValue
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
                        backgroundColor: 'rgba(56, 178, 172, 0.2)', // Updated color
                        borderColor: 'var(--color-success)',
                        borderWidth: 2,
                        pointBackgroundColor: 'var(--color-success)',
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        tension: 0.1
                    },
                    {
                        label: 'Cumulative GPA',
                        data: cumulativeGpa,
                        backgroundColor: 'rgba(67, 97, 238, 0.2)', // Updated color
                        borderColor: 'var(--color-link)',
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
                        reverse: true, // Reverse the Y axis as requested
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
                        padding: 10,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.raw} / 4.00`;
                            }
                        }
                    },
                    legend: {
                        labels: {
                            boxWidth: 12,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
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
        const customGradeInputs = document.querySelectorAll('.custom-grade-input');
        customGradeInputs.forEach(input => input.classList.remove('is-invalid'));
        
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
            
            // Check for custom grade
            if (grade === 'custom') {
                const customGradeContainer = courseGrades[i].parentElement.querySelector('.custom-grade-container');
                if (customGradeContainer) {
                    const customGradeInput = customGradeContainer.querySelector('.custom-grade-input');
                    if (customGradeInput && (!customGradeInput.value || parseFloat(customGradeInput.value) < 0 || parseFloat(customGradeInput.value) > 4)) {
                        customGradeInput.classList.add('is-invalid');
                        isValid = false;
                    }
                }
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
            
            // Get timeout value and validate it
            let timeout = parseInt(document.getElementById('advanced-timeout').value, 10) || 15;
            // Ensure timeout is within reasonable limits
            if (timeout < 5) timeout = 5;
            if (timeout > 120) timeout = 120;
            
            console.log(`Setting API timeout to ${timeout} seconds`);
            
            // Set custom API options
            this.apiService.setTimeout(timeout);
            
            // Clear any previous error message
            Helpers.hideElement(document.getElementById('advanced-error-message'));
            
            if (this.advancedBaseUrl.value.trim()) {
                this.apiService.setBaseUrl(this.advancedBaseUrl.value.trim());
            }
            
            // Create a global variable to track the start time
            window.fetchStartTime = performance.now();
            
            // Set up slow response detection
            const slowResponseThreshold = 5000; // 5 seconds
            let slowResponseDetected = false;
            
            // Set up interval to check if API is responding slowly
            const slowCheckInterval = setInterval(() => {
                const currentTime = performance.now();
                const elapsedTime = (currentTime - window.fetchStartTime) / 1000;
                if (elapsedTime > slowResponseThreshold / 1000 && !slowResponseDetected) {
                    slowResponseDetected = true;
                    this.showSlowApiWarning(elapsedTime);
                }
            }, 1000);
            
            // Create and append the timer display
            const timerDisplay = document.createElement('div');
            timerDisplay.id = 'advanced-fetch-timer';
            timerDisplay.className = 'timer-display';
            timerDisplay.style.marginTop = '10px';
            timerDisplay.style.fontSize = '14px';
            timerDisplay.style.color = 'var(--color-text-secondary)';
            timerDisplay.textContent = `Time elapsed: 0.0 seconds`;
            resultsContainer.appendChild(timerDisplay);
            
            // Set up timer update interval that uses the global startTime
            const timerInterval = setInterval(() => {
                if (!window.fetchStartTime) return; // Safety check
                const currentTime = performance.now();
                const elapsedTime = ((currentTime - window.fetchStartTime) / 1000).toFixed(1);
                const timerElement = document.getElementById('advanced-fetch-timer');
                if (timerElement) {
                    timerElement.textContent = `Time elapsed: ${elapsedTime} seconds`;
                }
            }, 100);
            
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
                        <p><small>Timeout setting: ${timeout} seconds per request</small></p>
                    </div>`;
                    
                    // Re-add timer display during progress updates
                    const newTimerDisplay = document.createElement('div');
                    newTimerDisplay.className = 'timer-display';
                    newTimerDisplay.style.marginTop = '10px';
                    newTimerDisplay.style.fontSize = '14px';
                    newTimerDisplay.style.color = 'var(--color-text-secondary)';
                    const elapsedTime = ((performance.now() - window.fetchStartTime) / 1000).toFixed(1);
                    newTimerDisplay.textContent = `Time elapsed: ${elapsedTime} seconds`;
                    resultsContainer.appendChild(newTimerDisplay);
                }
            );
            
            // Clear slow response check interval
            clearInterval(slowCheckInterval);
            
            // Store results for export
            this.advancedFetchResults = results;
            
            // Stop timer and store the final time
            clearInterval(timerInterval);
            const fetchEndTime = performance.now();
            const totalFetchTime = ((fetchEndTime - window.fetchStartTime) / 1000).toFixed(2);
            
            // Store the fetch time for display in various places
            this.fetchTimerValue = totalFetchTime;
            
            // Add ResultCard instance property for PDF generation
            if (window.ResultCard && window.ResultCard.prototype) {
                window.ResultCard.prototype.fetchTimerValue = totalFetchTime;
            }
            
            // Display results with timer information
            this.displayAdvancedResults(results, totalFetchTime);
            
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
        if (!this.advancedFetchResults || !this.advancedFetchResults.results || Object.keys(this.advancedFetchResults.results).length === 0) {
            alert('No results to export');
            return;
        }
        
        // Create CSV header with student info and semester columns
        let csvContent = 'Student ID,Name,Department,CGPA,Total Credits';
        
        // First, determine how many semesters we have across all students to create proper headers
        const allSemesters = new Set();
        
        // Find all unique semester names
        Object.values(this.advancedFetchResults.results).forEach(data => {
            if (data && data.results) {
                // Process semester data to gather all semesters
                const semesterResults = {};
                
                // Filter out missingSemesters key
                Object.entries(data.results).forEach(([key, value]) => {
                    if (key !== 'missingSemesters' && Array.isArray(value)) {
                        // For each semester, check if we have semester info in the semesterList
                        const semesterInfo = this.semesterList.find(s => s.semesterId === key);
                        if (semesterInfo) {
                            const semesterName = `${semesterInfo.semesterName} ${semesterInfo.semesterYear}`;
                            allSemesters.add(semesterName);
                        } else {
                            // If not found in semesterList, use the key as semester name
                            allSemesters.add(key);
                        }
                    }
                });
            }
        });
        
        // Convert to array and sort in reverse order (latest to oldest)
        const semesterNames = Array.from(allSemesters).sort().reverse();
        
        // Add semester GPA headers
        semesterNames.forEach(semName => {
            csvContent += `,${semName} GPA`;
        });
        csvContent += '\n';
        
        // Process each student result
        Object.entries(this.advancedFetchResults.results).forEach(([studentId, data]) => {
            // Get student info if available
            const studentInfo = data.studentInfo || {};
            const name = studentInfo.name || studentInfo.studentName || 'Unknown';
            const department = studentInfo.department || studentInfo.departmentName || 'Unknown';
            
            // Calculate CGPA and credits if results available
            let cgpa = 'N/A';
            let totalCredits = 0;
            
            // Prepare an object to store each semester's GPA
            const semesterGpas = {};
            semesterNames.forEach(sem => {
                semesterGpas[sem] = 'N/A'; // Default value
            });
            
            if (data.results) {
                try {
                    // Map semester IDs to semester names and calculate GPA for each
                    Object.entries(data.results).forEach(([key, value]) => {
                        if (key !== 'missingSemesters' && Array.isArray(value) && value.length > 0) {
                            // Find semester info in the semesterList
                            const semesterInfo = this.semesterList.find(s => s.semesterId === key);
                            let semesterName = key; // Default to key
                            
                            if (semesterInfo) {
                                semesterName = `${semesterInfo.semesterName} ${semesterInfo.semesterYear}`;
                            }
                            
                            // Calculate semester GPA
                            try {
                                const semResult = this.calculator.calculateSemesterGpa(value);
                                semesterGpas[semesterName] = semResult.gpa;
                            } catch (error) {
                                console.error(`Error calculating GPA for semester ${semesterName}:`, error);
                            }
                        }
                    });
                    
                    // Calculate CGPA
                    const semesterResults = {};
                    Object.entries(data.results).forEach(([key, value]) => {
                        if (key !== 'missingSemesters' && Array.isArray(value)) {
                            semesterResults[key] = value;
                        }
                    });
                    
                    if (Object.keys(semesterResults).length > 0) {
                        const result = this.calculator.calculateCgpa(semesterResults);
                        cgpa = result.cgpa;
                        totalCredits = result.totalCredits;
                    }
                } catch (error) {
                    console.error(`Error calculating CGPA for ${studentId}:`, error);
                }
            }
            
            // Escape any fields that might contain commas
            const escapedName = name.includes(',') ? `"${name}"` : name;
            const escapedDepartment = department.includes(',') ? `"${department}"` : department;
            
            // Start with basic student info (removed status column)
            csvContent += `${studentId},${escapedName},${escapedDepartment},${cgpa},${totalCredits}`;
            
            // Add semester GPAs
            semesterNames.forEach(semName => {
                csvContent += `,${semesterGpas[semName]}`;
            });
            
            csvContent += '\n';
        });
        
        // Add error entries 
        if (this.advancedFetchResults.errors) {
            Object.entries(this.advancedFetchResults.errors).forEach(([studentId, error]) => {
                if (!this.advancedFetchResults.results[studentId]) {
                    // Only add if not already included in results
                    csvContent += `${studentId},N/A,N/A,N/A,N/A`;
                    
                    // Add N/A for all semester columns
                    semesterNames.forEach(() => {
                        csvContent += ',N/A';
                    });
                    
                    csvContent += '\n';
                }
            });
        }
        
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
     * @param {string} fetchTime - Total fetch time in seconds
     */
    displayAdvancedResults(results, fetchTime) {
        const resultsContainer = document.getElementById('advanced-results');
        resultsContainer.innerHTML = '';
        
        if (!results || !results.results || Object.keys(results.results).length === 0) {
            resultsContainer.innerHTML = '<div class="gh-alert gh-alert-warning">No results found</div>';
            return;
        }
        
        // Check if we're displaying a single student (for detailed view)
        const isSingleStudent = Object.keys(results.results).length === 1;
        
        if (isSingleStudent) {
            // Get the single student data
            const studentId = Object.keys(results.results)[0];
            const data = results.results[studentId];
            
            if (!data || !data.studentInfo) {
                resultsContainer.innerHTML = '<div class="gh-alert gh-alert-warning">No results found for student</div>';
                return;
            }
            
            // Display detailed results for single student similar to fetch CGPA page
            this.displaySingleStudentDetailedResults(studentId, data, resultsContainer);
            return;
        }
        
        // Create results summary for multiple students
        const totalStudents = Object.keys(results.results).length;
        const totalErrors = Object.keys(results.errors || {}).length;
        const successCount = totalStudents - totalErrors;
        
        const summaryHtml = `
            <div class="gh-box">
                <h3>Results Summary</h3>
                <div class="gh-stats-container" style="grid-template-columns: 1fr 1fr 1fr 1fr;">
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
                    <div class="gh-stats-box">
                        <div class="gh-stats-value" style="color: var(--color-text-secondary);">${fetchTime}s</div>
                        <div class="gh-stats-label">Fetch Time</div>
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

    /**
     * Generate academic transcript as PDF
     * Prepares and exports data in a professional transcript format
     */
    generateTranscriptPDF() {
        if (!this.studentInfo || !this.semesterResults || Object.keys(this.semesterResults).length === 0) {
            alert('No student data available to generate transcript. Please fetch CGPA data first.');
            return;
        }
        
        try {
            // Process semester data
            const semesterData = this.calculator.processSemesterData(
                this.semesterResults, 
                this.semesterList
            );
            
            // Calculate CGPA and total credits
            const cgpaData = this.calculator.calculateCgpa(this.semesterResults);
            
            // Create a new instance of ResultCard if window.resultCard doesn't exist
            const resultCardInstance = window.resultCard || new ResultCard();
            
            // Generate PDF using the ResultCard's generatePdfTranscript method
            resultCardInstance.generatePdfTranscript(this.studentInfo, semesterData, cgpaData);
            
            console.log('PDF generation initiated');
            
        } catch (error) {
            console.error('Error generating transcript PDF:', error);
            alert('An error occurred while generating the transcript. Please try again.');
        }
    }
    
    /**
     * Display detailed results for a single student in advanced fetch
     * @param {string} studentId - Student ID
     * @param {Object} data - Student data object
     * @param {HTMLElement} container - Container element for results
     */
    displaySingleStudentDetailedResults(studentId, data, container) {
        // Extract student info
        const studentInfo = data.studentInfo || {};
        const name = studentInfo.name || studentInfo.studentName || 'Unknown';
        const department = studentInfo.department || studentInfo.departmentName || 'Unknown';
        const program = studentInfo.program || studentInfo.programName || 'Unknown';
        const batch = studentInfo.batch || studentInfo.batchNo || 'Unknown';
        
        // Filter out missingSemesters key and prepare semester results
        const semesterResults = {};
        let semesterCount = 0;
        
        if (data.results) {
            Object.entries(data.results).forEach(([key, value]) => {
                if (key !== 'missingSemesters' && Array.isArray(value)) {
                    semesterResults[key] = value;
                    semesterCount++;
                }
            });
        }
        
        // Calculate CGPA if we have semester results
        let cgpa = 'N/A';
        let totalCredits = 0;
        
        if (Object.keys(semesterResults).length > 0) {
            try {
                const result = this.calculator.calculateCgpa(semesterResults);
                cgpa = result.cgpa;
                totalCredits = result.totalCredits;
            } catch (error) {
                console.error(`Error calculating CGPA for ${studentId}:`, error);
            }
        }
        
        // Create student info card
        const studentInfoHtml = `
            <div class="gh-box" id="advanced-student-info">
                <div class="gh-student-info">
                    <div class="gh-student-header">
                        <h3>${name}</h3>
                        <div class="gh-student-id">${studentId}</div>
                    </div>
                    <div class="gh-student-details">
                        <div class="gh-student-detail-item">
                            <span class="gh-detail-label">Department:</span>
                            <span class="gh-detail-value">${department}</span>
                        </div>
                        <div class="gh-student-detail-item">
                            <span class="gh-detail-label">Program:</span>
                            <span class="gh-detail-value">${program}</span>
                        </div>
                        <div class="gh-student-detail-item">
                            <span class="gh-detail-label">Batch:</span>
                            <span class="gh-detail-value">${batch}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Create CGPA summary card
        const cgpaSummaryHtml = `
            <div class="gh-box" id="advanced-cgpa-summary">
                <div class="gh-stats-container" style="grid-template-columns: 1fr 1fr 1fr;">
                    <div class="gh-stats-box">
                        <div class="gh-stats-value" style="color: var(--color-link);">${cgpa}</div>
                        <div class="gh-stats-label">CGPA</div>
                    </div>
                    <div class="gh-stats-box">
                        <div class="gh-stats-value">${totalCredits}</div>
                        <div class="gh-stats-label">Total Credits</div>
                    </div>
                    <div class="gh-stats-box">
                        <div class="gh-stats-value">${semesterCount}</div>
                        <div class="gh-stats-label">Semesters</div>
                    </div>
                </div>
            </div>
        `;
        
        // Process semester data
        let semesterDataHtml = '<div class="gh-section-title"><h3>Semester Results</h3></div>';
        
        if (semesterCount === 0) {
            semesterDataHtml += '<div class="gh-alert gh-alert-warning">No semester results found</div>';
        } else {
            try {
                // Process the data using the calculator
                const semesterData = this.calculator.processSemesterData(
                    semesterResults,
                    this.semesterList
                );
                
                // Sort semesters in reverse order (newest first)
                const sortedSemesters = [...semesterData].sort((a, b) => 
                    (b.year - a.year) || (b.term - a.term)
                );
                
                // Generate semester cards similar to the main CGPA page
                semesterDataHtml += `<div id="advanced-semester-results">`;
                
                // Use the ResultCard component to render each semester with forceOpen=true
                sortedSemesters.forEach((semester, index) => {
                    semesterDataHtml += ResultCard.render(semester, index, true);
                });
                
                semesterDataHtml += `</div>`;
                
            } catch (error) {
                console.error(`Error processing semester data for ${studentId}:`, error);
                semesterDataHtml += '<div class="gh-alert gh-alert-error">Error processing semester data</div>';
            }
        }
        
        // Check for missing semesters
        let missingSemestersHtml = '';
        if (data.missingSemesters && data.missingSemesters.length > 0) {
            const semesterNames = data.missingSemesters.map(sem => sem.name).join(', ');
            missingSemestersHtml = `
                <div class="gh-alert gh-alert-warning">
                    <div class="gh-alert-content">
                        <p><strong>Missing Semester Data:</strong> ${semesterNames}</p>
                        <p>CGPA calculation may be incomplete. This could be due to server issues or missing data.</p>
                    </div>
                </div>
            `;
        }
        
        // Combine all HTML and update the container
        container.innerHTML = studentInfoHtml + cgpaSummaryHtml + missingSemestersHtml + semesterDataHtml;
        
        // Add event delegation for result card toggling
        container.addEventListener('click', (e) => {
            const header = e.target.closest('.gh-result-card-header');
            if (header) {
                const card = header.closest('.gh-result-card');
                if (card) {
                    card.classList.toggle('open');
                }
            }
        });
        
        // Show export button
        Helpers.showElement(document.getElementById('export-results-btn'));
    }

    /**
     * Show warning for slow API response
     * @param {number} elapsedTime - Time elapsed in seconds
     */
    showSlowApiWarning(elapsedTime) {
        // Close all existing snackbars before creating a new one
        this.closeAllSnackbars();
        
        // Create new snackbar
        let snackbar = document.createElement('div');
        snackbar.id = 'slow-api-snackbar';
        snackbar.className = 'gh-snackbar warning';
        document.body.appendChild(snackbar);
        
        // Create warning message
        snackbar.innerHTML = `
            <div class="gh-snackbar-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="gh-snackbar-content">
                <h4>Slow Server Response</h4>
                <p>The server is responding slowly (${elapsedTime.toFixed(1)}s). This might be due to network issues or server load.</p>
                <p>Please be patient while we fetch your results.</p>
            </div>
            <button class="gh-snackbar-close" title="Close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add event listener to close button
        const closeButton = snackbar.querySelector('.gh-snackbar-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                snackbar.classList.remove('show');
            });
        }
        
        // Show the snackbar
        snackbar.classList.add('show');
    }

    /**
     * Create CGPA chart using Chart.js
     * @param {Array} semesterData - Array of semester data objects
     */
    createCgpaChart(semesterData) {
        if (!semesterData || semesterData.length === 0 || !this.cgpaChartCanvas) return;
        
        // Show chart container
        const chartContainer = document.getElementById('cgpa-progress-container');
        if (chartContainer) {
            Helpers.showElement(chartContainer);
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
        const ctx = this.cgpaChartCanvas.getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.cgpaChart) {
            this.cgpaChart.destroy();
        }
        
        // Create beautiful chart
        this.cgpaChart = new Chart(ctx, {
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
                        label: 'Cumulative GPA',
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
                        fill: false // Disable area fill
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
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
                            text: 'GPA (out of 4.00)',
                            font: {
                                size: 14
                            }
                        }
                    },
                    x: {
                        // Oldest semesters are already on the left due to our sorting
                        reverse: false,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            font: {
                                weight: 'bold'
                            }
                        },
                        title: {
                            display: true,
                            text: 'Semesters (Oldest to Newest)',
                            font: {
                                size: 14
                            }
                        }
                    }
                },
                // Ensure all animations are synchronized
                animations: {
                    tension: {
                        duration: 1000,
                        easing: 'linear'
                    }
                },
                // Ensure tooltips show same data points
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    tooltip: {
                        backgroundColor: 'rgba(36, 41, 46, 0.9)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 8,
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 13
                        },
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.raw} / 4.00`;
                            },
                            title: function(context) {
                                const semester = sortedSemesters[context[0].dataIndex];
                                return `${semester.name} (${semester.totalCredits} Credits)`;
                            },
                            afterLabel: function(context) {
                                if (context.datasetIndex === 0) { // Semester GPA
                                    const semester = sortedSemesters[context.dataIndex];
                                    return `Ranking: ${context.raw >= 3.75 ? 'A+' : 
                                        context.raw >= 3.5 ? 'A' : 
                                        context.raw >= 3.25 ? 'A-' : 
                                        context.raw >= 3.0 ? 'B+' : 
                                        context.raw >= 2.75 ? 'B' : 
                                        context.raw >= 2.5 ? 'B-' : 
                                        context.raw >= 2.25 ? 'C+' : 
                                        context.raw >= 2.0 ? 'C' : 'F'}`;
                                }
                            }
                        }
                    },
                    legend: {
                        labels: {
                            usePointStyle: true,
                            pointStyle: 'circle',
                            boxWidth: 10,
                            boxHeight: 10,
                            padding: 15,
                            font: {
                                size: 13
                            }
                        },
                        title: {
                            display: true,
                            text: 'CGPA Progress',
                            font: {
                                size: 14,
                                weight: 'bold'
                            },
                            padding: {
                                bottom: 10
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Close all active snackbars
     * Ensures no multiple snackbars appear at the same time
     */
    closeAllSnackbars() {
        // List of all snackbar IDs used in the application
        const snackbarIds = ['missing-semesters-snackbar', 'slow-api-snackbar'];
        
        // Remove each snackbar if it exists
        snackbarIds.forEach(id => {
            const snackbar = document.getElementById(id);
            if (snackbar) {
                snackbar.remove();
            }
        });
    }
}

// Initialize UI on document load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the main UI controller
    window.uiController = new UiController();
    
    // Add direct event listeners for tab navigation
    initDirectTabNavigation();
});

/**
 * Initialize direct tab navigation that works independently of the UiController
 * This ensures the header navigation buttons work properly
 */
function initDirectTabNavigation() {
    // Get all tab buttons in the navigation
    const tabButtons = document.querySelectorAll('.gh-nav .gh-btn[data-tab]');
    
    // Get all tab content panes
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    if (!tabButtons.length || !tabPanes.length) {
        console.error('Tab navigation elements not found');
        return;
    }
    
    console.log('Initializing direct tab navigation with', tabButtons.length, 'buttons and', tabPanes.length, 'panes');
    
    // Add click event listeners to each tab button
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Get the target tab id
            const targetTabId = button.getAttribute('data-tab');
            console.log('Tab button clicked:', targetTabId);
            
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to the clicked button
            button.classList.add('active');
            
            // Show the corresponding tab pane and hide others
            tabPanes.forEach(pane => {
                if (pane.id === targetTabId) {
                    pane.classList.add('active');
                } else {
                    pane.classList.remove('active');
                }
            });
        });
    });
}