import { useNavigate } from 'react-router-dom';
import { uiConfig } from '../styles/uiConfig';
// Updated 09JUN25: Converted from Phosphor React to Lucide React icons
import { 
  User, 
  Globe, 
  Sun, 
  Users, 
  Target, 
  ClipboardList, 
  DollarSign,
  Check,
  Scale,
  BarChart3,
  Star,
  MapPin,
  Heart,
  Calculator,
  List
} from 'lucide-react';

// Icon mapping - Updated 09JUN25: Using Lucide React icons consistently
const IconMap = {
  user: User,
  globe: Globe,
  sun: Sun,
  users: Users,
  target: Target,
  clipboard: ClipboardList,
  dollar: DollarSign,
  check: Check,
  scales: Scale,
  chart: BarChart3,
  star: Star,
  map: MapPin,
  heart: Heart,
  calculator: Calculator,
  list: List
};

/**
 * BaseStepNavigation - Reusable step navigation component
 * Added 09JUN25: Centralized step navigation system following industry best practices
 * Updated 09JUN25: Converted to Lucide React icons
 */
export const BaseStepNavigation = ({ 
  variant = 'onboarding', 
  currentStep, 
  completedSteps = {},
  allowNavigation = true,
  customSteps = null 
}) => {
  const navigate = useNavigate();
  const styles = uiConfig.stepNavigation.styles;
  
  // Get steps from variant or use custom steps
  const steps = customSteps || uiConfig.stepNavigation.variants[variant]?.steps || [];
  
  const getStepStatus = (stepKey) => {
    if (stepKey === currentStep) return 'current';
    if (completedSteps[stepKey]) return 'completed';
    return 'future';
  };

  const handleStepClick = (step) => {
    if (!allowNavigation) return;
    
    const status = getStepStatus(step.key);
    // Allow navigation to current and completed steps
    if (status === 'current' || status === 'completed') {
      if (step.path) {
        navigate(step.path);
      }
    }
  };

  const getIconForStep = (step) => {
    if (typeof step.icon === 'string' && IconMap[step.icon]) {
      const IconComponent = IconMap[step.icon];
      // Updated 09JUN25: Lucide React uses size and strokeWidth instead of weight
      return <IconComponent size={20} strokeWidth={2} />;
    }
    return step.icon; // Custom JSX icon
  };

  return (
    <div className={styles.container}>
      {/* Icon Row */}
      <div className={styles.iconRow}>
        {steps.map((step) => {
          const status = getStepStatus(step.key);
          const isClickable = allowNavigation && (status === 'current' || status === 'completed');
          
          return (
            <button
              key={step.key}
              onClick={() => handleStepClick(step)}
              disabled={!isClickable}
              className={`
                ${styles.icon.base}
                ${status === 'current' 
                  ? styles.icon.current
                  : status === 'completed'
                  ? styles.icon.completed
                  : styles.icon.future
                }
                ${isClickable ? 'hover:scale-105' : ''}
              `}
              title={step.label}
              aria-label={`${step.label} - ${status}`}
            >
              {getIconForStep(step)}
            </button>
          );
        })}
      </div>
      
      {/* Label Row */}
      <div className={styles.labelRow}>
        {steps.map((step) => {
          const status = getStepStatus(step.key);
          return (
            <div
              key={`${step.key}-label`}
              className={`
                ${styles.labels.base}
                ${status === 'current' 
                  ? styles.labels.current
                  : status === 'completed'
                  ? styles.labels.completed
                  : styles.labels.future
                }
              `}
            >
              {step.label}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * BaseBottomNavigation - Reusable bottom navigation component
 * Added 09JUN25: Clean Back/Next button system
 */
export const BaseBottomNavigation = ({ 
  onBack, 
  onNext, 
  backLabel = "Back", 
  nextLabel = "Next",
  nextDisabled = false,
  loading = false,
  showBack = true,
  showNext = true
}) => {
  const styles = uiConfig.bottomNavigation.styles;

  return (
    <div className={styles.container}>
      {showBack ? (
        <button
          type="button"
          onClick={onBack}
          className={styles.backButton}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {backLabel}
        </button>
      ) : (
        <div></div> // Spacer for alignment
      )}

      {showNext && (
        <button
          type="submit"
          onClick={onNext}
          disabled={nextDisabled || loading}
          className={styles.nextButton}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            <>
              {nextLabel}
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      )}
    </div>
  );
};

/**
 * Enhanced Slider Component - Added 09JUN25: Beautiful sliders matching screenshot
 */
export const EnhancedSlider = ({ 
  label, 
  value, 
  onChange, 
  min = 1, 
  max = 5, 
  step = 1,
  leftLabel = "Not important",
  rightLabel = "Very important",
  className = ""
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`${uiConfig.components.formGroup} ${className}`}>
      <label className={uiConfig.components.label}>
        {label}
      </label>
      
      <div className="relative mb-4">
        {/* Track */}
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full relative">
          {/* Fill */}
          <div 
            className="h-2 bg-sage-600 rounded-full transition-all duration-200"
            style={{ width: `${percentage}%` }}
          ></div>
          
          {/* Slider Input */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer enhanced-slider"
          />
          
          {/* Custom Thumb */}
          <div 
            className="absolute top-1/2 w-5 h-5 bg-sage-600 rounded-full shadow-lg transform -translate-y-1/2 -translate-x-1/2 transition-all duration-200 hover:shadow-xl hover:scale-110"
            style={{ left: `${percentage}%` }}
          ></div>
        </div>
        
        {/* Labels */}
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Button Variants - Added 09JUN25: Consistent button styling
 */
export const ButtonVariant = ({ 
  variant = 'unselected', 
  selected = false, 
  onClick, 
  children, 
  className = "",
  ...props 
}) => {
  const variantClass = selected 
    ? uiConfig.components.buttonVariants.selected 
    : uiConfig.components.buttonVariants[variant];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default BaseStepNavigation;