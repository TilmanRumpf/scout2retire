// Updated QuickNav.jsx - FIXED 09JUN25: REMOVED ALL FUCKING ICONS
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function QuickNav() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside the nav and not on the toggle button
      if (isOpen && 
          !event.target.closest('.nav-menu') && 
          !event.target.closest('.nav-toggle')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key to close menu
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // FIXED 09JUN25: Clean navigation items - NO MORE SVG ICON BULLSHIT
  const navItems = [
    { path: '/daily', label: 'Today' },
    { path: '/discover', label: 'Discover' },
    { path: '/favorites', label: 'Favorites' },
    { path: '/compare', label: 'Compare' },
    { path: '/schedule', label: 'Schedule' },
    { path: '/chat', label: 'Chat' },
    { path: '/journal', label: 'Journal' },
    { path: '/profile', label: 'Profile' },
    { path: '/settings', label: 'Settings' }
  ];

  return (
    <>
      {/* Hamburger toggle button - fixed in upper right corner with increased z-index */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="nav-toggle fixed top-4 right-4 z-[100] p-2 rounded-md bg-white dark:bg-gray-800 shadow-md"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? (
          // X icon when menu is open
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          // Hamburger icon when menu is closed
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Slide-out navigation menu with increased z-index */}
      <div
        className={`nav-menu fixed top-0 right-0 h-full bg-white dark:bg-gray-800 shadow-lg z-[90] w-64 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="pt-16 pb-6 px-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
            Scout<span className="text-green-600">2</span>Retire
          </h2>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center p-3 rounded-md transition-colors ${
                    isActive
                      ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {/* FIXED 09JUN25: REMOVED span with mr-3 and item.icon - NO MORE ICONS! */}
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="absolute bottom-8 left-0 right-0 px-4">
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
              &copy; 2025 Scout2Retire
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for clicking outside to close with increased z-index */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-[80]"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        ></div>
      )}
    </>
  );
}