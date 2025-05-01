/**
 * Iterator design pattern implementation for DIU CGPA Calculator
 * Provides a way to access elements of collections without exposing underlying representation
 */

class Iterator {
    /**
     * Base Iterator class
     * @param {Array} collection - Collection to iterate over
     */
    constructor(collection) {
        this.collection = collection || [];
        this.index = 0;
    }

    /**
     * Check if there are more elements to iterate
     * @returns {boolean} True if more elements exist
     */
    hasNext() {
        return this.index < this.collection.length;
    }

    /**
     * Get the next element in the collection
     * @returns {*} The next element
     */
    next() {
        if (this.hasNext()) {
            return this.collection[this.index++];
        }
        return null;
    }

    /**
     * Reset the iterator to the beginning
     */
    reset() {
        this.index = 0;
    }

    /**
     * Get the current collection
     * @returns {Array} The collection
     */
    getCollection() {
        return this.collection;
    }

    /**
     * Get the length of the collection
     * @returns {number} Collection length
     */
    count() {
        return this.collection.length;
    }
}

/**
 * SemesterIterator for traversing semester data
 * Extends base Iterator with semester-specific functionality
 */
class SemesterIterator extends Iterator {
    /**
     * Calculate total credits across all semesters
     * @returns {number} Total credits
     */
    getTotalCredits() {
        let totalCredits = 0;
        const originalIndex = this.index;
        
        this.reset();
        while (this.hasNext()) {
            const semester = this.next();
            if (semester && semester.totalCredits) {
                totalCredits += semester.totalCredits;
            }
        }
        
        // Restore original position
        this.index = originalIndex;
        return totalCredits;
    }

    /**
     * Calculate average CGPA across all semesters
     * @returns {number} Average CGPA
     */
    getAverageCGPA() {
        let totalCGPA = 0;
        const originalIndex = this.index;
        
        this.reset();
        while (this.hasNext()) {
            const semester = this.next();
            if (semester && semester.cgpa) {
                totalCGPA += semester.cgpa;
            }
        }
        
        // Restore original position
        this.index = originalIndex;
        return totalCGPA / this.count() || 0;
    }
}

/**
 * CourseIterator for traversing course data
 * Extends base Iterator with course-specific functionality
 */
class CourseIterator extends Iterator {
    /**
     * Calculate GPA for the course collection
     * @returns {number} Calculated GPA
     */
    calculateGPA() {
        let totalPoints = 0;
        let totalCredits = 0;
        const originalIndex = this.index;
        
        this.reset();
        while (this.hasNext()) {
            const course = this.next();
            if (course && course.credits && course.grade) {
                const gradePoints = this.getGradePoints(course.grade);
                totalPoints += gradePoints * course.credits;
                totalCredits += course.credits;
            }
        }
        
        // Restore original position
        this.index = originalIndex;
        return totalCredits > 0 ? totalPoints / totalCredits : 0;
    }

    /**
     * Get grade points for a letter grade
     * @param {string} grade - Letter grade (A+, A, A-, etc.)
     * @returns {number} Grade points
     */
    getGradePoints(grade) {
        const gradeMap = {
            'A+': 4.00,
            'A': 3.75,
            'A-': 3.50,
            'B+': 3.25,
            'B': 3.00,
            'B-': 2.75,
            'C+': 2.50,
            'C': 2.25,
            'D': 2.00,
            'F': 0.00
        };
        
        return gradeMap[grade] || 0;
    }

    /**
     * Get total credits for the course collection
     * @returns {number} Total credits
     */
    getTotalCredits() {
        let totalCredits = 0;
        const originalIndex = this.index;
        
        this.reset();
        while (this.hasNext()) {
            const course = this.next();
            if (course && course.credits) {
                totalCredits += course.credits;
            }
        }
        
        // Restore original position
        this.index = originalIndex;
        return totalCredits;
    }
}

// Export as global variables
window.Iterator = Iterator;
window.SemesterIterator = SemesterIterator;
window.CourseIterator = CourseIterator;