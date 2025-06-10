// src/pages/onboarding/OnboardingClimate.jsx
// Updated 09JUN25: Added 7-step navigation and Lucide icons while preserving ALL existing logic
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CloudSun, Sun, Snowflake, Droplets, DropletOff, Cloud, CloudRain } from 'lucide-react';
import { getCurrentUser } from '../../utils/authUtils';
import { saveOnboardingStep, getOnboardingProgress } from '../../utils/onboardingUtils';
import { uiConfig } from '../../styles/uiConfig';
import OnboardingStepNavigation from '../../components/OnboardingStepNavigation';
import toast from 'react-hot-toast';

// Updated 09JUN25: Preserved all original functionality while improving design consistency and mobile responsiveness
export default function OnboardingClimate() {
  // Updated 09JUN25: Preserved all original state management with summer/winter logic
  const [formData, setFormData] = useState({
    summer_climate_preference: [], // Array for multi-choice: ['mild', 'warm', 'hot']
    winter_climate_preference: [], // Array for multi-choice: ['cold', 'cool', 'mild']
    humidity_level: [], // Array for multi-choice: ['dry', 'balanced', 'humid']
    sunshine: [], // Array for multi-choice: ['mostly_sunny', 'balanced', 'often_cloudy']
    precipitation: [], // Array for multi-choice: ['mostly_dry', 'balanced', 'often_rainy']
    seasonal_preference: 'Optional' // Optional, all_seasons, summer_focused, winter_focused
  });
  
  // Updated 09JUN25: Preserved all original loading states
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [progress, setProgress] = useState({
    completedSteps: {},
    completedCount: 0,
    totalSteps: 7, // Updated 09JUN25: Changed from 6 to 7 steps
    percentage: 0
  });
  const navigate = useNavigate();

  // Updated 09JUN25: Preserved original data loading useEffect with progress loading
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
        
        // Set progress data - Added 09JUN25
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

  // Updated 09JUN25: Preserved original input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Updated 09JUN25: Preserved original climate toggle handler
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

  // Updated 09JUN25: Preserved original multi-choice toggle handler
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

  // Updated 09JUN25: Preserved original form submission handler
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

  // Navigation handlers - Added 09JUN25
  const handleBack = () => {
    navigate('/onboarding/region');
  };

  // Updated 09JUN25: Loading screen with emerald styling
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center">
        <div className="animate-pulse text-emerald-600 font-semibold">Loading...</div>
      </div>
    );
  }

  // Updated 09JUN25: Converted to Lucide React icons with preserved multi-icon support
  const summerOptions = [
    { value: 'mild', label: 'Mild', icons: [CloudSun] },
    { value: 'warm', label: 'Warm', icons: [Sun] },
    { value: 'hot', label: 'Hot', icons: [Sun, Sun] } // Multiple suns for hot
  ];

  const winterOptions = [
    { value: 'cold', label: 'Cold', icons: [Snowflake, Snowflake] }, // 2 snowflakes
    { value: 'cool', label: 'Cool', icons: [Snowflake] }, // 1 snowflake
    { value: 'mild', label: 'Mild', icons: [CloudSun] }
  ];

  const humidityOptions = [
    { value: 'dry', label: 'Dry', icons: [DropletOff] },
    { value: 'balanced', label: 'Balanced', icons: [Droplets] },
    { value: 'humid', label: 'Humid', icons: [Droplets, Droplets] }
  ];

  const sunshineOptions = [
    { value: 'mostly_sunny', label: 'Often Sunny', icons: [Sun] },
    { value: 'balanced', label: 'Balanced', icons: [CloudSun] },
    { value: 'often_cloudy', label: 'Less Sunny', icons: [Cloud] }
  ];

  const precipitationOptions = [
    { value: 'mostly_dry', label: 'Mostly Dry', icons: [Sun] },
    { value: 'balanced', label: 'Balanced', icons: [CloudSun] },
    { value: 'often_rainy', label: 'Often Rainy', icons: [CloudRain] }
  ];

  // Updated 09JUN25: Reusable Lucide icon rendering function for multiple icons support
  const renderIcons = (iconsArray, size = 20) => {
    return (
      <div className="flex items-center justify-center space-x-1">
        {iconsArray.map((IconComponent, index) => (
          <IconComponent 
            key={index} 
            size={size} 
            className="text-gray-600 dark:text-gray-400"
          />
        ))}
      </div>
    );
  };

  return (
    // Updated 09JUN25: Mobile-first page container with emerald theme
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md mx-auto">
        
        {/* Step Navigation - Added 09JUN25: New 7-step navigation component */}
        <OnboardingStepNavigation 
          currentStep="climate_preferences"
          completedSteps={progress.completedSteps}
          className="mb-8"
        />

        {/* Header section removed - 09JUN25: Avoiding duplicate headings */}

        {/* Updated 09JUN25: Form with emerald theme and preserved functionality */}
        <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          
          {/* Updated 09JUN25: Summer Climate section with Lucide icons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Summer Climate
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {summerOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleClimateToggle('summer', option.value)}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 ${
                    formData.summer_climate_preference?.includes(option.value)
                      ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10'
                  }`}
                >
                  {renderIcons(option.icons, 24)}
                  <span className="text-sm font-medium text-center text-gray-800 dark:text-gray-200 mt-2">
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Updated 09JUN25: Winter Climate section with Lucide icons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Winter Climate
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {winterOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleClimateToggle('winter', option.value)}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 ${
                    formData.winter_climate_preference?.includes(option.value)
                      ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10'
                  }`}
                >
                  {renderIcons(option.icons, 24)}
                  <span className="text-sm font-medium text-center text-gray-800 dark:text-gray-200 mt-2">
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Updated 09JUN25: Humidity section with Lucide icons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Humidity
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {humidityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleMultiChoiceToggle('humidity_level', option.value)}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 ${
                    formData.humidity_level?.includes(option.value)
                      ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10'
                  }`}
                >
                  {renderIcons(option.icons, 24)}
                  <span className="text-sm font-medium text-center text-gray-800 dark:text-gray-200 mt-2">
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Updated 09JUN25: Sunshine section with Lucide icons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Sunshine
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {sunshineOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleMultiChoiceToggle('sunshine', option.value)}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 ${
                    formData.sunshine?.includes(option.value)
                      ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10'
                  }`}
                >
                  {renderIcons(option.icons, 24)}
                  <span className="text-sm font-medium text-center text-gray-800 dark:text-gray-200 mt-2">
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Updated 09JUN25: Precipitation section with Lucide icons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Precipitation
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {precipitationOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleMultiChoiceToggle('precipitation', option.value)}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 ${
                    formData.precipitation?.includes(option.value)
                      ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10'
                  }`}
                >
                  {renderIcons(option.icons, 24)}
                  <span className="text-sm font-medium text-center text-gray-800 dark:text-gray-200 mt-2">
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Updated 09JUN25: Seasonal Preference dropdown with emerald styling */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Seasonal Preference
            </label>
            <select
              name="seasonal_preference"
              value={formData.seasonal_preference}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200"
            >
              <option value="Optional">Optional</option>
              <option value="all_seasons">I enjoy all seasons equally</option>
              <option value="summer_focused">I prefer warm seasons (summer)</option>
              <option value="winter_focused">I prefer cool seasons (winter)</option>
            </select>
          </div>

          {/* Bottom Navigation - Added 09JUN25: Professional navigation buttons */}
          <div className="flex justify-between items-center pt-8 mt-8 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 transition-all duration-200"
            >
              <ChevronLeft size={16} className="mr-2" />
              Back
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-emerald-400 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? 'Saving...' : 'Continue'}
              {!loading && <ChevronRight size={16} className="ml-2" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}