// Test if JavaScript is loading properly
console.log('Script is loaded and running');

// Initialize direct tab navigation without depending on other components
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing tab navigation');
    
    // Get all tab buttons in the navigation
    const tabButtons = document.querySelectorAll('.gh-nav .gh-btn[data-tab]');
    
    // Get all tab content panes
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    console.log('Found', tabButtons.length, 'nav buttons and', tabPanes.length, 'tab panes');
    
    // Add click event listeners to each tab button
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Get the target tab id
            const targetTabId = button.getAttribute('data-tab');
            console.log('Tab button clicked:', targetTabId);
            
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Hide all tab panes
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Show the target tab pane
            const targetPane = document.getElementById(targetTabId);
            if (targetPane) {
                targetPane.classList.add('active');
                console.log('Activated tab pane:', targetTabId);
            } else {
                console.error('Target pane not found:', targetTabId);
            }
        });
    });
    
    // Set the first tab as active by default
    console.log('Setting first tab as active');
    if (tabButtons.length > 0) {
        tabButtons[0].click();
    }
});