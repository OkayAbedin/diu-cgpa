// Simple navigation handler
function initNavigation() {
  // Get all navigation buttons
  const navButtons = document.querySelectorAll('.gh-nav .gh-btn[data-tab]');
  
  // Get all tab panes
  const tabPanes = document.querySelectorAll('.tab-pane');
  
  // Get mobile menu elements
  const menuToggleBtn = document.getElementById('mobile-menu-toggle');
  const navMenu = document.querySelector('.gh-nav');
  
  // Get dark mode toggle button
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  
  // Create overlay for mobile menu
  let menuOverlay = document.createElement('div');
  menuOverlay.className = 'menu-overlay';
  document.body.appendChild(menuOverlay);
  
  // Check for saved theme preference or respect OS theme preference
  function getThemePreference() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  
  // Set theme on page load
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateDarkModeButton(theme);
  }
  
  // Update button text and icon based on current theme
  function updateDarkModeButton(theme) {
    if (!darkModeToggle) return;
    
    const icon = darkModeToggle.querySelector('i');
    
    if (theme === 'dark') {
      icon.className = 'fas fa-sun';
    } else {
      icon.className = 'fas fa-moon';
    }
  }
  
  // Toggle the theme
  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
  }
  
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
  
  // Add click handler to dark mode toggle
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', toggleTheme);
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
  
  // Apply saved theme on page load
  applyTheme(getThemePreference());
}

// Run navigation setup when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNavigation);
} else {
  // DOM already loaded, run immediately
  initNavigation();
}