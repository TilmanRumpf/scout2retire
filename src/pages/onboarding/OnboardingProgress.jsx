// src/pages/onboarding/OnboardingProgress.jsx
// Updated 10JUN25: Fixed to match exact 7-step flow with correct icons
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../utils/authUtils';
import { getOnboardingProgress } from '../../utils/onboardingUtils';
import { 
  MapPin, 
  Globe, 
  CloudSun, 
  Users, 
  SmilePlus,
  HousePlus,
  DollarSign,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { uiConfig } from '../../styles/uiConfig';

export default function OnboardingProgress() {
  const [progress, setProgress] = useState({
    completedSteps: {},
    completedCount: 0,
    totalSteps: 7,
    percentage: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 10JUN25 - Updated to match exact spreadsheet specification
  const steps = [
    { 
      key: 'current_status', 
      label: 'Current Status', 
      path: '/onboarding/current-status',
      icon: MapPin,
      description: 'Your current situation'
    },
    { 
      key: 'region_preferences', 
      label: 'Region Preferences', 
      path: '/onboarding/region',
      icon: Globe,
      description: 'Your regional preferences'
    },
    { 
      key: 'climate_preferences', 
      label: 'Climate Preferences', 
      path: '/onboarding/climate',
      icon: CloudSun,
      description: 'Your climate preferences'
    },
    { 
      key: 'culture_preferences', 
      label: 'Culture Preferences', 
      path: '/onboarding/culture',
      icon: Users,
      description: 'Your cultural preferences'
    },
    { 
      key: 'hobbies', 
      label: 'Hobbies & Interests', 
      path: '/onboarding/hobbies',
      icon: SmilePlus,
      description: 'Your preferred hobbies'
    },
    { 
      key: 'administration', 
      label: 'Administration', 
      path: '/onboarding/administration',
      icon: HousePlus,
      description: 'Your administrative preferences'
    },
    { 
      key: 'budget', 
      label: 'Budget & Costs', 
      path: '/onboarding/costs',
      icon: DollarSign,
      description: 'Your cost preferences'
    }
  ];

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

  // Determine the next incomplete step for Continue button
  const getNextStep = () => {
    const nextIncompleteStep = steps.find(step => !progress.completedSteps[step.key]);
    return nextIncompleteStep || steps[steps.length - 1];
  };

  // Handle navigation to specific step (only if completed or next incomplete)
  const handleStepClick = (step) => {
    const isCompleted = progress.completedSteps[step.key];
    const nextStep = getNextStep();
    const isNextStep = step.key === nextStep.key;
    
    if (isCompleted || isNextStep) {
      navigate(step.path);
    }
  };

  // Handle continue button click
  const handleContinue = () => {
    const nextStep = getNextStep();
    
    // If all steps are complete, go to review
    if (progress.percentage === 100) {
      navigate('/onboarding/review');
    } else {
      navigate(nextStep.path);
    }
  };

  // Get status display for each step using uiConfig patterns
  const getStepStatus = (step) => {
    const isCompleted = progress.completedSteps[step.key];
    const nextStep = getNextStep();
    const isNextStep = step.key === nextStep.key;
    
    if (isCompleted) {
      return {
        status: 'completed',
        icon: CheckCircle2,
        text: 'Completed',
        classes: uiConfig.notifications.success,
        clickable: true
      };
    } else if (isNextStep) {
      return {
        status: 'current',
        icon: Clock,
        text: 'In Progress',
        classes: uiConfig.notifications.info,
        clickable: true
      };
    } else {
      return {
        status: 'pending',
        icon: Clock,
        text: 'Not Started',
        classes: `${uiConfig.colors.muted} ${uiConfig.colors.input}`,
        clickable: false
      };
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${uiConfig.colors.page} ${uiConfig.layout.spacing.section} flex items-center justify-center`}>
        <div className={`${uiConfig.animation.pulse} ${uiConfig.colors.success} ${uiConfig.font.weight.semibold}`}>
          Loading your progress...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${uiConfig.colors.page} ${uiConfig.layout.spacing.section} flex items-center justify-center`}>
        <div className="text-center">
          <div className={`${uiConfig.colors.error} ${uiConfig.font.weight.semibold} ${uiConfig.layout.spacing.fieldCompact}`}>Error</div>
          <div className={uiConfig.colors.hint}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${uiConfig.colors.page} pb-20 ${uiConfig.responsive.md}pb-4`}>
      {/* Header with progress overview using uiConfig styles */}
      <header className={`${uiConfig.colors.card} ${uiConfig.layout.shadow.sm}`}>
        <div className={`${uiConfig.layout.width.container} ${uiConfig.layout.spacing.card}`}>
          <div className={`text-center ${uiConfig.layout.spacing.field}`}>
            <h1 className={`${uiConfig.font.size['2xl']} ${uiConfig.font.weight.bold} ${uiConfig.colors.heading} ${uiConfig.layout.spacing.fieldCompact}`}>
              Your Retirement Profile Setup
            </h1>
            <p className={`${uiConfig.colors.body}`}>
              Complete all steps to get personalized retirement destination recommendations
            </p>
          </div>
          
          {/* Overall completion percentage using uiConfig progress styles */}
          <div className={`${uiConfig.colors.input} ${uiConfig.layout.radius.lg} ${uiConfig.layout.spacing.cardCompact}`}>
            <div className={`flex justify-between items-center ${uiConfig.layout.spacing.fieldCompact}`}>
              <span className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body}`}>
                Overall Progress
              </span>
              <span className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.semibold} ${uiConfig.colors.success}`}>
                {progress.percentage}% Complete
              </span>
            </div>
            <div className={`w-full ${uiConfig.progress.track} ${uiConfig.layout.radius.lg} h-3`}>
              <div 
                className={`${uiConfig.progress.fill} h-3 ${uiConfig.layout.radius.lg} ${uiConfig.animation.transitionSlow}`}
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
            <div className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`} style={{ marginTop: '0.25rem' }}>
              {progress.completedCount} of {progress.totalSteps} steps completed
            </div>
          </div>
        </div>
      </header>

      <main className={`${uiConfig.layout.width.container} ${uiConfig.layout.spacing.section}`}>
        {/* Three-column table layout following uiConfig patterns */}
        <div className={`${uiConfig.components.card} ${uiConfig.layout.shadow.md}`}>
          <div className={`${uiConfig.layout.spacing.card} border-b ${uiConfig.colors.borderLight}`}>
            <h2 className={`${uiConfig.font.size.lg} ${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>
              Setup Steps
            </h2>
          </div>
          
          <div className={`divide-y ${uiConfig.colors.borderLight}`}>
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const statusInfo = getStepStatus(step);
              const StatusIcon = statusInfo.icon;
              
              return (
                <div 
                  key={step.key}
                  onClick={() => handleStepClick(step)}
                  className={`grid grid-cols-1 md:grid-cols-12 gap-4 ${uiConfig.layout.spacing.cardCompact} ${uiConfig.animation.transition} ${
                    statusInfo.clickable 
                      ? `${uiConfig.states.hover} cursor-pointer` 
                      : uiConfig.states.disabled
                  }`}
                >
                  {/* Column 1: Step Icon - Proper circle styling with white icons */}
                  <div className="flex items-center justify-center md:col-span-2 order-1">
                    <div className={`w-12 h-12 ${uiConfig.layout.radius.full} flex items-center justify-center ${
                      statusInfo.status === 'completed' 
                        ? uiConfig.colors.badge 
                        : statusInfo.status === 'current'
                        ? uiConfig.colors.tabActive
                        : uiConfig.colors.input
                    }`}>
                      <StepIcon className={`${uiConfig.icons.size.lg} ${statusInfo.status === 'completed' || statusInfo.status === 'current' ? '' : uiConfig.colors.muted}`} />
                    </div>
                  </div>
                  
                  {/* Column 2: Step Name and Description - Mobile first */}
                  <div className="md:col-span-7 flex flex-col justify-center order-2">
                    <h3 className={`${uiConfig.font.weight.medium} ${uiConfig.colors.heading}`}>
                      {index + 1}. {step.label}
                    </h3>
                    <p className={`${uiConfig.font.size.sm} ${uiConfig.colors.hint}`} style={{ marginTop: '0.25rem' }}>
                      {step.description}
                    </p>
                  </div>
                  
                  {/* Column 3: Status - Mobile first */}
                  <div className="flex items-center justify-center md:justify-end md:col-span-3 order-3">
                    <div className={`inline-flex items-center ${uiConfig.components.navItem} ${statusInfo.classes}`}>
                      <StatusIcon className={`${uiConfig.icons.size.sm}`} style={{ marginRight: '0.25rem' }} />
                      {statusInfo.text}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Continue button using uiConfig button styles */}
        <div className={`${uiConfig.layout.spacing.field} flex justify-center`}>
          <button
            onClick={handleContinue}
            className={`${uiConfig.components.buttonPrimary} ${uiConfig.bottomNavigation.styles.nextButton}`}
          >
            {progress.percentage === 100 ? 'Review Profile' : `Continue: ${getNextStep().label}`}
          </button>
        </div>
        
        {/* Help text using uiConfig typography */}
        <div className={`${uiConfig.layout.spacing.cardCompact} text-center`}>
          <p className={`${uiConfig.font.size.sm} ${uiConfig.colors.hint}`}>
            💡 Click on completed steps to edit them. Complete all steps for the best recommendations.
          </p>
        </div>
      </main>
    </div>
  );
}