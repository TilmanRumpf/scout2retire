// src/components/OnboardingStepNavigation.jsx
// Updated 19JUN25: Enhanced current step highlighting with hamburger menu
// NOTE: Requires scout-progress and scout-nav colors to be defined in tailwind.config.js
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Globe, 
  CloudSun, 
  Users, 
  SmilePlus,
  HousePlus,
  DollarSign,
  Menu
} from 'lucide-react';
import QuickNav from './QuickNav';

const OnboardingStepNavigation = ({ 
  currentStep, 
  completedSteps = {}, 
  onStepClick = null,
  className = "" 
}) => {
  const [isQuickNavOpen, setIsQuickNavOpen] = useState(false);
  // Updated 19JUN25: Fixed to match database column names
  const steps = [
    { 
      key: 'current_status', 
      label: 'Status', 
      path: '/onboarding/current-status',
      icon: MapPin
    },
    { 
      key: 'region_preferences', 
      label: 'Region', 
      path: '/onboarding/region',
      icon: Globe
    },
    { 
      key: 'climate_preferences', 
      label: 'Climate', 
      path: '/onboarding/climate',
      icon: CloudSun
    },
    { 
      key: 'culture_preferences', 
      label: 'Culture', 
      path: '/onboarding/culture',
      icon: Users
    },
    { 
      key: 'hobbies', 
      label: 'Hobbies', 
      path: '/onboarding/hobbies',
      icon: SmilePlus
    },
    { 
      key: 'administration', 
      label: 'Admin', 
      path: '/onboarding/administration',
      icon: HousePlus
    },
    { 
      key: 'costs', // Fixed: Changed from 'budget' to 'costs' to match database
      label: 'Costs', 
      path: '/onboarding/costs',
      icon: DollarSign
    }
  ];

  // Improved step status detection - check current FIRST
  const getStepStatus = (stepKey) => {
    if (stepKey === currentStep) return 'current';  // Check current FIRST
    if (completedSteps[stepKey]) return 'completed';
    return 'future';
  };

  // Enhanced icon styling with better visual states
  const getIconClasses = (status) => {
    const baseClasses = 'rounded-full flex items-center justify-center transition-all duration-300 border-2';
    
    switch (status) {
      case 'completed':
        // Light green with darker green outline and icon
        return `${baseClasses} w-10 h-10 bg-scout-accent-100 border-scout-accent-600 text-scout-accent-700 hover:bg-scout-accent-200 cursor-pointer`;
      case 'current':
        // REVERSED: Dark green fill with light green border and icon
        return `${baseClasses} w-10 h-10 bg-scout-accent-600 border-scout-accent-200 text-scout-accent-100 shadow-lg ring-2 ring-scout-accent-300 dark:ring-scout-accent-700`;
      case 'future':
        // Warm peach tone for not edited steps
        return `${baseClasses} w-10 h-10 bg-scout-progress-100 border-scout-progress-300 text-scout-progress-500 hover:bg-scout-progress-200 hover:border-scout-progress-400 cursor-pointer`;
      default:
        return `${baseClasses} w-10 h-10 bg-gray-200 border-gray-300 text-gray-400`;
    }
  };

  // Enhanced label styling
  const getLabelClasses = (status) => {
    const baseClasses = 'text-xs text-center mt-2 transition-all duration-300';
    
    switch (status) {
      case 'completed':
        return `${baseClasses} text-scout-accent-700 dark:text-scout-accent-400 font-medium`;
      case 'current':
        // Bold text for current step but same size
        return `${baseClasses} text-scout-accent-700 dark:text-scout-accent-300 font-bold`;
      case 'future':
        return `${baseClasses} text-scout-progress-500 dark:text-scout-progress-400 font-normal`;
      default:
        return `${baseClasses} text-gray-600 dark:text-gray-400 font-normal`;
    }
  };

  // Container classes for proper spacing with current step
  const getContainerClasses = (status) => {
    return 'flex flex-col items-center w-16 sm:w-20';
  };

  // Handle step click - Allow clicking any step
  const handleStepClick = (step, status) => {
    if (onStepClick) {
      onStepClick(step);
    }
  };

  return (
    <>
      <div className={`${className}`}>
        {/* Step icons and labels with hamburger menu */}
        <div className="flex justify-center items-start space-x-2 sm:space-x-4 mb-6 px-4">
          {steps.map((step, index) => {
            const status = getStepStatus(step.key);
            const StepIcon = step.icon;
            const canClick = true; // Always allow clicking
            
            return (
              <div key={step.key} className={getContainerClasses(status)}>
                {/* Icon */}
                <div className="flex justify-center mb-1">
                  {canClick && !onStepClick ? (
                    <Link to={step.path}>
                      <div className={getIconClasses(status)}>
                        <StepIcon 
                          size={20} 
                          strokeWidth={status === 'current' ? 2.5 : 2} 
                        />
                      </div>
                    </Link>
                  ) : canClick && onStepClick ? (
                    <button 
                      type="button"
                      onClick={() => handleStepClick(step, status)}
                    >
                      <div className={getIconClasses(status)}>
                        <StepIcon 
                          size={20} 
                          strokeWidth={status === 'current' ? 2.5 : 2} 
                        />
                      </div>
                    </button>
                  ) : (
                    <div className={getIconClasses(status)}>
                      <StepIcon 
                        size={20} 
                        strokeWidth={status === 'current' ? 2.5 : 2} 
                      />
                    </div>
                  )}
                </div>

                {/* Label */}
                <div className={getLabelClasses(status)}>
                  {step.label}
                </div>
              </div>
            );
          })}
          
          {/* Hamburger Menu Button */}
          <div className="flex flex-col items-center w-16 sm:w-20">
            <div className="flex justify-center mb-1">
              <button
                onClick={() => setIsQuickNavOpen(!isQuickNavOpen)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-scout-nav-500 hover:text-scout-nav-700 dark:text-scout-nav-400 dark:hover:text-scout-nav-600 transition-colors"
                aria-label="Open navigation menu"
              >
                <Menu size={20} strokeWidth={2} />
              </button>
            </div>
            <div className="text-xs text-center mt-2 text-scout-nav-500 dark:text-scout-nav-400 font-normal">
              Menu
            </div>
          </div>
        </div>

        {/* Progress line with enhanced current position */}
        <div className="hidden sm:block relative mb-6 mx-8">
          <div className="absolute top-0 left-0 w-full h-1 bg-scout-progress-200 dark:bg-scout-progress-700 rounded-full"></div>
          <div 
            className="absolute top-0 left-0 h-1 bg-scout-accent-600 rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${((steps.findIndex(s => s.key === currentStep) + 1) / steps.length) * 100}%`
            }}
          />
        </div>
      </div>

      {/* Quick Navigation Overlay */}
      {isQuickNavOpen && (
        <QuickNav 
          isOpen={isQuickNavOpen} 
          onClose={() => setIsQuickNavOpen(false)} 
        />
      )}
    </>
  );
};

export default OnboardingStepNavigation;