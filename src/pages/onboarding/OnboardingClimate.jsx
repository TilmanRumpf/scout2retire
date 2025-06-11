// src/pages/onboarding/OnboardingClimate.jsx
// Updated 10JUN25: Fixed scout-accent colors, improved mobile-first design, added professional enhancements
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CloudSun, Sun, Snowflake, Droplets, DropletOff, Cloud, CloudRain } from 'lucide-react';
import { getCurrentUser } from '../../utils/authUtils';
import { saveOnboardingStep, getOnboardingProgress } from '../../utils/onboardingUtils';
import { uiConfig } from '../../styles/uiConfig';
import OnboardingStepNavigation from '../../components/OnboardingStepNavigation';
import toast from 'react-hot-toast';

// Updated 10JUN25: Enhanced with professional features and scout-accent theme
export default function OnboardingClimate() {
  // Preserved all original state management with summer/winter logic
  const [formData, setFormData] = useState({
    summer_climate_preference: [], // Array for multi-choice: ['mild', 'warm', 'hot']
    winter_climate_preference: [], // Array for multi-choice: ['cold', 'cool', 'mild']
    humidity_level: [], // Array for multi-choice: ['dry', 'balanced', 'humid']
    sunshine: [], // Array for multi-choice: ['mostly_sunny', 'balanced', 'often_cloudy']
    precipitation: [], // Array for multi-choice: ['mostly_dry', 'balanced', 'often_rainy']
    seasonal_preference: 'Optional' // Optional, all_seasons, summer_focused, winter_focused
  });
  
  // Preserved all original loading states
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [progress, setProgress] = useState({
    completedSteps: {},
    completedCount: 0,
    totalSteps: 7,
    percentage: 0
  });
  
  // Added 10JUN25: Touch feedback state for better mobile UX
  const [touchedButton, setTouchedButton] = useState(null);
  
  const navigate = useNavigate();

  // Preserved original data loading useEffect with progress loading
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        const { user } = await getCurrentUser();
        if (!user) {
          navigate('/welcome');
          return;
        }
        
        const { success, data, progress: userProgress, error } = await getOnboardingProgress(user.id);
        if (!success) {
          console.error("Error loading existing data:", error);
          setInitialLoading(false);
          return;
        }
        
        // Set progress data
        if (userProgress) {
          setProgress(userProgress);
        }
        
        // If climate data exists, load it - Preserved original logic
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

  // Preserved original input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Enhanced 10JUN25: Added haptic feedback simulation for mobile
  const handleClimateToggle = (season, option) => {
    // Haptic feedback for mobile
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
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

  // Enhanced 10JUN25: Added haptic feedback for better UX
  const handleMultiChoiceToggle = (fieldName, option) => {
    // Haptic feedback for mobile
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
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

  // Enhanced 10JUN25: Added validation before submission
  const validateForm = () => {
    // Check if at least one preference is selected in each category
    const hasNoSelections = 
      formData.summer_climate_preference.length === 0 &&
      formData.winter_climate_preference.length === 0 &&
      formData.humidity_level.length === 0 &&
      formData.sunshine.length === 0 &&
      formData.precipitation.length === 0;
    
    if (hasNoSelections) {
      toast.error('Please select at least one preference to continue');
      return false;
    }
    
    return true;
  };

  // Enhanced form submission handler with validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
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

  // Navigation handlers
  const handleBack = () => {
    navigate('/onboarding/region');
  };

  // Updated 10JUN25: Professional loading screen with scout-accent
  if (initialLoading) {
    return (
      <div className={`min-h-screen ${uiConfig.colors.page} p-4 flex items-center justify-center`}>
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-scout-accent-300"></div>
          <p className="text-scout-accent-600 font-medium">Loading your preferences...</p>
        </div>
      </div>
    );
  }

  // Updated 10JUN25: Refined options with better labeling
  const summerOptions = [
    { value: 'mild', label: 'Mild', icons: [CloudSun], description: '18-24°C' },
    { value: 'warm', label: 'Warm', icons: [Sun], description: '24-30°C' },
    { value: 'hot', label: 'Hot', icons: [Sun, Sun], description: '30°C+' }
  ];

  const winterOptions = [
    { value: 'cold', label: 'Cold', icons: [Snowflake, Snowflake], description: 'Below 0°C' },
    { value: 'cool', label: 'Cool', icons: [Snowflake], description: '0-10°C' },
    { value: 'mild', label: 'Mild', icons: [CloudSun], description: '10°C+' }
  ];

  const humidityOptions = [
    { value: 'dry', label: 'Dry', icons: [DropletOff], description: '<40%' },
    { value: 'balanced', label: 'Balanced', icons: [Droplets], description: '40-60%' },
    { value: 'humid', label: 'Humid', icons: [Droplets, Droplets], description: '>60%' }
  ];

  const sunshineOptions = [
    { value: 'mostly_sunny', label: 'Often Sunny', icons: [Sun], description: '250+ days/year' },
    { value: 'balanced', label: 'Balanced', icons: [CloudSun], description: '150-250 days/year' },
    { value: 'often_cloudy', label: 'Less Sunny', icons: [Cloud], description: '<150 days/year' }
  ];

  const precipitationOptions = [
    { value: 'mostly_dry', label: 'Mostly Dry', icons: [Sun], description: '<500mm/year' },
    { value: 'balanced', label: 'Balanced', icons: [CloudSun], description: '500-1000mm/year' },
    { value: 'often_rainy', label: 'Often Rainy', icons: [CloudRain], description: '>1000mm/year' }
  ];

  // Enhanced 10JUN25: Professional icon rendering with animations
  const renderIcons = (iconsArray, size = 20, isSelected = false) => {
    return (
      <div className="flex items-center justify-center space-x-1">
        {iconsArray.map((IconComponent, index) => (
          <IconComponent 
            key={index} 
            size={size} 
            className={`transition-all duration-300 ${
              isSelected 
                ? 'text-scout-accent-700 dark:text-scout-accent-300' 
                : 'text-gray-600 dark:text-gray-400'
            }`}
          />
        ))}
      </div>
    );
  };

  // Enhanced 10JUN25: Professional option button component
  const OptionButton = ({ option, isSelected, onClick, sectionName, optionValue }) => {
    const buttonId = `${sectionName}-${optionValue}`;
    const isPressed = touchedButton === buttonId;
    
    return (
      <button
        type="button"
        onClick={onClick}
        onTouchStart={() => setTouchedButton(buttonId)}
        onTouchEnd={() => setTouchedButton(null)}
        className={`
          relative flex flex-col items-center justify-center p-4 rounded-lg border-2 
          transition-all duration-200 transform
          ${isSelected
            ? 'border-scout-accent-300 bg-scout-accent-50 dark:bg-scout-accent-900/20 shadow-md scale-[1.02]'
            : 'border-gray-200 dark:border-gray-700 hover:border-scout-accent-200 hover:bg-gray-50 dark:hover:bg-gray-800'
          }
          ${isPressed ? 'scale-95' : ''}
          focus:outline-none focus:ring-2 focus:ring-scout-accent-400 focus:ring-offset-2
        `}
        aria-label={`${option.label} - ${option.description || ''}`}
        aria-pressed={isSelected}
      >
        {renderIcons(option.icons, 24, isSelected)}
        <span className={`text-sm font-medium text-center mt-2 ${
          isSelected 
            ? 'text-scout-accent-700 dark:text-scout-accent-300' 
            : 'text-gray-800 dark:text-gray-200'
        }`}>
          {option.label}
        </span>
        {option.description && (
          <span className={`text-xs mt-1 ${
            isSelected 
              ? 'text-scout-accent-600 dark:text-scout-accent-400' 
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            {option.description}
          </span>
        )}
        {isSelected && (
          <div className="absolute top-2 right-2">
            <div className="w-2 h-2 bg-scout-accent-300 rounded-full animate-pulse"></div>
          </div>
        )}
      </button>
    );
  };

  return (
    <div className={`min-h-screen ${uiConfig.colors.page} p-4`}>
      <div className={uiConfig.layout.width.containerNarrow}>
        
        {/* Step Navigation */}
        <OnboardingStepNavigation 
          currentStep="climate_preferences"
          completedSteps={progress.completedSteps}
          className="mb-8"
        />

        {/* Main Form - Enhanced 10JUN25 with better spacing and scout-accent theme */}
        <form onSubmit={handleSubmit} className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} ${uiConfig.layout.spacing.card}`}>
          
          {/* Header - Added 10JUN25 */}
          <div className="mb-8">
            <h1 className={`${uiConfig.font.size['2xl']} ${uiConfig.font.weight.bold} ${uiConfig.colors.heading} mb-2`}>
              Climate Preferences
            </h1>
            <p className={`${uiConfig.font.size.base} ${uiConfig.colors.body}`}>
              Select your ideal climate conditions. You can choose multiple options for each category.
            </p>
          </div>

          {/* Summer Climate - Enhanced with descriptions */}
          <div className={uiConfig.layout.spacing.field}>
            <label className={`${uiConfig.components.label} flex items-center`}>
              <Sun size={20} className="mr-2 text-scout-accent-600" />
              Summer Climate
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {summerOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  option={option}
                  isSelected={formData.summer_climate_preference?.includes(option.value)}
                  onClick={() => handleClimateToggle('summer', option.value)}
                  sectionName="summer"
                  optionValue={option.value}
                />
              ))}
            </div>
          </div>

          {/* Winter Climate - Enhanced with descriptions */}
          <div className={uiConfig.layout.spacing.field}>
            <label className={`${uiConfig.components.label} flex items-center`}>
              <Snowflake size={20} className="mr-2 text-scout-accent-600" />
              Winter Climate
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {winterOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  option={option}
                  isSelected={formData.winter_climate_preference?.includes(option.value)}
                  onClick={() => handleClimateToggle('winter', option.value)}
                  sectionName="winter"
                  optionValue={option.value}
                />
              ))}
            </div>
          </div>

          {/* Humidity - Enhanced with descriptions */}
          <div className={uiConfig.layout.spacing.field}>
            <label className={`${uiConfig.components.label} flex items-center`}>
              <Droplets size={20} className="mr-2 text-scout-accent-600" />
              Humidity
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {humidityOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  option={option}
                  isSelected={formData.humidity_level?.includes(option.value)}
                  onClick={() => handleMultiChoiceToggle('humidity_level', option.value)}
                  sectionName="humidity"
                  optionValue={option.value}
                />
              ))}
            </div>
          </div>

          {/* Sunshine - Enhanced with descriptions */}
          <div className={uiConfig.layout.spacing.field}>
            <label className={`${uiConfig.components.label} flex items-center`}>
              <Sun size={20} className="mr-2 text-scout-accent-600" />
              Sunshine
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {sunshineOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  option={option}
                  isSelected={formData.sunshine?.includes(option.value)}
                  onClick={() => handleMultiChoiceToggle('sunshine', option.value)}
                  sectionName="sunshine"
                  optionValue={option.value}
                />
              ))}
            </div>
          </div>

          {/* Precipitation - Enhanced with descriptions */}
          <div className={uiConfig.layout.spacing.field}>
            <label className={`${uiConfig.components.label} flex items-center`}>
              <CloudRain size={20} className="mr-2 text-scout-accent-600" />
              Precipitation
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {precipitationOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  option={option}
                  isSelected={formData.precipitation?.includes(option.value)}
                  onClick={() => handleMultiChoiceToggle('precipitation', option.value)}
                  sectionName="precipitation"
                  optionValue={option.value}
                />
              ))}
            </div>
          </div>

          {/* Seasonal Preference - Enhanced with better styling */}
          <div className={uiConfig.layout.spacing.field}>
            <label className={`${uiConfig.components.label}`}>
              Seasonal Preference
            </label>
            <select
              name="seasonal_preference"
              value={formData.seasonal_preference}
              onChange={handleInputChange}
              className={uiConfig.components.select}
            >
              <option value="Optional">No specific preference</option>
              <option value="all_seasons">I enjoy all seasons equally</option>
              <option value="summer_focused">I prefer warm seasons (summer)</option>
              <option value="winter_focused">I prefer cool seasons (winter)</option>
            </select>
            <p className={uiConfig.components.helpText}>
              This helps us prioritize locations based on your seasonal preferences
            </p>
          </div>

          {/* Summary Section - Added 10JUN25: Shows selected preferences */}
          {(formData.summer_climate_preference.length > 0 || 
            formData.winter_climate_preference.length > 0 ||
            formData.humidity_level.length > 0 ||
            formData.sunshine.length > 0 ||
            formData.precipitation.length > 0) && (
            <div className="mt-6 p-4 bg-scout-accent-50 dark:bg-scout-accent-900/20 rounded-lg">
              <h3 className="text-sm font-medium text-scout-accent-700 dark:text-scout-accent-300 mb-2">
                Your Climate Profile:
              </h3>
              <div className="text-xs text-scout-accent-600 dark:text-scout-accent-400 space-y-1">
                {formData.summer_climate_preference.length > 0 && (
                  <p>• Summer: {formData.summer_climate_preference.join(', ')}</p>
                )}
                {formData.winter_climate_preference.length > 0 && (
                  <p>• Winter: {formData.winter_climate_preference.join(', ')}</p>
                )}
                {formData.humidity_level.length > 0 && (
                  <p>• Humidity: {formData.humidity_level.join(', ')}</p>
                )}
                {formData.sunshine.length > 0 && (
                  <p>• Sunshine: {formData.sunshine.join(', ')}</p>
                )}
                {formData.precipitation.length > 0 && (
                  <p>• Precipitation: {formData.precipitation.join(', ')}</p>
                )}
              </div>
            </div>
          )}

          {/* Bottom Navigation - Enhanced 10JUN25 with professional styling */}
          <div className={uiConfig.bottomNavigation.styles.container}>
            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
              className={uiConfig.bottomNavigation.styles.backButton}
            >
              <ChevronLeft size={16} className="mr-2" />
              Back
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className={uiConfig.bottomNavigation.styles.nextButton}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight size={16} className="ml-2" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Progress Indicator - Added 10JUN25 */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Step 3 of 7 • {Math.round((3/7) * 100)}% complete
          </p>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-scout-accent-300 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.round((3/7) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}