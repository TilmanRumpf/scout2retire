import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Snowflake, Droplets, Cloud, CloudRain, Lightbulb } from 'lucide-react';
import { getCurrentUser } from '../../utils/authUtils';
import { saveOnboardingStep, getOnboardingProgress } from '../../utils/onboardingUtils';
import { saveUserPreferences } from '../../utils/userPreferences';
import { useOnboardingAutoSave } from '../../hooks/useOnboardingAutoSave';
import ProTip from '../../components/ProTip';
import toast from 'react-hot-toast';
import { uiConfig } from '../../styles/uiConfig';
import { SelectionCard, SelectionGrid, SelectionSection } from '../../components/onboarding/SelectionCard';

export default function OnboardingClimate() {
  const [formData, setFormData] = useState({
    summer_climate_preference: [],
    winter_climate_preference: [],
    humidity_level: [],
    sunshine: [],
    precipitation: [],
    seasonal_preference: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const navigate = useNavigate();
  
  // Enable auto-save for this page
  const autoSave = useOnboardingAutoSave(formData, 'climate_preferences');

  // Load existing data if available
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        const userResult = await getCurrentUser();
        if (!userResult.user) {
          navigate('/welcome');
          return;
        }
        
        const progressResult = await getOnboardingProgress(userResult.user.id);
        
        if (!progressResult.success) {
          console.error("Error loading existing data:", progressResult.error);
          setInitialLoading(false);
          return;
        }
        
        // Progress is now managed by OnboardingLayout
        
        // If climate data exists, load it
        if (progressResult.data && progressResult.data.climate_preferences) {
          setFormData(prev => ({
            ...prev,
            ...progressResult.data.climate_preferences,
            summer_climate_preference: progressResult.data.climate_preferences.summer_climate_preference || [],
            winter_climate_preference: progressResult.data.climate_preferences.winter_climate_preference || [],
            humidity_level: progressResult.data.climate_preferences.humidity_level || [],
            sunshine: progressResult.data.climate_preferences.sunshine || [],
            precipitation: progressResult.data.climate_preferences.precipitation || [],
            seasonal_preference: progressResult.data.climate_preferences.seasonal_preference || ''
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

  const handleSkip = async () => {
    setLoading(true);
    await autoSave();
    setLoading(false);
    navigate('/onboarding/culture');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    
    try {
      const userResult = await getCurrentUser();
      if (!userResult.user) {
        navigate('/welcome');
        return;
      }
      
      const { success, error } = await saveOnboardingStep(
        userResult.user.id,
        formData,
        'climate_preferences'
      );
      
      if (!success) {
        toast.error(`Failed to save: ${error.message}`);
        setLoading(false);
        return;
      }
      
      toast.success('Climate preferences saved!');
      
      // Also save to new user_preferences table
      try {
        const { success: prefSuccess, error: prefError } = await saveUserPreferences(
          userResult.user.id,
          'climate_preferences',
          formData
        );
        if (prefSuccess) {
          console.log('✅ Saved climate to user_preferences table');
        } else {
          console.error('❌ Failed to save climate to user_preferences:', prefError);
        }
      } catch (err) {
        console.error('Error saving climate to user_preferences:', err);
      }
      
      // Add a small delay to ensure data is saved before navigation
      setTimeout(() => {
        navigate('/onboarding/culture');
      }, 100);
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
        <div className={`${uiConfig.animation.pulse} ${uiConfig.colors.success} ${uiConfig.font.weight.semibold} ${uiConfig.font.size.base}`}>Loading...</div>
      </div>
    );
  }

  const summerOptions = [
    { value: 'mild', label: 'Mild' },
    { value: 'warm', label: 'Warm' },
    { value: 'hot', label: 'Hot' }
  ];

  const winterOptions = [
    { value: 'cold', label: 'Cold' },
    { value: 'cool', label: 'Cool' },
    { value: 'mild', label: 'Mild' }
  ];

  const humidityOptions = [
    { value: 'dry', label: 'Dry' },
    { value: 'balanced', label: 'Balanced' },
    { value: 'humid', label: 'Humid' }
  ];

  const sunshineOptions = [
    { value: 'often_sunny', label: 'Often Sunny' },
    { value: 'balanced', label: 'Balanced' },
    { value: 'less_sunny', label: 'Less Sunny' }
  ];

  const precipitationOptions = [
    { value: 'mostly_dry', label: 'Mostly Dry' },
    { value: 'balanced', label: 'Balanced' },
    { value: 'often_rainy', label: 'Often Rainy' }
  ];

  return (
      <main className="max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="py-6">
          {/* Pro Tip at top */}
          <div className={`bg-scout-accent/10 p-3 lg:p-4 ${uiConfig.layout.radius.lg} mb-4 lg:mb-6 flex items-start`}>
            <Lightbulb size={16} className="mr-2 text-orange-500 flex-shrink-0 mt-0.5" strokeWidth={3} />
            <p className={`${uiConfig.font.size.sm} lg:text-base ${uiConfig.colors.body}`}>
              <span className={`${uiConfig.font.weight.medium}`}>Pro Tip:</span> Select multiple options to keep your choices flexible. We'll find locations that match your preferred climate conditions throughout the year.
            </p>
          </div>
          
          {/* Summer Climate */}
          <SelectionSection icon={Sun} title="Summer Climate">
            <SelectionGrid>
              {summerOptions.map((option) => (
                <SelectionCard
                  key={option.value}
                  title={option.label}
                  isSelected={formData.summer_climate_preference?.includes(option.value)}
                  onClick={() => handleClimateToggle('summer', option.value)}
                  size="small"
                />
              ))}
            </SelectionGrid>
          </SelectionSection>

          {/* Winter Climate */}
          <SelectionSection icon={Snowflake} title="Winter Climate">
            <SelectionGrid>
              {winterOptions.map((option) => (
                <SelectionCard
                  key={option.value}
                  title={option.label}
                  isSelected={formData.winter_climate_preference?.includes(option.value)}
                  onClick={() => handleClimateToggle('winter', option.value)}
                  size="small"
                />
              ))}
            </SelectionGrid>
          </SelectionSection>

          {/* Humidity */}
          <SelectionSection icon={Droplets} title="Humidity">
            <SelectionGrid>
              {humidityOptions.map((option) => (
                <SelectionCard
                  key={option.value}
                  title={option.label}
                  isSelected={formData.humidity_level?.includes(option.value)}
                  onClick={() => handleMultiChoiceToggle('humidity_level', option.value)}
                  size="small"
                />
              ))}
            </SelectionGrid>
          </SelectionSection>

          {/* Sunshine */}
          <SelectionSection icon={Sun} title="Sunshine">
            <SelectionGrid>
              {sunshineOptions.map((option) => (
                <SelectionCard
                  key={option.value}
                  title={option.label}
                  isSelected={formData.sunshine?.includes(option.value)}
                  onClick={() => handleMultiChoiceToggle('sunshine', option.value)}
                  size="small"
                />
              ))}
            </SelectionGrid>
          </SelectionSection>

          {/* Precipitation */}
          <SelectionSection icon={CloudRain} title="Precipitation">
            <SelectionGrid>
              {precipitationOptions.map((option) => (
                <SelectionCard
                  key={option.value}
                  title={option.label}
                  isSelected={formData.precipitation?.includes(option.value)}
                  onClick={() => handleMultiChoiceToggle('precipitation', option.value)}
                  size="small"
                />
              ))}
            </SelectionGrid>
          </SelectionSection>

          {/* Seasonal Preference */}
          <div className="mb-4">
            <label className={`${uiConfig.font.size.sm} lg:text-base ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2 lg:mb-3 block`}>
              Seasonal Preference
            </label>
            <select
              name="seasonal_preference"
              value={formData.seasonal_preference}
              onChange={handleInputChange}
              className={uiConfig.components.select}
            >
              <option value="">Select preference</option>
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
            <div className={`mb-4 p-3 lg:p-4 ${uiConfig.colors.input} ${uiConfig.layout.radius.lg} lg:rounded-xl`}>
              <h3 className={`${uiConfig.font.weight.medium} ${uiConfig.colors.heading} mb-2 ${uiConfig.font.size.sm}`}>
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
                {formData.seasonal_preference && formData.seasonal_preference !== 'Optional' && (
                  <div><span className={`${uiConfig.font.weight.medium}`}>Seasonal:</span> {formData.seasonal_preference.replace(/_/g, ' ')}</div>
                )}
              </div>
            </div>
          )}

        </form>

        {/* Bottom Navigation - Fixed on mobile, sticky on desktop */}
        <div className={`fixed sm:sticky bottom-0 left-0 right-0 sm:relative ${uiConfig.colors.card} border-t ${uiConfig.colors.borderLight} p-4 sm:p-0 sm:border-0 sm:bg-transparent sm:mt-6 lg:mt-8`}>
          <div className="max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-7xl mx-auto">
            <div className="flex items-center">
              <button
                type="button"
                onClick={async () => {
                  setLoading(true);
                  await autoSave();
                  setLoading(false);
                  navigate('/onboarding/region');
                }}
                disabled={loading}
                className={uiConfig.components.buttonSecondary}
              >
                ← Back
              </button>
              <div className="flex-1 flex justify-center">
                <button
                  type="button"
                  onClick={handleSkip}
                  className={uiConfig.components.buttonSecondary}
                >
                  Skip
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                onClick={handleSubmit}
                className={uiConfig.components.buttonPrimary}
              >
                {loading ? 'Saving...' : 'Next →'}
              </button>
            </div>
          </div>
        </div>
      </main>
  );
}
