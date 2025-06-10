import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../utils/authUtils';
import { getOnboardingProgress } from '../../utils/onboardingUtils';
import { BaseStepNavigation } from '../../components/BaseStepNavigation';
import { uiConfig } from '../../styles/uiConfig';

export default function OnboardingStatus() {
  const [progress, setProgress] = useState({
    completedSteps: {},
    completedCount: 0,
    totalSteps: 7, // Updated 09JUN25: Changed from 6 to 7 for Administration step
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

  // FIXED 09JUN25: Hardcoded clean step list - NO FUCKING ICONS FROM uiConfig
  const steps = [
    { key: 'current_status', label: 'Current Status', path: '/onboarding/current-status' },
    { key: 'region', label: 'Region Preferences', path: '/onboarding/region' },
    { key: 'climate', label: 'Climate Preferences', path: '/onboarding/climate' },
    { key: 'lifestyle', label: 'Lifestyle Preferences', path: '/onboarding/lifestyle' },
    { key: 'financial', label: 'Financial Requirements', path: '/onboarding/financial' },
    { key: 'healthcare', label: 'Healthcare Needs', path: '/onboarding/healthcare' },
    { key: 'administration', label: 'Administration & Legal', path: '/onboarding/administration' }
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
      <div className={`min-h-screen ${uiConfig.colors.page} p-4 flex items-center justify-center`}>
        <div className={`${uiConfig.animation.pulse} ${uiConfig.colors.accent} ${uiConfig.font.weight.semibold}`}>
          Loading your progress...
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${uiConfig.colors.page} p-4`}>
      <div className="max-w-md mx-auto">
        <h1 className={`${uiConfig.font.size['2xl']} ${uiConfig.font.weight.bold} ${uiConfig.colors.heading} mb-6`}>
          Your Retirement Profile
        </h1>
        
        {error && (
          <div className={`${uiConfig.notifications.error} p-4 ${uiConfig.layout.radius.lg} mb-6 border`}>
            {error}
          </div>
        )}

        {/* FIXED 09JUN25: REMOVED BaseStepNavigation - NO MORE EMOJI ICONS! */}
        
        <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} p-6 mb-6`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`${uiConfig.font.size.lg} ${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>
              Your Progress
            </h2>
            <span className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.success}`}>
              {progress.percentage}% Complete
            </span>
          </div>
          
          {/* Progress Bar - Updated 09JUN25: Using uiConfig progress styling */}
          <div className={`w-full ${uiConfig.progress.track} rounded-full h-2.5 mb-6`}>
            <div 
              className={`${uiConfig.progress.fill} h-2.5 rounded-full`}
              style={{ width: `${progress.percentage}%` }}
            ></div>
          </div>
          
          {/* Steps List - FIXED 09JUN25: ABSOLUTELY NO FUCKING ICONS OR EMOJIS */}
          <ul className="space-y-3 mb-6">
            {steps.map((step) => {
              const isCompleted = progress.completedSteps[step.key];
              return (
                <li key={step.key} className="flex items-center">
                  {/* FIXED: Clean status indicator - no more mr-3 bullshit */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                    isCompleted
                      ? `${uiConfig.colors.matchStrong}`
                      : `${uiConfig.progress.track} ${uiConfig.colors.muted}`
                  }`}>
                    {isCompleted ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className={`${uiConfig.font.size.xs} ${uiConfig.font.weight.semibold}`}>
                        {steps.indexOf(step) + 1}
                      </span>
                    )}
                  </div>
                  
                  <Link
                    to={step.path}
                    className={`flex-1 ${uiConfig.font.size.sm} ${
                      isCompleted
                        ? uiConfig.colors.heading
                        : uiConfig.colors.body
                    } hover:${uiConfig.colors.accent} ${uiConfig.animation.transitionFast}`}
                  >
                    <div className="flex flex-col">
                      <span className={uiConfig.font.weight.medium}>{step.label}</span>
                      {isCompleted && (
                        <span className={`${uiConfig.font.size.xs} ${uiConfig.colors.success} mt-1`}>
                          ✓ Completed
                        </span>
                      )}
                      {/* Description for Administration step - Added 09JUN25 */}
                      {step.key === 'administration' && !isCompleted && (
                        <span className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} mt-1`}>
                          Health, Safety, Governance, Immigration
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
          
          {/* Continue Button - Updated 09JUN25: Using uiConfig button styling */}
          <button
            onClick={handleContinue}
            className={`w-full ${uiConfig.components.buttonPrimary} py-3 px-4 ${uiConfig.layout.radius.lg}`}
          >
            {progress.completedCount === 0 ? 'Start Your Journey' : 
             progress.completedCount === progress.totalSteps ? 'Review & Complete' : 
             'Continue Setup'}
          </button>
          
          {/* Progress Messages - Updated 09JUN25: Enhanced messaging */}
          {progress.completedCount > 0 && progress.completedCount < progress.totalSteps && (
            <p className={`text-center ${uiConfig.font.size.sm} ${uiConfig.colors.hint} mt-4`}>
              Great progress! You can always come back and finish later.
            </p>
          )}
          
          {progress.completedCount === progress.totalSteps && (
            <div className={`text-center mt-4 p-3 ${uiConfig.colors.statusSuccess} ${uiConfig.layout.radius.md}`}>
              <p className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} mb-2`}>
                All sections completed!
              </p>
              <Link
                to="/onboarding/review"
                className={`${uiConfig.font.size.sm} ${uiConfig.colors.accent} hover:underline ${uiConfig.animation.transitionFast}`}
              >
                Review and finalize your preferences →
              </Link>
            </div>
          )}
        </div>

        {/* Help Section - Added 09JUN25: Additional user guidance */}
        <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.sm} p-4`}>
          <h3 className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.semibold} ${uiConfig.colors.heading} mb-2`}>
            What's Next?
          </h3>
          <p className={`${uiConfig.font.size.sm} ${uiConfig.colors.body} mb-3`}>
            Complete all {steps.length} sections to get personalized retirement location recommendations.
          </p>
          <div className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>
            <p>• Each section takes 2-3 minutes</p>
            <p>• Your progress is saved automatically</p>
            <p>• You can edit your answers anytime</p>
          </div>
        </div>
      </div>
    </div>
  );
}