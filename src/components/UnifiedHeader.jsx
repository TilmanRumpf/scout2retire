import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, MapPin, Globe, CloudSun, Users, SmilePlus, HousePlus, DollarSign, SlidersHorizontal, X } from 'lucide-react';
import QuickNav from './QuickNav';
import FilterBarV3 from './FilterBarV3';
import Logo from './Logo';

/*
=== UNIFIED HEADER - Single Source of Truth ===
Consolidated header component handling ALL header variations in the app.
Successfully merged functionality from multiple header components into one.

Functionality:
- Basic header (title + menu)
- Step navigation (Onboarding) with auto-scroll
- Tab navigation (Compare, Journal) with horizontal scrolling
- Comparison controls (Compare page town pills)
- Filters (Discover, Favorites) with mobile modal
- Logo and quick navigation

Priority-based second row rendering ensures only one type displays at a time.
The component maintains 100% backward compatibility.
=== END DOCUMENTATION ===
*/

/**
 * UnifiedHeader - SINGLE source of truth for ALL headers in the app
 * 
 * First row ALWAYS contains: S2R logo + title + hamburger menu
 * Second row intelligently shows one of (priority order):
 * 1. Steps (when steps array provided) - for Onboarding
 * 2. Tabs (when tabs array provided) - for Compare, Journal
 * 3. Comparison controls (when showComparison=true) - for Compare page
 * 4. Filters (when showFilters=true) - for Discover, Favorites
 * 5. Nothing (when no second row content needed)
 * 
 * @param {Object} props
 * @param {string} props.title - Main title text (required)
 * @param {string} props.subtitle - Optional subtitle for certain pages
 * @param {number} props.totalCount - Total items count (shows "X of Y" format)
 * @param {number} props.filteredCount - Filtered items count
 * 
 * // Second row options (mutually exclusive, rendered in priority order)
 * @param {Array} props.steps - Step objects: {id, key, label, path, icon, isActive?, isCompleted?}
 * @param {string} props.currentStep - Current step key for step navigation
 * @param {Object} props.completedSteps - Object with completed step keys
 * @param {Function} props.onStepNavigate - Callback for step navigation
 * 
 * @param {Array} props.tabs - Tab objects: {id, label, icon?, isActive, onClick}
 * 
 * @param {boolean} props.showComparison - Whether to show comparison controls
 * @param {Object} props.comparisonProps - All comparison-related props
 * 
 * @param {boolean} props.showFilters - Whether to show filter row
 * @param {Object} props.filterProps - All filter-related props
 * 
 * @param {string} props.maxWidth - CSS max-width class
 */
export default function UnifiedHeader({
  title,
  subtitle,
  totalCount,
  filteredCount,
  
  // Second row options (mutually exclusive, rendered in priority order)
  steps = [],
  currentStep,
  completedSteps = {},
  onStepNavigate,
  
  tabs = [],
  
  showComparison = false,
  comparisonProps = {},
  
  showFilters = false,
  filterProps = {},
  
  maxWidth = 'max-w-7xl'
}) {
  const [isQuickNavOpen, setIsQuickNavOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Refs for auto-scrolling
  const scrollContainerRef = useRef(null);
  const activeStepRef = useRef(null);
  const activeTabRef = useRef(null);

  // Close menu when route changes
  useEffect(() => {
    setIsQuickNavOpen(false);
  }, [location.pathname]);

  // Determine what type of second row to show (PRIORITY ORDER)
  const hasSecondRow = steps.length > 0 || tabs.length > 0 || showComparison || showFilters;
  const secondRowType = steps.length > 0 ? 'steps' 
    : tabs.length > 0 ? 'tabs'
    : showComparison ? 'comparison' 
    : showFilters ? 'filters' 
    : null;
  
  // Find current step number for display
  const currentStepNum = currentStep ? (steps.findIndex(s => s.key === currentStep) + 1 || 1) : 0;

  const handleMenuClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickNavOpen(true);
  };
  
  // Auto-scroll for steps on mobile
  useEffect(() => {
    if (secondRowType !== 'steps') return;
    
    const animationFrame = requestAnimationFrame(() => {
      if (activeStepRef.current && scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const activeElement = activeStepRef.current;
        
        const innerContent = container.querySelector('.flex');
        if (!innerContent) return;
        
        const elementRect = activeElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const innerRect = innerContent.getBoundingClientRect();
        
        const elementLeft = elementRect.left - innerRect.left;
        const elementRight = elementRect.right - innerRect.left;
        
        const visibleLeft = container.scrollLeft + 32;
        const visibleRight = container.scrollLeft + containerRect.width - 32;
        
        if (elementLeft < visibleLeft) {
          container.scrollTo({
            left: Math.max(0, elementLeft - 32),
            behavior: 'smooth'
          });
        } else if (elementRight > visibleRight) {
          container.scrollTo({
            left: elementRight - containerRect.width + 32,
            behavior: 'smooth'
          });
        }
      }
    });
    
    return () => cancelAnimationFrame(animationFrame);
  }, [currentStep, secondRowType]);
  
  // Auto-scroll for tabs
  useEffect(() => {
    if (secondRowType !== 'tabs') return;
    
    const animationFrame = requestAnimationFrame(() => {
      if (activeTabRef.current && scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const activeElement = activeTabRef.current;
        
        const innerContent = container.querySelector('.flex');
        if (!innerContent) return;
        
        const elementRect = activeElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const innerRect = innerContent.getBoundingClientRect();
        
        const elementLeft = elementRect.left - innerRect.left;
        const elementRight = elementRect.right - innerRect.left;
        
        const visibleLeft = container.scrollLeft + 16;
        const visibleRight = container.scrollLeft + containerRect.width - 16;
        
        if (elementLeft < visibleLeft) {
          container.scrollTo({
            left: Math.max(0, elementLeft - 16),
            behavior: 'smooth'
          });
        } else if (elementRight > visibleRight) {
          container.scrollTo({
            left: elementRight - containerRect.width + 16,
            behavior: 'smooth'
          });
        }
      }
    });
    
    return () => cancelAnimationFrame(animationFrame);
  }, [tabs, secondRowType]);

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
                  {/* Step context for onboarding */}
                  {steps.length > 0 && currentStepNum > 0 && (
                    <span className="ml-1.5 text-sm font-normal text-gray-500 dark:text-gray-400">
                      {currentStepNum} of {steps.length}
                    </span>
                  )}
                </h1>
              </div>
              
              
              {/* Filter button - visible on mobile and tablet when filters exist */}
              {secondRowType === 'filters' && (
                <button
                  onClick={() => setIsMobileFiltersOpen(true)}
                  className="relative p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors lg:hidden"
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
            
            {/* SECOND ROW - Priority order: Steps > Tabs > Comparison > Filters */}
            
            {/* Steps Row - For Onboarding (Priority 1) */}
            {secondRowType === 'steps' && (
              <div className="filter-row py-2">
                <div className="relative">
                  {/* Gradient masks for horizontal scroll */}
                  <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white dark:from-gray-800 to-transparent z-10 pointer-events-none opacity-90" />
                  <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white dark:from-gray-800 to-transparent z-10 pointer-events-none opacity-90" />
                  
                  <div ref={scrollContainerRef} className="overflow-x-auto scrollbar-hide">
                    <div className="flex items-center gap-2 px-1">
                      {steps.map((step) => {
                        const Icon = step.icon;
                        const isActive = step.key === currentStep;
                        const isCompleted = completedSteps[step.key];
                        
                        return (
                          <button
                            key={step.key}
                            ref={isActive ? activeStepRef : null}
                            onClick={async (e) => {
                              e.preventDefault();
                              if (onStepNavigate) {
                                await onStepNavigate(step.path);
                              }
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm whitespace-nowrap transition-all duration-200 ${
                              isActive 
                                ? 'bg-scout-accent-100 dark:bg-scout-accent-900/30 font-medium text-scout-accent-700 dark:text-scout-accent-300' 
                                : isCompleted
                                ? 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400'
                            }`}
                          >
                            <Icon className={`w-4 h-4 transition-colors duration-200 ${
                              isActive 
                                ? 'text-scout-accent-600 dark:text-scout-accent-400' 
                                : isCompleted
                                ? 'text-gray-600 dark:text-gray-400'
                                : 'text-gray-400 dark:text-gray-500'
                            }`} />
                            <span>{step.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Tabs Row - For Compare, Journal (Priority 2) */}
            {secondRowType === 'tabs' && (
              <div className="filter-row py-2">
                <div className="relative">
                  {/* Gradient masks for horizontal scroll on mobile */}
                  <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white dark:from-gray-800 to-transparent z-10 pointer-events-none opacity-90 sm:hidden" />
                  <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white dark:from-gray-800 to-transparent z-10 pointer-events-none opacity-90 sm:hidden" />
                  
                  <div ref={scrollContainerRef} className="overflow-x-auto scrollbar-hide">
                    <div className="flex items-center gap-1 px-1">
                      {tabs.map((tab) => {
                        const Icon = tab.icon;
                        
                        return (
                          <button
                            key={tab.id}
                            ref={tab.isActive ? activeTabRef : null}
                            onClick={tab.onClick}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-all duration-200 ${
                              tab.isActive
                                ? 'bg-scout-accent-100 dark:bg-scout-accent-900/30 font-medium text-scout-accent-700 dark:text-scout-accent-300'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            {Icon && (
                              <Icon className={`w-4 h-4 transition-colors duration-200 ${
                                tab.isActive
                                  ? 'text-scout-accent-600 dark:text-scout-accent-400'
                                  : 'text-gray-500 dark:text-gray-500'
                              }`} />
                            )}
                            <span>{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Comparison Controls - For Compare page (Priority 3) */}
            {secondRowType === 'comparison' && comparisonProps.towns && (
              <div className="filter-row py-2">
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                  {/* Town count */}
                  <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                    {comparisonProps.towns.length}/{comparisonProps.maxTowns || 3}
                  </span>
                  
                  {/* Town pills */}
                  {comparisonProps.towns.map((town) => (
                    <div
                      key={town.id}
                      className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-sm"
                    >
                      <MapPin className="w-3 h-3 text-scout-accent-600" />
                      <span className="text-gray-900 dark:text-white">{town.name}</span>
                      <button
                        onClick={() => comparisonProps.onRemoveTown(town.id)}
                        className="ml-1 text-gray-400 hover:text-red-500 transition-colors"
                        aria-label={`Remove ${town.name}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  
                  {/* Add town button */}
                  {comparisonProps.towns.length < (comparisonProps.maxTowns || 3) && (
                    <button
                      onClick={() => navigate('/favorites')}
                      className="flex-shrink-0 px-3 py-1.5 bg-scout-accent-50 dark:bg-scout-accent-900/20 text-scout-accent-700 dark:text-scout-accent-300 border border-scout-accent-200 dark:border-scout-accent-800 rounded-full text-sm hover:bg-scout-accent-100 dark:hover:bg-scout-accent-900/30 transition-colors"
                    >
                      + Add Town
                    </button>
                  )}
                  
                  {/* Max reached */}
                  {comparisonProps.towns.length >= (comparisonProps.maxTowns || 3) && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 italic flex-shrink-0">
                      Maximum reached
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {/* Desktop Filters - For Discover, Favorites (Priority 4) */}
            {secondRowType === 'filters' && (
              <div className="filter-row hidden lg:block py-2">
                <FilterBarV3 {...filterProps} />
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
      {secondRowType === 'filters' && isMobileFiltersOpen && (
        <div className="fixed inset-0 z-[10000] md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileFiltersOpen(false)}
          />
          
          {/* Modal */}
          <div className="absolute bottom-0 left-4 right-4 bg-white dark:bg-gray-800 rounded-t-2xl shadow-xl max-h-[80vh] overflow-y-auto">
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