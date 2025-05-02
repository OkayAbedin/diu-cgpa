// Simple navigation handler
function initNavigation() {
  // Get all navigation buttons
  const navButtons = document.querySelectorAll('.gh-nav .gh-btn[data-tab]');
  
  // Get all tab panes
  const tabPanes = document.querySelectorAll('.tab-pane');
  
  // Function to set active tab
  function setActiveTab(tabId) {
    // Update buttons
    navButtons.forEach(button => {
      if (button.getAttribute('data-tab') === tabId) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
    
    // Update tab panes
    tabPanes.forEach(pane => {
      if (pane.id === tabId) {
        pane.style.display = 'block';
      } else {
        pane.style.display = 'none';
      }
    });
  }
  
  // Add click handlers to buttons
  navButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const tabId = this.getAttribute('data-tab');
      setActiveTab(tabId);
    });
  });
  
  // Set default tab (auto-calculator)
  setActiveTab('auto-calculator');
}

// Run navigation setup when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNavigation);
} else {
  // DOM already loaded, run immediately
  initNavigation();
}