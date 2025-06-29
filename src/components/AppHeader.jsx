import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { uiConfig } from '../styles/uiConfig';

export default function AppHeader({ title, subtitle, rightElement }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && 
          !event.target.closest('.nav-menu') && 
          !event.target.closest('.nav-toggle')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Navigation items
  const navItems = [
    { path: '/daily', label: 'Today' },
    { path: '/discover', label: 'Discover' },
    { path: '/favorites', label: 'Favorites' },
    { path: '/compare', label: 'Compare' },
    { path: '/schedule', label: 'Schedule' },
    { path: '/chat', label: 'Chat' },
    { path: '/journal', label: 'Journal' },
    { path: '/profile', label: 'Profile' }
  ];

  return (
    <>
      {/* Sticky header */}
      <header className={`${uiConfig.colors.card} shadow-sm sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold ${uiConfig.colors.heading}`}>
                {title}
              </h1>
              {subtitle && (
                <p className={`text-sm ${uiConfig.colors.body} mt-1`}>
                  {subtitle}
                </p>
              )}
            </div>
            
            {/* Right side elements */}
            <div className="flex items-center gap-2">
              {rightElement}
              
              {/* Hamburger menu button */}
              <button
                onClick={() => {
                  console.log('Hamburger clicked, current state:', isMenuOpen);
                  setIsMenuOpen(!isMenuOpen);
                }}
                className="nav-toggle p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Slide-out navigation menu */}
      <div
        className="nav-menu fixed top-0 h-full bg-white dark:bg-gray-800 shadow-lg w-64 transition-all duration-300 ease-in-out"
        style={{ 
          zIndex: 9999,
          right: isMenuOpen ? '0' : '-256px'
        }}
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

      {/* Overlay for clicking outside to close */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
          style={{ zIndex: 9998 }}
        />
      )}
    </>
  );
}