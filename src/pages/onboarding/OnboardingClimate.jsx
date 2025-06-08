import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../utils/authUtils';
import { saveOnboardingStep, getOnboardingProgress } from '../../utils/onboardingUtils';
import toast from 'react-hot-toast';

// NOTE: Add Phosphor Icons CSS to your index.html:
// <link rel="stylesheet" type="text/css" href="https://unpkg.com/@phosphor-icons/web@2.0.3/src/regular/style.css" />

export default function OnboardingClimate() {
  const [formData, setFormData] = useState({
    summer_climate_preference: [], // Array for multi-choice: ['mild', 'warm', 'hot']
    winter_climate_preference: [], // Array for multi-choice: ['cold', 'cool', 'mild']
    humidity_level: [], // Array for multi-choice: ['dry', 'balanced', 'humid']
    sunshine: [], // Array for multi-choice: ['mostly_sunny', 'balanced', 'often_cloudy']
    precipitation: [], // Array for multi-choice: ['mostly_dry', 'balanced', 'often_rainy']
    seasonal_preference: 'all_seasons' // all_seasons, summer_focused, winter_focused
  });
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const navigate = useNavigate();

  // Load existing data if available
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
            precipitation: data.climate_preferences.precipitation || []
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center">
        <div className="animate-pulse text-green-600 font-semibold">Loading...</div>
      </div>
    );
  }

  const summerOptions = [
    { value: 'mild', label: 'Mild', icon: 'sun' },
    { value: 'warm', label: 'Warm', icon: 'sun-dim' },
    { value: 'hot', label: 'Hot', icon: 'fire' }
  ];

  const winterOptions = [
    { value: 'cold', label: 'Cold', icon: 'snowflake' },
    { value: 'cool', label: 'Cool', icon: 'cloud-snow' },
    { value: 'mild', label: 'Mild', icon: 'cloud' }
  ];

  const humidityOptions = [
    { value: 'dry', label: 'Dry', icon: 'drop-half' },
    { value: 'balanced', label: 'Balanced', icon: 'scales' },
    { value: 'humid', label: 'Humid', icon: 'drop' }
  ];

  const sunshineOptions = [
    { value: 'mostly_sunny', label: 'Mostly Sunny', icon: 'sun' },
    { value: 'balanced', label: 'Balanced', icon: 'cloud-sun' },
    { value: 'often_cloudy', label: 'Often Cloudy', icon: 'cloud' }
  ];

  const precipitationOptions = [
    { value: 'mostly_dry', label: 'Mostly Dry', icon: 'plant' },
    { value: 'balanced', label: 'Balanced', icon: 'cloud-rain' },
    { value: 'often_rainy', label: 'Often Rainy', icon: 'cloud-lightning-rain' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => navigate('/onboarding/region')}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5, 6].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-1 rounded-full ${
                    step === 3
                      ? 'bg-green-600 dark:bg-green-400'
                      : step < 3
                        ? 'bg-gray-400 dark:bg-gray-600'
                        : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                ></div>
              ))}
            </div>
            <div className="w-5"></div> {/* Spacer to balance the back button */}
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Climate Preferences</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Select your climates preference you'd enjoy. Multiple choices are allowed.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          {/* Summer Climate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Summer Climate
            </label>
            <div className="grid grid-cols-3 gap-2">
              {summerOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleClimateToggle('summer', option.value)}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                    formData.summer_climate_preference?.includes(option.value)
                      ? 'border-green-600 bg-green-50 dark:bg-green-900/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <i className={`ph ph-${option.icon} text-2xl mb-1`}></i>
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Winter Climate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Winter Climate
            </label>
            <div className="grid grid-cols-3 gap-2">
              {winterOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleClimateToggle('winter', option.value)}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                    formData.winter_climate_preference?.includes(option.value)
                      ? 'border-green-600 bg-green-50 dark:bg-green-900/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <i className={`ph ph-${option.icon} text-2xl mb-1`}></i>
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Humidity Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Humidity Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {humidityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleMultiChoiceToggle('humidity_level', option.value)}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                    formData.humidity_level?.includes(option.value)
                      ? 'border-green-600 bg-green-50 dark:bg-green-900/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <i className={`ph ph-${option.icon} text-2xl mb-1`}></i>
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sunshine */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sunshine
            </label>
            <div className="grid grid-cols-3 gap-2">
              {sunshineOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleMultiChoiceToggle('sunshine', option.value)}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                    formData.sunshine?.includes(option.value)
                      ? 'border-green-600 bg-green-50 dark:bg-green-900/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <i className={`ph ph-${option.icon} text-2xl mb-1`}></i>
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Precipitation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Precipitation
            </label>
            <div className="grid grid-cols-3 gap-2">
              {precipitationOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleMultiChoiceToggle('precipitation', option.value)}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                    formData.precipitation?.includes(option.value)
                      ? 'border-green-600 bg-green-50 dark:bg-green-900/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <i className={`ph ph-${option.icon} text-2xl mb-1`}></i>
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Seasonal Preference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Seasonal Preference
            </label>
            <select
              name="seasonal_preference"
              value={formData.seasonal_preference}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            >
              <option value="all_seasons">I enjoy all seasons equally</option>
              <option value="summer_focused">I prefer warm seasons (summer)</option>
              <option value="winter_focused">I prefer cool seasons (winter)</option>
            </select>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}