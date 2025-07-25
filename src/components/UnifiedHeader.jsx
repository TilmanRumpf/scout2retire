import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, MapPin, Globe, CloudSun, Users, SmilePlus, HousePlus, DollarSign } from 'lucide-react';
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
          {/* Grid layout with logo column */}
          <div className="grid grid-cols-[auto_1fr_auto] gap-3 gap-y-1 items-start">
            {/* Logo Column - Spans both rows */}
            <div className={`${hasSecondRow ? 'row-span-2' : ''} flex`}>
              <Logo 
                variant="full" 
                className={hasSecondRow ? "h-[52px]" : "h-9"}
                navigateTo="/daily"
              />
            </div>
            
            {/* Content Column - First Row */}
            <div className="h-9 flex items-center">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white flex items-baseline">
                {/* Title with optional styling */}
                <span 
                  className={`${title.includes("brings your future home") ? 'handwritten-tagline' : ''}`}
                >
                  {title}
                </span>
                
                {/* Optional count display */}
                {totalCount !== undefined && (
                  <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                    {filteredCount} of {totalCount}
                  </span>
                )}
                
                {/* Optional step context */}
                {stepContext && (
                  <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                    {stepContext}
                  </span>
                )}
              </h1>
            </div>
            
            {/* Menu Column - First Row */}
            <div className="h-9 flex items-center">
              <button 
                onClick={handleMenuClick}
                className="nav-toggle p-1.5 -mr-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Open navigation menu"
                type="button"
              >
                <Menu className="w-5 h-5 text-gray-900 dark:text-gray-100" />
              </button>
            </div>
            
            {/* Content Column - Second Row (when present) */}
            {hasSecondRow && (
              <>
                <div className="h-8 flex items-center overflow-hidden col-start-2">
                  {/* Filters */}
                  {secondRowType === 'filters' && (
                    <div className="flex-1">
                      <FilterBarV3 {...filterProps} />
                    </div>
                  )}
                  
                  {/* Tabs */}
                  {secondRowType === 'tabs' && (
                    <div className="flex-1 overflow-x-auto scrollbar-hide">
                      <div className="flex items-center gap-3 sm:gap-4">
                        {tabs.map((tab) => {
                          const Icon = tab.icon;
                          const isActive = tab.isActive;
                          
                          return (
                            <button
                              key={tab.id}
                              onClick={tab.onClick}
                              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm whitespace-nowrap transition-all duration-200 ${
                                isActive 
                                  ? 'bg-scout-accent-100 dark:bg-scout-accent-900/30 font-medium text-scout-accent-700 dark:text-scout-accent-300' 
                                  : 'text-gray-500 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300'
                              }`}
                            >
                              {Icon && <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-scout-accent-600 dark:text-scout-accent-400' : ''}`} />}
                              <span>{tab.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Steps */}
                  {secondRowType === 'steps' && (
                    <div className="flex-1 overflow-x-auto scrollbar-hide">
                      <div className="flex items-center gap-3 sm:gap-4">
                        {steps.map((step) => {
                          const Icon = step.icon;
                          const isActive = step.isActive;
                          const isCompleted = step.isCompleted;
                          
                          return (
                            <Link
                              key={step.key}
                              to={step.path}
                              className={`flex items-center gap-1 text-sm whitespace-nowrap transition-colors ${
                                isActive 
                                  ? 'font-medium text-gray-900 dark:text-gray-100' 
                                  : isCompleted
                                  ? 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                                  : 'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                              }`}
                            >
                              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-scout-accent-600 dark:text-scout-accent-400' : ''}`} />
                              <span>{step.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Empty cell for menu column in second row */}
                <div className="col-start-3"></div>
              </>
            )}
          </div>
          
          {/* Subtitle Row - Only if subtitle exists AND no second row (for Daily page) */}
          {subtitle && !hasSecondRow && (
            <div className="grid grid-cols-[auto_1fr_auto] gap-3 pb-2">
              <div></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {subtitle}
              </p>
              <div></div>
            </div>
          )}
        </div>
      </header>

      {/* Quick Navigation Overlay */}
      <QuickNav 
        isOpen={isQuickNavOpen} 
        onClose={() => setIsQuickNavOpen(false)} 
      />
    </>
  );
}