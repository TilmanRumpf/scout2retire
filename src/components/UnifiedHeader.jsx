import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, MapPin, Globe, CloudSun, Users, SmilePlus, HousePlus, DollarSign, SlidersHorizontal, X } from 'lucide-react';
import QuickNav from './QuickNav';
import FilterBarV3 from './FilterBarV3';
import Logo from './Logo';
import NotificationBell from './NotificationBell';
import { uiConfig } from '../styles/uiConfig';

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

  customSecondRow = null,  // Custom JSX content for second row

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
  const hasSecondRow = steps.length > 0 || tabs.length > 0 || showComparison || showFilters || customSecondRow;
  const secondRowType = steps.length > 0 ? 'steps'
    : tabs.length > 0 ? 'tabs'
    : showComparison ? 'comparison'
    : showFilters ? 'filters'
    : customSecondRow ? 'custom'
    : null;
  
  // Find current step number for display
  const currentStepNum = currentStep ? (steps.findIndex(s => s.key === currentStep) + 1 || 1) : 0;

  const handleMenuClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickNavOpen(true);
  };
  
  // Auto-scroll to CENTER active step
  useEffect(() => {
    if (secondRowType !== 'steps') return;
    
    const animationFrame = requestAnimationFrame(() => {
      if (activeStepRef.current && scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const activeElement = activeStepRef.current;
        
        // Get element position and dimensions
        const elementRect = activeElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Calculate element center relative to container
        const elementCenter = elementRect.left + (elementRect.width / 2) - containerRect.left;
        const containerCenter = containerRect.width / 2;
        
        // Calculate scroll position to center the element
        const scrollPosition = container.scrollLeft + (elementCenter - containerCenter);
        
        // Smooth scroll to center
        container.scrollTo({
          left: Math.max(0, scrollPosition),
          behavior: 'smooth'
        });
      }
    });
    
    return () => cancelAnimationFrame(animationFrame);
  }, [currentStep, secondRowType]);
  
  // Auto-scroll to CENTER active tab
  useEffect(() => {
    if (secondRowType !== 'tabs') return;
    
    const animationFrame = requestAnimationFrame(() => {
      if (activeTabRef.current && scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const activeElement = activeTabRef.current;
        
        // Get element position and dimensions
        const elementRect = activeElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Calculate element center relative to container
        const elementCenter = elementRect.left + (elementRect.width / 2) - containerRect.left;
        const containerCenter = containerRect.width / 2;
        
        // Calculate scroll position to center the element
        const scrollPosition = container.scrollLeft + (elementCenter - containerCenter);
        
        // Smooth scroll to center
        container.scrollTo({
          left: Math.max(0, scrollPosition),
          behavior: 'smooth'
        });
      }
    });
    
    return () => cancelAnimationFrame(animationFrame);
  }, [tabs, secondRowType]);

  return (
    <>
      <header className="ios-header fixed top-0 left-0 right-0 w-full pt-safe">
        <div className={`${maxWidth} mx-auto px-4 sm:px-6`}>
          <div className="ios-header-content">
              {/* Logo with company name - hidden on mobile phones */}
              <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                <Logo
                  variant="symbol"
                  className="h-7 lg:h-10"
                  navigateTo="/daily"
                />
                <span className={`text-sm font-semibold lg:hidden ${uiConfig.colors.heading}`}>
                  Scout<span className={uiConfig.colors.accent}>2</span>Retire
                </span>
              </div>

              {/* Title - always visible */}
              <div className="flex-1 min-w-0">
                <h1 className={`text-lg sm:text-xl font-semibold ${uiConfig.colors.heading} truncate`}>
                  <span className={`${title.includes("brings your future home") ? 'handwritten-tagline' : ''}`}>
                    {title}
                  </span>
                  {/* Count - hidden on narrow screens */}
                  {totalCount !== undefined && (
                    <span className={`ml-2 text-sm font-normal ${uiConfig.colors.subtitle} hidden md:inline`}>
                      ({filteredCount} of {totalCount})
                    </span>
                  )}
                  {/* Step context for onboarding */}
                  {steps.length > 0 && currentStepNum > 0 && (
                    <span className={`ml-2 text-sm font-normal ${uiConfig.colors.subtitle}`}>
                      {currentStepNum} of {steps.length}
                    </span>
                  )}
                </h1>
              </div>
              
              
              {/* Filter button - visible on mobile and tablet when filters exist */}
              {secondRowType === 'filters' && (
                <button
                  onClick={() => setIsMobileFiltersOpen(true)}
                  className={`relative p-2.5 ${uiConfig.colors.hoverBg} rounded-lg transition-colors lg:hidden flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center`}
                  aria-label="Filters"
                >
                  <SlidersHorizontal className={`w-6 h-6 ${uiConfig.colors.heading}`} />
                  {filterProps.filterCount > 0 && (
                    <span className={`absolute -top-0.5 -right-0.5 bg-scout-accent-500 text-white text-[10px] font-semibold rounded-full h-5 w-5 flex items-center justify-center`}>
                      {filterProps.filterCount}
                    </span>
                  )}
                </button>
              )}

              {/* Notification Bell */}
              <NotificationBell />

              {/* Menu button - always visible */}
              <button
                onClick={handleMenuClick}
                className={`p-2.5 ${uiConfig.colors.hoverBg} rounded-lg transition-colors flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center`}
                aria-label="Open navigation menu"
                type="button"
              >
                <Menu className={`w-6 h-6 ${uiConfig.colors.heading}`} />
              </button>
            </div>
            
            {/* SECOND ROW - Priority order: Steps > Tabs > Comparison > Filters */}
            
            {/* Steps Row - For Onboarding (Priority 1) */}
            {secondRowType === 'steps' && (
              <div className="filter-row pb-3 pt-2">
                <div className="relative">
                  {/* Gradient masks for horizontal scroll - match filter-row background */}
                  <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[rgba(255,255,255,0.95)] dark:from-[rgba(31,41,55,0.9)] to-transparent z-10 pointer-events-none" />
                  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[rgba(255,255,255,0.95)] dark:from-[rgba(31,41,55,0.9)] to-transparent z-10 pointer-events-none" />
                  
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

                              // Auto-center the clicked button
                              const button = e.currentTarget;
                              const container = scrollContainerRef.current;
                              if (container && button) {
                                const buttonRect = button.getBoundingClientRect();
                                const containerRect = container.getBoundingClientRect();
                                const buttonCenter = buttonRect.left + (buttonRect.width / 2) - containerRect.left;
                                const containerCenter = containerRect.width / 2;
                                const scrollPosition = container.scrollLeft + (buttonCenter - containerCenter);

                                container.scrollTo({
                                  left: Math.max(0, scrollPosition),
                                  behavior: 'smooth'
                                });
                              }

                              if (onStepNavigate) {
                                await onStepNavigate(step.path);
                              }
                            }}
                            className={`flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                              isActive
                                ? `${uiConfig.colors.accentSecondary} ${uiConfig.colors.accent}`
                                : isCompleted
                                ? `${uiConfig.colors.hoverBg} ${uiConfig.colors.heading}`
                                : `${uiConfig.colors.hoverBg} ${uiConfig.colors.subtitle}`
                            }`}
                          >
                            <Icon className={`w-5 h-5 transition-colors duration-200 ${
                              isActive
                                ? uiConfig.colors.accent
                                : isCompleted
                                ? uiConfig.colors.body
                                : uiConfig.colors.subtitle
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
              <div className="filter-row pb-3 pt-2">
                <div className="relative">
                  {/* Gradient masks for horizontal scroll on mobile - match filter-row background */}
                  <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[rgba(255,255,255,0.95)] dark:from-[rgba(31,41,55,0.9)] to-transparent z-10 pointer-events-none sm:hidden" />
                  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[rgba(255,255,255,0.95)] dark:from-[rgba(31,41,55,0.9)] to-transparent z-10 pointer-events-none sm:hidden" />
                  
                  <div ref={scrollContainerRef} className="overflow-x-auto scrollbar-hide">
                    <div className="flex items-center gap-2 px-1">
                      {tabs.map((tab) => {
                        const Icon = tab.icon;
                        
                        return (
                          <button
                            key={tab.id}
                            ref={tab.isActive ? activeTabRef : null}
                            onClick={(e) => {
                              // Auto-center the clicked tab
                              const button = e.currentTarget;
                              const container = scrollContainerRef.current;
                              if (container && button) {
                                const buttonRect = button.getBoundingClientRect();
                                const containerRect = container.getBoundingClientRect();
                                const buttonCenter = buttonRect.left + (buttonRect.width / 2) - containerRect.left;
                                const containerCenter = containerRect.width / 2;
                                const scrollPosition = container.scrollLeft + (buttonCenter - containerCenter);

                                container.scrollTo({
                                  left: Math.max(0, scrollPosition),
                                  behavior: 'smooth'
                                });
                              }

                              tab.onClick();
                            }}
                            className={`flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                              tab.isActive
                                ? `${uiConfig.colors.accentSecondary} ${uiConfig.colors.accent}`
                                : `${uiConfig.colors.hoverBg} ${uiConfig.colors.body}`
                            }`}
                          >
                            <Icon className={`w-5 h-5 transition-colors duration-200 ${
                              tab.isActive
                                ? uiConfig.colors.accent
                                : uiConfig.colors.subtitle
                            }`} />
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
              <div className="filter-row pb-3 pt-2">
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                  {/* Town count */}
                  <span className={`text-sm ${uiConfig.colors.subtitle} flex-shrink-0`}>
                    {comparisonProps.towns.length}/{comparisonProps.maxTowns || 3}
                  </span>
                  
                  {/* Town pills */}
                  {comparisonProps.towns.map((town) => (
                    <div
                      key={town.id}
                      className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 ${uiConfig.colors.card} border ${uiConfig.colors.border} rounded-full text-sm`}
                    >
                      <MapPin className={`w-3 h-3 ${uiConfig.colors.accent}`} />
                      <span className={uiConfig.colors.heading}>{town.name}</span>
                      <button
                        onClick={() => comparisonProps.onRemoveTown(town.id)}
                        className={`ml-1 ${uiConfig.colors.subtitle} hover:${uiConfig.colors.danger} transition-colors`}
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
                      className={`flex-shrink-0 px-3 py-1.5 ${uiConfig.colors.accentSecondary} ${uiConfig.colors.accent} border ${uiConfig.colors.accentBorder} rounded-full text-sm hover:${uiConfig.colors.accentHover} transition-colors`}
                    >
                      + Add Town
                    </button>
                  )}
                  
                  {/* Max reached */}
                  {comparisonProps.towns.length >= (comparisonProps.maxTowns || 3) && (
                    <span className={`text-sm ${uiConfig.colors.subtitle} italic flex-shrink-0`}>
                      Maximum reached
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {/* Desktop Filters - For Discover, Favorites (Priority 4) */}
            {secondRowType === 'filters' && (
              <div className="filter-row hidden lg:block pb-3 pt-2">
                <FilterBarV3 {...filterProps} />
              </div>
            )}

            {/* Custom Second Row - For special pages like Scotty (Priority 5) */}
            {secondRowType === 'custom' && customSecondRow && (
              <div className="filter-row pb-3 pt-2">
                {customSecondRow}
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
            className={`absolute inset-0 ${uiConfig.colors.overlay}`}
            onClick={() => setIsMobileFiltersOpen(false)}
          />
          
          {/* Modal */}
          <div className={`absolute bottom-0 left-4 right-4 ${uiConfig.colors.card} rounded-t-2xl shadow-xl max-h-[80vh] overflow-y-auto`}>
            {/* Header */}
            <div className={`sticky top-0 ${uiConfig.colors.card} border-b ${uiConfig.colors.border} p-4`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-lg font-semibold ${uiConfig.colors.heading}`}>Filters</h2>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className={`p-2 ${uiConfig.colors.hoverBg} rounded-lg transition-colors`}
                  aria-label="Close filters"
                >
                  <X className={`w-5 h-5 ${uiConfig.colors.subtitle}`} />
                </button>
              </div>
            </div>
            
            {/* Filter Content */}
            <div className="p-4">
              <FilterBarV3 {...filterProps} variant="mobile" />
            </div>
            
            {/* Apply Button */}
            <div className={`sticky bottom-0 ${uiConfig.colors.card} border-t ${uiConfig.colors.border} p-4`}>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className={`w-full py-3 ${uiConfig.colors.btnPrimary} rounded-lg font-medium transition-colors`}
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