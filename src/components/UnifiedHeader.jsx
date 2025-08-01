import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, MapPin, Globe, CloudSun, Users, SmilePlus, HousePlus, DollarSign, SlidersHorizontal, X } from 'lucide-react';
import QuickNav from './QuickNav';
import FilterBarV3 from './FilterBarV3';
import Logo from './Logo';

/**
 * UnifiedHeader - Intelligent header that adapts its second row based on props
 * 
 * First row ALWAYS contains: S2R logo + title + hamburger menu
 * Second row intelligently shows one of:
 * - Filters (when showFilters=true)
 * - Tabs (when tabs array is provided)
 * - Steps (when steps array is provided)
 * - Nothing (when no second row content is needed)
 * 
 * @param {Object} props
 * @param {string} props.title - Main title text (required)
 * @param {string} props.subtitle - Optional subtitle for certain pages
 * @param {number} props.totalCount - Total items count (shows "X of Y" format)
 * @param {number} props.filteredCount - Filtered items count
 * @param {boolean} props.showFilters - Whether to show filter row
 * @param {Object} props.filterProps - All filter-related props
 * @param {Array} props.tabs - Array of tab objects with {id, label, icon?, isActive, onClick}
 * @param {Array} props.steps - Array of step objects with {id, key, label, path, icon, isActive?, isCompleted?}
 * @param {string} props.stepContext - Additional context for steps (e.g., "3 of 7")
 */
export default function UnifiedHeader({
  title,
  subtitle,
  totalCount,
  filteredCount,
  showFilters = false,
  filterProps = {},
  tabs = [],
  steps = [],
  stepContext = '',
  maxWidth = 'max-w-7xl'
}) {
  const [isQuickNavOpen, setIsQuickNavOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close menu when route changes
  useEffect(() => {
    setIsQuickNavOpen(false);
  }, [location.pathname]);

  // Determine what type of second row to show
  const hasSecondRow = showFilters || tabs.length > 0 || steps.length > 0;
  const secondRowType = showFilters ? 'filters' : tabs.length > 0 ? 'tabs' : steps.length > 0 ? 'steps' : null;

  const handleMenuClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickNavOpen(true);
  };

  return (
    <>
      <header className="ios-header fixed top-0 left-0 right-0 w-full">
        <div className={`${maxWidth} mx-auto px-4`}>
          <div className="ios-header-content gap-2">
              {/* Logo - hidden on mobile phones */}
              <Logo 
                variant="full" 
                className="h-8 hidden md:block"
                navigateTo="/daily"
              />
              
              {/* Title - always visible */}
              <div className="flex-1 min-w-0">
                <h1 className="text-base font-medium text-gray-900 dark:text-white">
                  <span className={`${title.includes("brings your future home") ? 'handwritten-tagline' : ''}`}>
                    {title}
                  </span>
                  {/* Count - hidden on narrow screens */}
                  {totalCount !== undefined && (
                    <span className="ml-1.5 text-sm font-normal text-gray-500 dark:text-gray-400 hidden md:inline">
                      ({filteredCount} of {totalCount})
                    </span>
                  )}
                  {stepContext && (
                    <span className="ml-1.5 text-sm font-normal text-gray-500 dark:text-gray-400">
                      {stepContext}
                    </span>
                  )}
                </h1>
              </div>
              
              
              {/* Filter button - visible on mobile when filters exist */}
              {hasSecondRow && showFilters && (
                <button
                  onClick={() => setIsMobileFiltersOpen(true)}
                  className="relative p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors md:hidden"
                  aria-label="Filters"
                >
                  <SlidersHorizontal className="w-5 h-5 text-gray-900 dark:text-gray-100" />
                  {filterProps.filterCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-scout-accent-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {filterProps.filterCount}
                    </span>
                  )}
                </button>
              )}
              
              {/* Menu button - always visible */}
              <button 
                onClick={handleMenuClick}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Open navigation menu"
                type="button"
              >
                <Menu className="w-5 h-5 text-gray-900 dark:text-gray-100" />
              </button>
            </div>
            
        </div>
      </header>

      {/* Quick Navigation Overlay */}
      <QuickNav 
        isOpen={isQuickNavOpen} 
        onClose={() => setIsQuickNavOpen(false)} 
      />

      {/* Mobile Filters Modal */}
      {hasSecondRow && showFilters && isMobileFiltersOpen && (
        <div className="fixed inset-0 z-[10000] md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileFiltersOpen(false)}
          />
          
          {/* Modal */}
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl shadow-xl max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>
            
            {/* Filter Content */}
            <div className="p-4">
              <FilterBarV3 {...filterProps} variant="mobile" />
            </div>
            
            {/* Apply Button */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full py-3 bg-scout-accent-600 text-white rounded-lg font-medium hover:bg-scout-accent-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}