// Test script to verify semester names are working correctly
// Run this in browser console after navigating to the Manual Calculator tab

// Sample data with actual semester names
const sampleData = `Result of Spring, 2022
SL	Course Code	Course Title	Credit	Grade	Grade Point
1	CSE-101	Introduction to Computer Programming	3.00	A	4.00
2	CSE-102	Programming Lab	1.00	A	4.00
3	MAT-101	Calculus and Analytical Geometry	3.00	A+	4.00
4	PHY-101	Physics I	3.00	A	4.00
5	PHY-102	Physics I Lab	1.00	A	4.00
6	ENG-101	English Reading Skills and Public Speaking	3.00	A-	3.67
		Total Credit = 14.00		Total Grade Point = 55.67	SGPA = 3.98

Result of Summer, 2022
SL	Course Code	Course Title	Credit	Grade	Grade Point
1	CSE-201	Data Structures	3.00	A	4.00
2	CSE-202	Data Structures Lab	1.00	A	4.00
3	MAT-201	Calculus II	3.00	A+	4.00
4	PHY-201	Physics II	3.00	A	4.00
5	PHY-202	Physics II Lab	1.00	A	4.00
6	ENG-201	English Writing Skills and Communication	3.00	A-	3.67
		Total Credit = 14.00		Total Grade Point = 55.67	SGPA = 3.98`;

console.log('Testing semester name parsing...');

// Find the first textarea and fill it with sample data
const textarea = document.querySelector('.semester-textarea');
if (textarea) {
    textarea.value = sampleData;
    
    // Trigger the parsing
    const semesterIndex = textarea.closest('.semester-input-container').getAttribute('data-semester') || 1;
    
    // Get manual input instance
    const manualInput = window.manualInput;
    if (manualInput) {
        manualInput.parseSemesterData(textarea, semesterIndex);
        console.log('Sample data entered and parsed. Now click "Calculate CGPA" to see the results.');
    } else {
        console.error('Manual input instance not found');
    }
} else {
    console.error('Textarea not found. Make sure you are on the Manual Calculator tab.');
}
