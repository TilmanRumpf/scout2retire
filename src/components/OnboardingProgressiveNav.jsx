import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, MapPin, Globe, CloudSun, Users, SmilePlus, HousePlus, DollarSign } from 'lucide-react';
import QuickNav from './QuickNav';

export default function OnboardingProgressiveNav({ currentStep, completedSteps = {} }) {
  const [isQuickNavOpen, setIsQuickNavOpen] = useState(false);
  const location = useLocation();
  const scrollContainerRef = useRef(null);
  const activeStepRef = useRef(null);
  const mountedRef = useRef(false);
  
  // Prevent double mounting in development (React StrictMode)
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
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

  // Scroll to show active step with proper boundaries
  useEffect(() => {
    // Use requestAnimationFrame for smoother DOM updates
    const animationFrame = requestAnimationFrame(() => {
      if (activeStepRef.current && scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const activeElement = activeStepRef.current;
        
        // Get the inner content width
        const innerContent = container.querySelector('.flex');
        if (!innerContent) return;
        
        // Get element position relative to container
        const elementRect = activeElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const innerRect = innerContent.getBoundingClientRect();
        
        // Calculate current element position
        const elementLeft = elementRect.left - innerRect.left;
        const elementRight = elementRect.right - innerRect.left;
        
        // Calculate visible area (accounting for gradients)
        const visibleLeft = container.scrollLeft + 32; // 2rem gradient
        const visibleRight = container.scrollLeft + containerRect.width - 32; // 2rem gradient
        
        // Only scroll if element is not fully visible
        if (elementLeft < visibleLeft) {
          // Scroll left to show element with padding
          container.scrollTo({
            left: Math.max(0, elementLeft - 32),
            behavior: 'smooth'
          });
        } else if (elementRight > visibleRight) {
          // Scroll right to show element with padding
          container.scrollTo({
            left: elementRight - containerRect.width + 32,
            behavior: 'smooth'
          });
        }
        // If element is already visible, don't scroll
      }
    });
    
    return () => cancelAnimationFrame(animationFrame);
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
        <div className="max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-7xl mx-auto relative overflow-hidden">
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
          
          {/* Steps Row - Horizontal scrolling */}
          <div className="h-10 flex items-center -mt-1 px-4">
            {/* Scrollable steps container with mask */}
            <div className="relative flex-1 overflow-hidden">
              {/* Subtle gradient masks - only 1rem wide */}
              <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white dark:from-gray-800 to-transparent z-10 pointer-events-none opacity-90" />
              <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white dark:from-gray-800 to-transparent z-10 pointer-events-none opacity-90" />
              
              <div ref={scrollContainerRef} className="overflow-x-auto scrollbar-hide">
                <div className="flex items-center gap-2 py-1 px-1">
                  {allSteps.map((step) => {
                  const Icon = step.icon;
                  const isActive = step.key === currentStep && currentStep !== 'progress';
                  const isCompleted = completedSteps[step.key];
                  
                  return (
                    <Link
                      key={step.key}
                      ref={isActive ? activeStepRef : null}
                      to={step.path}
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
                    </Link>
                  );
                })}
                </div>
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