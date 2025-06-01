import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../utils/authUtils';
import { getOnboardingProgress } from '../../utils/onboardingUtils';

export default function OnboardingStatus() {
  const [progress, setProgress] = useState({
    completedSteps: {},
    completedCount: 0,
    totalSteps: 6,
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

  const steps = [
    { key: 'current_status', label: 'Current Status', path: '/onboarding/current-status' },
    { key: 'region_preferences', label: 'Region', path: '/onboarding/region' },
    { key: 'climate_preferences', label: 'Climate', path: '/onboarding/climate' },
    { key: 'culture_preferences', label: 'Culture', path: '/onboarding/culture' },
    { key: 'hobbies', label: 'Hobbies', path: '/onboarding/hobbies' },
    { key: 'budget', label: 'Costs', path: '/onboarding/costs' }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center">
        <div className="animate-pulse text-green-600 font-semibold">Loading your progress...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Your Retirement Profile</h1>
        
        {error && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Your Progress</h2>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              {progress.percentage}% Complete
            </span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-6">
            <div 
              className="bg-green-600 h-2.5 rounded-full" 
              style={{ width: `${progress.percentage}%` }}
            ></div>
          </div>
          
          <ul className="space-y-3 mb-6">
            {steps.map((step) => {
              const isCompleted = progress.completedSteps[step.key];
              return (
                <li key={step.key} className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                    isCompleted
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className="text-xs">{steps.indexOf(step) + 1}</span>
                    )}
                  </div>
                  <Link
                    to={step.path}
                    className={`flex-1 text-sm ${
                      isCompleted
                        ? 'text-gray-800 dark:text-white'
                        : 'text-gray-600 dark:text-gray-400'
                    } hover:text-green-600 dark:hover:text-green-400`}
                  >
                    {step.label}
                    {isCompleted && (
                      <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                        Completed
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
          
          <button
            onClick={handleContinue}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            {progress.completedCount === 0 ? 'Start' : progress.completedCount === progress.totalSteps ? 'Review' : 'Continue'}
          </button>
          
          {progress.completedCount > 0 && progress.completedCount < progress.totalSteps && (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
              You can always come back and finish later.
            </p>
          )}
          
          {progress.completedCount === progress.totalSteps && (
            <Link
              to="/onboarding/review"
              className="block text-center text-sm text-green-600 dark:text-green-400 mt-4 hover:underline"
            >
              Review and finalize your preferences
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}