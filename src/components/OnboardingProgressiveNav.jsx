import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, MapPin, Globe, CloudSun, Users, SmilePlus, HousePlus, DollarSign } from 'lucide-react';
import QuickNav from './QuickNav';

export default function OnboardingProgressiveNav({ currentStep, completedSteps = {} }) {
  const [isQuickNavOpen, setIsQuickNavOpen] = useState(false);
  const location = useLocation();
  
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
  const currentStepNum = currentStep === 'review' ? 7 : (allSteps.findIndex(s => s.key === currentStep) + 1 || 1);

  return (
    <>
      {/* Unified header matching Discover/Favorites design */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
        {/* Title Row - 36px */}
        <div className="h-9 flex items-center justify-between px-4">
          <h1 className="text-base font-semibold text-gray-900 dark:text-white">
            Onboarding
            <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
              {currentStepNum} of 7
            </span>
          </h1>
          <button 
            onClick={() => setIsQuickNavOpen(!isQuickNavOpen)}
            className="p-1.5 -mr-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
        
        {/* Steps Row - 32px - Horizontal scrolling */}
        <div className="h-8 flex items-center overflow-hidden">
          {/* Scrollable steps container */}
          <div className="flex-1 overflow-x-auto scrollbar-hide">
            <div className="flex items-center px-4 gap-3 sm:gap-4">
              {allSteps.map((step) => {
                const Icon = step.icon;
                const isActive = step.key === currentStep;
                const isCompleted = completedSteps[step.key];
                
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
                    {isActive && <span className="text-scout-accent-600 dark:text-scout-accent-400 ml-1">•</span>}
                  </Link>
                );
              })}
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