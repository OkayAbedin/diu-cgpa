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
  
  // Get header element for scroll effect
  const header = document.querySelector('.gh-header');
  
  // Create overlay for mobile menu
  let menuOverlay = document.createElement('div');
  menuOverlay.className = 'menu-overlay';
  document.body.appendChild(menuOverlay);
  
  // Add scroll event listener for header blur effect
  function handleScroll() {
    if (window.scrollY > 10) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  
  // Add event listener for scroll
  window.addEventListener('scroll', handleScroll);
  
  // Check scroll position on page load
  handleScroll();
  
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
    try {
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
          pane.style.setProperty('display', 'block', 'important');
        } else {
          pane.style.display = 'none';
          pane.style.setProperty('display', 'none', 'important');
        }
      });
      
      // Close mobile menu when a tab is selected
      closeMobileMenu();
    } catch (error) {
      console.error('Error in setActiveTab:', error);
      // Fallback: manually show the tab
      const targetTab = document.getElementById(tabId);
      if (targetTab) {
        // Hide all tabs first
        document.querySelectorAll('.tab-pane').forEach(pane => {
          pane.style.display = 'none';
        });
        // Show target tab
        targetTab.style.display = 'block';
        targetTab.style.setProperty('display', 'block', 'important');
      }
    }
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
  
  // Set default tab (manual-calculator due to API issues)
  try {
    setActiveTab('manual-calculator');
  } catch (error) {
    console.error('Error setting default tab:', error);
    // Fallback: try to show manual calculator tab directly
    const manualTab = document.getElementById('manual-calculator');
    if (manualTab) {
      manualTab.style.display = 'block';
    }
  }
  
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