import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../utils/authUtils';
import { saveOnboardingStep, getOnboardingProgress } from '../../utils/onboardingUtils';
import toast from 'react-hot-toast';
// 08JUN25: Import uiConfig for consistent design system
import { uiConfig } from '../../styles/uiConfig';

// NOTE: Add Phosphor Icons CSS to your index.html:
// <link rel="stylesheet" type="text/css" href="https://unpkg.com/@phosphor-icons/web@2.0.3/src/regular/style.css" />

// 08JUN25: Updated navigation pattern to match OnboardingRegion consistency
// Added proper Previous Step / Step X of 5 / Continue to Step X navigation
export default function OnboardingClimate() {
  // 08JUN25: Preserved all original state management
  const [formData, setFormData] = useState({
    summer_climate_preference: [], // Array for multi-choice: ['mild', 'warm', 'hot']
    winter_climate_preference: [], // Array for multi-choice: ['cold', 'cool', 'mild']
    humidity_level: [], // Array for multi-choice: ['dry', 'balanced', 'humid']
    sunshine: [], // Array for multi-choice: ['mostly_sunny', 'balanced', 'often_cloudy']
    precipitation: [], // Array for multi-choice: ['mostly_dry', 'balanced', 'often_rainy']
    seasonal_preference: 'Optional' // Optional, all_seasons, summer_focused, winter_focused
  });
  
  // 08JUN25: Preserved all original loading states
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const navigate = useNavigate();

  // 08JUN25: Preserved original data loading useEffect
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        const { user } = await getCurrentUser();
        if (!user) {
          navigate('/welcome');
          return;
        }
        
        const { success, data, error } = await getOnboardingProgress(user.id);
        if (!success) {
          console.error("Error loading existing data:", error);
          setInitialLoading(false);
          return;
        }
        
        // If climate data exists, load it
        if (data && data.climate_preferences) {
          setFormData(prev => ({
            ...prev,
            ...data.climate_preferences,
            // Ensure arrays exist for backward compatibility
            summer_climate_preference: data.climate_preferences.summer_climate_preference || [],
            winter_climate_preference: data.climate_preferences.winter_climate_preference || [],
            humidity_level: data.climate_preferences.humidity_level || [],
            sunshine: data.climate_preferences.sunshine || [],
            precipitation: data.climate_preferences.precipitation || [],
            // Ensure seasonal preference defaults to Optional if not set
            seasonal_preference: data.climate_preferences.seasonal_preference || 'Optional'
          }));
        }
      } catch (err) {
        console.error("Unexpected error loading data:", err);
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadExistingData();
  }, [navigate]);

  // 08JUN25: Preserved original input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 08JUN25: Preserved original climate toggle handler
  const handleClimateToggle = (season, option) => {
    const fieldName = `${season}_climate_preference`;
    setFormData(prev => {
      const currentOptions = prev[fieldName] || [];
      const isSelected = currentOptions.includes(option);
      
      if (isSelected) {
        // Remove option if already selected
        return {
          ...prev,
          [fieldName]: currentOptions.filter(item => item !== option)
        };
      } else {
        // Add option if not selected
        return {
          ...prev,
          [fieldName]: [...currentOptions, option]
        };
      }
    });
  };

  // 08JUN25: Preserved original multi-choice toggle handler
  const handleMultiChoiceToggle = (fieldName, option) => {
    setFormData(prev => {
      const currentOptions = prev[fieldName] || [];
      const isSelected = currentOptions.includes(option);
      
      if (isSelected) {
        // Remove option if already selected
        return {
          ...prev,
          [fieldName]: currentOptions.filter(item => item !== option)
        };
      } else {
        // Add option if not selected
        return {
          ...prev,
          [fieldName]: [...currentOptions, option]
        };
      }
    });
  };

  // 08JUN25: Updated form submission handler to match new navigation pattern
  const handleNext = async () => {
    setLoading(true);
    
    try {
      const { user } = await getCurrentUser();
      if (!user) {
        navigate('/welcome');
        return;
      }
      
      const { success, error } = await saveOnboardingStep(
        user.id,
        formData,
        'climate_preferences'
      );
      
      if (!success) {
        toast.error(`Failed to save: ${error.message}`);
        setLoading(false);
        return;
      }
      
      toast.success('Climate preferences saved!');
      navigate('/onboarding/culture');
    } catch (err) {
      toast.error('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 08JUN25: Added previous step handler to match navigation pattern
  const handlePrevious = () => {
    navigate('/onboarding/region');
  };

  // 08JUN25: Loading screen with uiConfig styling
  if (initialLoading) {
    return (
      <div className={`min-h-screen ${uiConfig.colors.page} p-4 flex items-center justify-center`}>
        <div className={`${uiConfig.animation.pulse} text-scout-accent-600 ${uiConfig.font.weight.semibold}`}>Loading...</div>
      </div>
    );
  }

  // 08JUN25: Updated to flexible icons array system for reusability across components
  // Each option can now have single or multiple icons using the 'icons' array
  const summerOptions = [
    { value: 'mild', label: 'Mild', icons: ['cloud-sun'] },
    { value: 'warm', label: 'Warm', icons: ['sun-dim'] },
    { value: 'hot', label: 'Hot', icons: ['sun'] }
  ];

  const winterOptions = [
    { value: 'cold', label: 'Cold', icons: ['snowflake', 'snowflake'] }, // 2 snowflakes
    { value: 'cool', label: 'Cool', icons: ['snowflake'] }, // 1 snowflake
    { value: 'mild', label: 'Mild', icons: ['sun-dim'] }
  ];

  const humidityOptions = [
    { value: 'dry', label: 'Dry', icons: ['drop-slash'] },
    { value: 'balanced', label: 'Balanced', icons: ['drop-half-bottom'] },
    { value: 'humid', label: 'Humid', icons: ['drop'] }
  ];

  const sunshineOptions = [
    { value: 'mostly_sunny', label: 'Mostly Sunny', icons: ['sun'] },
    { value: 'balanced', label: 'Balanced', icons: ['cloud-sun'] },
    { value: 'often_cloudy', label: 'Often Cloudy', icons: ['cloud'] }
  ];

  const precipitationOptions = [
    { value: 'mostly_dry', label: 'Mostly Dry', icons: ['sun'] },
    { value: 'balanced', label: 'Balanced', icons: ['cloud-sun'] },
    { value: 'often_rainy', label: 'Often Rainy', icons: ['cloud-rain'] }
  ];

  // 08JUN25: Reusable icon rendering function for multiple icons support
  const renderIcons = (iconsArray, size = 'xl') => {
    return (
      <div className="flex items-center justify-center space-x-1">
        {iconsArray.map((iconName, index) => (
          <i 
            key={index} 
            className={`ph ph-${iconName} text-${size === 'xl' ? 'xl' : 'lg'} sm:text-${size === 'xl' ? '2xl' : 'xl'} ${uiConfig.colors.heading}`}
          />
        ))}
      </div>
    );
  };

  return (
    // 08JUN25: Mobile-first page container using uiConfig design tokens - matching OnboardingRegion pattern
    <div className={`${uiConfig.layout.width.containerWide} ${uiConfig.layout.spacing.section} ${uiConfig.colors.page} min-h-screen ${uiConfig.font.family}`}>
      
      {/* 08JUN25: Header section with mobile-responsive design - matching OnboardingRegion */}
      <div className="mb-6 sm:mb-8">
        <h1 className={`${uiConfig.font.size['2xl']} sm:${uiConfig.font.size['3xl']} ${uiConfig.font.weight.bold} ${uiConfig.colors.heading} mb-2`}>
          Climate Preferences
        </h1>
        
        {/* 08JUN25: Progress bar with uiConfig styling - Step 3 of 5 */}
        <div className={`w-full ${uiConfig.progress.track} ${uiConfig.layout.radius.full} h-2 mb-4`}>
          <div className={`${uiConfig.progress.fill} h-2 ${uiConfig.layout.radius.full} ${uiConfig.animation.transition}`} 
               style={{ width: '60%' }}>
          </div>
        </div>
        <p className={`${uiConfig.colors.hint} ${uiConfig.font.size.sm} sm:${uiConfig.font.size.base}`}>
          Step 3 of 5: Climate Preferences
        </p>
      </div>

      {/* 08JUN25: Main content area with form */}
      <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.xl} ${uiConfig.layout.shadow.sm} ${uiConfig.colors.borderLight} border p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8`}>
        
        {/* 08JUN25: Description section */}
        <div className="text-center mb-6 sm:mb-8">
          <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-scout-accent-100 dark:bg-scout-accent-900/20 ${uiConfig.layout.radius.full} mb-3 sm:mb-4`}>
            <svg className={`${uiConfig.icons.size.lg} sm:${uiConfig.icons.size.xl} text-scout-accent-600 dark:text-scout-accent-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>
          <p className={`${uiConfig.colors.body} ${uiConfig.font.size.base} sm:${uiConfig.font.size.lg} px-2`}>
            Select your climate preferences you'd enjoy. Multiple choices are allowed.
          </p>
        </div>

        {/* 08JUN25: Form sections with preserved functionality */}
        <div className="space-y-6 sm:space-y-8">
          
          {/* 08JUN25: Summer Climate section */}
          <div>
            <label className={`block ${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-3`}>
              Summer Climate
            </label>
            {/* 08JUN25: Mobile-first grid - 2 cols on mobile, 3 on larger screens */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {summerOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleClimateToggle('summer', option.value)}
                  className={`flex flex-col items-center justify-center p-3 sm:p-4 ${uiConfig.layout.radius.lg} border ${uiConfig.animation.transition} ${
                    formData.summer_climate_preference?.includes(option.value)
                      ? `border-scout-accent-600 bg-scout-accent-50 dark:bg-scout-accent-900/20 ${uiConfig.layout.shadow.md}`
                      : `${uiConfig.colors.border} ${uiConfig.states.hover}`
                  }`}
                >
                  {renderIcons(option.icons)}
                  <span className={`${uiConfig.font.size.xs} sm:${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} text-center ${uiConfig.colors.heading} mt-1`}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 08JUN25: Winter Climate section */}
          <div>
            <label className={`block ${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-3`}>
              Winter Climate
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {winterOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleClimateToggle('winter', option.value)}
                  className={`flex flex-col items-center justify-center p-3 sm:p-4 ${uiConfig.layout.radius.lg} border ${uiConfig.animation.transition} ${
                    formData.winter_climate_preference?.includes(option.value)
                      ? `border-scout-accent-600 bg-scout-accent-50 dark:bg-scout-accent-900/20 ${uiConfig.layout.shadow.md}`
                      : `${uiConfig.colors.border} ${uiConfig.states.hover}`
                  }`}
                >
                  {renderIcons(option.icons)}
                  <span className={`${uiConfig.font.size.xs} sm:${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} text-center ${uiConfig.colors.heading} mt-1`}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 08JUN25: Humidity section */}
          <div>
            <label className={`block ${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-3`}>
              Humidity
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {humidityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleMultiChoiceToggle('humidity_level', option.value)}
                  className={`flex flex-col items-center justify-center p-3 sm:p-4 ${uiConfig.layout.radius.lg} border ${uiConfig.animation.transition} ${
                    formData.humidity_level?.includes(option.value)
                      ? `border-scout-accent-600 bg-scout-accent-50 dark:bg-scout-accent-900/20 ${uiConfig.layout.shadow.md}`
                      : `${uiConfig.colors.border} ${uiConfig.states.hover}`
                  }`}
                >
                  {renderIcons(option.icons)}
                  <span className={`${uiConfig.font.size.xs} sm:${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} text-center ${uiConfig.colors.heading} mt-1`}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 08JUN25: Sunshine section */}
          <div>
            <label className={`block ${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-3`}>
              Sunshine
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {sunshineOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleMultiChoiceToggle('sunshine', option.value)}
                  className={`flex flex-col items-center justify-center p-3 sm:p-4 ${uiConfig.layout.radius.lg} border ${uiConfig.animation.transition} ${
                    formData.sunshine?.includes(option.value)
                      ? `border-scout-accent-600 bg-scout-accent-50 dark:bg-scout-accent-900/20 ${uiConfig.layout.shadow.md}`
                      : `${uiConfig.colors.border} ${uiConfig.states.hover}`
                  }`}
                >
                  {renderIcons(option.icons)}
                  <span className={`${uiConfig.font.size.xs} sm:${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} text-center ${uiConfig.colors.heading} mt-1`}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 08JUN25: Precipitation section */}
          <div>
            <label className={`block ${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-3`}>
              Precipitation
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {precipitationOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleMultiChoiceToggle('precipitation', option.value)}
                  className={`flex flex-col items-center justify-center p-3 sm:p-4 ${uiConfig.layout.radius.lg} border ${uiConfig.animation.transition} ${
                    formData.precipitation?.includes(option.value)
                      ? `border-scout-accent-600 bg-scout-accent-50 dark:bg-scout-accent-900/20 ${uiConfig.layout.shadow.md}`
                      : `${uiConfig.colors.border} ${uiConfig.states.hover}`
                  }`}
                >
                  {renderIcons(option.icons)}
                  <span className={`${uiConfig.font.size.xs} sm:${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} text-center ${uiConfig.colors.heading} mt-1`}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 08JUN25: Seasonal Preference dropdown with uiConfig styling */}
          <div>
            <label className={`block ${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2`}>
              Seasonal Preference
            </label>
            <select
              name="seasonal_preference"
              value={formData.seasonal_preference}
              onChange={handleInputChange}
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 ${uiConfig.font.size.sm} sm:${uiConfig.font.size.base} border ${uiConfig.colors.border} ${uiConfig.layout.radius.lg} ${uiConfig.colors.input} ${uiConfig.colors.heading} ${uiConfig.colors.focusRing} focus:border-transparent ${uiConfig.animation.transition}`}
            >
              <option value="Optional">Optional</option>
              <option value="all_seasons">I enjoy all seasons equally</option>
              <option value="summer_focused">I prefer warm seasons (summer)</option>
              <option value="winter_focused">I prefer cool seasons (winter)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 08JUN25: Navigation section matching OnboardingRegion pattern */}
      <div className={`flex flex-col sm:flex-row sm:justify-between sm:items-center pt-6 border-t ${uiConfig.colors.borderLight} space-y-4 sm:space-y-0`}>
        <button 
          onClick={handlePrevious}
          className={`w-full sm:w-auto px-4 sm:px-6 py-3 border ${uiConfig.colors.border} ${uiConfig.layout.radius.lg} ${uiConfig.colors.heading} ${uiConfig.colors.input} cursor-pointer ${uiConfig.states.hover} ${uiConfig.animation.transition} order-2 sm:order-1`}
        >
          Previous Step
        </button>
        <div className={`${uiConfig.font.size.sm} ${uiConfig.colors.hint} text-center order-1 sm:order-2`}>
          Step 3 of 5
        </div>
        <button 
          onClick={handleNext}
          disabled={loading}
          className={`w-full sm:w-auto px-4 sm:px-6 py-3 ${uiConfig.colors.btnPrimary} ${uiConfig.layout.radius.lg} border-none cursor-pointer ${uiConfig.animation.transition} ${uiConfig.colors.focusRing} focus:ring-offset-2 order-3 ${loading ? uiConfig.states.disabled : ''}`}
        >
          {loading ? 'Saving...' : 'Continue to Step 4'}
        </button>
      </div>
    </div>
  );
}