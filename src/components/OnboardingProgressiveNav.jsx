import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, MapPin, Globe, CloudSun, Users, SmilePlus, HousePlus, DollarSign } from 'lucide-react';
import QuickNav from './QuickNav';

export default function OnboardingProgressiveNav({ currentStep, completedSteps = {} }) {
  const [isQuickNavOpen, setIsQuickNavOpen] = useState(false);
  const location = useLocation();
  const scrollContainerRef = useRef(null);
  const activeStepRef = useRef(null);
  
  // Close menu when route changes
  useEffect(() => {
    setIsQuickNavOpen(false);
  }, [location.pathname]);

  // All 7 onboarding steps
  const allSteps = [
    { id: 1, key: 'current_status', label: 'Status', path: '/onboarding/current-status', icon: MapPin },
    { id: 2, key: 'region_preferences', label: 'Region', path: '/onboarding/region', icon: Globe },
    { id: 3, key: 'climate_preferences', label: 'Climate', path: '/onboarding/climate', icon: CloudSun },
    { id: 4, key: 'culture_preferences', label: 'Culture', path: '/onboarding/culture', icon: Users },
    { id: 5, key: 'hobbies', label: 'Hobbies', path: '/onboarding/hobbies', icon: SmilePlus },
    { id: 6, key: 'administration', label: 'Admin', path: '/onboarding/administration', icon: HousePlus },
    { id: 7, key: 'costs', label: 'Costs', path: '/onboarding/costs', icon: DollarSign }
  ];
  
  // Find current step number
  const currentStepNum = currentStep === 'progress' ? 0 : (allSteps.findIndex(s => s.key === currentStep) + 1 || 1);

  // Scroll to center the active step with a delay for mobile
  useEffect(() => {
    // Small delay to ensure DOM is ready, especially on mobile
    const timer = setTimeout(() => {
      if (activeStepRef.current && scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const activeElement = activeStepRef.current;
        
        // Get element position relative to container
        const elementRect = activeElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const elementCenter = elementRect.left - containerRect.left + (elementRect.width / 2);
        const containerCenter = containerRect.width / 2;
        
        // Calculate scroll position
        const scrollPosition = container.scrollLeft + elementCenter - containerCenter;
        
        // Smooth scroll to center
        container.scrollTo({
          left: Math.max(0, scrollPosition),
          behavior: 'smooth'
        });
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [currentStep]);

  const handleMenuClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickNavOpen(true);
  };

  return (
    <>
      {/* Unified header matching Discover/Favorites design */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-7xl mx-auto relative">
          {/* Title Row - 36px */}
          <div className="h-9 flex items-center justify-between px-4">
            <h1 className="text-base font-semibold text-gray-900 dark:text-white flex items-baseline">
              <span className="text-lg s2r-logo">
                S<span style={{ color: '#f66527' }}>2</span>R
              </span>
              <span className="ml-2">Onboarding</span>
              <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                {currentStep === 'progress' ? 'Progress Overview' : currentStep === 'review' ? 'Summary' : `${currentStepNum} of 7`}
              </span>
            </h1>
            <button 
              onClick={handleMenuClick}
              className="nav-toggle p-1.5 -mr-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Open navigation menu"
              type="button"
            >
              <Menu className="w-5 h-5 text-gray-900 dark:text-gray-100" />
            </button>
          </div>
          
          {/* Steps Row - 32px - Horizontal scrolling */}
          <div className="h-8 flex items-center overflow-hidden px-4">
            {/* Scrollable steps container */}
            <div ref={scrollContainerRef} className="flex-1 overflow-x-auto scrollbar-hide -mx-4">
              <div className="flex items-center px-4 gap-3 sm:gap-4">
                {/* Extra padding at start for better scroll experience */}
                <div className="w-4 shrink-0" />
                {allSteps.map((step) => {
                  const Icon = step.icon;
                  const isActive = step.key === currentStep && currentStep !== 'progress';
                  const isCompleted = completedSteps[step.key];
                  
                  return (
                    <Link
                      key={step.key}
                      ref={isActive ? activeStepRef : null}
                      to={step.path}
                      className={`flex items-center gap-1 text-sm whitespace-nowrap transition-all duration-200 ${
                        isActive 
                          ? 'font-medium text-scout-accent-600 dark:text-scout-accent-400' 
                          : isCompleted
                          ? 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                          : 'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 transition-colors duration-200 ${
                        isActive 
                          ? 'text-scout-accent-600 dark:text-scout-accent-400' 
                          : isCompleted
                          ? 'text-gray-600 dark:text-gray-400'
                          : 'text-gray-400 dark:text-gray-500'
                      }`} />
                      <span>{step.label}</span>
                    </Link>
                  );
                })}
                {/* Extra padding at end to ensure last item is visible */}
                <div className="w-12 shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Navigation Overlay */}
      {isQuickNavOpen && (
        <QuickNav 
          isOpen={isQuickNavOpen} 
          onClose={() => setIsQuickNavOpen(false)} 
        />
      )}
    </>
  );
}