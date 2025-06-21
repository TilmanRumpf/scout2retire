import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Snowflake, Droplets, Cloud, CloudRain } from 'lucide-react';
import { getCurrentUser } from '../../utils/authUtils';
import { saveOnboardingStep, getOnboardingProgress } from '../../utils/onboardingUtils';
import OnboardingStepNavigation from '../../components/OnboardingStepNavigation';
import toast from 'react-hot-toast';
import { uiConfig } from '../../styles/uiConfig';

// Option Button Component
const OptionButton = ({ label, description, isSelected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-2 sm:p-2.5 ${uiConfig.layout.radius.md} border-2 ${uiConfig.animation.transition} text-center min-h-[44px] ${
      isSelected
        ? uiConfig.components.buttonVariants.selected
        : uiConfig.components.buttonVariants.unselected
    }`}
  >
    <div className={`${uiConfig.font.size.xs} ${uiConfig.responsive.sm}${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${isSelected ? uiConfig.colors.accent : ''}`}>{label}</div>
    {description && <div className={`text-[10px] ${uiConfig.responsive.sm}${uiConfig.font.size.xs} mt-0.5 ${isSelected ? uiConfig.colors.accent : uiConfig.colors.hint}`}>{description}</div>}
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

  const handleSkip = () => {
    navigate('/onboarding/culture');
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
      <div className={`min-h-[100svh] ${uiConfig.colors.page} p-4 flex items-center justify-center`}>
        <div className={`${uiConfig.animation.pulse} ${uiConfig.colors.success} ${uiConfig.font.weight.semibold}`}>Loading...</div>
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
    <div className={`min-h-[100svh] ${uiConfig.colors.page} pb-20 ${uiConfig.responsive.sm}pb-4`}>
      <div className="max-w-md mx-auto p-4 sm:p-4">
        <OnboardingStepNavigation 
          currentStep="climate_preferences" 
          completedSteps={progress.completedSteps} 
          className="mb-3" 
        />
        
        <form onSubmit={handleSubmit} className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} p-4 ${uiConfig.responsive.sm}p-5`}>
          {/* Header */}
          <div className="mb-3">
            <h1 className={`${uiConfig.font.size.lg} ${uiConfig.font.weight.bold} ${uiConfig.colors.heading}`}>Climate Preferences</h1>
            <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} mt-0.5`}>
              Select your ideal climate conditions - choose multiple options
            </p>
          </div>

          {/* Summer Climate */}
          <div className="mb-3">
            <label className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-1.5 flex items-center`}>
              <Sun size={16} className="mr-1.5" />
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

          {/* Winter Climate */}
          <div className="mb-3">
            <label className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-1.5 flex items-center`}>
              <Snowflake size={16} className="mr-1.5" />
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

          {/* Humidity */}
          <div className="mb-3">
            <label className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-1.5 flex items-center`}>
              <Droplets size={16} className="mr-1.5" />
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

          {/* Sunshine */}
          <div className="mb-3">
            <label className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-1.5 flex items-center`}>
              <Sun size={16} className="mr-1.5" />
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

          {/* Precipitation */}
          <div className="mb-3">
            <label className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-1.5 flex items-center`}>
              <CloudRain size={16} className="mr-1.5" />
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

          {/* Seasonal Preference */}
          <div className="mb-3">
            <label className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-1.5 block`}>
              Seasonal Preference
            </label>
            <select
              name="seasonal_preference"
              value={formData.seasonal_preference}
              onChange={handleInputChange}
              className={`${uiConfig.components.select} appearance-none cursor-pointer focus:ring-0 focus:${uiConfig.colors.borderActive} ${uiConfig.animation.transition} h-[44px]`}
            >
              <option value="Optional">No specific preference</option>
              <option value="all_seasons">I enjoy all seasons equally</option>
              <option value="summer_focused">I prefer warm seasons</option>
              <option value="winter_focused">I prefer cool seasons</option>
            </select>
          </div>

          {/* Summary Section */}
          {(formData.summer_climate_preference.length > 0 || 
            formData.winter_climate_preference.length > 0 ||
            formData.humidity_level.length > 0 ||
            formData.sunshine.length > 0 ||
            formData.precipitation.length > 0) && (
            <div className={`mb-3 p-2.5 ${uiConfig.colors.input} ${uiConfig.layout.radius.lg}`}>
              <h3 className={`${uiConfig.font.weight.medium} ${uiConfig.colors.heading} mb-1.5 ${uiConfig.font.size.sm}`}>
                Your Climate Preferences:
              </h3>
              <div className={`space-y-0.5 ${uiConfig.font.size.xs} ${uiConfig.colors.body}`}>
                {formData.summer_climate_preference.length > 0 && (
                  <div><span className={`${uiConfig.font.weight.medium}`}>Summer:</span> {formData.summer_climate_preference.join(', ')}</div>
                )}
                {formData.winter_climate_preference.length > 0 && (
                  <div><span className={`${uiConfig.font.weight.medium}`}>Winter:</span> {formData.winter_climate_preference.join(', ')}</div>
                )}
                {formData.humidity_level.length > 0 && (
                  <div><span className={`${uiConfig.font.weight.medium}`}>Humidity:</span> {formData.humidity_level.join(', ')}</div>
                )}
                {formData.sunshine.length > 0 && (
                  <div><span className={`${uiConfig.font.weight.medium}`}>Sunshine:</span> {formData.sunshine.join(', ')}</div>
                )}
                {formData.precipitation.length > 0 && (
                  <div><span className={`${uiConfig.font.weight.medium}`}>Precipitation:</span> {formData.precipitation.join(', ')}</div>
                )}
                {formData.seasonal_preference !== 'Optional' && (
                  <div><span className={`${uiConfig.font.weight.medium}`}>Seasonal:</span> {formData.seasonal_preference.replace(/_/g, ' ')}</div>
                )}
              </div>
            </div>
          )}

          {/* Pro Tip */}
          <div className={`mb-3 p-2.5 ${uiConfig.notifications.info} ${uiConfig.layout.radius.lg}`}>
            <div className="flex items-start">
              <div className="mr-2">
                <svg className={`${uiConfig.icons.size.sm} ${uiConfig.colors.accent}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.body}`}>
                  <span className={`${uiConfig.font.weight.medium}`}>Pro Tip:</span> Select multiple options to keep your choices flexible. We'll find locations that match your preferred climate conditions throughout the year.
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Bottom Navigation - Fixed on mobile, sticky on desktop */}
        <div className={`fixed ${uiConfig.responsive.sm}sticky bottom-0 left-0 right-0 ${uiConfig.responsive.sm}relative ${uiConfig.colors.card} border-t ${uiConfig.colors.borderLight} p-4 ${uiConfig.responsive.sm}p-0 ${uiConfig.responsive.sm}border-0 ${uiConfig.responsive.sm}bg-transparent ${uiConfig.responsive.sm}mt-4`}>
          <div className="max-w-md mx-auto">
            <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} border ${uiConfig.colors.border} p-3 ${uiConfig.layout.shadow.lg} ${uiConfig.responsive.sm}shadow-none`}>
              <div className="flex justify-between items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/onboarding/region')}
                  className={`px-4 py-2.5 ${uiConfig.font.size.sm} ${uiConfig.colors.body} hover:${uiConfig.colors.heading} ${uiConfig.font.weight.medium} ${uiConfig.animation.transition} min-h-[44px]`}
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleSkip}
                  className={`px-4 py-2.5 ${uiConfig.font.size.sm} ${uiConfig.colors.hint} hover:${uiConfig.colors.body} ${uiConfig.font.weight.medium} ${uiConfig.animation.transition} min-h-[44px]`}
                >
                  Skip
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  onClick={handleSubmit}
                  className={`px-6 py-2.5 ${uiConfig.font.size.sm} ${uiConfig.colors.btnPrimary} ${uiConfig.font.weight.medium} ${uiConfig.layout.radius.lg} ${uiConfig.states.disabled} min-h-[44px]`}
                >
                  {loading ? 'Saving...' : 'Next →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}