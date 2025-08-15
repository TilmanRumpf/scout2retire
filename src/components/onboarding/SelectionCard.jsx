import React from 'react';
import { Check } from 'lucide-react';
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
  size = 'default', // 'small', 'default', 'large'
  showCheckmark = true
}) => {
  const sizeClasses = {
    small: 'p-3 sm:p-4 min-h-[60px] sm:min-h-[70px]',
    default: 'p-4 sm:p-5 min-h-[80px] sm:min-h-[90px]',
    large: 'p-5 sm:p-6 min-h-[100px] sm:min-h-[110px]'
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizeClasses[size]} ${uiConfig.layout.radius.lg} border-2 ${uiConfig.animation.transition}
        text-left relative overflow-hidden cursor-pointer w-full
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${isSelected 
          ? 'border-scout-accent-500 bg-scout-accent-50 dark:bg-scout-accent-900/20 shadow-md' 
          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800/30 hover:border-scout-accent-300 hover:shadow-md'
        }
        ${!disabled && !isSelected && 'hover:-translate-y-0.5 active:scale-[0.98]'}
      `}
    >
      {/* Selection indicator */}
      {showCheckmark && isSelected && (
        <div className="absolute top-2 right-2">
          <div className="w-6 h-6 bg-scout-accent-500 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
      
      {/* Card content */}
      <div className={showCheckmark && isSelected ? 'pr-10' : 'pr-2'}>
        <div className="flex items-start">
          {Icon && (
            <Icon className={`w-5 h-5 mt-0.5 mr-2 flex-shrink-0 ${
              isSelected ? 'text-scout-accent-600 dark:text-scout-accent-400' : 'text-gray-500 dark:text-gray-400'
            }`} />
          )}
          <div className="flex-1">
            <h3 className={`${uiConfig.font.weight.semibold} ${
              isSelected ? 'text-scout-accent-700 dark:text-scout-accent-300' : uiConfig.colors.heading
            } text-sm sm:text-base mb-1 whitespace-nowrap`}>
              {title}
            </h3>
            {description && (
              <p className={`text-xs sm:text-sm ${
                isSelected ? 'text-scout-accent-600 dark:text-scout-accent-400' : uiConfig.colors.hint
              }`}>
                {description}
              </p>
            )}
          </div>
        </div>
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
    single: 'grid grid-cols-1 gap-3 sm:gap-4',
    two: 'grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4',
    default: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4',
    four: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'
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