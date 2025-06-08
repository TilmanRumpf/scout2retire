import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../utils/authUtils';
import { saveOnboardingStep, getOnboardingProgress } from '../../utils/onboardingUtils';
import toast from 'react-hot-toast';
// 08JUN25: Import uiConfig for consistent design system
import { uiConfig } from '../../styles/uiConfig';

// NOTE: Add Phosphor Icons CSS to your index.html:
// <link rel="stylesheet" type="text/css" href="https://unpkg.com/@phosphor-icons/web@2.0.3/src/regular/style.css" />

// 08JUN25: Refactored to use uiConfig design tokens and mobile-first approach
// Maintained all existing functionality while improving design consistency and mobile responsiveness
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

  // 08JUN25: Preserved original form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
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
    // 08JUN25: Mobile-first page container using uiConfig design tokens
    <div className={`min-h-screen ${uiConfig.colors.page} p-4`}>
      <div className={`${uiConfig.layout.width.containerNarrow} px-4 sm:px-0`}>
        
        {/* 08JUN25: Header section with mobile-responsive design */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            {/* 08JUN25: Back button with uiConfig styling */}
            <button
              onClick={() => navigate('/onboarding/region')}
              className={`${uiConfig.colors.hint} hover:${uiConfig.colors.heading} ${uiConfig.animation.transition}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`${uiConfig.icons.size.md}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            {/* 08JUN25: Progress indicator with uiConfig styling */}
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5, 6].map((step) => (
                <div
                  key={step}
                  className={`w-6 sm:w-8 h-1 ${uiConfig.layout.radius.full} ${
                    step === 3
                      ? 'bg-scout-accent-600 dark:bg-scout-accent-400'
                      : step < 3
                        ? `${uiConfig.colors.hint.replace('text-', 'bg-')}`
                        : `${uiConfig.colors.borderLight.replace('border-', 'bg-')}`
                  }`}
                ></div>
              ))}
            </div>
            <div className="w-5"></div> {/* 08JUN25: Spacer to balance the back button */}
          </div>
          
          {/* 08JUN25: Mobile-responsive header text */}
          <h1 className={`${uiConfig.font.size.xl} sm:${uiConfig.font.size['2xl']} ${uiConfig.font.weight.bold} ${uiConfig.colors.heading} mb-2`}>
            Climate Preferences
          </h1>
          <p className={`${uiConfig.colors.body} ${uiConfig.font.size.sm} sm:${uiConfig.font.size.base} mb-6`}>
            Select your climates preference you'd enjoy. Multiple choices are allowed.
          </p>
        </div>

        {/* 08JUN25: Form with uiConfig styling and mobile-first design */}
        <form onSubmit={handleSubmit} className={`space-y-6 ${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} p-4 sm:p-6`}>
          
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

          {/* 08JUN25: Humidity section - renamed from "Humidity Level" to "Humidity" */}
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

          {/* 08JUN25: Submit button with conditional disabled styling to prevent red cursor icon */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full ${uiConfig.colors.btnPrimary} ${uiConfig.font.weight.medium} py-3 px-4 ${uiConfig.layout.radius.lg} ${uiConfig.animation.transition} ${loading ? uiConfig.states.disabled : ''} ${uiConfig.colors.focusRing} focus:ring-offset-2`}
            >
              {loading ? 'Saving...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}