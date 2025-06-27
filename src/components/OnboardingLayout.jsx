import { OnboardingStepNavigation } from './OnboardingStepNavigation';
import { uiConfig } from '../styles/uiConfig';

// Responsive wrapper for all onboarding steps
export default function OnboardingLayout({ 
  children, 
  currentStep, 
  completedSteps = {},
  title,
  subtitle,
  showNavigation = true 
}) {
  return (
    <div className={`min-h-[100svh] ${uiConfig.colors.page} pb-20 sm:pb-4`}>
      {/* Container with responsive max-widths */}
      <div className="w-full max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation - smaller on mobile, larger on desktop */}
        {showNavigation && (
          <OnboardingStepNavigation 
            currentStep={currentStep} 
            completedSteps={completedSteps} 
            className="mb-4 lg:mb-6 pt-4 lg:pt-6" 
          />
        )}
        
        {/* Main content card - responsive padding and radius */}
        <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} lg:rounded-2xl ${uiConfig.layout.shadow.md} lg:shadow-lg`}>
          {/* Header section - responsive spacing */}
          {(title || subtitle) && (
            <div className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-2 lg:pb-4">
              {title && (
                <h1 className={`${uiConfig.font.size.lg} lg:text-2xl xl:text-3xl ${uiConfig.font.weight.bold} ${uiConfig.colors.heading}`}>
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className={`${uiConfig.font.size.xs} lg:text-sm xl:text-base ${uiConfig.colors.hint} mt-1 lg:mt-2`}>
                  {subtitle}
                </p>
              )}
            </div>
          )}
          
          {/* Content area - responsive padding */}
          <div className="px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8">
            {children}
          </div>
        </div>
        
        {/* Bottom navigation - fixed on mobile, inline on desktop */}
        <div className={`fixed sm:relative bottom-0 left-0 right-0 ${uiConfig.colors.card} border-t ${uiConfig.colors.borderLight} sm:border-0 sm:bg-transparent mt-0 sm:mt-6 lg:mt-8`}>
          <div className="max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto px-4 sm:px-0">
            <div className={`py-4 sm:py-0`}>
              <div id="onboarding-navigation" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}