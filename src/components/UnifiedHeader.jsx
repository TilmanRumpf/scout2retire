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
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-[9999]">
        <div className={`${maxWidth} mx-auto px-4`}>
          {/* Responsive layout based on screen size */}
          <div className="flex flex-col">
            {/* Row 1: Logo/Title + Menu */}
            <div className="flex items-center h-14 gap-2">
              {/* Logo - hidden on very narrow screens */}
              <Logo 
                variant="full" 
                className="h-8 hidden sm:block"
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
                  className="relative p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors sm:hidden"
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
            
            {/* Row 2: Desktop Search and Filters - only on larger screens */}
            {hasSecondRow && showFilters && (
              <div className="hidden sm:block pb-3 -mt-1">
                <FilterBarV3 {...filterProps} />
              </div>
            )}
          </div>
          
          {/* Tabs - clean horizontal scroll */}
          {hasSecondRow && tabs.length > 0 && (
            <div className="border-t border-gray-100 dark:border-gray-700">
              <div className="overflow-x-auto scrollbar-hide py-2">
                <div className="flex items-center gap-1 px-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = tab.isActive;
                    
                    return (
                      <button
                        key={tab.id}
                        onClick={tab.onClick}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                          isActive 
                            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium' 
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                        }`}
                      >
                        {Icon && <Icon className="w-4 h-4" />}
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          
          {/* Steps - clean navigation for onboarding */}
          {hasSecondRow && steps.length > 0 && (
            <div className="border-t border-gray-100 dark:border-gray-700">
              <div className="overflow-x-auto scrollbar-hide py-2">
                <div className="flex items-center gap-1 px-1">
                  {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = step.isActive;
                    const isCompleted = step.isCompleted;
                    
                    return (
                      <Link
                        key={step.key}
                        to={step.path}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm whitespace-nowrap transition-colors relative ${
                          isActive 
                            ? 'font-medium text-gray-900 dark:text-gray-100' 
                            : isCompleted
                            ? 'text-gray-600 dark:text-gray-400'
                            : 'text-gray-400 dark:text-gray-600'
                        }`}
                      >
                        {index > 0 && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-4 bg-gray-200 dark:bg-gray-700" />
                        )}
                        <Icon className={`w-4 h-4 ${isActive ? 'text-scout-accent-600' : ''}`} />
                        <span>{step.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          
          {/* Subtitle - cleaner presentation */}
          {subtitle && !hasSecondRow && (
            <div className="pb-2 -mt-1">
              <p className="text-sm text-gray-600 dark:text-gray-400 px-1">
                {subtitle}
              </p>
            </div>
          )}
        </div>
      </header>

      {/* Quick Navigation Overlay */}
      <QuickNav 
        isOpen={isQuickNavOpen} 
        onClose={() => setIsQuickNavOpen(false)} 
      />

      {/* Mobile Filters Modal */}
      {hasSecondRow && showFilters && isMobileFiltersOpen && (
        <div className="fixed inset-0 z-[10000] sm:hidden">
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