import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../utils/authUtils';
import { getOnboardingProgress } from '../../utils/onboardingUtils';
// Updated 09JUN25: Using Lucide React icons for professional 7-step onboarding
import { 
  MapPin, 
  Globe, 
  CloudSun, 
  Users, 
  DollarSign, 
  Heart, 
  Building
} from 'lucide-react';

export default function OnboardingStatus() {
  const [progress, setProgress] = useState({
    completedSteps: {},
    completedCount: 0,
    totalSteps: 7, // Updated 09JUN25: Changed from 6 to 7 steps
    percentage: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const { user } = await getCurrentUser();
        if (!user) {
          navigate('/welcome');
          return;
        }
        
        const { success, progress: userProgress, error: progressError } = await getOnboardingProgress(user.id);
        if (!success) {
          setError(progressError?.message || "Failed to fetch onboarding progress");
          setLoading(false);
          return;
        }
        
        setProgress(userProgress);
      } catch (err) {
        setError("An unexpected error occurred");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProgress();
  }, [navigate]);

  // Updated 09JUN25: Updated to 7 steps with Lucide React icons and proper labels
  const steps = [
    { 
      key: 'current_status', 
      label: 'Current Status', 
      path: '/onboarding/current-status',
      icon: MapPin
    },
    { 
      key: 'region_preferences', 
      label: 'Region Preferences', 
      path: '/onboarding/region',
      icon: Globe
    },
    { 
      key: 'climate_preferences', 
      label: 'Climate Preferences', 
      path: '/onboarding/climate',
      icon: CloudSun
    },
    { 
      key: 'culture_preferences', 
      label: 'Lifestyle Preferences', 
      path: '/onboarding/culture',
      icon: Users
    },
    { 
      key: 'hobbies', 
      label: 'Financial Requirements', 
      path: '/onboarding/hobbies',
      icon: DollarSign
    },
    { 
      key: 'healthcare', 
      label: 'Healthcare Needs', 
      path: '/onboarding/healthcare',
      icon: Heart
    },
    { 
      key: 'administration', 
      label: 'Administration & Legal', 
      path: '/onboarding/administration',
      icon: Building
    }
  ];

  // Determine the next incomplete step
  const getNextStep = () => {
    const nextIncompleteStep = steps.find(step => !progress.completedSteps[step.key]);
    return nextIncompleteStep || steps[0]; // Default to first step if all complete
  };

  const handleContinue = () => {
    const nextStep = getNextStep();
    navigate(nextStep.path);
  };

  // Updated 09JUN25: Added function to get step status for styling
  const getStepStatus = (stepKey, stepIndex) => {
    const isCompleted = progress.completedSteps[stepKey];
    const nextIncompleteIndex = steps.findIndex(step => !progress.completedSteps[step.key]);
    const isCurrent = nextIncompleteIndex === stepIndex;
    
    if (isCompleted) return 'completed';
    if (isCurrent) return 'current';
    return 'future';
  };

  // Updated 09JUN25: Added function to get icon styling based on step status
  const getIconClasses = (status) => {
    const baseClasses = 'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer';
    
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-emerald-100 text-emerald-700 hover:bg-emerald-200 hover:scale-105`;
      case 'current':
        return `${baseClasses} bg-emerald-400 text-white shadow-lg scale-110`;
      case 'future':
        return `${baseClasses} bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed`;
      default:
        return `${baseClasses} bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500`;
    }
  };

  // Updated 09JUN25: Added function to get label styling
  const getLabelClasses = (status) => {
    const baseClasses = 'text-sm font-medium';
    
    switch (status) {
      case 'completed':
        return `${baseClasses} text-emerald-600 dark:text-emerald-400`;
      case 'current':
        return `${baseClasses} text-emerald-500 dark:text-emerald-400 font-semibold`;
      case 'future':
        return `${baseClasses} text-gray-400 dark:text-gray-500`;
      default:
        return `${baseClasses} text-gray-600 dark:text-gray-400`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center">
        <div className="animate-pulse text-emerald-600 font-semibold">Loading your progress...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">Your Retirement Profile</h1>
        
        {error && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Your Progress</h2>
            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              {progress.percentage}% Complete
            </span>
          </div>
          
          {/* Updated 09JUN25: Enhanced progress bar with sage green theme */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-8">
            <div 
              className="bg-emerald-400 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${progress.percentage}%` }}
            ></div>
          </div>

          {/* Updated 09JUN25: New step visualization with Lucide React icons */}
          <div className="space-y-6 mb-8">
            {steps.map((step, index) => {
              const status = getStepStatus(step.key, index);
              const StepIcon = step.icon;
              
              return (
                <div key={step.key} className="flex items-center space-x-4">
                  {/* Step Icon Circle - Updated 09JUN25: No numbers, no checkmarks, icons only */}
                  <div className="flex-shrink-0 text-center">
                    <Link
                      to={step.path}
                      className={getIconClasses(status)}
                      onClick={(e) => {
                        if (status === 'future') {
                          e.preventDefault();
                        }
                      }}
                    >
                      <StepIcon size={20} strokeWidth={status === 'current' ? 2.5 : 2} />
                    </Link>
                  </div>

                  {/* Step Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={step.path}
                      className={`block ${getLabelClasses(status)} hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors`}
                      onClick={(e) => {
                        if (status === 'future') {
                          e.preventDefault();
                        }
                      }}
                    >
                      {step.label}
                      {status === 'completed' && (
                                                  <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400">
                          ✓ Completed
                        </span>
                      )}
                    </Link>
                    
                    {/* Added 09JUN25: Helper text for specific steps */}
                    {step.key === 'administration' && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Health, Safety, Governance, Immigration
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Updated 09JUN25: Enhanced continue button with sage green theme */}
          <button
            onClick={handleContinue}
            className="w-full bg-emerald-400 hover:bg-emerald-500 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
          >
            {progress.completedCount === 0 
              ? 'Start Your Profile' 
              : progress.completedCount === progress.totalSteps 
                ? 'Review & Complete' 
                : 'Continue'}
          </button>
        </div>

        {/* Updated 09JUN25: Added informational section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            What's Next?
          </h3>
          
          <div className="text-gray-600 dark:text-gray-400 space-y-2">
            <p className="text-sm">
              Complete all 7 sections to get personalized retirement location recommendations.
            </p>
            
            <div className="text-sm space-y-1">
              <p>• Each section takes 2-3 minutes</p>
              <p>• Your progress is saved automatically</p>
              <p>• You can edit your answers anytime</p>
            </div>
          </div>

          {progress.completedCount > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Great progress! You can always come back and finish later.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}