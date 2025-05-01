/**
 * API Service for DIU CGPA Calculator
 * Handles all API requests to the DIU server
 */

class ApiService {
    constructor() {
        // Use CORS proxy if needed to avoid cross-origin issues
        this.corsProxy = '';  // Set this to a CORS proxy URL if needed
        this.baseUrl = 'http://peoplepulse.diu.edu.bd:8189/result';
        this.missingSemesters = []; // Track missing semesters
        
        // Default timeout in milliseconds (15 seconds)
        this.timeout = 15000;
        
        // Maximum number of retries
        this.maxRetries = 2;
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
            this.baseUrl = url;
            console.log(`API base URL set to ${url}`);
        } else {
            // Reset to default if empty
            this.baseUrl = 'http://peoplepulse.diu.edu.bd:8189/result';
            console.log(`API base URL reset to default`);
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
        }, this.timeout);
        
        try {
            const response = await fetch(url, { 
                ...options, 
                signal 
            });
            
            // Clear the timeout as the request completed
            clearTimeout(timeoutId);
            
            return response;
        } catch (error) {
            // Clear the timeout as the request failed
            clearTimeout(timeoutId);
            
            // If it's an abort error (timeout), handle it specifically
            if (error.name === 'AbortError') {
                console.warn(`Request timed out after ${this.timeout / 1000} seconds`);
                
                // If we haven't reached max retries, try again
                if (retryCount < this.maxRetries) {
                    console.log(`Retrying request (${retryCount + 1}/${this.maxRetries})...`);
                    return this.fetchWithTimeout(url, options, retryCount + 1);
                }
                
                throw new Error(`Request timed out after ${this.timeout / 1000} seconds and ${retryCount} retries`);
            }
            
            // Handle other errors
            if (retryCount < this.maxRetries) {
                console.log(`Request failed, retrying (${retryCount + 1}/${this.maxRetries})...`);
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
            
            return await response.json();
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
                // Stop after four consecutive empty semesters instead of two
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

    /**
     * Set custom base URL for API calls
     * @param {string} url - Base URL for API
     */
    setBaseUrl(url) {
        // Make sure URL ends with a slash
        this.baseUrl = url.endsWith('/') ? url : url + '/';
    }
}

// Export as global variable
window.apiService = new ApiService();