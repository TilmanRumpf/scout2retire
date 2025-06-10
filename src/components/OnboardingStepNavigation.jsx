// src/components/OnboardingStepNavigation.jsx
// Fixed 09JUN25: Corrected step logic and icon/label alignment issues
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Globe, 
  CloudSun, 
  Users, 
  DollarSign, 
  Heart, 
  Building
} from 'lucide-react';

const OnboardingStepNavigation = ({ 
  currentStep, 
  completedSteps = {}, 
  onStepClick = null,
  className = "" 
}) => {
  // Fixed 09JUN25: Corrected step definitions to match actual flow
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
      label: 'Finance', 
      path: '/onboarding/hobbies',
      icon: DollarSign
    },
    { 
      key: 'healthcare', 
      label: 'Health', 
      path: '/onboarding/healthcare',
      icon: Heart
    },
    { 
      key: 'administration', 
      label: 'Legal', 
      path: '/onboarding/administration',
      icon: Building
    }
  ];

  // Fixed 09JUN25: Improved step status detection
  const getStepStatus = (stepKey) => {
    if (completedSteps[stepKey]) return 'completed';
    if (stepKey === currentStep) return 'current';
    return 'future';
  };

  // Fixed 09JUN25: Corrected icon styling with proper emerald colors
  const getIconClasses = (status) => {
    const baseClasses = 'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200';
    
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-scout-accent-100 text-scout-accent-700 hover:bg-scout-accent-200 hover:scale-105 cursor-pointer`;
      case 'current':
        return `${baseClasses} bg-scout-accent-600 text-white shadow-lg scale-110 ring-2 ring-scout-accent-200`;
      case 'future':
        return `${baseClasses} bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed`;
      default:
        return `${baseClasses} bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500`;
    }
  };

  // Fixed 09JUN25: Corrected label styling with proper emerald colors
  const getLabelClasses = (status) => {
    const baseClasses = 'text-xs font-medium text-center mt-2';
    
    switch (status) {
      case 'completed':
        return `${baseClasses} text-scout-accent-600 dark:text-scout-accent-400`;
      case 'current':
        return `${baseClasses} text-scout-accent-500 dark:text-scout-accent-400 font-semibold`;
      case 'future':
        return `${baseClasses} text-gray-400 dark:text-gray-500`;
      default:
        return `${baseClasses} text-gray-600 dark:text-gray-400`;
    }
  };

  // Handle step click
  const handleStepClick = (step, status) => {
    if (status === 'future') return; // Don't allow clicking future steps
    
    if (onStepClick) {
      onStepClick(step);
    }
  };

  return (
    <div className={`mb-8 ${className}`}>
      {/* Fixed 09JUN25: Proper alignment grid for icons AND labels */}
      <div className="flex justify-center items-start space-x-2 sm:space-x-4">
        {steps.map((step, index) => {
          const status = getStepStatus(step.key);
          const StepIcon = step.icon;
          const canClick = status !== 'future';
          
          return (
            <div key={step.key} className="flex flex-col items-center w-16 sm:w-20">
              {/* Icon - Fixed 09JUN25: Centered properly */}
              <div className="flex justify-center mb-2">
                {canClick && !onStepClick ? (
                  <Link to={step.path}>
                    <div className={getIconClasses(status)}>
                      <StepIcon 
                        size={status === 'current' ? 20 : 18} 
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
                        size={status === 'current' ? 20 : 18} 
                        strokeWidth={status === 'current' ? 2.5 : 2} 
                      />
                    </div>
                  </button>
                ) : (
                  <div className={getIconClasses(status)}>
                    <StepIcon 
                      size={status === 'current' ? 20 : 18} 
                      strokeWidth={status === 'current' ? 2.5 : 2} 
                    />
                  </div>
                )}
              </div>

              {/* Label - Fixed 09JUN25: Properly centered and sized */}
              <div className={getLabelClasses(status)} style={{textAlign: 'center', width: '100%'}}>
                {step.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Optional: Progress line - Fixed 09JUN25: Only show on larger screens */}
      <div className="hidden sm:block relative mt-4">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-700"></div>
        <div 
          className="absolute top-0 left-0 h-0.5 bg-scout-accent-400 transition-all duration-300"
          style={{
            width: `${(Object.keys(completedSteps).filter(key => completedSteps[key]).length / steps.length) * 100}%`
          }}
        ></div>
      </div>
    </div>
  );
};

export default OnboardingStepNavigation;