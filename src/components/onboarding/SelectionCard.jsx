import React from 'react';
import { Check, Lock } from 'lucide-react';
import { uiConfig } from '../../styles/uiConfig';

/**
 * Reusable Selection Card Component for Onboarding
 * Provides consistent design across all onboarding pages
 */
export const SelectionCard = ({
  title,
  description,
  isSelected,
  onClick,
  icon: Icon,
  disabled = false,
  isLocked = false, // Paywall: Show lock icon if feature is locked
  size = 'default', // 'small', 'default', 'large' - kept for backward compatibility
  showCheckmark = true
}) => {
  // Use centralized configuration - SINGLE SOURCE OF TRUTH
  const buttonClasses = uiConfig.onboardingButton.getButtonClasses(isSelected, disabled || isLocked);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${buttonClasses} ${isLocked ? 'opacity-60' : ''}`}
    >
      {/* Lock indicator for paywall-locked features */}
      {isLocked && (
        <div className={uiConfig.onboardingButton.checkmark.position}>
          <div className="bg-gray-400 dark:bg-gray-600 text-white rounded-full p-1">
            <Lock className="w-3 h-3" />
          </div>
        </div>
      )}

      {/* Selection indicator - using centralized config */}
      {!isLocked && showCheckmark && isSelected && (
        <div className={uiConfig.onboardingButton.checkmark.position}>
          <div className={uiConfig.onboardingButton.checkmark.container}>
            <Check className={uiConfig.onboardingButton.checkmark.icon} />
          </div>
        </div>
      )}

      {/* Card content - simple flex column */}
      <div className="flex flex-col justify-center h-full">
        <div className="flex items-center">
          {Icon && (
            <Icon className={`w-4 h-4 mr-1.5 flex-shrink-0 ${
              isSelected ? 'text-scout-accent-600 dark:text-scout-accent-400' : 'text-gray-500 dark:text-gray-400'
            }`} />
          )}
          <h3 className={`${uiConfig.onboardingButton.typography.title.weight} ${
            isSelected ? uiConfig.onboardingButton.typography.title.selectedColor : uiConfig.onboardingButton.typography.title.unselectedColor
          } ${uiConfig.onboardingButton.typography.title.size} ${(showCheckmark && isSelected) || isLocked ? 'pr-6' : ''}`}>
            {title}
          </h3>
        </div>
        {description && (
          <p className={`${uiConfig.onboardingButton.typography.subtitle.size} ${
            isSelected ? uiConfig.onboardingButton.typography.subtitle.selectedColor : uiConfig.onboardingButton.typography.subtitle.unselectedColor
          } ${uiConfig.onboardingButton.typography.subtitle.spacing} ${Icon ? 'ml-5' : ''}`}>
            {description}
          </p>
        )}
      </div>
    </button>
  );
};

/**
 * Grid wrapper for consistent card layouts
 */
export const SelectionGrid = ({ 
  children, 
  columns = 'default' // 'default' (3), 'two', 'four', 'single'
}) => {
  const columnClasses = {
    single: 'grid grid-cols-1 gap-2 sm:gap-3 md:gap-4',
    two: 'grid grid-cols-2 gap-2 sm:gap-3 md:gap-4',
    default: 'grid grid-cols-2 min-[428px]:grid-cols-3 gap-2 sm:gap-3 md:gap-4',
    four: 'grid grid-cols-2 min-[428px]:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4'
  };

  return (
    <div className={columnClasses[columns]}>
      {children}
    </div>
  );
};

/**
 * Section wrapper with icon and title
 */
export const SelectionSection = ({ 
  icon: Icon, 
  title, 
  children,
  className = '' 
}) => {
  return (
    <div className={`mb-6 lg:mb-8 ${className}`}>
      <label className={`text-base lg:text-lg ${uiConfig.font.weight.semibold} ${uiConfig.colors.heading} mb-3 lg:mb-4 flex items-center`}>
        {Icon && <Icon size={20} className="mr-2 text-scout-accent-500" />}
        {title}
      </label>
      {children}
    </div>
  );
};

export default SelectionCard;