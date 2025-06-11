import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Snowflake, Droplets, Cloud, CloudRain } from 'lucide-react';
import { getCurrentUser } from '../../utils/authUtils';
import { saveOnboardingStep, getOnboardingProgress } from '../../utils/onboardingUtils';
import OnboardingStepNavigation from '../../components/OnboardingStepNavigation';
import toast from 'react-hot-toast';

// Option Button Component
const OptionButton = ({ label, description, isSelected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-3 rounded-md border-2 transition-all text-center ${
      isSelected
        ? 'border-scout-accent-300 bg-scout-accent-50 dark:bg-scout-accent-900/20'
        : 'border-gray-300 dark:border-gray-600 hover:border-scout-accent-200 dark:hover:border-scout-accent-400'
    }`}
  >
    <div className={`text-sm font-medium ${isSelected ? 'text-scout-accent-700 dark:text-scout-accent-300' : ''}`}>{label}</div>
    {description && <div className={`text-xs mt-1 ${isSelected ? 'text-scout-accent-600 dark:text-scout-accent-400' : 'text-gray-500 dark:text-gray-400'}`}>{description}</div>}
  </button>
);

export default function OnboardingClimate() {
  const [formData, setFormData] = useState({
    summer_climate_preference: [],
    winter_climate_preference: [],
    humidity_level: [],
    sunshine: [],
    precipitation: [],
    seasonal_preference: 'Optional'
  });
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [progress, setProgress] = useState({ completedSteps: {} });
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
        
        const { success, data, progress: userProgress, error } = await getOnboardingProgress(user.id);
        if (!success) {
          console.error("Error loading existing data:", error);
          setInitialLoading(false);
          return;
        }
        
        setProgress(userProgress);
        
        // If climate data exists, load it
        if (data && data.climate_preferences) {
          setFormData(prev => ({
            ...prev,
            ...data.climate_preferences,
            summer_climate_preference: data.climate_preferences.summer_climate_preference || [],
            winter_climate_preference: data.climate_preferences.winter_climate_preference || [],
            humidity_level: data.climate_preferences.humidity_level || [],
            sunshine: data.climate_preferences.sunshine || [],
            precipitation: data.climate_preferences.precipitation || [],
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
        return {
          ...prev,
          [fieldName]: currentOptions.filter(item => item !== option)
        };
      } else {
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
        return {
          ...prev,
          [fieldName]: currentOptions.filter(item => item !== option)
        };
      } else {
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
        <div className="animate-pulse text-scout-accent-600 font-semibold">Loading...</div>
      </div>
    );
  }

  const summerOptions = [
    { value: 'mild', label: 'Mild', description: '18-24°C' },
    { value: 'warm', label: 'Warm', description: '24-30°C' },
    { value: 'hot', label: 'Hot', description: '30°C+' }
  ];

  const winterOptions = [
    { value: 'cold', label: 'Cold', description: 'Below 0°C' },
    { value: 'cool', label: 'Cool', description: '0-10°C' },
    { value: 'mild', label: 'Mild', description: '10°C+' }
  ];

  const humidityOptions = [
    { value: 'dry', label: 'Dry', description: '<40%' },
    { value: 'balanced', label: 'Balanced', description: '40-60%' },
    { value: 'humid', label: 'Humid', description: '>60%' }
  ];

  const sunshineOptions = [
    { value: 'mostly_sunny', label: 'Often Sunny', description: '250+ days' },
    { value: 'balanced', label: 'Balanced', description: '150-250 days' },
    { value: 'often_cloudy', label: 'Less Sunny', description: '<150 days' }
  ];

  const precipitationOptions = [
    { value: 'mostly_dry', label: 'Mostly Dry', description: '<500mm/yr' },
    { value: 'balanced', label: 'Balanced', description: '500-1000mm' },
    { value: 'often_rainy', label: 'Often Rainy', description: '>1000mm/yr' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md mx-auto">
        <OnboardingStepNavigation 
          currentStep="climate_preferences" 
          completedSteps={progress.completedSteps} 
          className="mb-4" 
        />
        
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4">
          {/* Header - mb-4 */}
          <div className="mb-4">
            <h1 className="text-lg font-bold text-gray-800 dark:text-white">Climate Preferences</h1>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Select your ideal climate conditions - choose multiple options
            </p>
          </div>

          {/* Summer Climate - mb-4 */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <Sun size={18} className="mr-1.5" />
              Summer Climate
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {summerOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  description={option.description}
                  isSelected={formData.summer_climate_preference?.includes(option.value)}
                  onClick={() => handleClimateToggle('summer', option.value)}
                />
              ))}
            </div>
          </div>

          {/* Winter Climate - mb-4 */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <Snowflake size={18} className="mr-1.5" />
              Winter Climate
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {winterOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  description={option.description}
                  isSelected={formData.winter_climate_preference?.includes(option.value)}
                  onClick={() => handleClimateToggle('winter', option.value)}
                />
              ))}
            </div>
          </div>

          {/* Humidity - mb-4 */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <Droplets size={18} className="mr-1.5" />
              Humidity
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {humidityOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  description={option.description}
                  isSelected={formData.humidity_level?.includes(option.value)}
                  onClick={() => handleMultiChoiceToggle('humidity_level', option.value)}
                />
              ))}
            </div>
          </div>

          {/* Sunshine - mb-4 */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <Sun size={18} className="mr-1.5" />
              Sunshine
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {sunshineOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  description={option.description}
                  isSelected={formData.sunshine?.includes(option.value)}
                  onClick={() => handleMultiChoiceToggle('sunshine', option.value)}
                />
              ))}
            </div>
          </div>

          {/* Precipitation - mb-4 */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <CloudRain size={18} className="mr-1.5" />
              Precipitation
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {precipitationOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  description={option.description}
                  isSelected={formData.precipitation?.includes(option.value)}
                  onClick={() => handleMultiChoiceToggle('precipitation', option.value)}
                />
              ))}
            </div>
          </div>

          {/* Seasonal Preference - mb-4 */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Seasonal Preference
            </label>
            <select
              name="seasonal_preference"
              value={formData.seasonal_preference}
              onChange={handleInputChange}
              className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            >
              <option value="Optional">No specific preference</option>
              <option value="all_seasons">I enjoy all seasons equally</option>
              <option value="summer_focused">I prefer warm seasons</option>
              <option value="winter_focused">I prefer cool seasons</option>
            </select>
          </div>

          {/* Summary Section - mb-4 */}
          {(formData.summer_climate_preference.length > 0 || 
            formData.winter_climate_preference.length > 0 ||
            formData.humidity_level.length > 0 ||
            formData.sunshine.length > 0 ||
            formData.precipitation.length > 0) && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">Summary:</span>
                <div className="mt-1 text-xs space-y-1">
                  {formData.summer_climate_preference.length > 0 && (
                    <div>• Summer: {formData.summer_climate_preference.join(', ')}</div>
                  )}
                  {formData.winter_climate_preference.length > 0 && (
                    <div>• Winter: {formData.winter_climate_preference.join(', ')}</div>
                  )}
                  {formData.humidity_level.length > 0 && (
                    <div>• Humidity: {formData.humidity_level.join(', ')}</div>
                  )}
                  {formData.sunshine.length > 0 && (
                    <div>• Sunshine: {formData.sunshine.join(', ')}</div>
                  )}
                  {formData.precipitation.length > 0 && (
                    <div>• Precipitation: {formData.precipitation.join(', ')}</div>
                  )}
                  {formData.seasonal_preference !== 'Optional' && (
                    <div>• Seasonal: {formData.seasonal_preference.replace(/_/g, ' ')}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Pro Tip */}
          <div className="mb-4 p-3 bg-scout-accent-50 dark:bg-scout-accent-900/20 rounded-lg">
            <div className="flex items-start">
              <div className="mr-2">
                <svg className="h-5 w-5 text-scout-accent-600 dark:text-scout-accent-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Pro Tip:</span> Select multiple options to keep your choices flexible. We'll find locations that match your preferred climate conditions throughout the year.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigate('/onboarding/region')}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm bg-scout-accent-300 hover:bg-scout-accent-400 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}