import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import FilterBarV3 from './FilterBarV3';
import { uiConfig } from '../styles/uiConfig';

export default function CompactPageHeader({
  title,
  totalCount,
  filteredCount,
  // Filter props to pass through to FilterBarV3
  sortBy,
  setSortBy,
  filterRegion,
  setFilterRegion,
  filterCountry,
  setFilterCountry,
  filterCostRange,
  setFilterCostRange,
  filterMatchRange,
  setFilterMatchRange,
  regions,
  countries,
  filterCount,
  clearFilters,
  showFilters = true // Option to hide filters on some pages
}) {
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

  // Navigation items from QuickNav
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
      {/* Sticky header with title and filters */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto">
          {/* Title row - 36px */}
          <div className="h-9 flex items-center justify-between px-4">
            <h1 className="text-base font-semibold text-gray-900 dark:text-white">
              {title}
              <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                {filteredCount !== undefined ? `${filteredCount} of ${totalCount}` : totalCount}
              </span>
            </h1>
            
            {/* Hamburger menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="nav-toggle p-1.5 -mr-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Filter bar - only show if filters are enabled */}
          {showFilters && (
            <div className="h-8 px-4">
              <FilterBarV3
                variant="integrated"
                sortBy={sortBy}
                setSortBy={setSortBy}
                filterRegion={filterRegion}
                setFilterRegion={setFilterRegion}
                filterCountry={filterCountry}
                setFilterCountry={setFilterCountry}
                filterCostRange={filterCostRange}
                setFilterCostRange={setFilterCostRange}
                filterMatchRange={filterMatchRange}
                setFilterMatchRange={setFilterMatchRange}
                regions={regions}
                countries={countries}
                filterCount={filterCount}
                clearFilters={clearFilters}
                resultsCount={filteredCount || totalCount}
              />
            </div>
          )}
        </div>
      </header>

      {/* Slide-out navigation menu */}
      <div
        className={`nav-menu fixed top-0 right-0 h-full bg-white dark:bg-gray-800 shadow-lg z-50 w-64 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
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
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}