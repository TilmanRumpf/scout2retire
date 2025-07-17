// Theme utilities for consistent loading states

export const getLoadingBackgroundClass = () => {
  // Check if dark mode is active
  const isDark = document.documentElement.classList.contains('dark') || 
                 (localStorage.getItem('s2r-theme') === 'dark') ||
                 (!localStorage.getItem('s2r-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  return isDark ? 'bg-gray-950' : 'bg-gray-50';
};

export const getLoadingTextClass = () => {
  // Check if dark mode is active
  const isDark = document.documentElement.classList.contains('dark') || 
                 (localStorage.getItem('s2r-theme') === 'dark') ||
                 (!localStorage.getItem('s2r-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  return isDark ? 'text-scout-accent-400' : 'text-scout-accent-600';
};