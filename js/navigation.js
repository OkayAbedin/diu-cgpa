// Simple navigation handler
function initNavigation() {
  // Get all navigation buttons
  const navButtons = document.querySelectorAll('.gh-nav .gh-btn[data-tab]');
  
  // Get all tab panes
  const tabPanes = document.querySelectorAll('.tab-pane');
  
  // Get mobile menu elements
  const menuToggleBtn = document.getElementById('mobile-menu-toggle');
  const navMenu = document.querySelector('.gh-nav');
  
  // Create overlay for mobile menu
  let menuOverlay = document.createElement('div');
  menuOverlay.className = 'menu-overlay';
  document.body.appendChild(menuOverlay);
  
  // Function to toggle mobile menu
  function toggleMobileMenu() {
    navMenu.classList.toggle('open');
    menuOverlay.classList.toggle('open');
    
    // Toggle menu icon (bars/times)
    const menuIcon = menuToggleBtn.querySelector('i');
    if (navMenu.classList.contains('open')) {
      menuIcon.className = 'fas fa-times';
    } else {
      menuIcon.className = 'fas fa-bars';
    }
  }
  
  // Function to close mobile menu
  function closeMobileMenu() {
    navMenu.classList.remove('open');
    menuOverlay.classList.remove('open');
    menuToggleBtn.querySelector('i').className = 'fas fa-bars';
  }
  
  // Function to set active tab
  function setActiveTab(tabId) {
    // Update buttons
    navButtons.forEach(button => {
      // First, reset all buttons to default gray style
      button.classList.remove('active');
      button.classList.remove('gh-btn-primary');
      
      // Then, add active class to the selected button
      if (button.getAttribute('data-tab') === tabId) {
        button.classList.add('active');
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
    
    // Close mobile menu when a tab is selected
    closeMobileMenu();
  }
  
  // Add click handler to menu toggle button
  if (menuToggleBtn) {
    menuToggleBtn.addEventListener('click', toggleMobileMenu);
  }
  
  // Add click handler to overlay to close menu
  menuOverlay.addEventListener('click', closeMobileMenu);
  
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