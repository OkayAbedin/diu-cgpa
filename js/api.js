/**
 * API Service for DIU CGPA Calculator
 * Handles all API requests to the DIU server
 */

class ApiService {
    constructor() {
        // Check if we're running on Netlify (production)
        const isProduction = window.location.hostname !== 'localhost' && 
                             window.location.hostname !== '127.0.0.1';
        
        // Use CORS proxy if needed to avoid cross-origin issues
        this.corsProxy = '';  // Set this to a CORS proxy URL if needed
        
        // Use Netlify function as proxy in production, direct API in development
        if (isProduction) {
            this.baseUrl = '/.netlify/functions/api-proxy';
        } else {
            this.baseUrl = 'http://peoplepulse.diu.edu.bd:8189/result';
        }
        
        this.missingSemesters = []; // Track missing semesters
        
        // Default timeout in milliseconds (30 seconds instead of 15)
        this.timeout = 30000;
        
        // Maximum number of retries
        this.maxRetries = 3;
        
        console.log(`API Service initialized with base URL: ${this.baseUrl}`);
    }

    /**
     * Set the request timeout
     * @param {number} timeoutInSeconds - Timeout in seconds
     */
    setTimeout(timeoutInSeconds) {
        this.timeout = timeoutInSeconds * 1000; // Convert to milliseconds
        console.log(`API timeout set to ${timeoutInSeconds} seconds`);
    }
    
    /**
     * Get the current timeout in seconds
     * @returns {number} Timeout in seconds
     */
    getTimeoutInSeconds() {
        return this.timeout / 1000;
    }
    
    /**
     * Set the base URL for the API
     * @param {string} url - The base URL
     */
    setBaseUrl(url) {
        if (url && url.trim() !== '') {
            // Check if we're running on Netlify and using a custom URL that's not the Netlify function
            const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
            const isNetlifyFunction = url.includes('/.netlify/functions/');
            
            if (isProduction && !isNetlifyFunction && !url.startsWith('https://')) {
                console.warn('Using HTTP URL on production site may cause CORS issues. Consider using Netlify Functions.');
            }
            
            this.baseUrl = url.endsWith('/') ? url : url + '/';
            console.log(`API base URL set to ${this.baseUrl}`);
        } else {
            // Reset to default based on environment
            const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
            
            if (isProduction) {
                this.baseUrl = '/.netlify/functions/api-proxy';
            } else {
                this.baseUrl = 'http://peoplepulse.diu.edu.bd:8189/result';
            }
            
            console.log(`API base URL reset to default: ${this.baseUrl}`);
        }
    }
    
    /**
     * Get the current base URL
     * @returns {string} The current base URL
     */
    getBaseUrl() {
        return this.baseUrl;
    }
    
    /**
     * Set maximum number of retries
     * @param {number} retries - Number of retries
     */
    setMaxRetries(retries) {
        this.maxRetries = retries;
    }

    /**
     * Get full URL with CORS proxy if configured
     * @param {string} endpoint - API endpoint
     * @returns {string} Full URL
     */
    getFullUrl(endpoint) {
        // Add timeout parameter for Netlify functions
        const isProduction = window.location.hostname !== 'localhost' && 
                          window.location.hostname !== '127.0.0.1';
        
        if (isProduction && this.baseUrl.includes('/.netlify/functions/')) {
            // Add timeout parameter for Netlify functions
            const separator = endpoint.includes('?') ? '&' : '?';
            const timeoutInSeconds = Math.ceil(this.timeout / 1000);
            return `${this.corsProxy}${this.baseUrl}${endpoint}${separator}timeout=${timeoutInSeconds}`;
        }
        
        return `${this.corsProxy}${this.baseUrl}${endpoint}`;
    }

    /**
     * Fetch with timeout and retry support
     * @param {string} url - URL to fetch
     * @param {Object} options - Fetch options
     * @param {number} retryCount - Current retry count (internal use)
     * @returns {Promise<Response>} Fetch response
     */
    async fetchWithTimeout(url, options = {}, retryCount = 0) {
        // Create an abort controller for this request
        const controller = new AbortController();
        const signal = controller.signal;
        
        // Set a timeout to abort the request
        const timeoutId = setTimeout(() => {
            controller.abort();
        }, this.timeout + 5000); // Add 5 seconds buffer to allow server-side timeout to happen first
        
        try {
            console.log(`Fetching ${url} (timeout: ${this.timeout/1000}s)...`);
            const response = await fetch(url, { 
                ...options, 
                signal 
            });
            
            // Clear the timeout as the request completed
            clearTimeout(timeoutId);
            
            // Validate the response content
            const responseText = await response.text();
            
            // Check for empty response
            if (!responseText || responseText.trim() === '') {
                throw new Error('Empty response received from server');
            }
            
            // Try to parse as JSON
            try {
                const responseData = JSON.parse(responseText);
                
                // Construct a new response with the parsed data
                const newResponse = new Response(JSON.stringify(responseData), {
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers
                });
                
                return newResponse;
            } catch (parseError) {
                // If JSON parsing fails, throw an error
                console.error('Failed to parse response as JSON:', responseText);
                throw new Error('Invalid JSON response from server');
            }
        } catch (error) {
            // Clear the timeout as the request failed
            clearTimeout(timeoutId);
            
            // If it's an abort error (timeout), handle it specifically
            if (error.name === 'AbortError') {
                console.warn(`Request timed out after ${this.timeout / 1000} seconds`);
                
                // If we haven't reached max retries, try again
                if (retryCount < this.maxRetries) {
                    console.log(`Retrying request (${retryCount + 1}/${this.maxRetries})...`);
                    // Wait before retrying (exponential backoff)
                    const backoffTime = Math.min(1000 * Math.pow(2, retryCount), 5000);
                    await new Promise(resolve => setTimeout(resolve, backoffTime));
                    return this.fetchWithTimeout(url, options, retryCount + 1);
                }
                
                throw new Error(`Request timed out after ${this.timeout / 1000} seconds and ${retryCount} retries`);
            }
            
            // Handle empty response error
            if (error.message === 'Empty response received from server') {
                // If we haven't reached max retries, try again
                if (retryCount < this.maxRetries) {
                    console.log(`Empty response, retrying (${retryCount + 1}/${this.maxRetries})...`);
                    // Add a small delay before retrying
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return this.fetchWithTimeout(url, options, retryCount + 1);
                }
            }
            
            // Handle invalid JSON error
            if (error.message === 'Invalid JSON response from server') {
                // If we haven't reached max retries, try again
                if (retryCount < this.maxRetries) {
                    console.log(`Invalid JSON, retrying (${retryCount + 1}/${this.maxRetries})...`);
                    // Add a small delay before retrying
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return this.fetchWithTimeout(url, options, retryCount + 1);
                }
            }
            
            // Handle other network errors
            if (retryCount < this.maxRetries) {
                console.log(`Request failed, retrying (${retryCount + 1}/${this.maxRetries})...`);
                // Exponential backoff for other errors too
                const backoffTime = Math.min(1000 * Math.pow(2, retryCount), 5000);
                await new Promise(resolve => setTimeout(resolve, backoffTime));
                return this.fetchWithTimeout(url, options, retryCount + 1);
            }
            
            // If we've exhausted retries, throw the original error
            throw error;
        }
    }

    /**
     * Fetches all available semesters
     * @returns {Promise<Array>} Array of semester objects
     */
    async getSemesterList() {
        try {
            const response = await this.fetchWithTimeout(this.getFullUrl('/semesterList'), {
                mode: 'cors',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch semester list: ${response.status} ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching semester list:', error);
            throw error;
        }
    }

    /**
     * Fetches student information
     * @param {string} studentId - The student ID
     * @returns {Promise<Object>} Student information object
     */
    async getStudentInfo(studentId) {
        try {
            const response = await this.fetchWithTimeout(this.getFullUrl(`/studentInfo?studentId=${studentId}`), {
                mode: 'cors',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch student info: ${response.status} ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching student info:', error);
            throw error;
        }
    }

    /**
     * Fetches semester results for a student
     * @param {string} semesterId - The semester ID
     * @param {string} studentId - The student ID
     * @returns {Promise<Array>} Array of course results for the semester
     */
    async getSemesterResults(semesterId, studentId) {
        try {
            const response = await this.fetchWithTimeout(this.getFullUrl(`?grecaptcha=&semesterId=${semesterId}&studentId=${studentId}`), {
                mode: 'cors',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch results for semester ${semesterId}: ${response.status} ${response.statusText}`);
            }
            
            // Parse the response
            const data = await response.json();
            
            // Validate the data
            if (!data || !Array.isArray(data)) {
                console.warn(`Received invalid data for semester ${semesterId}:`, data);
                return [];
            }
            
            return data;
        } catch (error) {
            console.error(`Error fetching semester ${semesterId} results:`, error);
            // Return empty array instead of throwing to handle gracefully
            return [];
        }
    }

    /**
     * Fetches all semester results for a student
     * @param {string} studentId - The student ID
     * @param {Array} semesterList - Array of semester objects
     * @returns {Promise<Object>} Object containing semester results by semesterId and missingSemesters
     */
    async getAllSemesterResults(studentId, semesterList) {
        try {
            if (!semesterList || !Array.isArray(semesterList) || semesterList.length === 0) {
                throw new Error('No semester list provided');
            }
            
            // Extract enrollment semester ID from student ID (first three digits)
            const enrollmentSemesterId = studentId.split('-')[0];
            if (!enrollmentSemesterId || enrollmentSemesterId.length !== 3) {
                console.warn(`Could not extract enrollment semester from student ID: ${studentId}, using default approach`);
                return this.getAllSemesterResultsLegacy(studentId, semesterList);
            }
            
            console.log(`Student ID: ${studentId}, Enrollment Semester: ${enrollmentSemesterId}`);
            
            // Sort semesters in ascending order by semesterId for chronological processing
            const sortedSemesters = [...semesterList].sort((a, b) => 
                parseInt(a.semesterId) - parseInt(b.semesterId)
            );
            
            // Find the starting semester (enrollment semester or the first available after it)
            const startSemesterIndex = sortedSemesters.findIndex(s => 
                parseInt(s.semesterId) >= parseInt(enrollmentSemesterId)
            );
            
            if (startSemesterIndex === -1) {
                console.warn(`Could not find enrollment semester ${enrollmentSemesterId} or later, using default approach`);
                return this.getAllSemesterResultsLegacy(studentId, semesterList);
            }
            
            // Get semesters from enrollment semester onwards
            const relevantSemesters = sortedSemesters.slice(startSemesterIndex);
            
            const results = {};
            let emptyCount = 0;
            this.missingSemesters = []; // Reset missing semesters list
            
            // Track valid semesters to identify gaps later
            const validSemesterIds = [];
            const emptySemesterIds = [];
            
            for (const semester of relevantSemesters) {
                // Stop after four consecutive empty semesters
                if (emptyCount >= 4) {
                    break;
                }
                
                console.log(`Fetching results for semester ${semester.semesterId} (${semester.semesterName} ${semester.semesterYear})`);
                const semesterResult = await this.getSemesterResults(semester.semesterId, studentId);
                
                if (semesterResult && semesterResult.length > 0) {
                    results[semester.semesterId] = semesterResult;
                    validSemesterIds.push(parseInt(semester.semesterId));
                    emptyCount = 0; // Reset counter when we find results
                } else {
                    emptyCount++;
                    emptySemesterIds.push({
                        id: parseInt(semester.semesterId),
                        name: `${semester.semesterName} ${semester.semesterYear}`,
                        consecutive: emptyCount
                    });
                    console.log(`No results found for semester ${semester.semesterId}, empty count: ${emptyCount}`);
                }
            }
            
            // Identify missing semesters (gaps between valid semesters)
            if (validSemesterIds.length > 1) {
                validSemesterIds.sort((a, b) => a - b); // Sort in ascending order
                
                for (let i = 0; i < validSemesterIds.length - 1; i++) {
                    const current = validSemesterIds[i];
                    const next = validSemesterIds[i + 1];
                    
                    // Check for gaps (missing semesters)
                    if (next - current > 1) {
                        for (let missingId = current + 1; missingId < next; missingId++) {
                            // Find the semester info for this ID
                            const missingSemester = sortedSemesters.find(s => parseInt(s.semesterId) === missingId);
                            
                            if (missingSemester) {
                                // Check if this is one of the consecutive empty semesters at the end
                                const emptyMatch = emptySemesterIds.find(e => e.id === missingId && e.consecutive >= 4);
                                
                                // Only add to missing if it's not part of the four consecutive empty ones
                                if (!emptyMatch) {
                                    this.missingSemesters.push({
                                        id: missingId,
                                        name: `${missingSemester.semesterName} ${missingSemester.semesterYear}`
                                    });
                                }
                            }
                        }
                    }
                }
            }
            
            // Add missing semesters to the results object
            results.missingSemesters = this.missingSemesters;
            
            return results;
        } catch (error) {
            console.error('Error fetching all semester results:', error);
            throw error;
        }
    }
    
    /**
     * Legacy method for fetching all semester results (starting from newest)
     * Kept for fallback compatibility
     * @param {string} studentId - The student ID
     * @param {Array} semesterList - Array of semester objects
     * @returns {Promise<Object>} Object containing semester results by semesterId
     * @private
     */
    async getAllSemesterResultsLegacy(studentId, semesterList) {
        try {
            // Sort semester IDs in descending order to get newest first
            const sortedSemesters = [...semesterList].sort((a, b) => 
                parseInt(b.semesterId) - parseInt(a.semesterId)
            );
            
            const results = {};
            let emptyCount = 0;
            this.missingSemesters = []; // Reset missing semesters list
            
            // Track valid semesters to identify gaps later
            const validSemesterIds = [];
            const emptySemesterIds = [];
            
            for (const semester of sortedSemesters) {
                // Stop after four consecutive empty semesters
                if (emptyCount >= 4) {
                    break;
                }
                
                console.log(`Fetching results for semester ${semester.semesterId} (${semester.semesterName} ${semester.semesterYear})`);
                const semesterResult = await this.getSemesterResults(semester.semesterId, studentId);
                
                if (semesterResult && semesterResult.length > 0) {
                    results[semester.semesterId] = semesterResult;
                    validSemesterIds.push(parseInt(semester.semesterId));
                    emptyCount = 0; // Reset counter when we find results
                } else {
                    emptyCount++;
                    emptySemesterIds.push({
                        id: parseInt(semester.semesterId),
                        name: `${semester.semesterName} ${semester.semesterYear}`,
                        consecutive: emptyCount
                    });
                    console.log(`No results found for semester ${semester.semesterId}, empty count: ${emptyCount}`);
                }
            }
            
            // Identify missing semesters (gaps between valid semesters)
            if (validSemesterIds.length > 1) {
                validSemesterIds.sort((a, b) => a - b); // Sort in ascending order
                
                for (let i = 0; i < validSemesterIds.length - 1; i++) {
                    const current = validSemesterIds[i];
                    const next = validSemesterIds[i + 1];
                    
                    // Check for gaps (missing semesters)
                    if (next - current > 1) {
                        for (let missingId = current + 1; missingId < next; missingId++) {
                            // Find the semester info for this ID
                            const missingSemester = sortedSemesters.find(s => parseInt(s.semesterId) === missingId);
                            
                            if (missingSemester) {
                                // Check if this is one of the consecutive empty semesters at the end
                                const emptyMatch = emptySemesterIds.find(e => e.id === missingId && e.consecutive >= 4);
                                
                                // Only add to missing if it's not part of the four consecutive empty ones
                                if (!emptyMatch) {
                                    this.missingSemesters.push({
                                        id: missingId,
                                        name: `${missingSemester.semesterName} ${missingSemester.semesterYear}`
                                    });
                                }
                            }
                        }
                    }
                }
            }
            
            // Add missing semesters to the results object
            results.missingSemesters = this.missingSemesters;
            
            return results;
        } catch (error) {
            console.error('Error fetching all semester results (legacy):', error);
            throw error;
        }
    }

    /**
     * Get list of missing semesters
     * @returns {Array} Array of missing semester objects with id and name
     */
    getMissingSemesters() {
        return this.missingSemesters;
    }

    /**
     * Check if there are any missing semesters
     * @returns {boolean} True if there are missing semesters
     */
    hasMissingSemesters() {
        return this.missingSemesters.length > 0;
    }

    /**
     * Fetches student CGPA data with progress tracking
     * @param {string} studentId - The student ID
     * @param {function} progressCallback - Optional callback for progress updates
     * @returns {Promise<Object>} Complete student data including info and results
     */
    async fetchStudentCGPA(studentId, progressCallback = null) {
        try {
            // Progress update: Starting
            if (progressCallback) progressCallback('starting', 0);
            
            // Step 1: Get student info
            if (progressCallback) progressCallback('fetching_info', 10);
            const studentInfo = await this.getStudentInfo(studentId);
            
            // Step 2: Get semester list
            if (progressCallback) progressCallback('fetching_semesters', 30);
            const semesterList = await this.getSemesterList();
            
            // Step 3: Get all semester results
            if (progressCallback) progressCallback('fetching_results', 50);
            const allResults = await this.getAllSemesterResults(studentId, semesterList);
            
            // Step 4: Compile the data
            if (progressCallback) progressCallback('compiling', 90);
            
            const result = {
                studentInfo,
                semesterList,
                results: allResults,
                missingSemesters: this.getMissingSemesters(),
                hasMissingSemesters: this.hasMissingSemesters()
            };
            
            // Progress update: Complete
            if (progressCallback) progressCallback('complete', 100);
            
            return result;
        } catch (error) {
            console.error('Error in fetchStudentCGPA:', error);
            throw error;
        }
    }
    
    /**
     * Fetches CGPA data for multiple students
     * @param {Array<string>} studentIds - Array of student IDs
     * @param {function} progressCallback - Optional callback for progress updates
     * @returns {Promise<Object>} Object with results for each student ID
     */
    async fetchMultipleStudentsCGPA(studentIds, progressCallback = null) {
        const results = {};
        const errors = {};
        let completed = 0;
        const total = studentIds.length;
        
        // Get semester list once to reuse
        const semesterList = await this.getSemesterList().catch(err => {
            console.error('Error fetching semester list:', err);
            throw new Error('Could not fetch semester list. Please check your network connection.');
        });
        
        for (const studentId of studentIds) {
            if (progressCallback) {
                const overallProgress = Math.floor((completed / total) * 100);
                progressCallback('processing', overallProgress, studentId, completed, total);
            }
            
            try {
                // Fetch student info
                const studentInfo = await this.getStudentInfo(studentId);
                
                // Fetch all semester results using the common semester list
                const allResults = await this.getAllSemesterResults(studentId, semesterList);
                
                results[studentId] = {
                    studentInfo,
                    results: allResults,
                    missingSemesters: [...this.getMissingSemesters()], // Create a copy
                    hasMissingSemesters: this.hasMissingSemesters()
                };
            } catch (error) {
                console.error(`Error fetching data for student ${studentId}:`, error);
                errors[studentId] = error.message;
            }
            
            completed++;
            
            if (progressCallback) {
                const overallProgress = Math.floor((completed / total) * 100);
                progressCallback('processing', overallProgress, studentId, completed, total);
            }
        }
        
        return { 
            results, 
            errors,
            completed,
            total
        };
    }
    
    /**
     * Generate an array of student IDs from a range
     * @param {string} prefix - Common prefix for all IDs in the range
     * @param {number} start - Starting number (inclusive)
     * @param {number} end - Ending number (inclusive)
     * @returns {Array<string>} Array of formatted student IDs
     */
    generateStudentIdRange(prefix, start, end) {
        const ids = [];
        for (let i = start; i <= end; i++) {
            ids.push(`${prefix}${i}`);
        }
        return ids;
    }

    /**
     * Generate a range of student IDs with a given prefix
     * @param {string} prefix - Prefix for student ID (e.g., "221-15-")
     * @param {number} start - Start number (e.g., 4900)
     * @param {number} end - End number (e.g., 4999)
     * @returns {Array} Array of generated student IDs
     */
    generateStudentIdRange(prefix, start, end) {
        const studentIds = [];
        for (let i = start; i <= end; i++) {
            studentIds.push(`${prefix}${i}`);
        }
        return studentIds;
    }

    /**
     * Fetch CGPA data for multiple student IDs with progress tracking
     * @param {Array} studentIds - Array of student IDs to fetch
     * @param {Function} progressCallback - Callback for fetch progress updates
     * @returns {Object} Object containing results and errors
     */
    async fetchMultipleStudentsCGPA(studentIds, progressCallback) {
        const results = {};
        const errors = {};
        let completed = 0;
        const total = studentIds.length;
        
        for (const studentId of studentIds) {
            try {
                // Update progress (studentId, completed count, total count)
                if (progressCallback) {
                    const progress = Math.floor((completed / total) * 100);
                    progressCallback('Processing', progress, studentId, completed, total);
                }
                
                // Fetch student data
                const studentData = await this.fetchStudentCGPA(studentId);
                
                // Store result
                results[studentId] = studentData;
            } catch (error) {
                // Store error
                errors[studentId] = error.message || 'Unknown error';
            }
            
            // Update progress
            completed++;
            if (progressCallback) {
                const progress = Math.floor((completed / total) * 100);
                progressCallback('Processing', progress, studentId, completed, total);
            }
        }
        
        return {
            results,
            errors,
            completed,
            total
        };
    }
}

// Export as global variable
window.apiService = new ApiService();