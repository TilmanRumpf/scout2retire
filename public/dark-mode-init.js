// Immediate dark mode initialization to prevent flash
// This runs before React to ensure correct theme is applied instantly
(function() {
  // Check local storage for saved theme preference
  const savedTheme = localStorage.getItem('s2r-theme');
  
  // Check system preference if no saved theme
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Apply dark class immediately if needed
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add('dark');
  }
  
  // Also set the background color immediately to prevent flash
  document.documentElement.style.backgroundColor = (savedTheme === 'dark' || (!savedTheme && prefersDark)) ? '#030712' : '#f9fafb';
})();