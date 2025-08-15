import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Globe2, Languages, Utensils, Building, Music, Calendar, Gauge, Home, Lightbulb, Check } from 'lucide-react';
import { getCurrentUser } from '../../utils/authUtils';
import { saveOnboardingStep, getOnboardingProgress } from '../../utils/onboardingUtils';
import { saveUserPreferences } from '../../utils/userPreferences';
import { useOnboardingAutoSave } from '../../hooks/useOnboardingAutoSave';
import ProTip from '../../components/ProTip';
import toast from 'react-hot-toast';
import { uiConfig } from '../../styles/uiConfig';
import { SelectionCard, SelectionGrid, SelectionSection } from '../../components/onboarding/SelectionCard';

// Language Select Component - styled to match SelectionCard
const LanguageSelect = ({ value, onChange, label, languages }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLanguage = languages.find(lang => lang.id === value);
  
  return (
    <div className="relative">
      <label className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} block mb-1`}>
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full p-3 sm:p-4 min-h-[60px] sm:min-h-[70px] ${uiConfig.layout.radius.lg} 
          border-2 ${uiConfig.animation.transition} text-left relative overflow-hidden cursor-pointer
          ${value 
            ? 'border-scout-accent-500 bg-scout-accent-50 dark:bg-scout-accent-900/20 shadow-md' 
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800/30 hover:border-scout-accent-300 hover:shadow-md'
          }
          hover:-translate-y-0.5 active:scale-[0.98]
        `}
      >
        {/* Checkmark indicator */}
        {value && (
          <div className="absolute top-2 right-2">
            <div className="w-6 h-6 bg-scout-accent-500 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          </div>
        )}
        
        <div className={value ? 'pr-10' : 'pr-2'}>
          <div className={`${uiConfig.font.weight.medium} ${
            value ? 'text-scout-accent-700 dark:text-scout-accent-300' : 'text-gray-500 dark:text-gray-400'
          } text-sm sm:text-base`}>
            {selectedLanguage ? selectedLanguage.label : 'Select...'}
          </div>
        </div>
      </button>
      
      {/* Dropdown menu */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className={`absolute top-full left-0 right-0 mt-1 z-50 bg-white dark:bg-gray-800 
            ${uiConfig.layout.radius.lg} border-2 border-gray-300 dark:border-gray-600 shadow-lg 
            max-h-60 overflow-y-auto`}>
            <button
              type="button"
              onClick={() => {
                onChange({ target: { value: '' } });
                setIsOpen(false);
              }}
              className={`w-full p-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700/30 
                ${uiConfig.animation.transition} ${!value ? 'bg-gray-50 dark:bg-gray-700/30' : ''}`}
            >
              None
            </button>
            {languages.map(lang => (
              <button
                key={lang.id}
                type="button"
                onClick={() => {
                  onChange({ target: { value: lang.id } });
                  setIsOpen(false);
                }}
                className={`w-full p-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700/30 
                  ${uiConfig.animation.transition} ${value === lang.id ? 'bg-scout-accent-50 dark:bg-scout-accent-900/20 text-scout-accent-700 dark:text-scout-accent-300' : ''}`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default function OnboardingCulture() {
  const [formData, setFormData] = useState({
    expat_community_preference: [],
    language_comfort: {
      preferences: [],
      already_speak: []
    },
    cultural_importance: {
      dining_nightlife: 1,
      museums: 1,
      cultural_events: 1
    },
    lifestyle_preferences: {
      pace_of_life: [],
      urban_rural: [],
      traditional_progressive: ''
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const navigate = useNavigate();
  
  // Enable auto-save for this page
  const autoSave = useOnboardingAutoSave(formData, 'culture_preferences');

  // Common languages options
  const languages = [
    { id: 'english', label: 'English' },
    { id: 'spanish', label: 'Spanish' },
    { id: 'german', label: 'German' },
    { id: 'french', label: 'French' },
    { id: 'arabic', label: 'Arabic' },
    { id: 'croatian', label: 'Croatian' },
    { id: 'dutch', label: 'Dutch' },
    { id: 'greek', label: 'Greek' },
    { id: 'italian', label: 'Italian' },
    { id: 'japanese', label: 'Japanese' },
    { id: 'latvian', label: 'Latvian' },
    { id: 'mandarin', label: 'Mandarin' },
    { id: 'portuguese', label: 'Portuguese' },
    { id: 'thai', label: 'Thai' },
    { id: 'turkish', label: 'Turkish' }
  ];

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
        
        // If culture data exists, load it
        if (progressResult.data && progressResult.data.culture_preferences) {
          const loadedData = {
            ...progressResult.data.culture_preferences,
            expat_community_preference: Array.isArray(progressResult.data.culture_preferences.expat_community_preference) 
              ? progressResult.data.culture_preferences.expat_community_preference 
              : (progressResult.data.culture_preferences.expat_community_preference ? [progressResult.data.culture_preferences.expat_community_preference] : []),
            language_comfort: {
              ...progressResult.data.culture_preferences.language_comfort,
              preferences: progressResult.data.culture_preferences.language_comfort?.preferences || [],
              already_speak: progressResult.data.culture_preferences.language_comfort?.already_speak || []
            },
            lifestyle_preferences: {
              ...progressResult.data.culture_preferences.lifestyle_preferences,
              pace_of_life: Array.isArray(progressResult.data.culture_preferences.lifestyle_preferences?.pace_of_life)
                ? progressResult.data.culture_preferences.lifestyle_preferences.pace_of_life
                : (progressResult.data.culture_preferences.lifestyle_preferences?.pace_of_life ? [progressResult.data.culture_preferences.lifestyle_preferences.pace_of_life] : []),
              urban_rural: Array.isArray(progressResult.data.culture_preferences.lifestyle_preferences?.urban_rural)
                ? progressResult.data.culture_preferences.lifestyle_preferences.urban_rural
                : (progressResult.data.culture_preferences.lifestyle_preferences?.urban_rural ? [progressResult.data.culture_preferences.lifestyle_preferences.urban_rural] : []),
            },
            cultural_importance: {
              // Handle legacy data: combine restaurants and nightlife if they exist separately
              dining_nightlife: progressResult.data.culture_preferences.cultural_importance?.dining_nightlife || 
                                (progressResult.data.culture_preferences.cultural_importance?.restaurants && progressResult.data.culture_preferences.cultural_importance?.nightlife 
                                  ? Math.round((progressResult.data.culture_preferences.cultural_importance.restaurants + 
                                               progressResult.data.culture_preferences.cultural_importance.nightlife) / 2)
                                  : 1),
              museums: progressResult.data.culture_preferences.cultural_importance?.museums || 1,
              cultural_events: progressResult.data.culture_preferences.cultural_importance?.cultural_events || 1
            }
          };
          setFormData(loadedData);
        }
      } catch (err) {
        console.error("Unexpected error loading data:", err);
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadExistingData();
  }, [navigate]);

    const handleMultiSelect = (fieldName, value, isNested = false) => {
    if (isNested) {
      const [parent, child] = fieldName.split('.');
      setFormData(prev => {
        const currentValues = prev[parent][child] || [];
        const isSelected = currentValues.includes(value);
        
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: isSelected 
              ? currentValues.filter(v => v !== value)
              : [...currentValues, value]
          }
        };
      });
    } else {
      setFormData(prev => {
        const currentValues = prev[fieldName] || [];
        const isSelected = currentValues.includes(value);
        
        return {
          ...prev,
          [fieldName]: isSelected 
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value]
        };
      });
    }
  };

  const handleLanguageChange = (newLanguages) => {
    setFormData(prev => ({
      ...prev,
      language_comfort: {
        ...prev.language_comfort,
        already_speak: newLanguages
      }
    }));
  };

  const handleImportanceChange = (category, value) => {
    setFormData(prev => ({
      ...prev,
      cultural_importance: {
        ...prev.cultural_importance,
        [category]: value
      }
    }));
  };

  const handleSkip = async () => {
    setLoading(true);
    await autoSave();
    setLoading(false);
    navigate('/onboarding/hobbies');
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
        'culture_preferences'
      );
      
      if (!success) {
        toast.error(`Failed to save: ${error.message}`);
        setLoading(false);
        return;
      }
      
      toast.success('Culture preferences saved!');
      
      // Also save to new user_preferences table
      try {
        const { success: prefSuccess, error: prefError } = await saveUserPreferences(
          userResult.user.id,
          'culture_preferences',
          formData
        );
        if (prefSuccess) {
          console.log('✅ Saved culture to user_preferences table');
        } else {
          console.error('❌ Failed to save culture to user_preferences:', prefError);
        }
      } catch (err) {
        console.error('Error saving culture to user_preferences:', err);
      }
      
      // Add a small delay to ensure data is saved before navigation
      setTimeout(() => {
        navigate('/onboarding/hobbies');
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
        <div className={`${uiConfig.animation.pulse} ${uiConfig.colors.success} ${uiConfig.font.weight.semibold}`}>Loading...</div>
      </div>
    );
  }

  // Cultural importance categories with icons - renamed Events and Museums
  const culturalCategories = [
    { id: 'dining_nightlife', label: 'Dining & Nightlife', icon: Utensils },
    { id: 'cultural_events', label: 'Events & Concerts', icon: Calendar },
    { id: 'museums', label: 'Museums & Arts', icon: Building }
  ];

  // Expat community options
  const expatOptions = [
    { value: 'small', label: 'Small' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'large', label: 'Large' }
  ];

  // Pace of life options
  const paceOptions = [
    { value: 'relaxed', label: 'Relaxed' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'fast', label: 'Fast' }
  ];

  // Language preference options
  const languageOptions = [
    { value: 'english_only', label: 'English Only' },
    { value: 'willing_to_learn', label: 'Will Learn' },
    { value: 'comfortable', label: 'Flexible' }
  ];

  // Urban/Rural options
  const urbanOptions = [
  { value: 'rural', label: 'Rural' },
  { value: 'suburban', label: 'Suburban' },
  { value: 'urban', label: 'Urban' }
  ];


  // Simple slider component with consistent icon colors
  const ImportanceSlider = ({ category, icon }) => {
    const value = formData.cultural_importance[category.id];
    
    return (
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center">
            {React.createElement(icon, { size: 16, className: `mr-1.5 lg:mr-2 ${uiConfig.colors.body}` })}
            <span className={`text-xs sm:text-sm lg:text-base ${uiConfig.colors.body}`}>
              {category.label}
            </span>
          </div>
          <span className={`text-xs sm:text-sm lg:text-base ${uiConfig.font.weight.medium} text-scout-accent-300 dark:text-scout-accent-300`}>
            {((value - 1) * 25)}%
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="5"
          step="1"
          value={value}
          onChange={(e) => handleImportanceChange(category.id, parseInt(e.target.value))}
          className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-scout-accent-300 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
          style={{
            background: `linear-gradient(to right, rgb(var(--scout-accent-300)) 0%, rgb(var(--scout-accent-300)) ${(value - 1) * 25}%, rgb(var(--gray-200)) ${(value - 1) * 25}%, rgb(var(--gray-200)) 100%)`
          }}
        />
      </div>
    );
  };

  return (
      <main className="max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        
        <form onSubmit={handleSubmit} className="py-6">
          {/* Pro Tip at top */}
          <div className={`bg-scout-accent/10 p-3 lg:p-4 ${uiConfig.layout.radius.lg} mb-4 lg:mb-6 flex items-start`}>
            <Lightbulb size={16} className="mr-2 text-orange-500 flex-shrink-0 mt-0.5" strokeWidth={3} />
            <p className={`${uiConfig.font.size.sm} lg:text-base ${uiConfig.colors.body}`}>
              <span className={`${uiConfig.font.weight.medium}`}>Pro Tip:</span> Your cultural preferences help us find communities where you'll feel at home. Consider both practical needs and lifestyle desires.
            </p>
          </div>
          
          {/* Living Environment - moved to first position */}
          <SelectionSection icon={Home} title="Living Environment">
            <SelectionGrid>
              {urbanOptions.map((option) => (
                <SelectionCard
                  key={option.value}
                  title={option.label}
                  isSelected={formData.lifestyle_preferences.urban_rural.includes(option.value)}
                  onClick={() => handleMultiSelect('lifestyle_preferences.urban_rural', option.value, true)}
                  size="small"
                />
              ))}
            </SelectionGrid>
          </SelectionSection>

          {/* Pace of Life - moved to second position */}
          <SelectionSection icon={Gauge} title="Pace of Life">
            <SelectionGrid>
              {paceOptions.map((option) => (
                <SelectionCard
                  key={option.value}
                  title={option.label}
                  isSelected={formData.lifestyle_preferences.pace_of_life.includes(option.value)}
                  onClick={() => handleMultiSelect('lifestyle_preferences.pace_of_life', option.value, true)}
                  size="small"
                />
              ))}
            </SelectionGrid>
          </SelectionSection>

          {/* Expat Community */}
          <SelectionSection icon={Users} title="Expat Community">
            <SelectionGrid>
              {expatOptions.map((option) => (
                <SelectionCard
                  key={option.value}
                  title={option.label}
                  isSelected={formData.expat_community_preference.includes(option.value)}
                  onClick={() => handleMultiSelect('expat_community_preference', option.value)}
                  size="small"
                />
              ))}
            </SelectionGrid>
          </SelectionSection>

          {/* Language Preferences - moved to fourth position */}
          <SelectionSection icon={Languages} title="Language Preference">
            <SelectionGrid>
              {languageOptions.map((option) => (
                <SelectionCard
                  key={option.value}
                  title={option.label}
                  isSelected={formData.language_comfort.preferences.includes(option.value)}
                  onClick={() => handleMultiSelect('language_comfort.preferences', option.value, true)}
                  size="small"
                />
              ))}
            </SelectionGrid>
          </SelectionSection>

          {/* Languages you speak - after Language Preference */}
          <div className="mb-4">
            <label className={`${uiConfig.font.size.sm} lg:text-base ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2 lg:mb-3 flex items-center`}>
              <Languages size={16} className="mr-1.5 lg:mr-2" />
              Languages you speak
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 xl:gap-6">
              {/* Primary Language */}
              <LanguageSelect
                value={formData.language_comfort.already_speak[0] || ''}
                onChange={(e) => {
                  const newLanguages = [...formData.language_comfort.already_speak];
                  newLanguages[0] = e.target.value;
                  const uniqueLanguages = [...new Set(newLanguages.filter(Boolean))];
                  handleLanguageChange(uniqueLanguages);
                }}
                label="Primary"
                languages={languages}
              />

              {/* Secondary Language */}
              <LanguageSelect
                value={formData.language_comfort.already_speak[1] || ''}
                onChange={(e) => {
                  const newLanguages = [...formData.language_comfort.already_speak];
                  newLanguages[1] = e.target.value;
                  const uniqueLanguages = [...new Set(newLanguages.filter(Boolean))];
                  handleLanguageChange(uniqueLanguages);
                }}
                label="Secondary"
                languages={languages}
              />

              {/* Optional Language */}
              <LanguageSelect
                value={formData.language_comfort.already_speak[2] || ''}
                onChange={(e) => {
                  const newLanguages = [...formData.language_comfort.already_speak];
                  newLanguages[2] = e.target.value;
                  const uniqueLanguages = [...new Set(newLanguages.filter(Boolean))];
                  handleLanguageChange(uniqueLanguages);
                }}
                label="Optional"
                languages={languages}
              />
            </div>
          </div>

          {/* Cultural & Lifestyle Priorities */}
          <div className="mb-4">
            <label className={`${uiConfig.font.size.sm} lg:text-base ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2 lg:mb-3 block`}>
              Cultural & Lifestyle Priorities
            </label>
            <div className="space-y-1.5">
              {culturalCategories.map((category) => (
                <ImportanceSlider 
                  key={category.id} 
                  category={category} 
                  icon={category.icon}
                />
              ))}
            </div>
          </div>

          {/* Summary Section */}
          {(formData.expat_community_preference.length > 0 ||
            formData.lifestyle_preferences.pace_of_life.length > 0 ||
            formData.lifestyle_preferences.urban_rural.length > 0 ||
            formData.language_comfort.preferences.length > 0 ||
            formData.language_comfort.already_speak.length > 0) && (
            <div className={`mb-4 p-3 lg:p-4 ${uiConfig.colors.input} ${uiConfig.layout.radius.lg} lg:rounded-xl`}>
              <h3 className={`${uiConfig.font.weight.medium} ${uiConfig.colors.heading} mb-1.5 ${uiConfig.font.size.sm}`}>
                Your Culture & Lifestyle:
              </h3>
              <div className={`space-y-0.5 ${uiConfig.font.size.xs} ${uiConfig.colors.body}`}>
                {formData.lifestyle_preferences.urban_rural.length > 0 && (
                  <div><span className={`${uiConfig.font.weight.medium}`}>Environment:</span> {formData.lifestyle_preferences.urban_rural.join(', ')}</div>
                )}
                {formData.lifestyle_preferences.pace_of_life.length > 0 && (
                  <div><span className={`${uiConfig.font.weight.medium}`}>Pace:</span> {formData.lifestyle_preferences.pace_of_life.join(', ')}</div>
                )}
                {formData.expat_community_preference.length > 0 && (
                  <div><span className={`${uiConfig.font.weight.medium}`}>Community:</span> {formData.expat_community_preference.join(', ')}</div>
                )}
                {formData.language_comfort.preferences.length > 0 && (
                  <div><span className={`${uiConfig.font.weight.medium}`}>Language preference:</span> {formData.language_comfort.preferences.join(', ').replace(/_/g, ' ')}</div>
                )}
                {formData.language_comfort.already_speak.length > 0 && (
                  <div><span className={`${uiConfig.font.weight.medium}`}>Speaks:</span> {formData.language_comfort.already_speak.map(langId => 
                    languages.find(l => l.id === langId)?.label
                  ).filter(Boolean).join(', ')}</div>
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
                  navigate('/onboarding/climate');
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
